import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { GalleryEvent, GalleryEventSummary, GalleryPhoto } from '~~/shared/types/gallery'
import { defaultLocale, siteLocales, type SiteLocaleCode } from '~~/shared/constants/locales'

type GalleryCollectionName = `gallery_${SiteLocaleCode}`

/**
 * A gallery Markdown file as Nuxt Content returns it. Translations only set
 * the fields they localize; the others come back as null.
 */
interface GalleryDocument {
  path: string
  title: string
  location: string
  organizer?: GalleryEvent['organizer'] | null
  date: string
  endDate?: string | null
  description: string
  links?: GalleryEvent['links'] | null
  seo?: GalleryEvent['seo'] | null
  tags?: string[] | null
  cover?: GalleryEvent['cover'] | null
  photos?: GalleryPhoto[] | null
  icon?: string | null
  draft?: boolean | null
  body?: unknown
}

const galleryLocaleCodes = new Set<SiteLocaleCode>(siteLocales.map(({ code }) => code))
const languageByLocale = Object.fromEntries(
  siteLocales.map(({ code, language }) => [code, language])
) as Record<SiteLocaleCode, string>

const getGalleryCollectionName = (locale: SiteLocaleCode): GalleryCollectionName =>
  `gallery_${locale}`

const getEventSlug = (path: string) => path.split('/').pop() || ''

const isFilledText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

/**
 * Nuxt Content returns page bodies in its compact minimark format
 * ({ type: 'minimark', value: [...nodes] }); older bodies are HAST trees.
 */
const hasBodyContent = (body: unknown): boolean => {
  if (!body || typeof body !== 'object') {
    return false
  }

  const { type, value, children } = body as Record<string, unknown>
  if (type === 'minimark') {
    return Array.isArray(value) && value.length > 0
  }

  return Array.isArray(children) && children.length > 0
}

/**
 * Translated files list only `src` plus the fields they localize for each
 * photo. Order, sizes and the photo list itself always come from Spanish, so
 * a photo added there shows up in every language straight away.
 */
function mergePhotos(base: GalleryPhoto[], translated: GalleryPhoto[]): GalleryPhoto[] {
  const translations = new Map(translated.map((photo) => [photo.src, photo]))

  return base.map((photo) => {
    const translation = translations.get(photo.src)
    if (!translation) return photo

    return {
      ...photo,
      ...(isFilledText(translation.alt) ? { alt: translation.alt } : {}),
      ...(isFilledText(translation.description) ? { description: translation.description } : {}),
    }
  })
}

