import { eq, and, inArray } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { db } from '@/server/db/index'
import { teams, teamMembers, kins } from '@/server/db/schema'
import { sseManager } from '@/server/sse/index'
import { generateSlug, ensureUniqueSlug } from '@/server/utils/slug'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateTeamInput {
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  hubKinId: string
  memberKinIds?: string[]
  createdBy?: string
}

export interface UpdateTeamInput {
  name?: string
  slug?: string
  description?: string | null
  icon?: string | null
  color?: string | null
  hubKinId?: string
}

export interface TeamWithMembers {
  id: string
  name: string
  slug: string | null
  description: string | null
  icon: string | null
  color: string | null
  hubKinId: string
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
  members: TeamMemberDetail[]
}

export interface TeamMemberDetail {
  kinId: string
  kinName: string
  kinSlug: string | null
  kinRole: string
  kinAvatarPath: string | null
  teamRole: string
  joinedAt: Date
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExistingSlugs(): Set<string> {
  const rows = db.select({ slug: teams.slug }).from(teams).all()
  const set = new Set<string>()
  for (const r of rows) {
    if (r.slug) set.add(r.slug)
  }
  return set
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createTeam(input: CreateTeamInput) {
  const id = uuid()
  const now = new Date()

  // Validate hub kin exists
  const hubKin = db.select().from(kins).where(eq(kins.id, input.hubKinId)).get()
  if (!hubKin) throw new Error('Hub Kin not found')

  // Generate slug
  const baseSlug = input.slug || generateSlug(input.name)
  const slug = ensureUniqueSlug(baseSlug, getExistingSlugs())

  db.insert(teams).values({
    id,
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    icon: input.icon || null,
    color: input.color || null,
    hubKinId: input.hubKinId,
    createdBy: input.createdBy || null,
    createdAt: now,
    updatedAt: now,
  }).run()

  // Add hub kin as member with role 'hub'
  db.insert(teamMembers).values({
    teamId: id,
    kinId: input.hubKinId,
    role: 'hub',
    joinedAt: now,
  }).run()

  // Add additional members
  if (input.memberKinIds?.length) {
    for (const kinId of input.memberKinIds) {
      if (kinId === input.hubKinId) continue // already added
      const kin = db.select().from(kins).where(eq(kins.id, kinId)).get()
      if (!kin) continue
      db.insert(teamMembers).values({
        teamId: id,
        kinId,
        role: 'member',
        joinedAt: now,
      }).run()
    }
  }

  const team = await getTeamWithMembers(id)

  sseManager.broadcast({
    type: 'team:created',
    data: { teamId: id, name: input.name, slug },
  })

  return team
}

export async function updateTeam(teamId: string, input: UpdateTeamInput) {
  const existing = db.select().from(teams).where(eq(teams.id, teamId)).get()
  if (!existing) return null

  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.description !== undefined) updates.description = input.description?.trim() || null
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.color !== undefined) updates.color = input.color

  if (input.slug !== undefined && input.slug !== existing.slug) {
    const existingSlugs = getExistingSlugs()
    existingSlugs.delete(existing.slug || '')
    updates.slug = ensureUniqueSlug(input.slug || generateSlug(input.name || existing.name), existingSlugs)
  }

  if (input.hubKinId !== undefined && input.hubKinId !== existing.hubKinId) {
    const hubKin = db.select().from(kins).where(eq(kins.id, input.hubKinId)).get()
    if (!hubKin) throw new Error('Hub Kin not found')
    updates.hubKinId = input.hubKinId

    // Demote old hub to member
    db.update(teamMembers)
      .set({ role: 'member' })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, existing.hubKinId)))
      .run()

    // Ensure new hub is a member, promote to hub
    const existingMember = db.select().from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, input.hubKinId)))
      .get()

    if (existingMember) {
      db.update(teamMembers)
        .set({ role: 'hub' })
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, input.hubKinId)))
        .run()
    } else {
      db.insert(teamMembers).values({
        teamId,
        kinId: input.hubKinId,
        role: 'hub',
        joinedAt: new Date(),
      }).run()
    }
  }

  db.update(teams).set(updates).where(eq(teams.id, teamId)).run()

  const team = await getTeamWithMembers(teamId)

  sseManager.broadcast({
    type: 'team:updated',
    data: { teamId, name: team?.name },
  })

  return team
}

