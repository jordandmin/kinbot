import type { ProviderConfig, ProviderDefinition, ProviderModel } from '@/server/providers/types'
import { createLogger } from '@/server/logger'

const log = createLogger('provider:fal')

/**
 * fal.ai provider — fast image generation inference
 *
 * API docs: https://fal.ai/docs
 * Auth: Key-based (Authorization: Key <api_key>)
 * No model listing endpoint — uses well-known models.
 *
 * Supports Flux, SDXL, and other fast-inference image models.
 */

const BASE_URL = 'https://fal.run'

/** Well-known fal.ai image generation models */
const IMAGE_MODELS: ProviderModel[] = [
  { id: 'fal-ai/flux/dev', name: 'FLUX.1 [dev]', capability: 'image' },
  { id: 'fal-ai/flux/schnell', name: 'FLUX.1 [schnell]', capability: 'image' },
  { id: 'fal-ai/flux-pro/v1.1', name: 'FLUX.1 Pro v1.1', capability: 'image' },
  { id: 'fal-ai/flux-pro/v1.1-ultra', name: 'FLUX.1 Pro v1.1 Ultra', capability: 'image' },
  { id: 'fal-ai/flux-realism', name: 'FLUX Realism', capability: 'image' },
  { id: 'fal-ai/stable-diffusion-v35-large', name: 'Stable Diffusion 3.5 Large', capability: 'image' },
  { id: 'fal-ai/recraft-v3', name: 'Recraft V3', capability: 'image' },
  { id: 'fal-ai/ideogram/v2', name: 'Ideogram V2', capability: 'image' },
]

async function testAuth(config: ProviderConfig): Promise<boolean> {
  // fal.ai doesn't have a dedicated auth test endpoint;
  // we check by hitting the queue status of a known model which returns 401 on bad key
  const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell/requests', {
    method: 'GET',
    headers: { Authorization: `Key ${config.apiKey}` },
  })
  // 200 or 404 (no requests) means auth is valid; 401/403 means bad key
  return response.status !== 401 && response.status !== 403
}

export const falProvider: ProviderDefinition = {
  type: 'fal',

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
