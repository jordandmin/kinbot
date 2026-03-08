import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Textarea } from '@/client/components/ui/textarea'
import { Badge } from '@/client/components/ui/badge'
import { Label } from '@/client/components/ui/label'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/client/components/ui/collapsible'
import { EmptyState } from '@/client/components/common/EmptyState'
import { api, toastError } from '@/client/lib/api'
import { cn } from '@/client/lib/utils'
import {
  BookOpen,
  ChevronRight,
  FileText,
  Globe,
  File,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'

interface KnowledgeSource {
  id: string
  kinId: string
  name: string
  type: 'file' | 'text' | 'url'
  status: 'pending' | 'processing' | 'ready' | 'error'
  errorMessage: string | null
  originalFilename: string | null
  mimeType: string | null
  chunkCount: number
  tokenCount: number
  createdAt: string
  updatedAt: string
}

interface KnowledgeChunk {
  id: string
  sourceId: string
  content: string
  position: number
  tokenCount: number
}

interface KinKnowledgeTabProps {
  kinId: string | null
}

type SourceType = 'text' | 'url'

const TYPE_ICONS = {
  text: FileText,
  url: Globe,
  file: File,
} as const

function StatusBadge({ status, errorMessage }: { status: KnowledgeSource['status']; errorMessage?: string | null }) {
  const { t } = useTranslation()

  const variants: Record<string, string> = {
    ready: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    processing: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    pending: 'bg-muted text-muted-foreground border-border',
    error: 'bg-destructive/15 text-destructive border-destructive/20',
  }

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 text-[10px]', variants[status])}
      title={status === 'error' && errorMessage ? errorMessage : undefined}
    >
      {status === 'processing' && <Loader2 className="size-3 animate-spin" />}
      {t(`knowledge.status.${status}`)}
    </Badge>
  )
}

