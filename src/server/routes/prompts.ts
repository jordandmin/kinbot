import { Hono } from 'hono'
import { respondToHumanPrompt, getPendingPrompts } from '@/server/services/human-prompts'
import { createLogger } from '@/server/logger'
import type { AppVariables } from '@/server/app'

const log = createLogger('routes:prompts')

export const promptRoutes = new Hono<{ Variables: AppVariables }>()

/**
 * POST /api/prompts/:id/respond — submit a response to a human prompt.
 */
promptRoutes.post('/:id/respond', async (c) => {
  const promptId = c.req.param('id')
  const body = await c.req.json<{ response: unknown }>()

  if (body.response === undefined || body.response === null) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Response is required' } }, 400)
  }

  const user = c.get('user')
  const result = await respondToHumanPrompt(promptId, body.response, user.id)

  if (!result.success) {
    return c.json({ error: { code: 'PROMPT_ERROR', message: result.error } }, 400)
  }

  return c.json({ success: true })
})

/**
 * GET /api/prompts/pending — get pending prompts for hydration on page load.
 * Query params: kinId (required), taskId (optional)
 */
promptRoutes.get('/pending', async (c) => {
  const kinId = c.req.query('kinId')
  const taskId = c.req.query('taskId')

  if (!kinId) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'kinId is required' } }, 400)
  }

  const prompts = await getPendingPrompts(kinId, taskId ?? undefined)
  return c.json({ prompts })
})
