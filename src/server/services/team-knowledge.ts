import { eq, and, desc } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { db, sqlite } from '@/server/db/index'
import { createLogger } from '@/server/logger'
import { teamKnowledgeSources, teamKnowledgeChunks } from '@/server/db/schema'
import { generateEmbedding } from '@/server/services/embeddings'
import { sseManager } from '@/server/sse/index'
import { config } from '@/server/config'
import { chunkText } from '@/server/services/knowledge'

const log = createLogger('team-knowledge')

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateTeamSourceInput {
  name: string
  type: 'file' | 'text' | 'url'
  content?: string | null
  sourceUrl?: string | null
  originalFilename?: string | null
  mimeType?: string | null
  storedPath?: string | null
  metadata?: string | null
}

export interface TeamKnowledgeSearchResult {
  id: string
  content: string
  sourceId: string
  position: number
  score: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length / 0.75)
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createTeamSource(teamId: string, input: CreateTeamSourceInput) {
  const id = uuid()
  const now = new Date()

  await db.insert(teamKnowledgeSources).values({
    id,
    teamId,
    name: input.name,
    type: input.type,
    status: 'pending',
    originalFilename: input.originalFilename ?? null,
    mimeType: input.mimeType ?? null,
    storedPath: input.storedPath ?? null,
    sourceUrl: input.sourceUrl ?? null,
    rawContent: input.content ?? null,
    metadata: input.metadata ?? null,
    createdAt: now,
    updatedAt: now,
  })

  const created = db.select().from(teamKnowledgeSources).where(eq(teamKnowledgeSources.id, id)).get()!

  sseManager.broadcast({
    type: 'team:knowledge_source_created',
    data: { teamId, sourceId: id, name: input.name, type: input.type },
  })

  log.debug({ teamId, sourceId: id, type: input.type }, 'Team knowledge source created')
  return created
}

export async function deleteTeamSource(sourceId: string, teamId: string) {
  const existing = await getTeamSource(sourceId, teamId)
  if (!existing) return false

  // Remove chunks from vec index
  try {
    const chunks = db.select({ id: teamKnowledgeChunks.id }).from(teamKnowledgeChunks)
      .where(eq(teamKnowledgeChunks.sourceId, sourceId)).all()
    for (const chunk of chunks) {
      try { sqlite.run('DELETE FROM team_knowledge_chunks_vec WHERE chunk_id = ?', [chunk.id]) } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  await db.delete(teamKnowledgeSources).where(
    and(eq(teamKnowledgeSources.id, sourceId), eq(teamKnowledgeSources.teamId, teamId)),
  )

  sseManager.broadcast({
    type: 'team:knowledge_source_deleted',
    data: { teamId, sourceId },
  })

  log.debug({ sourceId, teamId }, 'Team knowledge source deleted')
  return true
}

export async function listTeamSources(teamId: string) {
  return db.select().from(teamKnowledgeSources)
    .where(eq(teamKnowledgeSources.teamId, teamId))
    .orderBy(desc(teamKnowledgeSources.createdAt))
    .all()
}

export async function getTeamSource(sourceId: string, teamId: string) {
  return db.select().from(teamKnowledgeSources)
    .where(and(eq(teamKnowledgeSources.id, sourceId), eq(teamKnowledgeSources.teamId, teamId)))
    .get()
}

export async function getTeamSourceChunks(sourceId: string) {
  return db.select().from(teamKnowledgeChunks)
    .where(eq(teamKnowledgeChunks.sourceId, sourceId))
    .orderBy(teamKnowledgeChunks.position)
    .all()
}

// ─── Processing Pipeline ────────────────────────────────────────────────────

export async function processTeamSource(sourceId: string) {
  const source = db.select().from(teamKnowledgeSources).where(eq(teamKnowledgeSources.id, sourceId)).get()
  if (!source) throw new Error(`Team knowledge source ${sourceId} not found`)

  const teamId = source.teamId

  try {
    await db.update(teamKnowledgeSources).set({ status: 'processing', updatedAt: new Date() })
      .where(eq(teamKnowledgeSources.id, sourceId))

    sseManager.broadcast({
      type: 'team:knowledge_source_updated',
      data: { teamId, sourceId, status: 'processing' },
    })

    // Extract text content
    let textContent = source.rawContent ?? ''
    if (!textContent && source.type === 'url') {
      throw new Error('URL content extraction not yet implemented')
    }
    if (!textContent && source.type === 'file' && source.storedPath) {
      try {
        const file = Bun.file(source.storedPath)
        textContent = await file.text()
      } catch (err) {
        throw new Error(`Failed to read file: ${(err as Error).message}`)
      }
    }

    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No text content to process')
    }

    // Store extracted content
    await db.update(teamKnowledgeSources).set({ rawContent: textContent }).where(eq(teamKnowledgeSources.id, sourceId))

    // Chunk the text
    const chunks = chunkText(textContent, 512, 50)
    if (chunks.length === 0) throw new Error('Text produced no chunks')

    // Delete existing chunks
    const existingChunks = db.select({ id: teamKnowledgeChunks.id }).from(teamKnowledgeChunks)
      .where(eq(teamKnowledgeChunks.sourceId, sourceId)).all()
    for (const c of existingChunks) {
      try { sqlite.run('DELETE FROM team_knowledge_chunks_vec WHERE chunk_id = ?', [c.id]) } catch { /* ignore */ }
    }
    await db.delete(teamKnowledgeChunks).where(eq(teamKnowledgeChunks.sourceId, sourceId))

    // Generate embeddings and store chunks
    let totalTokens = 0
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i]!
      const chunkId = uuid()
      const chunkTokens = estimateTokens(chunkContent)
      totalTokens += chunkTokens

      let embeddingBuf: Buffer | null = null
      try {
        const embedding = await generateEmbedding(chunkContent)
        embeddingBuf = Buffer.from(new Float32Array(embedding).buffer)
      } catch { /* embedding provider may not be available */ }

      await db.insert(teamKnowledgeChunks).values({
        id: chunkId,
        sourceId,
        teamId,
        content: chunkContent,
        embedding: embeddingBuf,
        position: i,
        tokenCount: chunkTokens,
        createdAt: new Date(),
      })

      if (embeddingBuf) {
        try {
          sqlite.run('INSERT INTO team_knowledge_chunks_vec(chunk_id, embedding) VALUES (?, ?)', [chunkId, embeddingBuf])
        } catch { /* ignore */ }
      }
    }

    // Update source status
    await db.update(teamKnowledgeSources).set({
      status: 'ready',
      chunkCount: chunks.length,
      tokenCount: totalTokens,
      errorMessage: null,
      updatedAt: new Date(),
    }).where(eq(teamKnowledgeSources.id, sourceId))

    sseManager.broadcast({
      type: 'team:knowledge_source_updated',
      data: { teamId, sourceId, status: 'ready', chunkCount: chunks.length, tokenCount: totalTokens },
    })

    log.info({ sourceId, teamId, chunks: chunks.length, tokens: totalTokens }, 'Team knowledge source processed')
  } catch (err) {
    const errorMessage = (err as Error).message || 'Unknown processing error'
    await db.update(teamKnowledgeSources).set({
      status: 'error',
      errorMessage,
      updatedAt: new Date(),
    }).where(eq(teamKnowledgeSources.id, sourceId))

    sseManager.broadcast({
      type: 'team:knowledge_source_updated',
      data: { teamId, sourceId, status: 'error', errorMessage },
    })

    log.error({ sourceId, teamId, err }, 'Team knowledge source processing failed')
    throw err
  }
}