export function KinKnowledgeTab({ kinId }: KinKnowledgeTabProps) {
  const { t } = useTranslation()
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addType, setAddType] = useState<SourceType>('text')
  const [addName, setAddName] = useState('')
  const [addContent, setAddContent] = useState('')
  const [addUrl, setAddUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [chunks, setChunks] = useState<Record<string, KnowledgeChunk[]>>({})
  const [loadingChunks, setLoadingChunks] = useState<string | null>(null)

  const fetchSources = useCallback(async () => {
    if (!kinId) return
    setIsLoading(true)
    try {
      const data = await api.get<{ sources: KnowledgeSource[] }>(`/kins/${kinId}/knowledge`)
      setSources(data.sources)
    } catch (err) {
      toastError(err)
    } finally {
      setIsLoading(false)
    }
  }, [kinId])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  // Poll for processing sources
  useEffect(() => {
    const hasProcessing = sources.some((s) => s.status === 'processing' || s.status === 'pending')
    if (!hasProcessing) return
    const interval = setInterval(fetchSources, 3000)
    return () => clearInterval(interval)
  }, [sources, fetchSources])

  const handleAdd = async () => {
    if (!kinId || !addName.trim()) return
    setIsAdding(true)
    try {
      await api.post(`/kins/${kinId}/knowledge`, {
        name: addName.trim(),
        type: addType,
        ...(addType === 'text' ? { content: addContent } : { sourceUrl: addUrl }),
      })
      toast.success(t('common.success'))
      setShowAddForm(false)
      setAddName('')
      setAddContent('')
      setAddUrl('')
      await fetchSources()
    } catch (err) {
      toastError(err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!kinId || !deleteId) return
    try {
      await api.delete(`/kins/${kinId}/knowledge/${deleteId}`)
      toast.success(t('common.success'))
      setSources((prev) => prev.filter((s) => s.id !== deleteId))
    } catch (err) {
      toastError(err)
    } finally {
      setDeleteId(null)
    }
  }

  const handleReprocess = async (sourceId: string) => {
    if (!kinId) return
    try {
      await api.post(`/kins/${kinId}/knowledge/${sourceId}/reprocess`)
      toast.success(t('common.success'))
      await fetchSources()
    } catch (err) {
      toastError(err)
    }
  }

  const toggleChunks = async (sourceId: string) => {
    if (expandedId === sourceId) {
      setExpandedId(null)
      return
    }
    setExpandedId(sourceId)
    if (chunks[sourceId]) return
    setLoadingChunks(sourceId)
    try {
      const data = await api.get<{ source: KnowledgeSource; chunks: KnowledgeChunk[] }>(
        `/kins/${kinId}/knowledge/${sourceId}`,
      )
      setChunks((prev) => ({ ...prev, [sourceId]: data.chunks }))
    } catch (err) {
      toastError(err)
    } finally {
      setLoadingChunks(null)
    }
  }

  if (!kinId) {
    return (
      <EmptyState
        minimal
        icon={BookOpen}
        title={t('knowledge.createFirst')}
        description={t('knowledge.createFirstDescription')}
      />
    )
  }

  if (isLoading && sources.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t('knowledge.title')}</h3>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={fetchSources} disabled={isLoading}>
            <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="size-3.5" />
            {t('knowledge.addSource')}
          </Button>
        </div>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <div className="rounded-lg border bg-card/50 p-4 space-y-3">
          {/* Type selector */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={addType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddType('text')}
            >
              <FileText className="size-3.5" />
              {t('knowledge.sourceType.text')}
            </Button>
            <Button
              type="button"
              variant={addType === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddType('url')}
            >
              <Globe className="size-3.5" />
              {t('knowledge.sourceType.url')}
            </Button>
            <div className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              <X className="size-3.5" />
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('knowledge.sourceName')}</Label>
            <Input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder={t('knowledge.sourceNamePlaceholder')}
            />
          </div>

          {/* Content or URL */}
          {addType === 'text' ? (
            <div className="space-y-1.5">
              <Label className="text-xs">{t('knowledge.content')}</Label>
              <Textarea
                value={addContent}
                onChange={(e) => setAddContent(e.target.value)}
                placeholder={t('knowledge.contentPlaceholder')}
                className="min-h-[120px] resize-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">{t('knowledge.url')}</Label>
              <Input
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder={t('knowledge.urlPlaceholder')}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={isAdding || !addName.trim() || (addType === 'text' ? !addContent.trim() : !addUrl.trim())}
            >
              {isAdding && <Loader2 className="size-3.5 animate-spin" />}
              {t('knowledge.addSource')}
            </Button>
          </div>
        </div>
      )}

      {/* Sources list */}
      {sources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('knowledge.empty')}
          description={t('knowledge.emptyDescription')}
          actionLabel={t('knowledge.addSource')}
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="space-y-2">
          {sources.map((source) => {
            const TypeIcon = TYPE_ICONS[source.type] ?? File
            const isExpanded = expandedId === source.id
            const sourceChunks = chunks[source.id]

            return (
              <Collapsible key={source.id} open={isExpanded} onOpenChange={() => toggleChunks(source.id)}>
                <div className="rounded-lg border bg-card/50">
                  {/* Source header */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <CollapsibleTrigger asChild>
                      <button type="button" className="flex flex-1 items-center gap-2.5 text-left min-w-0">
                        <ChevronRight
                          className={cn(
                            'size-3.5 shrink-0 text-muted-foreground transition-transform',
                            isExpanded && 'rotate-90',
                          )}
                        />
                        <TypeIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{source.name}</span>
                        <StatusBadge status={source.status} errorMessage={source.errorMessage} />
                        {source.chunkCount > 0 && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {t('knowledge.chunks', { count: source.chunkCount })}
                          </span>
                        )}
                        {source.tokenCount > 0 && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {t('knowledge.tokens', { count: source.tokenCount })}
                          </span>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-1 shrink-0">
                      {source.status === 'error' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReprocess(source.id)}
                          title={t('knowledge.reprocess')}
                        >
                          <RefreshCw className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(source.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Error message */}
                  {source.status === 'error' && source.errorMessage && (
                    <div className="border-t px-3 py-2">
                      <p className="text-xs text-destructive">{source.errorMessage}</p>
                    </div>
                  )}

                  {/* Chunks preview */}
                  <CollapsibleContent>
                    <div className="border-t">
                      {loadingChunks === source.id ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : sourceChunks && sourceChunks.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto divide-y">
                          {sourceChunks.map((chunk) => (
                            <div key={chunk.id} className="px-3 py-2">
                              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                {t('knowledge.chunkPosition', { position: chunk.position + 1 })}
                                <span className="ml-2">{t('knowledge.tokens', { count: chunk.tokenCount })}</span>
                              </p>
                              <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-4">
                                {chunk.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-3 text-xs text-muted-foreground italic">
                          {t('knowledge.empty')}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('knowledge.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('knowledge.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
