import { useState, useEffect } from 'react'
import { api } from '@/client/lib/api'

export interface PlatformInfo {
  platform: string
  displayName: string
  brandColor?: string
  iconUrl?: string
  isPlugin: boolean
}

/** Cached platforms — shared across all hook consumers within the same session */
let cachedPlatforms: PlatformInfo[] | null = null
let fetchPromise: Promise<PlatformInfo[]> | null = null

function fetchPlatforms(): Promise<PlatformInfo[]> {
  if (!fetchPromise) {
    fetchPromise = api
      .get<{ platforms: PlatformInfo[] }>('/channels/platforms')
      .then((res) => {
        cachedPlatforms = res.platforms
        return res.platforms
      })
      .catch(() => {
        fetchPromise = null
        return []
      })
  }
  return fetchPromise
}

/**
 * Hook to get registered channel platforms from the API.
 * Results are cached for the session lifetime.
 */
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>(cachedPlatforms ?? [])
  const [loading, setLoading] = useState(!cachedPlatforms)

  useEffect(() => {
    if (cachedPlatforms) {
      setPlatforms(cachedPlatforms)
      setLoading(false)
      return
    }
    fetchPlatforms().then((p) => {
      setPlatforms(p)
      setLoading(false)
    })
  }, [])

  return { platforms, loading }
}
