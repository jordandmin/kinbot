import { Hono } from 'hono'
import {
  listTeams,
  getTeamWithMembers,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from '@/server/services/teams'
import {
  listTeamMemories,
  createTeamMemory,
  updateTeamMemory,
  deleteTeamMemory,
  searchTeamMemories,
} from '@/server/services/team-memory'
import {
  listTeamSources,
  getTeamSource,
  getTeamSourceChunks,
  createTeamSource,
  deleteTeamSource,
  processTeamSource,
  searchTeamKnowledge,
} from '@/server/services/team-knowledge'
import { createLogger } from '@/server/logger'
import type { MemoryCategory } from '@/shared/types'

const log = createLogger('routes:teams')
export const teamRoutes = new Hono()

// GET /api/teams - list all teams with members
teamRoutes.get('/', async (c) => {
  const allTeams = await listTeams()
  const teamsWithMembers = await Promise.all(
    allTeams.map((t) => getTeamWithMembers(t.id)),
  )
  return c.json({ teams: teamsWithMembers.filter(Boolean) })
})

// GET /api/teams/:id - get team details + members
teamRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const team = await getTeamWithMembers(id)
  if (!team) {
    return c.json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } }, 404)
  }
  return c.json({ team })
})

// POST /api/teams - create team
teamRoutes.post('/', async (c) => {
  const body = await c.req.json() as {
    name: string
    slug?: string
    description?: string
    icon?: string
    color?: string
    hubKinId: string
    memberKinIds?: string[]
  }

  const trimmedName = body.name?.trim()
  if (!trimmedName) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Name is required' } }, 400)
  }
  if (trimmedName.length > 100) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Name must be 100 characters or less' } }, 400)
  }
  if (!body.hubKinId) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'hubKinId is required' } }, 400)
  }

  try {
    const team = await createTeam({
      name: trimmedName,
      slug: body.slug,
      description: body.description,
      icon: body.icon,
      color: body.color,
      hubKinId: body.hubKinId,
      memberKinIds: body.memberKinIds,
    })
    return c.json({ team }, 201)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create team'
    log.error({ err }, 'Failed to create team')
    return c.json({ error: { code: 'CREATE_FAILED', message } }, 400)
  }
})

// PATCH /api/teams/:id - update team
teamRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json() as {
    name?: string
    slug?: string
    description?: string | null
    icon?: string | null
    color?: string | null
    hubKinId?: string
  }

  try {
    const team = await updateTeam(id, body)
    if (!team) {
      return c.json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } }, 404)
    }
    return c.json({ team })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update team'
    log.error({ err }, 'Failed to update team')
    return c.json({ error: { code: 'UPDATE_FAILED', message } }, 400)
  }
})

// DELETE /api/teams/:id - delete team
teamRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await deleteTeam(id)
  if (!deleted) {
    return c.json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } }, 404)
  }
  return c.json({ success: true })
})

// POST /api/teams/:id/members - add member
teamRoutes.post('/:id/members', async (c) => {
  const teamId = c.req.param('id')
  const { kinId } = await c.req.json() as { kinId: string }

  if (!kinId) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'kinId is required' } }, 400)
  }

  try {
    const member = await addTeamMember(teamId, kinId)
    return c.json({ member }, 201)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add member'
    log.error({ err }, 'Failed to add team member')
    return c.json({ error: { code: 'ADD_MEMBER_FAILED', message } }, 400)
  }
})

// DELETE /api/teams/:id/members/:kinId - remove member
teamRoutes.delete('/:id/members/:kinId', async (c) => {
  const teamId = c.req.param('id')
  const kinId = c.req.param('kinId')

  try {
    const removed = await removeTeamMember(teamId, kinId)
    if (!removed) {
      return c.json({ error: { code: 'MEMBER_NOT_FOUND', message: 'Member not found in team' } }, 404)
    }
    return c.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove member'
    log.error({ err }, 'Failed to remove team member')
    return c.json({ error: { code: 'REMOVE_MEMBER_FAILED', message } }, 400)
  }
})

// ─── Team Memories ───────────────────────────────────────────────────────────

// GET /api/teams/:id/memories - list team memories
teamRoutes.get('/:id/memories', async (c) => {
  const teamId = c.req.param('id')
  const category = c.req.query('category') as MemoryCategory | undefined
  const subject = c.req.query('subject')
  const query = c.req.query('q')

  if (query) {
    const results = await searchTeamMemories(teamId, query, 20)
    return c.json({ memories: results })
  }

  const memories = await listTeamMemories(teamId, { category, subject })
  return c.json({ memories })
})

