import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/client/components/ui/sidebar'
import { ScrollArea } from '@/client/components/ui/scroll-area'
import { Input } from '@/client/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/client/components/ui/avatar'
import { cn } from '@/client/lib/utils'
import { Loader2, CheckCircle2, XCircle, Clock, Ban, UserCheck, Search } from 'lucide-react'
import { TaskDetailModal } from '@/client/components/sidebar/TaskDetailModal'
import { useTasks } from '@/client/hooks/useTasks'
import type { TaskStatus, TaskSummary } from '@/shared/types'

const STATUS_CONFIG: Record<TaskStatus, {
  icon: typeof Clock
  iconClass: string
  labelClass: string
}> = {
  pending: {
    icon: Clock,
    iconClass: 'text-muted-foreground',
    labelClass: 'text-muted-foreground',
  },
  in_progress: {
    icon: Loader2,
    iconClass: 'text-primary animate-spin',
    labelClass: 'text-primary font-medium',
  },
  awaiting_human_input: {
    icon: UserCheck,
    iconClass: 'text-warning animate-pulse',
    labelClass: 'text-warning font-medium',
  },
  completed: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    labelClass: 'text-success font-medium',
  },
  failed: {
    icon: XCircle,
    iconClass: 'text-destructive',
    labelClass: 'text-destructive font-medium',
  },
  cancelled: {
    icon: Ban,
    iconClass: 'text-muted-foreground',
    labelClass: 'text-muted-foreground',
  },
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return '<1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

function formatElapsed(start: string): string {
  const ms = Date.now() - new Date(start).getTime()
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m`
}

function TaskCard({ task, onClick }: { task: TaskSummary; onClick: () => void }) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[task.status]
  const Icon = config.icon
  const avatarUrl = task.sourceKinAvatarUrl ?? task.parentKinAvatarUrl
  const kinName = task.sourceKinName ?? task.parentKinName
  const initials = kinName.slice(0, 2).toUpperCase()
  const isCancelled = task.status === 'cancelled'
  const isFinished = task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
  const duration = isFinished
    ? formatDuration(task.createdAt, task.updatedAt)
    : formatElapsed(task.createdAt)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={cn(
        'flex items-center gap-3 rounded-lg bg-sidebar-accent/30 px-3 py-2.5 text-xs hover:bg-sidebar-accent/50 transition-colors cursor-pointer',
        isCancelled && 'opacity-60',
      )}
    >
      <Avatar className="size-7 shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={kinName} />
        ) : (
          <AvatarFallback className="text-[10px] bg-secondary">{initials}</AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {task.title ?? (task.description.length > 60
            ? task.description.slice(0, 60) + '...'
            : task.description)}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Icon className={cn('size-3 shrink-0', config.iconClass)} />
          <span className={cn('text-[10px]', config.labelClass)}>
            {t(`sidebar.tasks.status.${task.status}`)}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground truncate">{kinName}</span>
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{duration}</span>
        </div>
      </div>
    </div>
  )
}

export function TaskList() {
  const { t } = useTranslation()
  const {
    activeTasks,
    historyTasks,
    hasMore,
    isLoading,
    isLoadingMore,
    searchQuery,
    setSearchQuery,
    loadMore,
  } = useTasks()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver on sentinel for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // Use the ScrollArea viewport as root so the observer fires when scrolling inside it
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { root: viewport, threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  // Deduplicate history vs active
  const activeIds = useMemo(() => new Set(activeTasks.map((t) => t.id)), [activeTasks])
  const deduplicatedHistory = useMemo(
    () => historyTasks.filter((t) => !activeIds.has(t.id)),
    [historyTasks, activeIds],
  )

  // Find selected task across both lists
  const allVisible = useMemo(
    () => [...activeTasks, ...deduplicatedHistory],
    [activeTasks, deduplicatedHistory],
  )
  const selectedTask = useMemo(
    () => allVisible.find((t) => t.id === selectedTaskId) ?? null,
    [allVisible, selectedTaskId],
  )

  const isEmpty = activeTasks.length === 0 && deduplicatedHistory.length === 0 && !isLoading

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('sidebar.tasks.title')}</SidebarGroupLabel>
      <SidebarGroupContent>
        {/* Search input */}
        <div className="px-1 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sidebar.tasks.search')}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {isEmpty ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            {searchQuery ? t('sidebar.tasks.noResults') : t('sidebar.tasks.empty')}
          </p>
        ) : (
          <div ref={scrollRef}>
            <ScrollArea className="max-h-[25vh] overflow-hidden">
              <div className="space-y-1 px-1">
                {/* Active tasks — pinned at top, hidden during search */}
                {activeTasks.length > 0 && !searchQuery && (
                  <>
                    {activeTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTaskId(task.id)}
                      />
                    ))}
                    {deduplicatedHistory.length > 0 && (
                      <div className="my-2 h-px bg-border/50" />
                    )}
                  </>
                )}

                {/* History / search results */}
                {deduplicatedHistory.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTaskId(task.id)}
                  />
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="flex justify-center py-2">
                  {(isLoadingMore || (isLoading && deduplicatedHistory.length === 0)) && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </SidebarGroupContent>

      <TaskDetailModal
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onOpenChange={(open) => { if (!open) setSelectedTaskId(null) }}
        kinName={selectedTask?.sourceKinName ?? selectedTask?.parentKinName}
        kinAvatarUrl={selectedTask?.sourceKinAvatarUrl ?? selectedTask?.parentKinAvatarUrl}
      />
    </SidebarGroup>
  )
}
