import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '@/client/lib/api'
import { useSSE } from '@/client/hooks/useSSE'
import type { CronSummary } from '@/shared/types'

interface CronsResponse {
  crons: CronSummary[]
}

interface CreateCronData {
  kinId: string
  name: string
  schedule: string
  taskDescription: string
  targetKinId?: string
  model?: string
}

type UpdateCronData = Partial<{
  name: string
  schedule: string
  taskDescription: string
  targetKinId: string
  model: string
  isActive: boolean
}>

export function useCrons() {
  const [crons, setCrons] = useState<CronSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCrons = useCallback(async () => {
    try {
      const data = await api.get<CronsResponse>('/crons')
      setCrons(data.crons)
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCrons()
  }, [fetchCrons])

  const createCron = useCallback(async (data: CreateCronData) => {
    const result = await api.post<{ cron: CronSummary }>('/crons', data)
    setCrons((prev) => [result.cron, ...prev])
    return result.cron
  }, [])

  const updateCron = useCallback(async (id: string, updates: UpdateCronData) => {
    const result = await api.patch<{ cron: CronSummary }>(`/crons/${id}`, updates)
    setCrons((prev) => prev.map((c) => (c.id === id ? result.cron : c)))
    return result.cron
  }, [])

  const deleteCron = useCallback(async (id: string) => {
    await api.delete(`/crons/${id}`)
    setCrons((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const approveCron = useCallback(async (id: string) => {
    const result = await api.post<{ cron: CronSummary }>(`/crons/${id}/approve`)
    setCrons((prev) => prev.map((c) => (c.id === id ? result.cron : c)))
    return result.cron
  }, [])

  // SSE: real-time cron updates
  useSSE({
    'cron:triggered': (data) => {
      const cronId = data.cronId as string
      setCrons((prev) =>
        prev.map((c) =>
          c.id === cronId ? { ...c, lastTriggeredAt: Date.now() } : c,
        ),
      )
    },
    'cron:created': () => {
      // A cron was created (possibly by a kin) — refetch to get full data
      fetchCrons()
    },
    'cron:updated': () => {
      // A cron was updated (possibly approval, toggle, etc.) — refetch
      fetchCrons()
    },
    'cron:deleted': (data) => {
      const cronId = data.cronId as string
      setCrons((prev) => prev.filter((c) => c.id !== cronId))
    },
  })

  // Sort: pending-approval first, then active, then inactive, newest first
  const sortedCrons = useMemo(
    () =>
      [...crons].sort((a, b) => {
        if (a.requiresApproval !== b.requiresApproval) return a.requiresApproval ? -1 : 1
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
        return b.createdAt - a.createdAt
      }),
    [crons],
  )

  return {
    crons: sortedCrons,
    isLoading,
    createCron,
    updateCron,
    deleteCron,
    approveCron,
    refetch: fetchCrons,
  }
}