export async function deleteTeam(teamId: string) {
  const existing = db.select().from(teams).where(eq(teams.id, teamId)).get()
  if (!existing) return false

  // team_members cascade-deleted by FK
  db.delete(teams).where(eq(teams.id, teamId)).run()

  sseManager.broadcast({
    type: 'team:deleted',
    data: { teamId },
  })

  return true
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function addTeamMember(teamId: string, kinId: string) {
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get()
  if (!team) throw new Error('Team not found')

  const kin = db.select().from(kins).where(eq(kins.id, kinId)).get()
  if (!kin) throw new Error('Kin not found')

  const existing = db.select().from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, kinId)))
    .get()
  if (existing) return existing // already a member

  const now = new Date()
  db.insert(teamMembers).values({
    teamId,
    kinId,
    role: 'member',
    joinedAt: now,
  }).run()

  sseManager.broadcast({
    type: 'team:member_added',
    data: { teamId, kinId, kinName: kin.name },
  })

  return { teamId, kinId, role: 'member', joinedAt: now }
}

export async function removeTeamMember(teamId: string, kinId: string) {
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get()
  if (!team) throw new Error('Team not found')

  // Cannot remove the hub kin
  if (team.hubKinId === kinId) {
    throw new Error('Cannot remove the Hub Kin from its team. Change the Hub first.')
  }

  const member = db.select().from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, kinId)))
    .get()
  if (!member) return false

  db.delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, kinId)))
    .run()

  sseManager.broadcast({
    type: 'team:member_removed',
    data: { teamId, kinId },
  })

  return true
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function listTeams() {
  return db.select().from(teams).all()
}

export async function getTeam(teamId: string) {
  return db.select().from(teams).where(eq(teams.id, teamId)).get() || null
}

export async function getTeamBySlug(slug: string) {
  return db.select().from(teams).where(eq(teams.slug, slug)).get() || null
}

export async function getTeamWithMembers(teamId: string): Promise<TeamWithMembers | null> {
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get()
  if (!team) return null

  const members = db
    .select({
      kinId: teamMembers.kinId,
      teamRole: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      kinName: kins.name,
      kinSlug: kins.slug,
      kinRole: kins.role,
      kinAvatarPath: kins.avatarPath,
    })
    .from(teamMembers)
    .innerJoin(kins, eq(teamMembers.kinId, kins.id))
    .where(eq(teamMembers.teamId, teamId))
    .all()

  return {
    ...team,
    members: members.map((m) => ({
      kinId: m.kinId,
      kinName: m.kinName,
      kinSlug: m.kinSlug,
      kinRole: m.kinRole,
      kinAvatarPath: m.kinAvatarPath,
      teamRole: m.teamRole,
      joinedAt: m.joinedAt,
    })),
  }
}

export async function getTeamsForKin(kinId: string) {
  const memberships = db
    .select({ teamId: teamMembers.teamId, role: teamMembers.role })
    .from(teamMembers)
    .where(eq(teamMembers.kinId, kinId))
    .all()

  if (!memberships.length) return []

  const teamIds = memberships.map((m) => m.teamId)
  const teamRows = db.select().from(teams).where(inArray(teams.id, teamIds)).all()

  return teamRows.map((t) => ({
    ...t,
    memberRole: memberships.find((m) => m.teamId === t.id)?.role || 'member',
  }))
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberDetail[]> {
  const members = db
    .select({
      kinId: teamMembers.kinId,
      teamRole: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      kinName: kins.name,
      kinSlug: kins.slug,
      kinRole: kins.role,
      kinAvatarPath: kins.avatarPath,
    })
    .from(teamMembers)
    .innerJoin(kins, eq(teamMembers.kinId, kins.id))
    .where(eq(teamMembers.teamId, teamId))
    .all()

  return members.map((m) => ({
    kinId: m.kinId,
    kinName: m.kinName,
    kinSlug: m.kinSlug,
    kinRole: m.kinRole,
    kinAvatarPath: m.kinAvatarPath,
    teamRole: m.teamRole,
    joinedAt: m.joinedAt,
  }))
}

export async function isKinInTeam(kinId: string, teamId: string): Promise<boolean> {
  const member = db.select().from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.kinId, kinId)))
    .get()
  return !!member
}