function mergeEventData(base: GalleryDocument, override: GalleryDocument): GalleryDocument {
  const result: Record<string, unknown> = { ...base }
  const overrideSlug = getEventSlug(override.path).toLowerCase()

  for (const [key, value] of Object.entries(override)) {
    if (key === 'path' || value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value) && value.length === 0) {
      continue
    }

    if (typeof value === 'string' && value.trim() === '') {
      continue
    }

    if (key === 'title' && typeof value === 'string') {
      const normalizedTitle = value.toLowerCase().replace(/\s+/g, '-')

      if (normalizedTitle === overrideSlug || value === overrideSlug) {
        continue
      }
    }

    if (key === 'body') {
      if (hasBodyContent(value)) {
        result.body = value
      }
      continue
    }

    if (key === 'photos' && Array.isArray(value)) {
      result.photos = mergePhotos(base.photos ?? [], value as GalleryPhoto[])
      continue
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = {
        ...((result[key] as object | null | undefined) || {}),
        ...value,
      }
      continue
    }

    result[key] = value
  }

  return result as unknown as GalleryDocument
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function getDateFormatter(language: string, options: Intl.DateTimeFormatOptions) {
  const key = `${language}:${JSON.stringify(options)}`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    // Event dates are calendar days: format them in UTC, where they were
    // parsed, so no time zone moves them to the previous day.
    formatter = new Intl.DateTimeFormat(language, { ...options, timeZone: 'UTC' })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

const parseDay = (day: string) => new Date(`${day}T00:00:00Z`)

/**
 * Derives the last day, the length and the date texts of an event. Only the
 * server formats them (see server/utils/profile.ts): browsers ship other CLDR
 * data, and text that differs from the SSR HTML would be patched on hydration.
 */
function describeDates(date: string, endDate: string | null | undefined, locale: SiteLocaleCode) {
  const language = languageByLocale[locale]
  const lastDay = endDate && endDate > date ? endDate : date
  const start = parseDay(date)
  const end = parseDay(lastDay)
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  const dayFormat = getDateFormatter(language, { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    endDate: lastDay,
    days,
    dateText: days > 1 ? dayFormat.formatRange(start, end) : dayFormat.format(start),
    monthText: getDateFormatter(language, { month: 'long', year: 'numeric' }).format(start),
  }
}

function toSummary(document: GalleryDocument, locale: SiteLocaleCode): GalleryEventSummary {
  return {
    slug: getEventSlug(document.path),
    title: document.title,
    location: document.location,
    date: document.date,
    ...describeDates(document.date, document.endDate, locale),
    description: document.description,
    tags: document.tags ?? [],
    cover: document.cover ?? undefined,
    icon: document.icon ?? undefined,
    photoCount: document.photos?.length ?? 0,
  }
}

function toGalleryEvent(document: GalleryDocument, locale: SiteLocaleCode): GalleryEvent {
  return {
    ...toSummary(document, locale),
    organizer: document.organizer ?? undefined,
    links: document.links ?? undefined,
    seo: document.seo ?? undefined,
    photos: document.photos ?? [],
    body: document.body,
  }
}

export const normalizeGalleryLocale = (locale: string | null | undefined): SiteLocaleCode => {
  if (typeof locale !== 'string') {
    return defaultLocale
  }

  return galleryLocaleCodes.has(locale as SiteLocaleCode)
    ? (locale as SiteLocaleCode)
    : defaultLocale
}

/**
 * Every published event, newest first, as list summaries: no body and no
 * photo list, which only the event page needs.
 */
export async function fetchGalleryEvents(
  event: H3Event,
  locale: string | null | undefined
): Promise<GalleryEventSummary[]> {
  const normalizedLocale = normalizeGalleryLocale(locale)
  const baseEvents = (await queryCollection(event, getGalleryCollectionName(defaultLocale))
    .where('draft', '<>', true)
    .order('date', 'DESC')
    .all()) as GalleryDocument[]

  if (normalizedLocale === defaultLocale) {
    return baseEvents.map((document) => toSummary(document, normalizedLocale))
  }

  const localeEvents = (await queryCollection(event, getGalleryCollectionName(normalizedLocale))
    .where('draft', '<>', true)
    .all()) as GalleryDocument[]

  const localeEventMap = new Map<string, GalleryDocument>()

  for (const localeEvent of localeEvents) {
    localeEventMap.set(getEventSlug(localeEvent.path), localeEvent)
  }

  return baseEvents.map((baseEvent) => {
    const localeEvent = localeEventMap.get(getEventSlug(baseEvent.path))
    const merged = localeEvent ? mergeEventData(baseEvent, localeEvent) : baseEvent
    return toSummary(merged, normalizedLocale)
  })
}

export async function fetchGalleryEvent(
  event: H3Event,
  locale: string | null | undefined,
  slug: string
): Promise<GalleryEvent | null> {
  const normalizedLocale = normalizeGalleryLocale(locale)
  const basePath = `/${defaultLocale}/${slug}`
  const baseEvent = (await queryCollection(event, getGalleryCollectionName(defaultLocale))
    .path(basePath)
    .first()) as GalleryDocument | null

  if (!baseEvent || baseEvent.draft) return null

  if (normalizedLocale === defaultLocale) {
    return toGalleryEvent(baseEvent, normalizedLocale)
  }

  const localePath = `/${normalizedLocale}/${slug}`
  const localeEvent = (await queryCollection(event, getGalleryCollectionName(normalizedLocale))
    .path(localePath)
    .first()) as GalleryDocument | null

  const merged =
    localeEvent && !localeEvent.draft ? mergeEventData(baseEvent, localeEvent) : baseEvent
  return toGalleryEvent(merged, normalizedLocale)
}
