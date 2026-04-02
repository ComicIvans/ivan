<script setup lang="ts">
const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const { getPhotoSrc, getCoverAlt } = useGalleryImages()

usePageSeo('gallery.title', 'seo.pages.gallery')

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const sortBy = ref<'date' | 'title'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(6)

const queryOptions = computed(() => ({
  search: searchQuery.value,
  tags: selectedTags.value,
  sortBy: sortBy.value,
  sortOrder: sortOrder.value,
  page: currentPage.value,
  perPage: perPage.value,
}))

const { events, allTags, totalPages, totalEvents, isLoading } = useGalleryEvents(queryOptions)

const sortOptions = computed(() => [
  { label: t('gallery.filters.sortByDateDesc'), value: 'date-desc' },
  { label: t('gallery.filters.sortByDateAsc'), value: 'date-asc' },
  { label: t('gallery.filters.sortByTitleAsc'), value: 'title-asc' },
  { label: t('gallery.filters.sortByTitleDesc'), value: 'title-desc' },
])

const selectedSort = ref('date-desc')

watch(selectedSort, (newValue) => {
  const [field, order] = newValue.split('-') as ['date' | 'title', 'asc' | 'desc']
  sortBy.value = field
  sortOrder.value = order
})

watch([searchQuery, selectedTags, sortBy, sortOrder], () => {
  currentPage.value = 1
})

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value = [...selectedTags.value, tag]
  } else {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedTags.value = []
  selectedSort.value = 'date-desc'
  currentPage.value = 1
}

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' || selectedTags.value.length > 0 || selectedSort.value !== 'date-desc'
  )
})

function getEventIcon(event: { icon?: string }) {
  return event.icon || 'i-tabler-photo'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
  }).format(date)
}
</script>

