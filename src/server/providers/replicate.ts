import type { ProviderConfig, ProviderDefinition, ProviderModel } from '@/server/providers/types'
import { createLogger } from '@/server/logger'

const log = createLogger('provider:replicate')

/**
 * Replicate provider — image generation via hosted models (Flux, SDXL, etc.)
 *
 * API docs: https://replicate.com/docs/reference/http
 * Auth: Bearer token
 * Models endpoint: GET /v1/models (paginated, returns owner/name style IDs)
 *
 * We list a curated set of popular image generation models since Replicate
 * hosts thousands of community models and listing all would be impractical.
 */

const BASE_URL = 'https://api.replicate.com'

/** Well-known image generation models on Replicate */
const IMAGE_MODELS: ProviderModel[] = [
  { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro', capability: 'image' },
  { id: 'black-forest-labs/flux-1.1-pro-ultra', name: 'FLUX 1.1 Pro Ultra', capability: 'image' },
  { id: 'black-forest-labs/flux-schnell', name: 'FLUX Schnell', capability: 'image' },
  { id: 'black-forest-labs/flux-dev', name: 'FLUX Dev', capability: 'image' },
  { id: 'stability-ai/sdxl', name: 'Stable Diffusion XL', capability: 'image' },
  { id: 'stability-ai/stable-diffusion-3.5-large', name: 'Stable Diffusion 3.5 Large', capability: 'image' },
  { id: 'bytedance/sdxl-lightning-4step', name: 'SDXL Lightning 4-Step', capability: 'image' },
  { id: 'lucataco/flux-dev-lora', name: 'FLUX Dev LoRA', capability: 'image' },
  { id: 'konieshadow/fooocus-api', name: 'Fooocus', capability: 'image' },
]

async function testAuth(config: ProviderConfig): Promise<boolean> {
  const baseUrl = config.baseUrl ?? BASE_URL
  const response = await fetch(`${baseUrl}/v1/account`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  })
  return response.ok
}

export const replicateProvider: ProviderDefinition = {
  type: 'replicate',

  async testConnection(config: ProviderConfig) {
    try {
      const valid = await testAuth(config)
      if (!valid) return { valid: false, error: 'Invalid API token' }
      return { valid: true }
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' }
    }
  },

  async listModels(config: ProviderConfig) {
    try {
      const valid = await testAuth(config)
      if (!valid) return []
      // Return curated list — Replicate has thousands of community models
      return IMAGE_MODELS
    } catch {
      return []
    }
  },
}
