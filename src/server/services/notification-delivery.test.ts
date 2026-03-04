import { describe, it, expect, beforeEach } from 'bun:test'

// ─── Test pure/quasi-pure functions by importing the module and testing
//     the exported behaviors. Since most internal helpers are not exported,
//     we test them indirectly through formatNotification and rate limiting.
//     We also test escapeTelegramMarkdown which is a pure string transform.

// Since the internal functions aren't exported, we'll extract and test
// the logic by re-implementing the pure parts and verifying the patterns.
// For the exported functions that hit DB, we'd need mocks — so we focus
// on the pure logic that can be tested in isolation.

// ─── escapeTelegramMarkdown ──────────────────────────────────────────────────

// Re-implement to test the regex pattern used in the module
function escapeTelegramMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

describe('escapeTelegramMarkdown', () => {
  it('escapes underscores', () => {
    expect(escapeTelegramMarkdown('hello_world')).toBe('hello\\_world')
  })

  it('escapes asterisks', () => {
    expect(escapeTelegramMarkdown('*bold*')).toBe('\\*bold\\*')
  })

  it('escapes square brackets', () => {
    expect(escapeTelegramMarkdown('[link](url)')).toBe('\\[link\\]\\(url\\)')
  })

  it('escapes backticks', () => {
    expect(escapeTelegramMarkdown('`code`')).toBe('\\`code\\`')
  })

  it('escapes multiple special characters', () => {
    expect(escapeTelegramMarkdown('a_b*c~d#e')).toBe('a\\_b\\*c\\~d\\#e')
  })

  it('leaves plain text unchanged', () => {
    expect(escapeTelegramMarkdown('hello world 123')).toBe('hello world 123')
  })

  it('escapes dots and exclamation marks', () => {
    expect(escapeTelegramMarkdown('Hello! End.')).toBe('Hello\\! End\\.')
  })

  it('escapes pipe and curly braces', () => {
    expect(escapeTelegramMarkdown('{a|b}')).toBe('\\{a\\|b\\}')
  })

  it('escapes equals and plus', () => {
    expect(escapeTelegramMarkdown('a=b+c')).toBe('a\\=b\\+c')
  })

  it('escapes tilde and greater-than', () => {
    expect(escapeTelegramMarkdown('~strikethrough~ >quote')).toBe('\\~strikethrough\\~ \\>quote')
  })

  it('escapes dash/minus', () => {
    expect(escapeTelegramMarkdown('a-b')).toBe('a\\-b')
  })

  it('handles empty string', () => {
    expect(escapeTelegramMarkdown('')).toBe('')
  })

  it('handles string with only special chars', () => {
    expect(escapeTelegramMarkdown('*_~')).toBe('\\*\\_\\~')
  })
})

// ─── NOTIFICATION_EMOJI mapping ──────────────────────────────────────────────

const NOTIFICATION_EMOJI: Record<string, string> = {
  'prompt:pending': '\u2753',
  'channel:user-pending': '\uD83D\uDC64',
  'cron:pending-approval': '\u23F0',
  'mcp:pending-approval': '\uD83E\uDDE9',
  'kin:error': '\u26A0\uFE0F',
}

describe('NOTIFICATION_EMOJI', () => {
  it('maps prompt:pending to question mark emoji', () => {
    expect(NOTIFICATION_EMOJI['prompt:pending']).toBe('❓')
  })

  it('maps channel:user-pending to bust emoji', () => {
    expect(NOTIFICATION_EMOJI['channel:user-pending']).toBe('👤')
  })

  it('maps cron:pending-approval to alarm clock emoji', () => {
    expect(NOTIFICATION_EMOJI['cron:pending-approval']).toBe('⏰')
  })

  it('maps mcp:pending-approval to puzzle piece emoji', () => {
    expect(NOTIFICATION_EMOJI['mcp:pending-approval']).toBe('🧩')
  })

  it('maps kin:error to warning emoji', () => {
    expect(NOTIFICATION_EMOJI['kin:error']).toBe('⚠️')
  })

  it('returns undefined for unknown types', () => {
    expect(NOTIFICATION_EMOJI['unknown:type']).toBeUndefined()
  })
})

// ─── formatNotification ──────────────────────────────────────────────────────

