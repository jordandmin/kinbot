import { tool } from 'ai'
import { z } from 'zod'
import {
  searchTeamMemories,
  createTeamMemory,
  updateTeamMemory,
  deleteTeamMemory,
  listTeamMemories,
} from '@/server/services/team-memory'
import { getTeamsForKin } from '@/server/services/teams'
import { createLogger } from '@/server/logger'
import type { ToolRegistration } from '@/server/tools/types'
import type { MemoryCategory } from '@/shared/types'

const log = createLogger('tools:team-memory')

const CATEGORIES: [string, ...string[]] = ['fact', 'preference', 'decision', 'knowledge']

function formatMemoryAge(updatedAt: Date | null): string | null {
  if (!updatedAt) return null
  const diffMs = Date.now() - updatedAt.getTime()
  const diffMin = Math.round(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.round(diffDays / 365)}y ago`
}

/**
 * Helper: resolve team ID from optional team_id or pick the first team the Kin belongs to.
 */
async function resolveTeamId(kinId: string, teamId?: string): Promise<{ teamId: string; teamName: string } | { error: string }> {
  if (teamId) {
    return { teamId, teamName: teamId }
  }
  const teams = await getTeamsForKin(kinId)
  if (teams.length === 0) {
    return { error: 'You are not a member of any team.' }
  }
  return { teamId: teams[0]!.id, teamName: teams[0]!.name }
}

/**
 * team_recall - search team shared memory.
 * Opt-in tool, enabled when a Kin joins a team.
 */
export const teamRecallTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description:
        'Search your team\'s shared memory for relevant information. Team memories are shared ' +
        'across all team members. Use this when you need team-level context, shared decisions, ' +
        'or knowledge stored by any team member.',
      inputSchema: z.object({
        query: z.string().describe('What to search for (semantic + keyword search)'),
        team_id: z.string().optional().describe('Team ID (defaults to your first team)'),
        limit: z.number().int().min(1).max(20).optional().describe('Max results (default: 10)'),
      }),
      execute: async ({ query, team_id, limit }) => {
        const resolved = await resolveTeamId(ctx.kinId, team_id)
        if ('error' in resolved) return resolved

        log.debug({ kinId: ctx.kinId, teamId: resolved.teamId, query }, 'Team recall invoked')
        const results = await searchTeamMemories(resolved.teamId, query, limit)
        return {
          memories: results.map((m) => ({
            id: m.id,
            content: m.content,
            category: m.category,
            subject: m.subject,
            importance: m.importance,
            author_kin_id: m.authorKinId,
            age: formatMemoryAge(m.updatedAt),
          })),
        }
      },
    }),
}

/**
 * team_memorize - save information to team shared memory.
 * Opt-in tool, enabled when a Kin joins a team.
 */
export const teamMemorizeTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description:
        'Save information to your team\'s shared memory. All team members can access this. ' +
        'Use this for team-level decisions, shared knowledge, project facts, or anything ' +
        'the whole team should remember.',
      inputSchema: z.object({
        content: z.string().describe('The information to remember (clear, standalone sentence)'),
        category: z.enum(CATEGORIES).describe('Type: "fact", "preference", "decision", or "knowledge"'),
        subject: z.string().optional().describe('Who or what this is about'),
        importance: z.number().int().min(1).max(10).optional().describe('Importance 1-10 (default: 5)'),
        team_id: z.string().optional().describe('Team ID (defaults to your first team)'),
      }),
      execute: async ({ content, category, subject, importance, team_id }) => {
        const resolved = await resolveTeamId(ctx.kinId, team_id)
        if ('error' in resolved) return resolved

        log.debug({ kinId: ctx.kinId, teamId: resolved.teamId, category, subject }, 'Team memorize invoked')
        const memory = await createTeamMemory(resolved.teamId, ctx.kinId, {
          content,
          category: category as MemoryCategory,
          subject,
          importance: importance ?? null,
        })
        return memory
          ? { id: memory.id, content: memory.content, category: memory.category, subject: memory.subject }
          : { error: 'Failed to create team memory' }
      },
    }),
}

/**
 * update_team_memory - update an existing team memory.
 */
export const updateTeamMemoryTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description: 'Update an existing team memory with corrected or updated information.',
      inputSchema: z.object({
        memory_id: z.string().describe('The team memory ID to update'),
        team_id: z.string().optional().describe('Team ID (defaults to your first team)'),
        content: z.string().optional().describe('Updated content'),
        category: z.enum(CATEGORIES).optional().describe('Updated category'),
        subject: z.string().optional().describe('Updated subject'),
      }),
      execute: async ({ memory_id, team_id, content, category, subject }) => {
        const resolved = await resolveTeamId(ctx.kinId, team_id)
        if ('error' in resolved) return resolved

        const updated = await updateTeamMemory(memory_id, resolved.teamId, {
          content,
          category: category as MemoryCategory | undefined,
          subject,
        })
        if (!updated) return { error: 'Team memory not found' }
        return { id: updated.id, content: updated.content, category: updated.category, subject: updated.subject }
      },
    }),
}

/**
 * forget_team_memory - delete a team memory.
 */
export const forgetTeamMemoryTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description: 'Delete a team memory that is outdated or no longer relevant.',
      inputSchema: z.object({
        memory_id: z.string().describe('The team memory ID to delete'),
        team_id: z.string().optional().describe('Team ID (defaults to your first team)'),
      }),
      execute: async ({ memory_id, team_id }) => {
        const resolved = await resolveTeamId(ctx.kinId, team_id)
        if ('error' in resolved) return resolved

        const deleted = await deleteTeamMemory(memory_id, resolved.teamId)
        return deleted ? { success: true } : { error: 'Team memory not found' }
      },
    }),
}

/**
 * list_team_memories - list all team memories with optional filters.
 */
export const listTeamMemoriesTool: ToolRegistration = {
  availability: ['main'],
  defaultDisabled: true,
  create: (ctx) =>
    tool({
      description: 'List your team\'s shared memories, optionally filtered by subject or category.',
      inputSchema: z.object({
        team_id: z.string().optional().describe('Team ID (defaults to your first team)'),
        subject: z.string().optional().describe('Filter by subject'),
        category: z.enum(CATEGORIES).optional().describe('Filter by category'),
      }),
      execute: async ({ team_id, subject, category }) => {
        const resolved = await resolveTeamId(ctx.kinId, team_id)
        if ('error' in resolved) return resolved

        const results = await listTeamMemories(resolved.teamId, {
          subject,
          category: category as MemoryCategory | undefined,
        })
        return {
          memories: results.map((m) => ({
            id: m.id,
            content: m.content,
            category: m.category,
            subject: m.subject,
            importance: m.importance,
            author_kin_id: m.authorKinId,
            age: formatMemoryAge(m.updatedAt),
          })),
        }
      },
    }),
}
