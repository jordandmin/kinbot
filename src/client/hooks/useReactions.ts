import { useCallback } from 'react'
import { api } from '@/client/lib/api'

export const PRESET_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

export function useReactions(kinId: string | null) {
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!kinId) return
      await api.post(`/kins/${kinId}/messages/${messageId}/reactions`, { emoji })
    },
    [kinId],
  )

  return { toggleReaction, presetEmojis: PRESET_EMOJIS }
}