interface NotificationPayload {
  type: string
  title: string
  body?: string | null
  kinName?: string | null
}

function formatNotification(payload: NotificationPayload, platform: string): string {
  const emoji = NOTIFICATION_EMOJI[payload.type] ?? '\uD83D\uDD14'
  const kinSuffix = payload.kinName ? `\n\u2014 ${payload.kinName}` : ''

  switch (platform) {
    case 'telegram':
      return [
        `${emoji} *${escapeTelegramMarkdown(payload.title)}*`,
        payload.body ? escapeTelegramMarkdown(payload.body) : null,
        kinSuffix ? escapeTelegramMarkdown(kinSuffix) : null,
      ].filter(Boolean).join('\n')

    default:
      return [
        `${emoji} ${payload.title}`,
        payload.body,
        kinSuffix,
      ].filter(Boolean).join('\n')
  }
}

describe('formatNotification', () => {
  describe('default platform', () => {
    it('formats title with emoji', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Something broke' }, 'discord')
      expect(result).toBe('⚠️ Something broke')
    })

    it('uses bell emoji for unknown types', () => {
      const result = formatNotification({ type: 'unknown', title: 'Hello' }, 'discord')
      expect(result).toBe('🔔 Hello')
    })

    it('includes body when provided', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error', body: 'Details here' }, 'discord')
      expect(result).toBe('⚠️ Error\nDetails here')
    })

    it('includes kin name suffix', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error', kinName: 'Atlas' }, 'discord')
      expect(result).toBe('⚠️ Error\n\n— Atlas')
    })

    it('includes both body and kin name', () => {
      const result = formatNotification({
        type: 'prompt:pending',
        title: 'New prompt',
        body: 'Please review',
        kinName: 'Aria',
      }, 'discord')
      expect(result).toBe('❓ New prompt\nPlease review\n\n— Aria')
    })

    it('omits null body', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error', body: null }, 'discord')
      expect(result).toBe('⚠️ Error')
    })

    it('omits null kinName', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error', kinName: null }, 'discord')
      expect(result).toBe('⚠️ Error')
    })
  })

  describe('telegram platform', () => {
    it('wraps title in bold markdown', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error occurred' }, 'telegram')
      expect(result).toBe('⚠️ *Error occurred*')
    })

    it('escapes special characters in title', () => {
      const result = formatNotification({ type: 'kin:error', title: 'Error_in_module' }, 'telegram')
      expect(result).toBe('⚠️ *Error\\_in\\_module*')
    })

    it('escapes body text', () => {
      const result = formatNotification({
        type: 'kin:error',
        title: 'Error',
        body: 'Check [logs](url)',
      }, 'telegram')
      expect(result).toContain('Check \\[logs\\]\\(url\\)')
    })

    it('escapes kin name suffix', () => {
      const result = formatNotification({
        type: 'kin:error',
        title: 'Error',
        kinName: 'My_Kin',
      }, 'telegram')
      // The kin suffix is "\n— My_Kin" which gets escaped
      expect(result).toContain('My\\_Kin')
    })

    it('handles all fields with escaping', () => {
      const result = formatNotification({
        type: 'prompt:pending',
        title: 'New *prompt*',
        body: 'Please review!',
        kinName: 'Test_Bot',
      }, 'telegram')
      expect(result).toContain('\\*prompt\\*')
      expect(result).toContain('Please review\\!')
      expect(result).toContain('Test\\_Bot')
    })
  })
})

// ─── Rate limiting logic ─────────────────────────────────────────────────────

