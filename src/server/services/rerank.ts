/**
 * Cross-encoder re-ranking via dedicated rerank APIs (Cohere, Jina).
 *
 * Falls back gracefully: if no rerank provider is configured, returns null
 * so the caller can use the existing LLM-based reranker instead.
 */

import { db } from '@/server/db/index'
import { providers } from '@/server/db/schema'
import { decrypt } from '@/server/services/encryption'
import { createLogger } from '@/server/logger'

const log = createLogger('rerank')

interface RerankResult {
  /** Original index in the input documents array */
  index: number
  /** Relevance score (0-1, higher = more relevant) */
  relevanceScore: number
}

/**
 * Re-rank documents using a cross-encoder rerank API.
 * Returns null if no rerank provider is available.
 */
export async function rerankDocuments(
  query: string,
  documents: string[],
  model: string,
  topN?: number,
): Promise<RerankResult[] | null> {
  const provider = await findRerankProvider()
  if (!provider) return null

  const providerConfig = JSON.parse(await decrypt(provider.configEncrypted)) as {
    apiKey: string
    baseUrl?: string
  }

  try {
    if (provider.type === 'cohere') {
      return await rerankCohere(providerConfig, model, query, documents, topN)
    } else if (provider.type === 'jina') {
      return await rerankJina(providerConfig, model, query, documents, topN)
    } else {
      log.warn({ providerType: provider.type }, 'Unknown rerank provider type')
      return null
    }
  } catch (err) {
    log.error({ err, provider: provider.type, model }, 'Rerank API call failed')
    return null
  }
}

async function rerankCohere(
  config: { apiKey: string; baseUrl?: string },
  model: string,
  query: string,
  documents: string[],
  topN?: number,
): Promise<RerankResult[]> {
  const baseUrl = config.baseUrl ?? 'https://api.cohere.com'
  const body: Record<string, unknown> = {
    model,
    query,
    documents,
  }
  if (topN != null) body.top_n = topN

  const response = await fetch(`${baseUrl}/v2/rerank`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Cohere rerank API error ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    results: Array<{ index: number; relevance_score: number }>
  }

  return data.results.map((r) => ({
    index: r.index,
    relevanceScore: r.relevance_score,
  }))
}

async function rerankJina(
  config: { apiKey: string; baseUrl?: string },
  model: string,
  query: string,
  documents: string[],
  topN?: number,
): Promise<RerankResult[]> {
  const baseUrl = config.baseUrl ?? 'https://api.jina.ai/v1'
  const body: Record<string, unknown> = {
    model,
    query,
    documents,
  }
  if (topN != null) body.top_n = topN

  const response = await fetch(`${baseUrl}/rerank`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Jina rerank API error ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    results: Array<{ index: number; relevance_score: number }>
  }

  return data.results.map((r) => ({
    index: r.index,
    relevanceScore: r.relevance_score,
  }))
}

async function findRerankProvider() {
  const allProviders = await db.select().from(providers).all()

  for (const p of allProviders) {
    try {
      const capabilities = JSON.parse(p.capabilities) as string[]
      if (capabilities.includes('rerank') && p.isValid) {
        return p
      }
    } catch {
      // Skip
    }
  }

  return null
}