<template>
  <section role="region" :aria-label="t('gallery.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('gallery.title') }}
      </h1>
      <p class="text-muted mx-auto mt-4 max-w-2xl">
        {{ t('gallery.intro') }}
      </p>
    </div>

    <!-- Filters and search -->
    <UCard class="mb-8">
      <div class="flex flex-col gap-4">
        <!-- Search bar and sort -->
        <div class="flex flex-col gap-4 sm:flex-row">
          <!-- Search -->
          <UInput
            v-model="searchQuery"
            :placeholder="t('gallery.filters.searchPlaceholder')"
            :aria-label="t('gallery.filters.searchLabel')"
            icon="i-tabler-search"
            class="flex-1"
            size="lg"
          />

          <USelect
            v-model="selectedSort"
            :items="sortOptions"
            :aria-label="t('gallery.filters.sortLabel')"
            class="w-full sm:w-64"
            size="lg"
          />
        </div>

        <!-- Tags -->
        <div
          v-if="allTags.length > 0"
          role="group"
          :aria-label="t('gallery.filters.tags')"
          class="flex flex-wrap gap-2"
        >
          <span class="text-muted flex items-center gap-2 text-sm" aria-hidden="true">
            <UIcon name="i-tabler-tags" class="size-4" />
            {{ t('gallery.filters.tags') }}:
          </span>
          <button
            v-for="tag in allTags"
            :key="tag"
            type="button"
            :aria-pressed="selectedTags.includes(tag)"
            class="cursor-pointer transition-all hover:scale-105"
            @click="toggleTag(tag)"
          >
            <UBadge
              :color="selectedTags.includes(tag) ? 'primary' : 'neutral'"
              :variant="selectedTags.includes(tag) ? 'solid' : 'outline'"
            >
              {{ tag }}
            </UBadge>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
          <span class="text-muted text-sm">
            {{ t('gallery.filters.resultsCount', { count: totalEvents }) }}
          </span>
          <UButton
            v-if="hasActiveFilters"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-tabler-x"
            @click="clearFilters"
          >
            {{ t('gallery.filters.clearFilters') }}
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Loading state -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="i in perPage" :key="i" class="overflow-hidden">
        <template #header>
          <USkeleton class="aspect-video w-full" />
        </template>
        <div class="space-y-3">
          <USkeleton class="h-6 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-16 w-full" />
        </div>
      </UCard>
    </div>

    <!-- No results -->
    <UCard v-else-if="events.length === 0" class="text-center">
      <div class="flex flex-col items-center gap-4 py-8">
        <UIcon name="i-tabler-photo-off" class="text-muted size-16" />
        <h3 class="text-lg font-semibold">{{ t('gallery.noResults.title') }}</h3>
        <p class="text-muted">{{ t('gallery.noResults.description') }}</p>
        <UButton v-if="hasActiveFilters" variant="soft" @click="clearFilters">
          {{ t('gallery.filters.clearFilters') }}
        </UButton>
      </div>
    </UCard>

    <!-- Events grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="event in events"
        :key="event.id"
        :to="localePath(`/galeria/${event.path.split('/').pop()}`)"
        :aria-label="`${event.title}. ${formatDate(event.date)}`"
        class="motion-link-card group block focus:outline-none"
      >
        <UCard class="h-full overflow-hidden">
          <template #header>
            <div class="bg-elevated relative aspect-video w-full overflow-hidden">
              <template v-if="event.cover">
                <img
                  :src="getPhotoSrc(event.cover.src)"
                  :alt="getCoverAlt(event.title, event.cover.alt)"
                  class="motion-link-media size-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="225"
                />
              </template>
              <template v-else>
                <USkeleton class="absolute inset-0 rounded-none" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <UIcon
                    :name="getEventIcon(event)"
                    class="text-dimmed size-16"
                    aria-hidden="true"
                  />
                </div>
                <UBadge color="neutral" size="sm" class="absolute right-2 bottom-2">
                  {{ t('gallery.photoSoon') }}
                </UBadge>
              </template>

              <!-- Photo counter -->
              <UBadge
                v-if="event.photos.length > 0"
                color="primary"
                size="sm"
                class="absolute right-2 bottom-2"
              >
                <UIcon name="i-tabler-photo" class="mr-1 size-3" />
                {{ event.photos.length }}
              </UBadge>
            </div>
          </template>

          <div>
            <h2 class="text-highlighted flex items-center gap-2 text-lg font-bold">
              <UIcon
                :name="getEventIcon(event)"
                class="text-primary-500 size-5 shrink-0"
                aria-hidden="true"
              />
              {{ event.title }}
            </h2>
            <div class="mt-1 flex items-center gap-2 text-sm">
              <UIcon name="i-tabler-calendar" class="text-primary-500 size-4 shrink-0" />
              <span class="text-toned font-medium">{{ formatDate(event.date) }}</span>
            </div>
            <div v-if="event.location" class="mt-1 flex items-center gap-2 text-sm">
              <UIcon name="i-tabler-map-pin" class="text-muted size-4 shrink-0" />
              <span class="text-muted">{{ event.location }}</span>
            </div>
            <p class="text-muted mt-2 line-clamp-2">{{ event.description }}</p>

            <!-- Tags -->
            <div v-if="event.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
              <UBadge
                v-for="tag in event.tags.slice(0, 3)"
                :key="tag"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ tag }}
              </UBadge>
              <UBadge v-if="event.tags.length > 3" color="neutral" variant="subtle" size="xs">
                +{{ event.tags.length - 3 }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination
        v-model:page="currentPage"
        :total="totalEvents"
        :items-per-page="perPage"
        show-edges
        show-controls
      />
    </div>

    <!-- Informational note when no events have photos -->
    <UCard v-if="events.length > 0 && events.every((e) => e.photos.length === 0)" class="mt-8">
      <div class="flex items-center justify-center gap-3 text-center">
        <UIcon name="i-tabler-camera" class="text-primary-500 size-6" aria-hidden="true" />
        <p class="text-muted">
          {{ t('gallery.comingSoon') }}
        </p>
      </div>
    </UCard>
  </section>
</template>
