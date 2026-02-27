import { useTranslation } from 'react-i18next'
import { useMiniAppPanel } from '@/client/contexts/MiniAppContext'
import { Button } from '@/client/components/ui/button'
import { X, RotateCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/client/lib/api'
import type { MiniAppSummary } from '@/shared/types'

export function MiniAppViewer() {
  const { t } = useTranslation()
  const { panelOpen, activeAppId, activeAppVersion, closePanel } = useMiniAppPanel()
  const [app, setApp] = useState<MiniAppSummary | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  // Fetch app details when activeAppId changes
  useEffect(() => {
    if (!activeAppId) {
      setApp(null)
      return
    }
    let cancelled = false
    api.get<{ app: MiniAppSummary }>(`/mini-apps/${activeAppId}`).then((data) => {
      if (!cancelled) setApp(data.app)
    }).catch(() => {
      if (!cancelled) setApp(null)
    })
    return () => { cancelled = true }
  }, [activeAppId])

  // Reload iframe when version changes
  useEffect(() => {
    if (activeAppVersion > 0) {
      setIframeKey((k) => k + 1)
    }
  }, [activeAppVersion])

  const handleRefresh = useCallback(() => {
    setIframeKey((k) => k + 1)
  }, [])

  const iframeSrc = activeAppId
    ? `/api/mini-apps/${activeAppId}/serve?v=${activeAppVersion}`
    : ''

  return (
    <div
      className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
        panelOpen ? 'w-[480px] lg:w-[600px]' : 'w-0'
      }`}
    >
      <div className="flex h-full w-[480px] lg:w-[600px] flex-col border-l border-border">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          {app?.icon && <span className="text-base">{app.icon}</span>}
          <span className="flex-1 truncate text-sm font-medium">
            {app?.name ?? '...'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleRefresh}
            title={t('miniApps.refresh')}
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={closePanel}
            title={t('miniApps.closePanel')}
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Iframe */}
        {activeAppId && (
          <iframe
            key={iframeKey}
            src={iframeSrc}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="min-h-0 flex-1 w-full border-0"
            title={app?.name ?? 'Mini App'}
          />
        )}
      </div>
    </div>
  )
}
