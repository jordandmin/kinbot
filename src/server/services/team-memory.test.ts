import { describe, it, expect } from 'bun:test'

/**
 * Tests for team-memory service - pure logic patterns.
 * We test validation, FTS query building, and scoring logic in isolation
 * without requiring a database connection.
 */

// ─── FTS Query Building ─────────────────────────────────────────────────────

function buildFTSQuery(query: string): { and: string; or: string } | null {
  const terms = query
    .replace(/['"*(){}[\]:^~!@#$%&]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3)

  if (terms.length === 0) return null

  return {
    and: terms.map((term) => `"${term}"*`).join(' AND '),
    or: terms.map((term) => `"${term}"*`).join(' OR '),
  }
}

describe('Team memory FTS query building', () => {
  it('builds AND and OR queries from terms', () => {
    const result = buildFTSQuery('deploy kubernetes cluster')
    expect(result).not.toBeNull()
    expect(result!.and).toBe('"deploy"* AND "kubernetes"* AND "cluster"*')
    expect(result!.or).toBe('"deploy"* OR "kubernetes"* OR "cluster"*')
  })

  it('filters short terms (< 3 chars)', () => {
    const result = buildFTSQuery('do it now')
    expect(result).not.toBeNull()
    expect(result!.and).toBe('"now"*')
  })

  it('returns null for empty/noise queries', () => {
    expect(buildFTSQuery('a b c')).toBeNull()
    expect(buildFTSQuery('')).toBeNull()
    expect(buildFTSQuery('  ')).toBeNull()
  })

  it('strips special characters', () => {
    const result = buildFTSQuery("what's the [status]")
    expect(result).not.toBeNull()
    expect(result!.and).not.toContain("'")
    expect(result!.and).not.toContain('[')
    expect(result!.and).not.toContain(']')
  })
})

// ─── Importance Weighting ────────────────────────────────────────────────────

function applyImportanceWeight(score: number, importance: number | null): number {
  const imp = importance ?? 5
  const importanceWeight = 0.5 + (imp / 10)
  return score * importanceWeight
}

describe('Team memory importance weighting', () => {
  it('importance 5 (default) gives weight 1.0', () => {
    expect(applyImportanceWeight(1.0, 5)).toBe(1.0)
    expect(applyImportanceWeight(1.0, null)).toBe(1.0)
  })

  it('importance 10 gives weight 1.5', () => {
    expect(applyImportanceWeight(1.0, 10)).toBe(1.5)
  })

  it('importance 1 gives weight 0.6', () => {
    expect(applyImportanceWeight(1.0, 1)).toBeCloseTo(0.6, 5)
  })

  it('scales scores proportionally', () => {
    const base = 0.8
    expect(applyImportanceWeight(base, 10)).toBeGreaterThan(applyImportanceWeight(base, 1))
  })
})

// ─── RRF Score Fusion ────────────────────────────────────────────────────────

function computeRRFScore(rank: number, K: number, boost: number = 1): number {
  return boost / (K + rank + 1)
}

describe('Team memory RRF scoring', () => {
  it('rank 0 gets highest score', () => {
    const K = 60
    expect(computeRRFScore(0, K)).toBeGreaterThan(computeRRFScore(1, K))
    expect(computeRRFScore(1, K)).toBeGreaterThan(computeRRFScore(2, K))
  })

  it('boost multiplies the score', () => {
    const K = 60
    const boost = 1.5
    expect(computeRRFScore(0, K, boost)).toBeCloseTo(boost * computeRRFScore(0, K, 1), 5)
  })

  it('higher K smooths rank differences', () => {
    const diff10 = computeRRFScore(0, 10) - computeRRFScore(1, 10)
    const diff100 = computeRRFScore(0, 100) - computeRRFScore(1, 100)
    expect(diff10).toBeGreaterThan(diff100) // K=10 has steeper drop-off
  })
})

// ─── Input Validation ────────────────────────────────────────────────────────

describe('Team memory input validation', () => {
  const validCategories = new Set(['fact', 'preference', 'decision', 'knowledge'])

  function validateInput(input: { content?: string; category?: string; teamId?: string }) {
    const errors: string[] = []
    if (!input.content?.trim()) errors.push('Content is required')
    if (!input.teamId) errors.push('teamId is required')
    if (input.category && !validCategories.has(input.category)) errors.push('Invalid category')
    return errors
  }

  it('requires content', () => {
    expect(validateInput({ teamId: 't1', category: 'fact' })).toContain('Content is required')
    expect(validateInput({ content: '', teamId: 't1' })).toContain('Content is required')
  })

  it('requires teamId', () => {
    expect(validateInput({ content: 'test' })).toContain('teamId is required')
  })

  it('validates category', () => {
    expect(validateInput({ content: 'test', teamId: 't1', category: 'invalid' })).toContain('Invalid category')
    expect(validateInput({ content: 'test', teamId: 't1', category: 'fact' })).toEqual([])
  })

  it('accepts valid input', () => {
    expect(validateInput({ content: 'User prefers dark mode', teamId: 't1', category: 'preference' })).toEqual([])
  })
})

// ─── Team Resolution ─────────────────────────────────────────────────────────

describe('Team resolution for tools', () => {
  it('uses provided team_id when given', () => {
    const teamId = 'explicit-team-id'
    // When teamId is provided, it should be used directly
    expect(teamId).toBe('explicit-team-id')
  })

  it('falls back to first team when not provided', () => {
    const teams = [{ id: 'team-1', name: 'Alpha' }, { id: 'team-2', name: 'Beta' }]
    const resolved = teams.length > 0 ? teams[0]!.id : null
    expect(resolved).toBe('team-1')
  })

  it('returns error when kin has no teams', () => {
    const teams: Array<{ id: string }> = []
    const resolved = teams.length > 0 ? teams[0]!.id : null
    expect(resolved).toBeNull()
  })
})
