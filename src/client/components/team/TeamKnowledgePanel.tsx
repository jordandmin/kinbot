import { useState, useEffect, useCallback, useRef } from 'react'
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
import { BookOpen, Trash2, Upload, FileText, Globe, Type } from 'lucide-react'
import { EmptyState } from '@/client/components/common/EmptyState'
import { api, toastError } from '@/client/lib/api'

interface KnowledgeSource {
  id: string
  name: string
  type: string
  status: string
  chunkCount: number
  tokenCount: number
  errorMessage: string | null
  createdAt: string
}

interface TeamKnowledgePanelProps {
  teamId: string
}

const typeIcons: Record<string, typeof FileText> = {
  file: FileText,
  url: Globe,
  text: Type,
}

export function TeamKnowledgePanel({ teamId }: TeamKnowledgePanelProps) {
  const { t } = useTranslation()
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSources = useCallback(async () => {
    try {
      const data = await api.get<{ sources: KnowledgeSource[] }>(`/teams/${teamId}/knowledge`)
      setSources(data.sources)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => { fetchSources() }, [fetchSources])

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const content = await file.text()
      await api.post(`/teams/${teamId}/knowledge`, {
        name: file.name,
        type: 'file',
        content,
        originalFilename: file.name,
        mimeType: file.type || 'text/plain',
      })
      toast.success(t('teams.knowledgeSourceCreated'))
      fetchSources()
    } catch (err) {
      toastError(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [teamId, t, fetchSources])

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      await api.delete(`/teams/${teamId}/knowledge/${deletingId}`)
      setSources((prev) => prev.filter((s) => s.id !== deletingId))
      toast.success(t('teams.knowledgeSourceDeleted'))
    } catch (err) {
      toastError(err)
    } finally {
      setDeletingId(null)
    }
  }, [deletingId, teamId, t])

  if (isLoading) return <div className="text-xs text-muted-foreground py-2">{t('common.loading')}...</div>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t('teams.knowledgeDescription')}</p>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".txt,.md,.pdf,.csv,.json,.html"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="size-3 mr-1" />
            {uploading ? '...' : t('teams.addKnowledgeSource')}
          </Button>
        </div>
      </div>

      {sources.length === 0 ? (
        <EmptyState
          compact
          icon={BookOpen}
          title={t('teams.noKnowledge')}
          description={t('teams.knowledgeDescription')}
        />
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {sources.map((source) => {
            const Icon = typeIcons[source.type] || FileText
            return (
              <div
                key={source.id}
                className="rounded-lg border p-2.5 text-sm flex items-center gap-2"
              >
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{source.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={source.status === 'ready' ? 'default' : source.status === 'error' ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {source.status}
                    </Badge>
                    {source.chunkCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {source.chunkCount} chunks
                      </span>
                    )}
                  </div>
                  {source.errorMessage && (
                    <p className="text-[10px] text-destructive mt-0.5 truncate">{source.errorMessage}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(source.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

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
