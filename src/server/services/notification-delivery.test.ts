import { describe, it, expect, beforeEach } from 'bun:test'

// ─── Pure functions extracted from notification-delivery.ts ──────────────────
// These are re-implemented to test the contracts since they aren't exported.
// If the module ever exports them, switch to real imports.

// ─── escapeTelegramMarkdown ──────────────────────────────────────────────────

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

  it('escapes parentheses', () => {
    expect(escapeTelegramMarkdown('(test)')).toBe('\\(test\\)')
  })

  it('escapes tildes', () => {
    expect(escapeTelegramMarkdown('~strikethrough~')).toBe('\\~strikethrough\\~')
  })

  it('escapes backticks', () => {
    expect(escapeTelegramMarkdown('`code`')).toBe('\\`code\\`')
  })

  it('escapes greater than', () => {
    expect(escapeTelegramMarkdown('> quote')).toBe('\\> quote')
  })

  it('escapes hash', () => {
    expect(escapeTelegramMarkdown('#heading')).toBe('\\#heading')
  })

  it('escapes plus', () => {
    expect(escapeTelegramMarkdown('a+b')).toBe('a\\+b')
  })

  it('escapes hyphen', () => {
    expect(escapeTelegramMarkdown('a-b')).toBe('a\\-b')
  })

  it('escapes equals', () => {
    expect(escapeTelegramMarkdown('a=b')).toBe('a\\=b')
  })

  it('escapes pipe', () => {
    expect(escapeTelegramMarkdown('a|b')).toBe('a\\|b')
  })

  it('escapes curly braces', () => {
    expect(escapeTelegramMarkdown('{test}')).toBe('\\{test\\}')
  })

  it('escapes dot', () => {
    expect(escapeTelegramMarkdown('hello.world')).toBe('hello\\.world')
  })

  it('escapes exclamation mark', () => {
    expect(escapeTelegramMarkdown('hello!')).toBe('hello\\!')
  })

  it('returns empty string for empty input', () => {
    expect(escapeTelegramMarkdown('')).toBe('')
  })

  it('does not escape regular characters', () => {
    expect(escapeTelegramMarkdown('hello world 123')).toBe('hello world 123')
  })

  it('escapes multiple special chars in one string', () => {
    expect(escapeTelegramMarkdown('*hello* _world_ [link]')).toBe(
      '\\*hello\\* \\_world\\_ \\[link\\]'
    )
  })

  it('handles consecutive special characters', () => {
    expect(escapeTelegramMarkdown('***')).toBe('\\*\\*\\*')
  })
})

// ─── NOTIFICATION_EMOJI mapping ─────────────────────────────────────────────

const NOTIFICATION_EMOJI: Record<string, string> = {
  'prompt:pending': '\u2753',
  'channel:user-pending': '\uD83D\uDC64',
  'cron:pending-approval': '\u23F0',
  'mcp:pending-approval': '\uD83E\uDDE9',
  'kin:error': '\u26A0\uFE0F',
}

describe('NOTIFICATION_EMOJI', () => {
  it('maps prompt:pending to question mark', () => {
    expect(NOTIFICATION_EMOJI['prompt:pending']).toBe('❓')
  })

  it('maps channel:user-pending to bust silhouette', () => {
    expect(NOTIFICATION_EMOJI['channel:user-pending']).toBe('👤')
  })

  it('maps cron:pending-approval to alarm clock', () => {
    expect(NOTIFICATION_EMOJI['cron:pending-approval']).toBe('⏰')
  })

  it('maps mcp:pending-approval to puzzle piece', () => {
    expect(NOTIFICATION_EMOJI['mcp:pending-approval']).toBe('🧩')
  })

  it('maps kin:error to warning sign', () => {
    expect(NOTIFICATION_EMOJI['kin:error']).toBe('⚠️')
  })

  it('returns undefined for unknown types', () => {
    expect(NOTIFICATION_EMOJI['unknown:type']).toBeUndefined()
  })
})

