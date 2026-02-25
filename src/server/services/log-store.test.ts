import { describe, it, expect, beforeEach } from 'bun:test'

// We need to test the LogStore class directly, but the module exports a singleton.
// Re-import the module internals by testing through the exported logStore,
// or by creating a fresh instance. Since the class isn't exported, we'll test
// via the singleton's methods after clearing state between tests.
//
// Actually, let's import the module and test the singleton + behavior.

import { logStore } from '@/server/services/log-store'
import type { LogQueryOptions } from '@/server/services/log-store'

// Helper: build a raw Pino JSON line
function pinoLine(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    level: 30,
    time: new Date().toISOString(),
    msg: 'test message',
    module: 'test',
    pid: 1,
    hostname: 'host',
    ...overrides,
  })
}

describe('LogStore', () => {
  // Note: logStore is a singleton so entries accumulate across tests.
  // We work around this by using unique module/message identifiers per test.

  describe('pushRaw', () => {
    it('parses a valid Pino JSON line', () => {
      const before = logStore.query({ module: 'pushraw-valid', limit: 200 }).length
      logStore.pushRaw(pinoLine({ module: 'pushraw-valid', msg: 'hello' }))
      const entries = logStore.query({ module: 'pushraw-valid', limit: 200 })
      expect(entries.length).toBe(before + 1)
      expect(entries[entries.length - 1]!.message).toBe('hello')
      expect(entries[entries.length - 1]!.level).toBe('info')
    })

    it('ignores unparseable lines', () => {
      const before = logStore.query({ limit: 200 }).length
      logStore.pushRaw('not json at all')
      logStore.pushRaw('')
      logStore.pushRaw('{broken')
      const after = logStore.query({ limit: 200 }).length
      // Should not have increased (or at most unchanged)
      expect(after).toBe(before)
    })

    it('maps Pino numeric levels to labels', () => {
      const levels: Array<[number, string]> = [
        [10, 'trace'],
        [20, 'debug'],
        [30, 'info'],
        [40, 'warn'],
        [50, 'error'],
        [60, 'fatal'],
      ]
      for (const [num, label] of levels) {
        logStore.pushRaw(pinoLine({ level: num, module: `level-${label}`, msg: `lvl-${label}` }))
        const entries = logStore.query({ module: `level-${label}` })
        expect(entries[entries.length - 1]!.level).toBe(label)
      }
    })

    it('defaults to info for unknown level numbers', () => {
      logStore.pushRaw(pinoLine({ level: 99, module: 'level-unknown' }))
      const entries = logStore.query({ module: 'level-unknown' })
      expect(entries[entries.length - 1]!.level).toBe('info')
    })

    it('extracts extra fields into data (excluding internal keys)', () => {
      logStore.pushRaw(pinoLine({
        module: 'extra-fields',
        msg: 'with extras',
        kinId: 'kin-123',
        duration: 42,
      }))
      const entries = logStore.query({ module: 'extra-fields' })
      const last = entries[entries.length - 1]!
      expect(last.data).toBeDefined()
      expect(last.data!.kinId).toBe('kin-123')
      expect(last.data!.duration).toBe(42)
      // Internal keys should be excluded
      expect(last.data!.level).toBeUndefined()
      expect(last.data!.msg).toBeUndefined()
      expect(last.data!.pid).toBeUndefined()
      expect(last.data!.hostname).toBeUndefined()
      expect(last.data!.module).toBeUndefined()
    })

    it('sets data to undefined when no extra fields exist', () => {
      // Only internal keys
      logStore.pushRaw(JSON.stringify({
        level: 30,
        time: new Date().toISOString(),
        msg: 'bare',
        module: 'no-extras',
        pid: 1,
        hostname: 'host',
      }))
      const entries = logStore.query({ module: 'no-extras' })
      const last = entries[entries.length - 1]!
      expect(last.message).toBe('bare')
      expect(last.data).toBeUndefined()
    })

    it('defaults module to root when missing', () => {
      logStore.pushRaw(JSON.stringify({ level: 30, time: new Date().toISOString(), msg: 'no mod' }))
      const entries = logStore.query({ search: 'no mod' })
      expect(entries.length).toBeGreaterThanOrEqual(1)
      expect(entries[entries.length - 1]!.module).toBe('root')
    })

    it('defaults message to empty string when msg is missing', () => {
      logStore.pushRaw(pinoLine({ module: 'no-msg' }))
      // Remove msg manually
      logStore.pushRaw(JSON.stringify({ level: 30, time: new Date().toISOString(), module: 'empty-msg' }))
      const entries = logStore.query({ module: 'empty-msg' })
      expect(entries[entries.length - 1]!.message).toBe('')
    })

    it('uses Date.now() when time is missing', () => {
      const before = Date.now()
      logStore.pushRaw(JSON.stringify({ level: 30, msg: 'no time', module: 'no-time' }))
      const after = Date.now()
      const entries = logStore.query({ module: 'no-time' })
      const ts = entries[entries.length - 1]!.timestamp
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })
  })

  describe('query', () => {
    it('filters by level', () => {
      logStore.pushRaw(pinoLine({ level: 50, module: 'q-level', msg: 'err' }))
      logStore.pushRaw(pinoLine({ level: 30, module: 'q-level', msg: 'inf' }))

      const errors = logStore.query({ level: 'error', module: 'q-level' })
      expect(errors.every(e => e.level === 'error')).toBe(true)
      expect(errors.some(e => e.message === 'err')).toBe(true)
    })

    it('filters by module (case-insensitive, partial match)', () => {
      logStore.pushRaw(pinoLine({ module: 'MyModule', msg: 'mod-test' }))
      const results = logStore.query({ module: 'mymod' })
      expect(results.some(e => e.message === 'mod-test')).toBe(true)
    })

    it('filters by search text in message', () => {
      logStore.pushRaw(pinoLine({ module: 'q-search', msg: 'unique-search-token-xyz' }))
      const results = logStore.query({ search: 'unique-search-token-xyz' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]!.message).toBe('unique-search-token-xyz')
    })

    it('filters by search text in data (case-insensitive)', () => {
      logStore.pushRaw(pinoLine({ module: 'q-search-data', msg: 'x', errorCode: 'UNIQUE_ERR_42' }))
      const results = logStore.query({ search: 'unique_err_42' })
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('filters by minutesAgo', () => {
      // Push an entry with a timestamp 10 minutes ago
      const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString()
      logStore.pushRaw(pinoLine({ time: tenMinAgo, module: 'q-time', msg: 'old' }))
      logStore.pushRaw(pinoLine({ module: 'q-time', msg: 'new' }))

      const recent = logStore.query({ module: 'q-time', minutesAgo: 5 })
      expect(recent.some(e => e.message === 'new')).toBe(true)
      expect(recent.some(e => e.message === 'old')).toBe(false)
    })

    it('respects limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        logStore.pushRaw(pinoLine({ module: 'q-limit', msg: `item-${i}` }))
      }
      const results = logStore.query({ module: 'q-limit', limit: 3 })
      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('caps limit at 200', () => {
      // Even if we request more, should be capped
      const results = logStore.query({ limit: 999 })
      expect(results.length).toBeLessThanOrEqual(200)
    })

    it('defaults limit to 50', () => {
      // Push 60 entries with a unique module
      for (let i = 0; i < 60; i++) {
        logStore.pushRaw(pinoLine({ module: 'q-default-limit', msg: `dl-${i}` }))
      }
      const results = logStore.query({ module: 'q-default-limit' })
      expect(results.length).toBeLessThanOrEqual(50)
    })

    it('returns newest entries last', () => {
      const t1 = new Date(Date.now() - 2000).toISOString()
      const t2 = new Date(Date.now() - 1000).toISOString()
      logStore.pushRaw(pinoLine({ time: t1, module: 'q-order', msg: 'first' }))
      logStore.pushRaw(pinoLine({ time: t2, module: 'q-order', msg: 'second' }))

      const results = logStore.query({ module: 'q-order' })
      const firstIdx = results.findIndex(e => e.message === 'first')
      const secondIdx = results.findIndex(e => e.message === 'second')
      expect(secondIdx).toBeGreaterThan(firstIdx)
    })

    it('combines multiple filters', () => {
      logStore.pushRaw(pinoLine({ level: 50, module: 'multi-filter', msg: 'target-combo' }))
      logStore.pushRaw(pinoLine({ level: 30, module: 'multi-filter', msg: 'not this one' }))

      const results = logStore.query({ level: 'error', module: 'multi-filter', search: 'target-combo' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every(e => e.level === 'error' && e.message.includes('target-combo'))).toBe(true)
    })

    it('returns empty array when no matches', () => {
      const results = logStore.query({ module: 'nonexistent-module-xyz-abc-123' })
      expect(results).toEqual([])
    })
  })

  describe('ring buffer behavior', () => {
    it('does not crash when many entries are pushed', () => {
      // Push more than DEFAULT_MAX_SIZE to test ring buffer trim
      for (let i = 0; i < 100; i++) {
        logStore.pushRaw(pinoLine({ module: 'ring-buffer', msg: `ring-${i}` }))
      }
      const results = logStore.query({ module: 'ring-buffer', limit: 200 })
      expect(results.length).toBeGreaterThan(0)
    })
  })
})
