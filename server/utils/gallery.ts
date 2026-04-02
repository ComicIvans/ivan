import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { GalleryEvent } from '~~/shared/types/gallery'
import { defaultLocale, siteLocales, type SiteLocaleCode } from '~~/shared/constants/locales'

type GalleryCollectionName = `gallery_${(typeof siteLocales)[number]['code']}`

const galleryLocaleCodes = new Set<SiteLocaleCode>(siteLocales.map(({ code }) => code))

const getGalleryCollectionName = (locale: SiteLocaleCode): GalleryCollectionName =>
  `gallery_${locale}` as GalleryCollectionName

const getEventSlug = (path: string) => path.split('/').pop() || ''

const hasBodyContent = (body: unknown): boolean => {
  if (!body || typeof body !== 'object') {
    return false
  }

  const bodyValue = body as Record<string, unknown>
  const hasChildren = Array.isArray(bodyValue.children) && bodyValue.children.length > 0
  const hasValue = typeof bodyValue.value === 'string' && bodyValue.value.trim().length > 0

  return hasChildren || hasValue
}

function mergeEventData(base: GalleryEvent, override: Partial<GalleryEvent>): GalleryEvent {
  const result = { ...base }
  const overrideSlug = override.path ? getEventSlug(override.path).toLowerCase() : ''
  const allKeys = new Set([...Object.keys(base), ...Object.keys(override)]) as Set<
    keyof GalleryEvent
  >

  for (const key of allKeys) {
    if (!(key in override)) {
      continue
    }

    const value = override[key]

    if (value === undefined || value === null) {
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
      if (!hasBodyContent(value)) {
        continue
      }

      ;(result as Record<string, unknown>)[key] = value
      continue
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      ;(result as Record<string, unknown>)[key] = {
        ...((base[key] as object | undefined) || {}),
        ...value,
      }
      continue
    }

    ;(result as Record<string, unknown>)[key] = value
  }

  return result
}

export const normalizeGalleryLocale = (locale: string | null | undefined): SiteLocaleCode => {
  if (typeof locale !== 'string') {
    return defaultLocale
  }

  return galleryLocaleCodes.has(locale as SiteLocaleCode)
    ? (locale as SiteLocaleCode)
    : defaultLocale
}

export async function fetchGalleryEvents(
  event: H3Event,
  locale: string | null | undefined
): Promise<GalleryEvent[]> {
  const normalizedLocale = normalizeGalleryLocale(locale)
  const baseEvents = (await queryCollection(event, getGalleryCollectionName(defaultLocale))
    .where('draft', '<>', true)
    .order('date', 'DESC')
    .all()) as GalleryEvent[]

  if (normalizedLocale === defaultLocale) {
    return baseEvents
  }

  const localeEvents = (await queryCollection(event, getGalleryCollectionName(normalizedLocale))
    .where('draft', '<>', true)
    .all()) as GalleryEvent[]

  const localeEventMap = new Map<string, GalleryEvent>()

  for (const localeEvent of localeEvents) {
    localeEventMap.set(getEventSlug(localeEvent.path), localeEvent)
  }

  return baseEvents.map((baseEvent) => {
    const localeEvent = localeEventMap.get(getEventSlug(baseEvent.path))

    return localeEvent ? mergeEventData(baseEvent, localeEvent) : baseEvent
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
    .first()) as GalleryEvent | null

  if (!baseEvent || normalizedLocale === defaultLocale) {
    return baseEvent
  }

  const localePath = `/${normalizedLocale}/${slug}`
  const localeEvent = (await queryCollection(event, getGalleryCollectionName(normalizedLocale))
    .path(localePath)
    .first()) as GalleryEvent | null

  return localeEvent ? mergeEventData(baseEvent, localeEvent) : baseEvent
}
