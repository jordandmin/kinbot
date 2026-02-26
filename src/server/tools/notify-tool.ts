import { tool } from 'ai'
import { z } from 'zod'
import { createNotification } from '@/server/services/notifications'
import type { ToolRegistration } from './types'

export const notifyTool: ToolRegistration = {
  availability: ['main', 'sub-kin'],
  create: (ctx) =>
    tool({
      description:
        'Send a custom notification to the user via the platform notification system (bell icon + external channels like Telegram/Discord if configured). Use for proactive alerts, reminders, or important updates that do not require user input.',
      inputSchema: z.object({
        title: z.string().max(100).describe('Short notification title (max 100 characters)'),
        body: z
          .string()
          .max(500)
          .optional()
          .describe('Optional notification body with additional details (max 500 characters)'),
      }),
      execute: async ({ title, body }) => {
        await createNotification({
          type: 'kin:alert',
          title,
          body,
          kinId: ctx.kinId,
          relatedType: 'kin',
        })
        return { success: true, message: 'Notification sent to user.' }
      },
    }),
}
