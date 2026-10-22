import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import { siteLocales } from '~~/shared/constants/locales'
import type { LocalizedDate, PeriodText, ProfileData, YearMonth } from '~~/shared/content/schemas'

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
 * Formats a `YYYY` / `YYYY-MM` content date in every site language ("Jun
 * 2024", "Diciembre de 2020"). Only the server formats dates: browsers ship
 * other CLDR versions ("sept" / "sep"), and text that differs from the SSR
 * HTML would be patched during hydration.
 */
function localizeDate(value: YearMonth, month: 'short' | 'long' = 'short'): LocalizedDate {
  const [year, monthNumber] = String(value).split('-')
  const date = new Date(Date.UTC(Number(year), monthNumber ? Number(monthNumber) - 1 : 0, 1))
  return Object.fromEntries(
    siteLocales.map(({ code, language }) => {
      const formatted = getFormatter(language, monthNumber ? month : undefined).format(date)
      // Spanish month names are lowercase; dates open their line, so capitalise.
      return [code, formatted.charAt(0).toLocaleUpperCase(language) + formatted.slice(1)]
    })
  ) as LocalizedDate
}

function withPeriodText<T extends { start?: YearMonth; end?: YearMonth }>(item: T): T & PeriodText {
  return {
    ...item,
    startText: item.start === undefined ? undefined : localizeDate(item.start),
    endText: item.end === undefined ? undefined : localizeDate(item.end),
  }
}

/**
 * Loads every profile section with all languages side by side. Locale
 * resolution happens in the app (useProfile), so one response serves every
 * locale and a language switch never refetches.
 */
export async function fetchProfile(event: H3Event): Promise<ProfileData> {
  const [highlights, experience, representation, projects, training] = await Promise.all([
    queryCollection(event, 'profile_highlights').select('items', 'topics').first(),
    queryCollection(event, 'profile_experience').select('items').first(),
    queryCollection(event, 'profile_representation').select('items').first(),
    queryCollection(event, 'profile_projects').select('stack', 'items').first(),
    queryCollection(event, 'profile_training')
      .select('academic', 'languages', 'certifications', 'competencies')
      .first(),
  ])

  if (!highlights || !experience || !representation || !projects || !training) {
    console.error('[profile] A profile collection is empty; check content/profile/*.yml')
    throw createError({ statusCode: 500, statusMessage: 'Profile content unavailable' })
  }

  // The collection types are generated from the same zod schemas, and
  // verify-content guarantees the YAML matches them.
  return {
    highlights: highlights.items,
    topics: highlights.topics ?? [],
    experience: experience.items.map(withPeriodText),
    representation: representation.items.map((item) => ({
      ...item,
      dateText: localizeDate(item.date, 'long'),
    })),
    projects: { stack: projects.stack, items: projects.items },
    training: {
      academic: training.academic.map(withPeriodText),
      languages: training.languages,
      certifications: training.certifications,
      competencies: training.competencies,
    },
  }
}
