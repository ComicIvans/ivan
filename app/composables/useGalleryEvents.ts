import type { Collections } from '@nuxt/content'

// Gallery event type extracted from schema
export interface GalleryEvent {
  id: string
  path: string
  title: string
  location: string
  date: string
  duration?: string
  description: string
  about?: string
  participation?: string
  links?: Array<{
    label: string
    url: string
  }>
  seo?: {
    title?: string
    description?: string
  }
  tags: string[]
  cover?: {
    src: string
    alt: string
  }
  photos: Array<{
    src: string
    alt?: string
    description?: string
  }>
  icon?: string
  draft?: boolean
  body?: unknown
}

// Options for filtering and sorting events
export interface GalleryQueryOptions {
  search?: string
  tags?: string[]
  sortBy?: 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

/**
 * Deep merge two objects, with the second object taking precedence
 * Only overwrites if the value is defined and not empty
 */
function mergeEventData(base: GalleryEvent, override: Partial<GalleryEvent>): GalleryEvent {
  const result = { ...base }

  // Get the slug from the override path to detect auto-generated titles
  const overrideSlug = override.path?.split('/').pop() || ''

  // Get all keys from both base and override
  const allKeys = new Set([...Object.keys(base), ...Object.keys(override)]) as Set<
    keyof GalleryEvent
  >

  for (const key of allKeys) {
    // If the key doesn't exist in override, keep the base value
    if (!(key in override)) {
      continue
    }

    const value = override[key]

    // Skip undefined, null, or empty values - keep base value instead
    if (value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'string' && value.trim() === '') continue

    // Special handling for title - skip if it's auto-generated from slug
    if (key === 'title' && typeof value === 'string') {
      // Nuxt Content auto-generates title from slug, detect and skip
      const normalizedTitle = value.toLowerCase().replace(/\s+/g, '-')
      const normalizedSlug = overrideSlug.toLowerCase()
      if (normalizedTitle === normalizedSlug || value === overrideSlug) {
        continue
      }
    }

    // Special handling for body - only override if it has actual content
    // Body should be REPLACED entirely, not merged, to ensure translated content is shown
    if (key === 'body') {
      const bodyValue = value as Record<string, unknown> | undefined
      // Skip empty body - check for children or value property
      if (!bodyValue) {
        continue
      }
      // Check if body has actual content (children array or value)
      const hasChildren = Array.isArray(bodyValue.children) && bodyValue.children.length > 0
      const hasValue = 'value' in bodyValue && bodyValue.value
      if (!hasChildren && !hasValue) {
        continue
      }
      // Replace body entirely with translated content
      ;(result as Record<string, unknown>)[key] = value
      continue
    }

    // For objects (like seo, cover), merge them
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      ;(result as Record<string, unknown>)[key] = {
        ...((base[key] as object) || {}),
        ...value,
      }
    } else {
      ;(result as Record<string, unknown>)[key] = value
    }
  }

  return result
}

/**
 * Composable for querying gallery events with filters, search, and pagination
 * Events are loaded from Spanish (es) as base and merged with current locale translations
 */
