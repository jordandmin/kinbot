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
import { createLogger } from '@/server/logger'

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
