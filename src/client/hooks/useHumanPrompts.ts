import { useState, useEffect, useCallback } from 'react'
import { api } from '@/client/lib/api'
import { useSSE } from '@/client/hooks/useSSE'
import type { HumanPromptSummary } from '@/shared/types'

/**
 * Manages pending human prompts for a given Kin (and optionally a specific task).
 * Fetches pending prompts on mount, listens for SSE events, and provides a respond function.
 */
export function useHumanPrompts(kinId: string | null, taskId?: string | null) {
  const [prompts, setPrompts] = useState<HumanPromptSummary[]>([])
  const [isResponding, setIsResponding] = useState(false)

  // Fetch pending prompts on mount / kinId change
  const fetchPending = useCallback(async () => {
    if (!kinId) {
      setPrompts([])
      return
    }
    const params = new URLSearchParams({ kinId })
    if (taskId) params.set('taskId', taskId)
    try {
      const data = await api.get<{ prompts: HumanPromptSummary[] }>(`/prompts/pending?${params}`)
      setPrompts(data.prompts)
    } catch {
      // Ignore fetch errors — prompts will appear via SSE
    }
  }, [kinId, taskId])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  // SSE handlers
  useSSE({
    'prompt:pending': (data) => {
      if (data.kinId !== kinId) return
      if (taskId !== undefined && taskId !== null && data.taskId !== taskId) return

      const newPrompt: HumanPromptSummary = {
        id: data.promptId as string,
        kinId: data.kinId as string,
        taskId: (data.taskId as string) ?? null,
        promptType: data.promptType as HumanPromptSummary['promptType'],
        question: data.question as string,
        description: (data.description as string) ?? null,
        options: data.options as HumanPromptSummary['options'],
        response: null,
        status: 'pending',
        createdAt: Date.now(),
        respondedAt: null,
      }
      setPrompts((prev) => [...prev, newPrompt])
    },
    'prompt:answered': (data) => {
      if (data.kinId !== kinId) return
      const promptId = data.promptId as string
      setPrompts((prev) => prev.filter((p) => p.id !== promptId))
    },
  })

  // Submit a response to a prompt
  const respond = useCallback(async (promptId: string, response: unknown) => {
    setIsResponding(true)
    try {
      await api.post(`/prompts/${promptId}/respond`, { response })
      // Optimistic removal
      setPrompts((prev) => prev.filter((p) => p.id !== promptId))
    } finally {
      setIsResponding(false)
    }
  }, [])

  return { prompts, respond, isResponding, refetch: fetchPending }
}
