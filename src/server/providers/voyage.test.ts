import { describe, it, expect, afterEach, mock } from 'bun:test'
import { voyageProvider } from './voyage'
import type { ProviderConfig } from '@/server/providers/types'

const baseConfig: ProviderConfig = {
  apiKey: 'test-voyage-key',
  baseUrl: 'https://api.voyageai.com/v1',
}

const sampleModels = {
  data: [
    { id: 'voyage-3', object: 'model' },
    { id: 'voyage-3-lite', object: 'model' },
    { id: 'voyage-code-3', object: 'model' },
  ],
}

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('voyageProvider', () => {
  it('has type "voyage"', () => {
    expect(voyageProvider.type).toBe('voyage')
  })

  describe('testConnection', () => {
    it('returns valid when models are returned', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(sampleModels), { status: 200 }))
      ) as unknown as typeof fetch

      const result = await voyageProvider.testConnection(baseConfig)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns invalid when API returns empty model list', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      ) as unknown as typeof fetch

      const result = await voyageProvider.testConnection(baseConfig)
      expect(result.valid).toBe(false)
    })

    it('returns invalid with error message on HTTP error', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response('Unauthorized', { status: 401 }))
      ) as unknown as typeof fetch

      const result = await voyageProvider.testConnection(baseConfig)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('401')
    })

    it('returns invalid with error message on network failure', async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new Error('Network unreachable'))
      ) as unknown as typeof fetch

      const result = await voyageProvider.testConnection(baseConfig)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Network unreachable')
    })

    it('returns generic error for non-Error throws', async () => {
      globalThis.fetch = mock(() => Promise.reject('string error')) as unknown as typeof fetch

      const result = await voyageProvider.testConnection(baseConfig)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Connection failed')
    })

    it('sends correct authorization header', async () => {
      let capturedHeaders: Headers | undefined
      globalThis.fetch = mock((_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers)
        return Promise.resolve(new Response(JSON.stringify(sampleModels), { status: 200 }))
      }) as unknown as typeof fetch

      await voyageProvider.testConnection(baseConfig)
      expect(capturedHeaders?.get('Authorization')).toBe('Bearer test-voyage-key')
    })

    it('uses custom baseUrl when provided', async () => {
      let capturedUrl = ''
      globalThis.fetch = mock((url: string | URL | Request) => {
        capturedUrl = url as string
        return Promise.resolve(new Response(JSON.stringify(sampleModels), { status: 200 }))
      }) as unknown as typeof fetch

      await voyageProvider.testConnection({ ...baseConfig, baseUrl: 'https://custom.voyage.ai/v1' })
      expect(capturedUrl).toBe('https://custom.voyage.ai/v1/models')
    })

    it('uses default baseUrl when not provided', async () => {
      let capturedUrl = ''
      globalThis.fetch = mock((url: string | URL | Request) => {
        capturedUrl = url as string
        return Promise.resolve(new Response(JSON.stringify(sampleModels), { status: 200 }))
      }) as unknown as typeof fetch

      await voyageProvider.testConnection({ apiKey: 'key' })
      expect(capturedUrl).toBe('https://api.voyageai.com/v1/models')
    })
  })

  describe('listModels', () => {
    it('returns models with embedding capability', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(sampleModels), { status: 200 }))
      ) as unknown as typeof fetch

      const models = await voyageProvider.listModels(baseConfig)
      expect(models).toHaveLength(3)
      expect(models[0]).toEqual({
        id: 'voyage-3',
        name: 'voyage-3',
        capability: 'embedding',
      })
      expect(models[1]).toEqual({
        id: 'voyage-3-lite',
        name: 'voyage-3-lite',
        capability: 'embedding',
      })
      expect(models[2]).toEqual({
        id: 'voyage-code-3',
        name: 'voyage-code-3',
        capability: 'embedding',
      })
    })

    it('returns empty array on HTTP error', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response('Server Error', { status: 500 }))
      ) as unknown as typeof fetch

      const models = await voyageProvider.listModels(baseConfig)
      expect(models).toEqual([])
    })

    it('returns empty array on network failure', async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new Error('timeout'))
      ) as unknown as typeof fetch

      const models = await voyageProvider.listModels(baseConfig)
      expect(models).toEqual([])
    })
  })
})
