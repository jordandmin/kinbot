import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useSSE } from '@/client/hooks/useSSE'

interface MiniAppContextValue {
  panelOpen: boolean
  activeAppId: string | null
  activeAppVersion: number
  openApp: (appId: string) => void
  closePanel: () => void
}

const MiniAppContext = createContext<MiniAppContextValue | null>(null)

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [activeAppId, setActiveAppId] = useState<string | null>(null)
  const [activeAppVersion, setActiveAppVersion] = useState(0)

  const openApp = useCallback((appId: string) => {
    setActiveAppId(appId)
    setActiveAppVersion((v) => v + 1)
  }, [])

  const closePanel = useCallback(() => {
    setActiveAppId(null)
  }, [])

  // Listen for file updates to reload the active app's iframe
  useSSE({
    'miniapp:file-updated': (data) => {
      const appId = data.appId as string
      const version = data.version as number
      if (appId === activeAppId) {
        setActiveAppVersion(version)
      }
    },
    'miniapp:deleted': (data) => {
      const appId = data.appId as string
      if (appId === activeAppId) {
        setActiveAppId(null)
      }
    },
  })

  return (
    <MiniAppContext.Provider
      value={{
        panelOpen: activeAppId !== null,
        activeAppId,
        activeAppVersion,
        openApp,
        closePanel,
      }}
    >
      {children}
    </MiniAppContext.Provider>
  )
}

export function useMiniAppPanel() {
  const ctx = useContext(MiniAppContext)
  if (!ctx) {
    throw new Error('useMiniAppPanel must be used within a MiniAppProvider')
  }
  return ctx
}