// POST /api/teams/:id/memories - create team memory
teamRoutes.post('/:id/memories', async (c) => {
  const teamId = c.req.param('id')
  const body = await c.req.json() as {
    content: string
    category: MemoryCategory
    authorKinId: string
    subject?: string
    importance?: number
  }

  if (!body.content?.trim()) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Content is required' } }, 400)
  }
  if (!body.authorKinId) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'authorKinId is required' } }, 400)
  }

  try {
    const memory = await createTeamMemory(teamId, body.authorKinId, {
      content: body.content.trim(),
      category: body.category || 'fact',
      subject: body.subject,
      importance: body.importance,
    })
    return c.json({ memory }, 201)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create team memory'
    log.error({ err }, 'Failed to create team memory')
    return c.json({ error: { code: 'CREATE_FAILED', message } }, 400)
  }
})

// PATCH /api/teams/:id/memories/:memoryId - update team memory
teamRoutes.patch('/:id/memories/:memoryId', async (c) => {
  const teamId = c.req.param('id')
  const memoryId = c.req.param('memoryId')
  const body = await c.req.json() as {
    content?: string
    category?: MemoryCategory
    subject?: string | null
    importance?: number | null
  }

  const updated = await updateTeamMemory(memoryId, teamId, body)
  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Team memory not found' } }, 404)
  }
  return c.json({ memory: updated })
})

// DELETE /api/teams/:id/memories/:memoryId - delete team memory
teamRoutes.delete('/:id/memories/:memoryId', async (c) => {
  const teamId = c.req.param('id')
  const memoryId = c.req.param('memoryId')
  const deleted = await deleteTeamMemory(memoryId, teamId)
  if (!deleted) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Team memory not found' } }, 404)
  }
  return c.json({ success: true })
})

// ─── Team Knowledge ──────────────────────────────────────────────────────────

// GET /api/teams/:id/knowledge - list team knowledge sources
teamRoutes.get('/:id/knowledge', async (c) => {
  const teamId = c.req.param('id')
  const sources = await listTeamSources(teamId)
  return c.json({ sources })
})

// POST /api/teams/:id/knowledge - create team knowledge source
teamRoutes.post('/:id/knowledge', async (c) => {
  const teamId = c.req.param('id')
  const body = await c.req.json() as {
    name: string
    type: 'file' | 'text' | 'url'
    content?: string
    sourceUrl?: string
    originalFilename?: string
    mimeType?: string
  }

  if (!body.name || !body.type) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'name and type are required' } }, 400)
  }

  try {
    const source = await createTeamSource(teamId, {
      name: body.name,
      type: body.type,
      content: body.content ?? null,
      sourceUrl: body.sourceUrl ?? null,
      originalFilename: body.originalFilename ?? null,
      mimeType: body.mimeType ?? null,
    })

    // Start processing in the background
    processTeamSource(source.id).catch(() => {
      // Error is already handled inside processTeamSource
    })

    return c.json({ source }, 201)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create team knowledge source'
    log.error({ err }, 'Failed to create team knowledge source')
    return c.json({ error: { code: 'CREATE_FAILED', message } }, 400)
  }
})

// GET /api/teams/:id/knowledge/search - search team knowledge
teamRoutes.get('/:id/knowledge/search', async (c) => {
  const teamId = c.req.param('id')
  const query = c.req.query('q')
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined

  if (!query) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'q query parameter is required' } }, 400)
  }

  const results = await searchTeamKnowledge(teamId, query, limit)
  return c.json({ results })
})

// GET /api/teams/:id/knowledge/:sourceId - get source with chunks
teamRoutes.get('/:id/knowledge/:sourceId', async (c) => {
  const teamId = c.req.param('id')
  const sourceId = c.req.param('sourceId')

  const source = await getTeamSource(sourceId, teamId)
  if (!source) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Team knowledge source not found' } }, 404)
  }

  const chunks = await getTeamSourceChunks(sourceId)
  return c.json({ source, chunks })
})

// DELETE /api/teams/:id/knowledge/:sourceId - delete source
teamRoutes.delete('/:id/knowledge/:sourceId', async (c) => {
  const teamId = c.req.param('id')
  const sourceId = c.req.param('sourceId')

  const deleted = await deleteTeamSource(sourceId, teamId)
  if (!deleted) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Team knowledge source not found' } }, 404)
  }

  return c.json({ success: true })
})

// POST /api/teams/:id/knowledge/:sourceId/reprocess - reprocess source
teamRoutes.post('/:id/knowledge/:sourceId/reprocess', async (c) => {
  const teamId = c.req.param('id')
  const sourceId = c.req.param('sourceId')

  const source = await getTeamSource(sourceId, teamId)
  if (!source) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Team knowledge source not found' } }, 404)
  }

  processTeamSource(sourceId).catch(() => {
    // Error handled inside processTeamSource
  })

  return c.json({ success: true, message: 'Reprocessing started' })
})
