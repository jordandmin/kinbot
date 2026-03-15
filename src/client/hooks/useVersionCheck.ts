import { useState, useEffect, useCallback } from 'react'
import { api } from '@/client/lib/api'
import { useSSE } from '@/client/hooks/useSSE'
import type { VersionInfo } from '@/shared/types'

export function useVersionCheck() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchVersionInfo = useCallback(async () => {
    try {
      const data = await api.get<VersionInfo>('/version-check')
      setVersionInfo(data)
    } catch {
      // Non-critical — silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVersionInfo()
  }, [fetchVersionInfo])

  useSSE({
    'version:update-available': (data) => {
      setVersionInfo((prev) =>
        prev
          ? {
              ...prev,
              latestVersion: data.latestVersion as string,
              releaseUrl: (data.releaseUrl as string) ?? null,
              publishedAt: (data.publishedAt as number) ?? null,
              isUpdateAvailable: true,
            }
          : null,
      )
    },
  })

  return { versionInfo, isLoading, refetch: fetchVersionInfo }
}
