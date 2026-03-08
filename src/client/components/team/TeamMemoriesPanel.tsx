import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/client/components/ui/button'
import { Badge } from '@/client/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/client/components/ui/alert-dialog'
import { Brain, Trash2 } from 'lucide-react'
import { EmptyState } from '@/client/components/common/EmptyState'
import { api, toastError } from '@/client/lib/api'

interface TeamMemory {
  id: string
  content: string
  category: string
  subject: string | null
  authorKinId: string
  importance: number | null
  createdAt: string
}

interface TeamMemoriesPanelProps {
  teamId: string
}

export function TeamMemoriesPanel({ teamId }: TeamMemoriesPanelProps) {
  const { t } = useTranslation()
  const [memories, setMemories] = useState<TeamMemory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMemories = useCallback(async () => {
    try {
      const data = await api.get<{ memories: TeamMemory[] }>(`/teams/${teamId}/memories`)
      setMemories(data.memories)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => { fetchMemories() }, [fetchMemories])

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      await api.delete(`/teams/${teamId}/memories/${deletingId}`)
      setMemories((prev) => prev.filter((m) => m.id !== deletingId))
      toast.success(t('teams.memoryDeleted'))
    } catch (err) {
      toastError(err)
    } finally {
      setDeletingId(null)
    }
  }, [deletingId, teamId, t])

  if (isLoading) return <div className="text-xs text-muted-foreground py-2">{t('common.loading')}...</div>

  if (memories.length === 0) {
    return (
      <EmptyState
        compact
        icon={Brain}
        title={t('teams.noMemories')}
        description={t('teams.memoriesDescription')}
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t('teams.memoriesDescription')}</p>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="rounded-lg border p-2.5 text-sm flex items-start gap-2"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {memory.category}
                </Badge>
                {memory.subject && (
                  <span className="text-[10px] text-muted-foreground truncate">{memory.subject}</span>
                )}
              </div>
              <p className="text-xs whitespace-pre-wrap break-words">{memory.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-destructive hover:text-destructive"
              onClick={() => setDeletingId(memory.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('teams.confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
