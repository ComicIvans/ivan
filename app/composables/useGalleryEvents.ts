import type { GalleryEvent, GalleryQueryOptions } from '~~/shared/types/gallery'

/**
 * Composable for querying gallery events with filters, search, and pagination
 * Events are loaded from Spanish (es) as base and merged with current locale translations
 */
export function useGalleryEvents(options: Ref<GalleryQueryOptions> = ref({})) {
  const { locale } = useI18n({ useScope: 'global' })

  const { data: allEvents, status } = useAsyncData(
    () => `gallery-events-${locale.value}`,
    () =>
      $fetch<GalleryEvent[]>('/api/gallery/events', {
        params: { locale: locale.value },
      }),
    {
      watch: [locale],
    }
  )

  const filteredEvents = computed(() => {
    if (!allEvents.value) return []

    let events = [...allEvents.value]

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

    const selectedTags = options.value.tags
    if (selectedTags && selectedTags.length > 0) {
      events = events.filter((event) => selectedTags.some((tag) => event.tags.includes(tag)))
    }

    const sortBy = options.value.sortBy || 'date'
    const sortOrder = options.value.sortOrder || 'desc'

    events.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title, locale.value)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return events
  })

  const perPage = computed(() => options.value.perPage || 6)
  const totalEvents = computed(() => filteredEvents.value.length)
  const totalPages = computed(() => Math.ceil(totalEvents.value / perPage.value))

  const paginatedEvents = computed(() => {
    const page = options.value.page || 1
    const start = (page - 1) * perPage.value
    const end = start + perPage.value

    return filteredEvents.value.slice(start, end)
  })

  const allTags = computed(() => {
    if (!allEvents.value) return []

    const tags = new Set<string>()
    allEvents.value.forEach((event) => {
      event.tags.forEach((tag) => tags.add(tag))
    })

    return Array.from(tags).sort((a, b) => a.localeCompare(b, locale.value))
  })

  return {
    events: paginatedEvents,
    allEvents: filteredEvents,
    allTags,
    totalEvents,
    totalPages,
    perPage,
    status,
    isLoading: computed(() => status.value === 'pending'),
  }
}

/**
 * Composable to fetch a specific event by its slug
 * Loads Spanish content as base and merges with current locale translation
 */
export function useGalleryEvent(eventSlug: Ref<string> | string) {
  const { locale } = useI18n({ useScope: 'global' })
  const slug = toRef(eventSlug)

  const { data: event, status } = useAsyncData(
    () => `gallery-event-${locale.value}-${slug.value}`,
    () => {
      if (!slug.value) {
        return Promise.resolve(null)
      }

      return $fetch<GalleryEvent | null>(`/api/gallery/events/${slug.value}`, {
        params: { locale: locale.value },
      })
    },
    {
      watch: [locale, slug],
    }
  )

  return {
    event,
    status,
    isLoading: computed(() => status.value === 'pending'),
  }
}