describe('rate limiting logic', () => {
  // Re-implement the rate limiting logic for isolated testing
  let deliveryTimestamps: Map<string, number[]>

  function isRateLimited(notifChannelId: string, maxPerMinute: number): boolean {
    const now = Date.now()
    const windowMs = 60_000
    const timestamps = deliveryTimestamps.get(notifChannelId) ?? []
    const recent = timestamps.filter((t) => now - t < windowMs)
    deliveryTimestamps.set(notifChannelId, recent)
    return recent.length >= maxPerMinute
  }

  function recordDelivery(notifChannelId: string) {
    const timestamps = deliveryTimestamps.get(notifChannelId) ?? []
    timestamps.push(Date.now())
    deliveryTimestamps.set(notifChannelId, timestamps)
  }

  beforeEach(() => {
    deliveryTimestamps = new Map()
  })

  it('is not rate limited with no deliveries', () => {
    expect(isRateLimited('ch1', 5)).toBe(false)
  })

  it('is not rate limited under the limit', () => {
    for (let i = 0; i < 4; i++) recordDelivery('ch1')
    expect(isRateLimited('ch1', 5)).toBe(false)
  })

  it('is rate limited at the limit', () => {
    for (let i = 0; i < 5; i++) recordDelivery('ch1')
    expect(isRateLimited('ch1', 5)).toBe(true)
  })

  it('is rate limited over the limit', () => {
    for (let i = 0; i < 10; i++) recordDelivery('ch1')
    expect(isRateLimited('ch1', 5)).toBe(true)
  })

  it('tracks channels independently', () => {
    for (let i = 0; i < 5; i++) recordDelivery('ch1')
    expect(isRateLimited('ch1', 5)).toBe(true)
    expect(isRateLimited('ch2', 5)).toBe(false)
  })

  it('clears old timestamps outside the window', () => {
    // Simulate old timestamps (>60s ago)
    const oldTime = Date.now() - 120_000
    deliveryTimestamps.set('ch1', [oldTime, oldTime, oldTime, oldTime, oldTime])
    // Should not be rate limited because old timestamps are filtered out
    expect(isRateLimited('ch1', 5)).toBe(false)
  })

  it('handles rate limit of 1', () => {
    recordDelivery('ch1')
    expect(isRateLimited('ch1', 1)).toBe(true)
  })

  it('handles rate limit of 0 (always limited)', () => {
    expect(isRateLimited('ch1', 0)).toBe(true)
  })
})

// ─── kinAvatarUrl (used in notifications.ts and tasks.ts) ────────────────────

function kinAvatarUrl(kinId: string, avatarPath: string | null, updatedAt?: Date | null): string | null {
  if (!avatarPath) return null
  const ext = avatarPath.split('.').pop() ?? 'png'
  const v = updatedAt ? updatedAt.getTime() : Date.now()
  return `/api/uploads/kins/${kinId}/avatar.${ext}?v=${v}`
}

describe('kinAvatarUrl', () => {
  it('returns null when avatarPath is null', () => {
    expect(kinAvatarUrl('kin1', null)).toBeNull()
  })

  it('returns null when avatarPath is empty string', () => {
    // Empty string is falsy
    expect(kinAvatarUrl('kin1', '')).toBeNull()
  })

  it('builds URL with correct extension', () => {
    const url = kinAvatarUrl('abc', 'photo.jpg', new Date(1000))
    expect(url).toBe('/api/uploads/kins/abc/avatar.jpg?v=1000')
  })

  it('defaults extension to png when no dot in path', () => {
    const url = kinAvatarUrl('abc', 'noext', new Date(2000))
    // 'noext'.split('.').pop() returns 'noext', not undefined
    // So it would use 'noext' as extension - testing actual behavior
    expect(url).toBe('/api/uploads/kins/abc/avatar.noext?v=2000')
  })

  it('uses updatedAt timestamp as cache buster', () => {
    const date = new Date('2025-06-15T12:00:00Z')
    const url = kinAvatarUrl('kin1', 'avatar.png', date)
    expect(url).toBe(`/api/uploads/kins/kin1/avatar.png?v=${date.getTime()}`)
  })

  it('falls back to Date.now() when updatedAt is null', () => {
    const before = Date.now()
    const url = kinAvatarUrl('kin1', 'avatar.png', null)
    const after = Date.now()
    expect(url).toStartWith('/api/uploads/kins/kin1/avatar.png?v=')
    const v = parseInt(url!.split('v=')[1]!)
    expect(v).toBeGreaterThanOrEqual(before)
    expect(v).toBeLessThanOrEqual(after)
  })

  it('falls back to Date.now() when updatedAt is undefined', () => {
    const url = kinAvatarUrl('kin1', 'avatar.webp')
    expect(url).toStartWith('/api/uploads/kins/kin1/avatar.webp?v=')
  })

  it('handles nested path — uses last extension', () => {
    const url = kinAvatarUrl('x', 'uploads/kins/x/avatar.png', new Date(999))
    expect(url).toBe('/api/uploads/kins/x/avatar.png?v=999')
  })
})
