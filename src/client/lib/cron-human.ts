import cronstrue from 'cronstrue/i18n'

/**
 * Convert a cron expression to a human-readable description.
 * Returns null if the expression is invalid.
 */
export function cronToHuman(expression: string, locale: string = 'en'): string | null {
  if (!expression.trim()) return null
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
