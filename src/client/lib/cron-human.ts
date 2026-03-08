import cronstrue from 'cronstrue/i18n'

/**
 * Check if a string is an ISO 8601 datetime (used for one-shot crons).
 */
export function isISODatetime(value: string): boolean {
  const d = new Date(value.trim())
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}[T ]/.test(value.trim())
}

/**
 * Convert a cron expression (or ISO datetime) to a human-readable description.
 * Returns null if the expression is invalid.
 */
export function cronToHuman(expression: string, locale: string = 'en'): string | null {
  if (!expression.trim()) return null

  // Handle ISO datetime strings for one-shot crons
  if (isISODatetime(expression)) {
    const d = new Date(expression.trim())
    return d.toLocaleString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  try {
    return cronstrue.toString(expression, {
      locale,
      use24HourTimeFormat: true,
      throwExceptionOnParseError: true,
    })
  } catch {
    return null
  }
}
