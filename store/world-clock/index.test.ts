import { describe, expect, it } from 'bun:test'
import worldClockPlugin from './index'

// ─── Helpers ────────────────────────────────────────────────────────────────

const plugin = worldClockPlugin({ homeTimezone: 'Europe/Paris', use24Hour: true })
const plugin12h = worldClockPlugin({ homeTimezone: 'America/New_York', use24Hour: false })
const pluginDefaults = worldClockPlugin({})

const getTime = plugin.tools.get_current_time.execute
const convertTime = plugin.tools.convert_time.execute
const worldClocks = plugin.tools.world_clocks.execute
const tzDifference = plugin.tools.timezone_difference.execute
const opts = { toolCallId: '', messages: [] } as any

// ─── get_current_time ───────────────────────────────────────────────────────

describe('get_current_time', () => {
  it('resolves IANA timezone', async () => {
    const res = await getTime({ timezone: 'Europe/Paris' }, opts) as any
    expect(res.timezone).toBe('Europe/Paris')
    expect(res.datetime).toBeTruthy()
    expect(res.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    expect(res.offset).toBeTruthy()
  })

  it('resolves city alias (case-insensitive)', async () => {
    const res = await getTime({ timezone: 'tokyo' }, opts) as any
    expect(res.timezone).toBe('Asia/Tokyo')
  })

  it('resolves abbreviation alias', async () => {
    const res = await getTime({ timezone: 'PST' }, opts) as any
    expect(res.timezone).toBe('America/Los_Angeles')
  })

  it('resolves NYC alias', async () => {
    const res = await getTime({ timezone: 'nyc' }, opts) as any
    expect(res.timezone).toBe('America/New_York')
  })

  it('resolves multi-word city alias', async () => {
    const res = await getTime({ timezone: 'new york' }, opts) as any
    expect(res.timezone).toBe('America/New_York')
  })

  it('resolves alias with leading/trailing whitespace', async () => {
    const res = await getTime({ timezone: '  london  ' }, opts) as any
    expect(res.timezone).toBe('Europe/London')
  })

  it('returns error for unknown timezone', async () => {
    const res = await getTime({ timezone: 'Narnia/Mordor' }, opts) as any
    expect(res.error).toContain('Unknown timezone')
  })

  it('returns offset string', async () => {
    const res = await getTime({ timezone: 'UTC' }, opts) as any
    expect(res.timezone).toBe('UTC')
    // UTC offset should contain GMT or UTC
    expect(res.offset).toBeTruthy()
  })

  it('resolves IST to Asia/Kolkata', async () => {
    const res = await getTime({ timezone: 'ist' }, opts) as any
    expect(res.timezone).toBe('Asia/Kolkata')
  })

  it('resolves AEST to Australia/Sydney', async () => {
    const res = await getTime({ timezone: 'aest' }, opts) as any
    expect(res.timezone).toBe('Australia/Sydney')
  })
})

// ─── convert_time ───────────────────────────────────────────────────────────

describe('convert_time', () => {
  it('converts time between two timezones in 24h format', async () => {
    const res = await convertTime({ time: '15:00', from: 'Europe/Paris', to: 'America/New_York' }, opts) as any
    expect(res.from.timezone).toBe('Europe/Paris')
    expect(res.to.timezone).toBe('America/New_York')
    expect(res.note).toContain('DST')
  })

  it('parses AM time', async () => {
    const res = await convertTime({ time: '9:30 AM', from: 'EST', to: 'PST' }, opts) as any
    expect(res.from.timezone).toBe('America/New_York')
    expect(res.to.timezone).toBe('America/Los_Angeles')
  })

  it('parses PM time', async () => {
    const res = await convertTime({ time: '3:00 PM', from: 'London', to: 'Tokyo' }, opts) as any
    expect(res.from.timezone).toBe('Europe/London')
    expect(res.to.timezone).toBe('Asia/Tokyo')
  })

  it('handles 12:00 AM correctly (midnight)', async () => {
    const res = await convertTime({ time: '12:00 AM', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toBeUndefined()
    expect(res.from).toBeTruthy()
  })

  it('handles 12:00 PM correctly (noon)', async () => {
    const res = await convertTime({ time: '12:00 PM', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toBeUndefined()
  })

  it('returns error for invalid time format', async () => {
    const res = await convertTime({ time: 'not-a-time', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toContain('Invalid time format')
  })

  it('returns error for out-of-range hours (24h)', async () => {
    const res = await convertTime({ time: '25:00', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toContain('Invalid time')
  })

  it('returns error for out-of-range minutes', async () => {
    const res = await convertTime({ time: '12:60', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toContain('Invalid time')
  })

  it('returns error for unknown source timezone', async () => {
    const res = await convertTime({ time: '10:00', from: 'Narnia', to: 'UTC' }, opts) as any
    expect(res.error).toContain('Unknown timezone')
  })

  it('accepts optional date parameter', async () => {
    const res = await convertTime({ time: '10:00', from: 'UTC', to: 'Europe/Paris', date: '2025-06-15' }, opts) as any
    expect(res.error).toBeUndefined()
    expect(res.from.timezone).toBe('UTC')
  })

  it('uses city aliases in from/to', async () => {
    const res = await convertTime({ time: '14:00', from: 'paris', to: 'nyc' }, opts) as any
    expect(res.from.timezone).toBe('Europe/Paris')
    expect(res.to.timezone).toBe('America/New_York')
  })

  it('parses single-digit hour in 24h', async () => {
    const res = await convertTime({ time: '9:05', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toBeUndefined()
  })

  it('parses case-insensitive AM/PM', async () => {
    const res = await convertTime({ time: '3:00 pm', from: 'UTC', to: 'UTC' }, opts) as any
    expect(res.error).toBeUndefined()
  })
})

// ─── world_clocks ───────────────────────────────────────────────────────────

describe('world_clocks', () => {
  it('returns clocks for major cities', async () => {
    const res = await worldClocks({}, opts) as any
    expect(res.clocks).toBeArray()
    expect(res.clocks.length).toBeGreaterThan(10)
    // First one should be Home
    expect(res.clocks[0].city).toContain('Home')
  })

  it('includes home timezone by default', async () => {
    const res = await worldClocks({}, opts) as any
    expect(res.clocks[0].city).toContain('Europe/Paris')
  })

  it('excludes home timezone when includeHome is false', async () => {
    const res = await worldClocks({ includeHome: false }, opts) as any
    const homeEntry = res.clocks.find((c: any) => c.city.includes('Home'))
    expect(homeEntry).toBeUndefined()
    // Should have exactly 17 world cities
    expect(res.clocks.length).toBe(17)
  })

  it('each clock has city, time, and offset', async () => {
    const res = await worldClocks({ includeHome: false }, opts) as any
    for (const clock of res.clocks) {
      expect(clock.city).toBeTruthy()
      expect(clock.time).toBeTruthy()
      expect(clock.offset).toBeTruthy()
    }
  })

  it('uses configured home timezone', async () => {
    const nyPlugin = worldClockPlugin({ homeTimezone: 'America/New_York' })
    const res = await nyPlugin.tools.world_clocks.execute({}, opts) as any
    expect(res.clocks[0].city).toContain('America/New_York')
  })

  it('defaults home to UTC when not configured', async () => {
    const res = await pluginDefaults.tools.world_clocks.execute({}, opts) as any
    expect(res.clocks[0].city).toContain('UTC')
  })
})

// ─── timezone_difference ────────────────────────────────────────────────────

describe('timezone_difference', () => {
  it('calculates difference between two timezones', async () => {
    const res = await tzDifference({ zone1: 'UTC', zone2: 'Asia/Tokyo' }, opts) as any
    expect(res.zone1.timezone).toBe('UTC')
    expect(res.zone2.timezone).toBe('Asia/Tokyo')
    expect(res.difference).toBe('+9h')
    expect(res.readable).toContain('Tokyo')
    expect(res.readable).toContain('ahead')
  })

  it('shows negative difference when zone2 is behind', async () => {
    const res = await tzDifference({ zone1: 'Asia/Tokyo', zone2: 'UTC' }, opts) as any
    expect(res.difference).toBe('-9h')
    expect(res.readable).toContain('behind')
  })

  it('shows 0h for same timezone', async () => {
    const res = await tzDifference({ zone1: 'Europe/Paris', zone2: 'Europe/Paris' }, opts) as any
    expect(res.difference).toBe('+0h')
  })

  it('resolves city aliases', async () => {
    const res = await tzDifference({ zone1: 'london', zone2: 'tokyo' }, opts) as any
    expect(res.zone1.timezone).toBe('Europe/London')
    expect(res.zone2.timezone).toBe('Asia/Tokyo')
  })

  it('resolves abbreviation aliases', async () => {
    const res = await tzDifference({ zone1: 'EST', zone2: 'PST' }, opts) as any
    expect(res.zone1.timezone).toBe('America/New_York')
    expect(res.zone2.timezone).toBe('America/Los_Angeles')
  })

  it('returns error for unknown timezone', async () => {
    const res = await tzDifference({ zone1: 'Mordor', zone2: 'UTC' }, opts) as any
    expect(res.error).toContain('Unknown timezone')
  })

  it('handles half-hour offset timezones', async () => {
    // India is UTC+5:30
    const res = await tzDifference({ zone1: 'UTC', zone2: 'Asia/Kolkata' }, opts) as any
    expect(res.difference).toBe('+5.5h')
  })

  it('includes current time for both zones', async () => {
    const res = await tzDifference({ zone1: 'UTC', zone2: 'Europe/Paris' }, opts) as any
    expect(res.zone1.currentTime).toBeTruthy()
    expect(res.zone2.currentTime).toBeTruthy()
    expect(res.zone1.offset).toBeTruthy()
    expect(res.zone2.offset).toBeTruthy()
  })
})

// ─── 12h vs 24h format ─────────────────────────────────────────────────────

describe('12h vs 24h format', () => {
  it('24h plugin does not include AM/PM in get_current_time', async () => {
    const res = await getTime({ timezone: 'UTC' }, opts) as any
    // 24h format shouldn't have AM or PM
    expect(res.datetime).not.toMatch(/\bAM\b/)
    expect(res.datetime).not.toMatch(/\bPM\b/)
  })

  it('12h plugin includes AM/PM in get_current_time', async () => {
    const res = await plugin12h.tools.get_current_time.execute({ timezone: 'UTC' }, opts) as any
    expect(res.datetime).toMatch(/\b(AM|PM)\b/)
  })
})

// ─── Edge cases ─────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles UTC directly as IANA timezone', async () => {
    const res = await getTime({ timezone: 'UTC' }, opts) as any
    expect(res.timezone).toBe('UTC')
    expect(res.error).toBeUndefined()
  })

  it('resolves capitalized city with prefix auto-detection', async () => {
    // "Sydney" should try Australia/Sydney
    const res = await getTime({ timezone: 'Sydney' }, opts) as any
    expect(res.timezone).toBe('Australia/Sydney')
  })

  it('resolves sao paulo alias (with space)', async () => {
    const res = await getTime({ timezone: 'sao paulo' }, opts) as any
    expect(res.timezone).toBe('America/Sao_Paulo')
  })

  it('all aliases resolve to valid IANA zones', async () => {
    const aliases = [
      'paris', 'london', 'new york', 'nyc', 'los angeles', 'la',
      'chicago', 'denver', 'tokyo', 'beijing', 'shanghai', 'hong kong',
      'singapore', 'sydney', 'melbourne', 'dubai', 'mumbai', 'delhi',
      'berlin', 'moscow', 'seoul', 'bangkok', 'toronto', 'vancouver',
      'sao paulo', 'cairo', 'istanbul', 'jakarta', 'nairobi',
      'honolulu', 'anchorage', 'auckland',
      'est', 'cst', 'mst', 'pst', 'gmt', 'cet', 'jst', 'kst', 'ist', 'aest', 'nzst',
    ]
    for (const alias of aliases) {
      const res = await getTime({ timezone: alias }, opts) as any
      expect(res.error).toBeUndefined()
      expect(res.timezone).toBeTruthy()
    }
  })
})
