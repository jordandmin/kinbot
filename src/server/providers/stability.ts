import type { ProviderConfig, ProviderDefinition, ProviderModel } from '@/server/providers/types'
import { createLogger } from '@/server/logger'

const log = createLogger('provider:stability')

/**
 * Stability AI provider — image generation via the Stability Platform API
 *
 * API docs: https://platform.stability.ai/docs/api-reference
 * Auth: Bearer token
 * Engines endpoint: GET /v1/engines/list
 *
 * Supports Stable Diffusion 3.5, SDXL, and other generation models.
 */

const BASE_URL = 'https://api.stability.ai'

/** Well-known Stability AI image generation models */
const IMAGE_MODELS: ProviderModel[] = [
  { id: 'sd3.5-large', name: 'Stable Diffusion 3.5 Large', capability: 'image' },
  { id: 'sd3.5-large-turbo', name: 'Stable Diffusion 3.5 Large Turbo', capability: 'image' },
  { id: 'sd3.5-medium', name: 'Stable Diffusion 3.5 Medium', capability: 'image' },
  { id: 'sd3-large', name: 'Stable Diffusion 3 Large', capability: 'image' },
  { id: 'sd3-large-turbo', name: 'Stable Diffusion 3 Large Turbo', capability: 'image' },
  { id: 'sd3-medium', name: 'Stable Diffusion 3 Medium', capability: 'image' },
  { id: 'stable-image-core', name: 'Stable Image Core', capability: 'image' },
  { id: 'stable-image-ultra', name: 'Stable Image Ultra', capability: 'image' },
]

async function testAuth(config: ProviderConfig): Promise<boolean> {
  const baseUrl = config.baseUrl ?? BASE_URL
  const response = await fetch(`${baseUrl}/v1/user/account`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  })
  return response.ok
}

export const stabilityProvider: ProviderDefinition = {
  type: 'stability',

  async testConnection(config: ProviderConfig) {
    try {
      const valid = await testAuth(config)
      if (!valid) return { valid: false, error: 'Invalid API key' }
      return { valid: true }
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' }
    }
  },

  async listModels(config: ProviderConfig) {
    try {
      const valid = await testAuth(config)
      if (!valid) return []
      return IMAGE_MODELS
    } catch {
      return []
    }
  },
}