// ─── formatNotification ─────────────────────────────────────────────────────

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
    it('formats basic notification with title only', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'New prompt' },
        'discord'
      )
      expect(result).toBe('❓ New prompt')
    })

    it('includes body when provided', () => {
      const result = formatNotification(
        { type: 'kin:error', title: 'Error', body: 'Something went wrong' },
        'discord'
      )
      expect(result).toBe('⚠️ Error\nSomething went wrong')
    })

    it('includes kin name suffix', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'Prompt', kinName: 'MyKin' },
        'discord'
      )
      expect(result).toBe('❓ Prompt\n\n— MyKin')
    })

    it('includes both body and kin name', () => {
      const result = formatNotification(
        { type: 'kin:error', title: 'Error', body: 'Details here', kinName: 'TestKin' },
        'discord'
      )
      expect(result).toBe('⚠️ Error\nDetails here\n\n— TestKin')
    })

    it('uses bell emoji for unknown types', () => {
      const result = formatNotification(
        { type: 'unknown:type', title: 'Hello' },
        'discord'
      )
      expect(result).toBe('🔔 Hello')
    })

    it('excludes null body', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'Test', body: null },
        'discord'
      )
      expect(result).toBe('❓ Test')
    })

    it('excludes null kinName', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'Test', kinName: null },
        'discord'
      )
      expect(result).toBe('❓ Test')
    })
  })

  describe('telegram platform', () => {
    it('wraps title in bold markdown', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'New prompt' },
        'telegram'
      )
      expect(result).toBe('❓ *New prompt*')
    })

    it('escapes special characters in title', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'Hello_World' },
        'telegram'
      )
      expect(result).toBe('❓ *Hello\\_World*')
    })

    it('escapes body text', () => {
      const result = formatNotification(
        { type: 'kin:error', title: 'Error', body: 'Check file.txt' },
        'telegram'
      )
      expect(result).toBe('⚠️ *Error*\nCheck file\\.txt')
    })

    it('escapes kin name suffix', () => {
      const result = formatNotification(
        { type: 'prompt:pending', title: 'Test', kinName: 'My_Kin' },
        'telegram'
      )
      expect(result).toBe('❓ *Test*\n\n— My\\_Kin')
    })

    it('handles all fields with escaping', () => {
      const result = formatNotification(
        { type: 'kin:error', title: 'Error!', body: 'Something (bad)', kinName: 'Test.Kin' },
        'telegram'
      )
      expect(result).toBe('⚠️ *Error\\!*\nSomething \\(bad\\)\n\n— Test\\.Kin')
    })
  })
})

// ─── Rate limiting logic ─────────────────────────────────────────────────────
// Re-implementing the in-memory sliding window rate limiter from the module

describe('rate limiting', () => {
  let deliveryTimestamps: Map<string, number[]>

  function isRateLimited(notifChannelId: string, max: number): boolean {
    const now = Date.now()
    const windowMs = 60_000
    const timestamps = deliveryTimestamps.get(notifChannelId) ?? []
    const recent = timestamps.filter((t) => now - t < windowMs)
    deliveryTimestamps.set(notifChannelId, recent)
    return recent.length >= max
  }

  function recordDelivery(notifChannelId: string) {
    const timestamps = deliveryTimestamps.get(notifChannelId) ?? []
    timestamps.push(Date.now())
    deliveryTimestamps.set(notifChannelId, timestamps)
  }

  beforeEach(() => {
    deliveryTimestamps = new Map()
  })

  it('is not rate limited when no deliveries recorded', () => {
    expect(isRateLimited('channel-1', 5)).toBe(false)
  })

  it('is not rate limited when under the limit', () => {
    recordDelivery('channel-1')
    recordDelivery('channel-1')
    expect(isRateLimited('channel-1', 5)).toBe(false)
  })

  it('is rate limited when at the limit', () => {
    for (let i = 0; i < 5; i++) {
      recordDelivery('channel-1')
    }
    expect(isRateLimited('channel-1', 5)).toBe(true)
  })

  it('is rate limited when over the limit', () => {
    for (let i = 0; i < 10; i++) {
      recordDelivery('channel-1')
    }
    expect(isRateLimited('channel-1', 5)).toBe(true)
  })

  it('tracks channels independently', () => {
    for (let i = 0; i < 5; i++) {
      recordDelivery('channel-1')
    }
    expect(isRateLimited('channel-1', 5)).toBe(true)
    expect(isRateLimited('channel-2', 5)).toBe(false)
  })

  it('expires old timestamps outside the window', () => {
    const now = Date.now()
    // Add timestamps from 2 minutes ago (outside 60s window)
    const oldTimestamps = Array.from({ length: 5 }, () => now - 120_000)
    deliveryTimestamps.set('channel-1', oldTimestamps)

    expect(isRateLimited('channel-1', 5)).toBe(false)
    // Old timestamps should be cleaned up
    expect(deliveryTimestamps.get('channel-1')!.length).toBe(0)
  })

  it('keeps recent timestamps while expiring old ones', () => {
    const now = Date.now()
    const timestamps = [
      now - 120_000, // old, should be removed
      now - 90_000,  // old, should be removed
      now - 30_000,  // recent, should be kept
      now - 10_000,  // recent, should be kept
    ]
    deliveryTimestamps.set('channel-1', timestamps)

    expect(isRateLimited('channel-1', 5)).toBe(false)
    expect(deliveryTimestamps.get('channel-1')!.length).toBe(2)
  })

  it('handles rate limit of 1', () => {
    recordDelivery('channel-1')
    expect(isRateLimited('channel-1', 1)).toBe(true)
  })

  it('handles rate limit of 0 (always limited)', () => {
    expect(isRateLimited('channel-1', 0)).toBe(true)
  })

  it('recordDelivery adds timestamp', () => {
    expect(deliveryTimestamps.has('channel-1')).toBe(false)
    recordDelivery('channel-1')
    expect(deliveryTimestamps.get('channel-1')!.length).toBe(1)
    recordDelivery('channel-1')
    expect(deliveryTimestamps.get('channel-1')!.length).toBe(2)
  })
})
