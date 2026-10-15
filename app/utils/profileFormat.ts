import { defaultLocale, siteLocales } from '~~/shared/constants/locales'
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

const formatters = new Map<string, Intl.DateTimeFormat>()

function getFormatter(language: string, month: 'short' | 'long' | undefined) {
  const key = `${language}:${month ?? 'year'}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(language, {
      year: 'numeric',
      ...(month ? { month } : {}),
      timeZone: 'UTC',
    })
    formatters.set(key, formatter)
  }
  return formatter
}

/**
 * Formats a `YYYY` / `YYYY-MM` content date for the locale ("Jun 2024",
 * "Diciembre de 2020"). Formatting in UTC keeps server and client output
 * identical regardless of their time zones.
 */
export function formatYearMonth(
  value: YearMonth,
  locale: string,
  month: 'short' | 'long' = 'short'
): string {
  const [year, monthNumber] = String(value).split('-')
  const language = siteLocales.find(({ code }) => code === locale)?.language ?? locale
  const date = new Date(Date.UTC(Number(year), monthNumber ? Number(monthNumber) - 1 : 0, 1))
  const formatted = getFormatter(language, monthNumber ? month : undefined).format(date)
  // Spanish month names are lowercase; dates open their line, so capitalise.
  return formatted.charAt(0).toLocaleUpperCase(language) + formatted.slice(1)
}

export interface PeriodSource {
  start?: YearMonth
  end?: YearMonth
  current?: boolean
  periodLabel?: LocalizedText
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

  const start = item.start === undefined ? undefined : formatYearMonth(item.start, locale)
  const end = item.end === undefined ? undefined : formatYearMonth(item.end, locale)
  const current = isCurrentPeriod(item)

  if (start && end) return start === end ? start : `${start} – ${end}`
  if (start) return current ? `${start} – ${openEnd}` : start
  if (end) return end
  return current ? openEnd : ''
}