export function useGalleryEvents(options: Ref<GalleryQueryOptions> = ref({})) {
  const { locale } = useI18n()

  // Fetch all events with locale fallback
  const { data: allEvents, status } = useAsyncData(
    () => `gallery-events-${locale.value}`,
    async () => {
      // Always fetch Spanish events as base
      const baseEvents = (await queryCollection('gallery_es' as keyof Collections)
        .where('draft', '<>', true)
        .order('date', 'DESC')
        .all()) as GalleryEvent[]

      // If current locale is Spanish, return base events directly
      if (locale.value === 'es') {
        return baseEvents
      }

      // Fetch events in current locale
      const collectionName = `gallery_${locale.value}` as keyof Collections
      const localeEvents = (await queryCollection(collectionName)
        .where('draft', '<>', true)
        .all()) as GalleryEvent[]

      // Create a map of locale events by slug for quick lookup
      const localeEventMap = new Map<string, GalleryEvent>()
      for (const event of localeEvents) {
        const slug = event.path.split('/').pop() || ''
        localeEventMap.set(slug, event)
      }

      // Merge base events with locale translations
      return baseEvents.map((baseEvent) => {
        const slug = baseEvent.path.split('/').pop() || ''
        const localeEvent = localeEventMap.get(slug)

        if (localeEvent) {
          // Merge locale event over base, keeping base values for missing fields
          return mergeEventData(baseEvent, localeEvent)
        }

        // No translation available, use base event
        return baseEvent
      })
    },
    {
      watch: [locale],
    }
  )

  // Filtered and paginated events
  const filteredEvents = computed(() => {
    if (!allEvents.value) return []

    let events = [...allEvents.value]

    // Filter by search term
    const searchTerm = options.value.search?.toLowerCase()
    if (searchTerm) {
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Filter by tags
    const selectedTags = options.value.tags
    if (selectedTags && selectedTags.length > 0) {
      events = events.filter((event) => selectedTags.some((tag) => event.tags.includes(tag)))
    }

    // Sort
    const sortBy = options.value.sortBy || 'date'
    const sortOrder = options.value.sortOrder || 'desc'

    events.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return events
  })

  // Calculate total pages
  const perPage = computed(() => options.value.perPage || 6)
  const totalEvents = computed(() => filteredEvents.value.length)
  const totalPages = computed(() => Math.ceil(totalEvents.value / perPage.value))

  // Events for current page
  const paginatedEvents = computed(() => {
    const page = options.value.page || 1
    const start = (page - 1) * perPage.value
    const end = start + perPage.value

    return filteredEvents.value.slice(start, end)
  })

  // Get all unique tags
  const allTags = computed(() => {
    if (!allEvents.value) return []

    const tags = new Set<string>()
    allEvents.value.forEach((event) => {
      event.tags.forEach((tag) => tags.add(tag))
    })

    return Array.from(tags).sort()
  })

  return {
    // Data
    events: paginatedEvents,
    allEvents: filteredEvents,
    allTags,

    // Pagination
    totalEvents,
    totalPages,
    perPage,

    // State
    status,
    isLoading: computed(() => status.value === 'pending'),
  }
}

/**
 * Composable to fetch a specific event by its slug
 * Loads Spanish content as base and merges with current locale translation
 */
export function useGalleryEvent(eventSlug: Ref<string> | string) {
  const { locale } = useI18n()
  const slug = toRef(eventSlug)

  // Helper function to fetch the event data
  async function fetchEventData(currentLocale: string, currentSlug: string) {
    // Always fetch base event from Spanish
    const basePath = `/es/${currentSlug}`
    const baseEvent = (await queryCollection('gallery_es' as keyof Collections)
      .path(basePath)
      .first()) as GalleryEvent | null

    // If no base event exists, return null
    if (!baseEvent) {
      return null
    }

    // If current locale is Spanish, return base event directly
    if (currentLocale === 'es') {
      return baseEvent
    }

    // Try to fetch locale-specific translation
    const localePath = `/${currentLocale}/${currentSlug}`
    const collectionName = `gallery_${currentLocale}` as keyof Collections
    const localeEvent = (await queryCollection(collectionName)
      .path(localePath)
      .first()) as GalleryEvent | null

    // Merge locale event over base if it exists
    if (localeEvent) {
      return mergeEventData(baseEvent, localeEvent)
    }

    // No translation available, use base event
    return baseEvent
  }

  // Use useAsyncData with watch to handle both SSR and locale changes
  const {
    data: event,
    status,
    refresh,
  } = useAsyncData(`gallery-event-${slug.value}`, () => fetchEventData(locale.value, slug.value))

  // Watch locale changes and refresh data
  watch(locale, async () => {
    await refresh()
  })

  // Watch slug changes and refresh data
  watch(slug, async () => {
    await refresh()
  })

  return {
    event,
    status,
    isLoading: computed(() => status.value === 'pending'),
  }
}
