import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/client/components/ui/sidebar'
import { ScrollArea } from '@/client/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/client/components/ui/avatar'
import { Badge } from '@/client/components/ui/badge'
import { Button } from '@/client/components/ui/button'
import { Switch } from '@/client/components/ui/switch'
import { CronFormModal } from '@/client/components/sidebar/CronFormModal'
import { CronDetailModal } from '@/client/components/sidebar/CronDetailModal'
import { useCrons } from '@/client/hooks/useCrons'
import { cn } from '@/client/lib/utils'
import { cronToHuman } from '@/client/lib/cron-human'
import { Plus, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import type { CronSummary } from '@/shared/types'

interface KinOption {
  id: string
  name: string
  role: string
  avatarUrl: string | null
}

interface LLMModel {
  id: string
  name: string
  providerId: string
  providerType: string
  capability: string
}

interface CronListProps {
  kins: KinOption[]
  llmModels: LLMModel[]
}

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 60_000) return '<1m'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}

function CronCard({
  cron,
  onClick,
  onApprove,
  onToggleActive,
}: {
  cron: CronSummary
  onClick: () => void
  onApprove?: () => void
  onToggleActive?: (isActive: boolean) => void
}) {
  const { t, i18n } = useTranslation()
  const initials = cron.kinName.slice(0, 2).toUpperCase()
  const isPaused = !cron.isActive && !cron.requiresApproval
  const humanSchedule = cronToHuman(cron.schedule, i18n.language)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={cn(
        'flex items-center gap-3 rounded-lg bg-sidebar-accent/30 px-3 py-2.5 text-xs hover:bg-sidebar-accent/50 transition-colors cursor-pointer',
        isPaused && 'opacity-60',
      )}
    >
      <Avatar className="size-7 shrink-0">
        {cron.kinAvatarUrl && <AvatarImage src={cron.kinAvatarUrl} alt={cron.kinName} />}
        <AvatarFallback className="text-[10px] bg-secondary">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{cron.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground truncate" title={cron.schedule}>
            {humanSchedule ?? cron.schedule}
          </span>
          {cron.requiresApproval && (
            <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] text-warning border-warning/40">
              {t('sidebar.crons.pendingApproval')}
            </Badge>
          )}
          {cron.lastTriggeredAt && (
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
              {formatRelativeTime(cron.lastTriggeredAt)}
            </span>
          )}
        </div>
      </div>
      {cron.requiresApproval && onApprove && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onApprove()
          }}
          title={t('sidebar.crons.approve')}
        >
          <CheckCircle2 className="size-3.5 text-success" />
        </Button>
      )}
      {!cron.requiresApproval && onToggleActive && (
        <Switch
          checked={cron.isActive}
          onCheckedChange={(checked) => onToggleActive(checked)}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 scale-75"
        />
      )}
    </div>
  )
}

export function CronList({ kins, llmModels }: CronListProps) {
  const { t } = useTranslation()
  const {
    crons,
    isLoading,
    createCron,
    updateCron,
    deleteCron,
    approveCron,
  } = useCrons()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editCron, setEditCron] = useState<CronSummary | null>(null)
  const [detailCron, setDetailCron] = useState<CronSummary | null>(null)

  // Split pending-approval from the rest
  const pendingCrons = useMemo(() => crons.filter((c) => c.requiresApproval), [crons])
  const regularCrons = useMemo(() => crons.filter((c) => !c.requiresApproval), [crons])

  const isEmpty = crons.length === 0 && !isLoading

  // Keep detailCron in sync with crons state (for live updates)
  const currentDetailCron = useMemo(
    () => (detailCron ? crons.find((c) => c.id === detailCron.id) ?? detailCron : null),
    [detailCron, crons],
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('sidebar.crons.title')}</SidebarGroupLabel>
      <SidebarGroupAction onClick={() => setShowCreateModal(true)} title={t('sidebar.crons.create')}>
        <Plus className="size-4" />
      </SidebarGroupAction>
      <SidebarGroupContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : isEmpty ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            {t('sidebar.crons.empty')}
          </p>
        ) : (
          <ScrollArea className="max-h-[25vh] overflow-hidden">
            <div className="space-y-1 px-1">
              {/* Pending approval */}
              {pendingCrons.map((cron) => (
                <CronCard
                  key={cron.id}
                  cron={cron}
                  onClick={() => setDetailCron(cron)}
                  onApprove={() => approveCron(cron.id)}
                />
              ))}
              {pendingCrons.length > 0 && regularCrons.length > 0 && (
                <div className="my-2 h-px bg-border/50" />
              )}
              {/* Active + inactive */}
              {regularCrons.map((cron) => (
                <CronCard
                  key={cron.id}
                  cron={cron}
                  onClick={() => setDetailCron(cron)}
                  onToggleActive={(isActive) => updateCron(cron.id, { isActive })}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </SidebarGroupContent>

      {/* Create modal */}
      <CronFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        kins={kins}
        llmModels={llmModels}
        onCreate={createCron}
      />

      {/* Edit modal */}
      <CronFormModal
        open={editCron !== null}
        onOpenChange={(open) => { if (!open) setEditCron(null) }}
        kins={kins}
        llmModels={llmModels}
        cron={editCron}
        onUpdate={updateCron}
        onDelete={deleteCron}
      />

      {/* Detail modal */}
      {currentDetailCron && (
        <CronDetailModal
          open={detailCron !== null}
          onOpenChange={(open) => { if (!open) setDetailCron(null) }}
          cron={currentDetailCron}
          onEdit={() => {
            setDetailCron(null)
            setEditCron(currentDetailCron)
          }}
          onApprove={approveCron}
          onToggleActive={(id, isActive) => updateCron(id, { isActive })}
        />
      )}
    </SidebarGroup>
  )
}
