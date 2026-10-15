import { defaultLocale } from '~~/shared/constants/locales'
import type { LocalizedText, YearMonth } from '~~/shared/content/schemas'

/**
 * Picks the visitor's language from a localized content field, falling back
 * to Spanish. Blank translations never override the Spanish text.
 */
export function resolveLocalized(value: LocalizedText, locale: string): string {
  if (typeof value === 'string') return value
  const translated = (value as Partial<Record<string, string>>)[locale]
  return translated?.trim() ? translated : value[defaultLocale]
}

export interface PeriodSource {
  end?: YearMonth
  current?: boolean
  periodLabel?: LocalizedText
  /** Period bounds formatted per locale by /api/profile. */
  startText?: LocalizedText
  endText?: LocalizedText
}

/** No end date means the item is still running, unless `current` says otherwise. */
export function isCurrentPeriod(item: PeriodSource): boolean {
  return item.current ?? item.end === undefined
}

/**
 * Human period for a timeline item. `openEnd` is the UI word for a running
 * period ("Actualidad", "En curso"), which stays in the i18n messages.
 */
export function formatPeriod(item: PeriodSource, locale: string, openEnd: string): string {
  if (item.periodLabel !== undefined) return resolveLocalized(item.periodLabel, locale)

  const start = item.startText === undefined ? undefined : resolveLocalized(item.startText, locale)
  const end = item.endText === undefined ? undefined : resolveLocalized(item.endText, locale)
  const current = isCurrentPeriod(item)

  if (start && end) return start === end ? start : `${start} – ${end}`
  if (start) return current ? `${start} – ${openEnd}` : start
  if (end) return end
  return current ? openEnd : ''
}
