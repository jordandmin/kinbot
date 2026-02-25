import type { ProviderConfig, ProviderDefinition, ProviderModel } from '@/server/providers/types'
import { createLogger } from '@/server/logger'

const log = createLogger('provider:perplexity')

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai'

interface PerplexityModel {
  id: string
  object: string
}

interface PerplexityModelsResponse {
  data: PerplexityModel[]
}

function isLLMModel(id: string): boolean {
  // Perplexity models are all LLM/search-augmented chat models
  return id.startsWith('sonar') || id.startsWith('llama') || id.startsWith('r1')
}

async function fetchModels(config: ProviderConfig): Promise<PerplexityModel[]> {
  const baseUrl = config.baseUrl ?? PERPLEXITY_BASE_URL
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }

  const data = (await response.json()) as PerplexityModelsResponse
  return data.data
}

export const perplexityProvider: ProviderDefinition = {
  type: 'perplexity',

  async testConnection(config: ProviderConfig) {
    try {
      const models = await fetchModels(config)
      const valid = models.length > 0
      log.info({ valid, modelCount: models.length }, 'Connection test completed')
      return { valid }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed'
      log.error({ err: error }, 'Connection test failed')
      return { valid: false, error: message }
    }
  },

  async listModels(config: ProviderConfig) {
    try {
      const apiModels = await fetchModels(config)
      const models = apiModels
        .filter(m => isLLMModel(m.id))
        .map((m): ProviderModel => ({
          id: m.id,
          name: m.id,
          capability: 'llm',
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
      log.debug({ count: models.length }, 'Models listed')
      return models
    } catch (error) {
      log.error({ err: error }, 'Failed to list models')
      return []
    }
  },
}