// ─── Hybrid Search ──────────────────────────────────────────────────────────

export async function searchTeamKnowledge(
  teamId: string,
  query: string,
  limit?: number,
): Promise<TeamKnowledgeSearchResult[]> {
  const maxResults = limit ?? 5
  const K = config.memory.rrfK
  const scoreMap = new Map<string, { score: number; content: string; sourceId: string; position: number }>()

  // Vector search
  try {
    const queryEmbedding = await generateEmbedding(query)
    const queryBuf = Buffer.from(new Float32Array(queryEmbedding).buffer)

    const vecRows = sqlite
      .query<{ chunk_id: string; distance: number }, [Buffer, number]>(
        `SELECT chunk_id, distance FROM team_knowledge_chunks_vec WHERE embedding MATCH ? AND k = ? ORDER BY distance`,
      )
      .all(queryBuf, maxResults * 2)

    const threshold = config.memory.similarityThreshold
    const matchingIds = vecRows.filter((r) => r.distance <= 1 - threshold).map((r) => r.chunk_id)

    if (matchingIds.length > 0) {
      const placeholders = matchingIds.map(() => '?').join(', ')
      const chunkRows = sqlite
        .query<{ id: string; content: string; source_id: string; position: number }, string[]>(
          `SELECT id, content, source_id, position FROM team_knowledge_chunks WHERE id IN (${placeholders}) AND team_id = ?`,
        )
        .all(...matchingIds, teamId)

      const chunkMap = new Map(chunkRows.map((c) => [c.id, c]))
      for (let i = 0; i < vecRows.length; i++) {
        const r = vecRows[i]!
        const c = chunkMap.get(r.chunk_id)
        if (!c) continue
        const rrfScore = 1 / (K + i + 1)
        const existing = scoreMap.get(c.id)
        if (existing) { existing.score += rrfScore } else {
          scoreMap.set(c.id, { score: rrfScore, content: c.content, sourceId: c.source_id, position: c.position })
        }
      }
    }
  } catch { /* vector search not available */ }

  // FTS search
  try {
    const terms = query
      .replace(/['"*(){}[\]:^~!@#$%&]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3)

    if (terms.length > 0) {
      const ftsQuery = terms.map((term) => `"${term}"*`).join(' AND ')
      const ftsQueryOr = terms.map((term) => `"${term}"*`).join(' OR ')

      const stmt = sqlite.query<
        { id: string; content: string; source_id: string; position: number; rank: number },
        [string, string, number]
      >(
        `SELECT c.id, c.content, c.source_id, c.position, fts.rank
         FROM team_knowledge_chunks_fts fts
         JOIN team_knowledge_chunks c ON c.rowid = fts.rowid
         WHERE team_knowledge_chunks_fts MATCH ? AND c.team_id = ?
         ORDER BY fts.rank
         LIMIT ?`,
      )

      let ftsRows = stmt.all(ftsQuery, teamId, maxResults * 2)
      if (ftsRows.length === 0 && terms.length > 1) {
        ftsRows = stmt.all(ftsQueryOr, teamId, maxResults * 2)
      }

      const ftsBoost = config.memory.ftsBoost
      for (let i = 0; i < ftsRows.length; i++) {
        const r = ftsRows[i]!
        const rrfScore = ftsBoost / (K + i + 1)
        const existing = scoreMap.get(r.id)
        if (existing) { existing.score += rrfScore } else {
          scoreMap.set(r.id, { score: rrfScore, content: r.content, sourceId: r.source_id, position: r.position })
        }
      }
    }
  } catch { /* FTS not available */ }

  const sorted = Array.from(scoreMap.entries())
    .map(([id, data]) => ({ id, content: data.content, sourceId: data.sourceId, position: data.position, score: data.score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  return sorted
}
