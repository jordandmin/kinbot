import { describe, expect, it, beforeEach, afterEach, mock, spyOn } from 'bun:test'
import currencyConverterPlugin from './index'

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockFetch(impl: (url: string) => Response | Promise<Response>) {
  return spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    return Promise.resolve(impl(url))
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Setup ──────────────────────────────────────────────────────────────────

let fetchSpy: ReturnType<typeof spyOn>

afterEach(() => {
  fetchSpy?.mockRestore()
})

// ─── Plugin instantiation ───────────────────────────────────────────────────

describe('currency-converter', () => {
  describe('plugin creation', () => {
    it('creates plugin with default baseCurrency EUR', () => {
      const plugin = currencyConverterPlugin({ config: {} })
      expect(plugin.tools).toHaveProperty('convert_currency')
      expect(plugin.tools).toHaveProperty('list_currencies')
      expect(plugin.tools).toHaveProperty('historical_rate')
    })

    it('accepts custom baseCurrency from config', () => {
      const plugin = currencyConverterPlugin({ config: { baseCurrency: 'USD' } })
      expect(plugin.tools).toBeDefined()
    })

    it('exposes exactly three tools', () => {
      const plugin = currencyConverterPlugin({ config: {} })
      expect(Object.keys(plugin.tools)).toEqual(['convert_currency', 'list_currencies', 'historical_rate'])
    })
  })

  // ─── convert_currency ───────────────────────────────────────────────────

  describe('convert_currency', () => {
    const plugin = currencyConverterPlugin({ config: { baseCurrency: 'EUR' } })
    const convert = plugin.tools.convert_currency.execute

    it('converts EUR to USD successfully', async () => {
      fetchSpy = mockFetch(() =>
        jsonResponse({
          amount: 100,
          base: 'EUR',
          date: '2026-03-07',
          rates: { USD: 108.42 },
        }),
      )

      const result = await convert(
        { amount: 100, from: 'EUR', to: 'USD' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('100 EUR')
      expect(result).toContain('108.42')
      expect(result).toContain('2026-03-07')
      expect(fetchSpy).toHaveBeenCalledTimes(1)

      const url = (fetchSpy.mock.calls[0]![0] as string)
      expect(url).toContain('from=EUR')
      expect(url).toContain('to=USD')
      expect(url).toContain('amount=100')
    })

    it('converts without target currency (all rates)', async () => {
      fetchSpy = mockFetch(() =>
        jsonResponse({
          amount: 1,
          base: 'GBP',
          date: '2026-03-07',
          rates: { USD: 1.29, EUR: 1.17, JPY: 191.5 },
        }),
      )

      const result = await convert(
        { amount: 1, from: 'GBP' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('1 GBP')
      expect(result).toContain('USD')
      expect(result).toContain('EUR')
      expect(result).toContain('JPY')
    })

    it('handles multiple target currencies (comma-separated)', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('to=USD%2CGBP')
        return jsonResponse({
          amount: 50,
          base: 'EUR',
          date: '2026-03-07',
          rates: { USD: 54.21, GBP: 42.15 },
        })
      })

      const result = await convert(
        { amount: 50, from: 'EUR', to: 'USD,GBP' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('50 EUR')
      expect(result).toContain('USD')
      expect(result).toContain('GBP')
    })

    it('uppercases currency codes', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('from=EUR')
        expect(url).toContain('to=USD')
        return jsonResponse({
          amount: 1,
          base: 'EUR',
          date: '2026-03-07',
          rates: { USD: 1.0842 },
        })
      })

      await convert(
        { amount: 1, from: 'eur', to: 'usd' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('returns error message on invalid currency', async () => {
      fetchSpy = mockFetch(() =>
        new Response('not found', { status: 404 }),
      )

      const result = await convert(
        { amount: 1, from: 'XYZ', to: 'USD' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
      expect(result).toContain('Invalid currency code')
    })

    it('returns error message on 422 response', async () => {
      fetchSpy = mockFetch(() =>
        new Response('Unprocessable', { status: 422 }),
      )

      const result = await convert(
        { amount: 1, from: 'AAA', to: 'BBB' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
    })

    it('returns error on server error (500)', async () => {
      fetchSpy = mockFetch(() =>
        new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
      )

      const result = await convert(
        { amount: 1, from: 'EUR', to: 'USD' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
      expect(result).toContain('500')
    })

    it('returns error when fetch throws', async () => {
      fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(() => {
        throw new Error('Network failure')
      })

      const result = await convert(
        { amount: 1, from: 'EUR', to: 'USD' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
      expect(result).toContain('Network failure')
    })

    it('formats rates with 4 decimal places', async () => {
      fetchSpy = mockFetch(() =>
        jsonResponse({
          amount: 1,
          base: 'EUR',
          date: '2026-03-07',
          rates: { JPY: 162.123456789 },
        }),
      )

      const result = await convert(
        { amount: 1, from: 'EUR', to: 'JPY' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('162.1235')
    })
  })

  // ─── list_currencies ────────────────────────────────────────────────────

  describe('list_currencies', () => {
    const plugin = currencyConverterPlugin({ config: {} })
    const listCurrencies = plugin.tools.list_currencies.execute

    it('lists currencies successfully', async () => {
      fetchSpy = mockFetch(() =>
        jsonResponse({
          AUD: 'Australian Dollar',
          EUR: 'Euro',
          USD: 'US Dollar',
        }),
      )

      const result = await listCurrencies(
        {},
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('Supported currencies')
      expect(result).toContain('AUD')
      expect(result).toContain('Australian Dollar')
      expect(result).toContain('EUR')
      expect(result).toContain('Euro')
      expect(result).toContain('USD')
      expect(result).toContain('US Dollar')
      expect(result).toContain('3 currencies available')
    })

    it('calls the /currencies endpoint', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('/currencies')
        return jsonResponse({ EUR: 'Euro' })
      })

      await listCurrencies({}, { toolCallId: '', messages: [] } as any)

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('returns error on API failure', async () => {
      fetchSpy = mockFetch(() =>
        new Response('error', { status: 500, statusText: 'Server Error' }),
      )

      const result = await listCurrencies(
        {},
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
    })
  })

  // ─── historical_rate ────────────────────────────────────────────────────

  describe('historical_rate', () => {
    const plugin = currencyConverterPlugin({ config: {} })
    const historical = plugin.tools.historical_rate.execute

    it('fetches historical rate successfully', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('/2024-01-15')
        expect(url).toContain('from=EUR')
        expect(url).toContain('to=USD')
        return jsonResponse({
          amount: 1,
          base: 'EUR',
          date: '2024-01-15',
          rates: { USD: 1.0892 },
        })
      })

      const result = await historical(
        { amount: 1, from: 'EUR', to: 'USD', date: '2024-01-15' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('1 EUR')
      expect(result).toContain('2024-01-15')
      expect(result).toContain('1.0892')
    })

    it('handles custom amount', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('amount=500')
        return jsonResponse({
          amount: 500,
          base: 'USD',
          date: '2023-06-01',
          rates: { GBP: 398.5 },
        })
      })

      const result = await historical(
        { amount: 500, from: 'USD', to: 'GBP', date: '2023-06-01' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('500 USD')
      expect(result).toContain('398.5')
    })

    it('returns error for invalid date', async () => {
      fetchSpy = mockFetch(() =>
        new Response('not found', { status: 500, statusText: 'Server Error' }),
      )

      const result = await historical(
        { amount: 1, from: 'EUR', to: 'USD', date: '1998-01-01' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
    })

    it('returns error when fetch throws', async () => {
      fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(() => {
        throw new Error('Timeout')
      })

      const result = await historical(
        { amount: 1, from: 'EUR', to: 'USD', date: '2024-01-15' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(result).toContain('❌')
      expect(result).toContain('Timeout')
    })

    it('uppercases currency codes in URL', async () => {
      fetchSpy = mockFetch((url) => {
        expect(url).toContain('from=EUR')
        expect(url).toContain('to=USD')
        return jsonResponse({
          amount: 1,
          base: 'EUR',
          date: '2024-01-15',
          rates: { USD: 1.09 },
        })
      })

      await historical(
        { amount: 1, from: 'eur', to: 'usd', date: '2024-01-15' },
        { toolCallId: '', messages: [] } as any,
      )

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })
  })
})
