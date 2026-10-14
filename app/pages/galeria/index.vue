<script setup lang="ts">
const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const { getCoverAlt } = useGalleryImages()
const { formatDate } = useDateFormatter()
const formatMonthYear = (dateStr: string) => formatDate(dateStr, { year: 'numeric', month: 'long' })

defineI18nRoute({
  paths: {
    es: '/galeria',
    en: '/gallery',
    de: '/galerie',
  },
})

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
const allVisibleEventsLackPhotos = computed(
  () => events.value.length > 0 && events.value.every((event) => event.photos.length === 0)
)

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

function getEventSlug(event: { path: string }) {
  return event.path.split('/').pop()
}
</script>

<template>
  <section :aria-label="t('gallery.title')">
    <PageHeader :title="t('gallery.title')" :intro="t('gallery.intro')" />

    <!-- Filter toolbar -->
    <div class="surface-glass mb-8 rounded-2xl p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:flex-row">
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
        class="mt-4 flex flex-wrap gap-2"
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

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <span class="text-muted font-mono text-sm">
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

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      :aria-label="t('gallery.loading')"
    >
      <UCard v-for="i in perPage" :key="i" class="overflow-hidden" aria-hidden="true">
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
        <h2 class="text-lg font-semibold">{{ t('gallery.noResults.title') }}</h2>
        <p class="text-muted">{{ t('gallery.noResults.description') }}</p>
        <UButton v-if="hasActiveFilters" variant="soft" @click="clearFilters">
          {{ t('gallery.filters.clearFilters') }}
        </UButton>
      </div>
    </UCard>

    <!-- Events grid -->
    <div v-else v-auto-animate class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="event in events"
        :key="event.id"
        v-spotlight
        :to="localePath(`/galeria/${getEventSlug(event)}`)"
        :aria-label="`${event.title}. ${formatMonthYear(event.date)}`"
        class="motion-link-card reveal surface-glass group relative block overflow-hidden rounded-2xl"
      >
        <!-- Cover / fallback tile with title scrim -->
        <div class="bg-elevated relative aspect-video w-full overflow-hidden">
          <template v-if="event.cover">
            <NuxtImg
              :src="event.cover.src"
              :alt="getCoverAlt(event.title, event.cover.alt)"
              :style="{ viewTransitionName: `gallery-cover-${getEventSlug(event)}` }"
              class="motion-link-media size-full object-cover"
              loading="lazy"
              width="800"
              height="450"
              quality="75"
              sizes="xs:100vw md:50vw lg:40vw"
            />
            <div
              class="absolute top-2 left-2 flex size-9 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-md"
              aria-hidden="true"
            >
              <UIcon :name="getEventIcon(event)" class="size-5" />
            </div>
          </template>
          <template v-else>
            <div class="gallery-fallback-tile absolute inset-0 flex items-center justify-center">
              <UIcon
                :name="getEventIcon(event)"
                class="text-primary-500/25 size-24"
                aria-hidden="true"
              />
            </div>
            <UBadge
              v-if="event.photos.length === 0"
              color="neutral"
              variant="soft"
              size="sm"
              class="absolute top-2 right-2"
            >
              {{ t('gallery.photoSoon') }}
            </UBadge>
          </template>

          <!-- Photo counter -->
          <UBadge
            v-if="event.photos.length > 0"
            color="primary"
            size="sm"
            class="absolute top-2 right-2"
          >
            <UIcon name="i-tabler-photo" class="mr-1 size-3" />
            {{ event.photos.length }}
          </UBadge>

          <!-- Title scrim: confined to the bottom ~45% so the cover reads
               clearly before hover, not just after -->
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 from-0% to-transparent to-45%"
          >
            <div class="px-4 pt-10 pb-3">
              <h2 class="text-lg leading-snug font-bold text-white drop-shadow-sm">
                {{ event.title }}
              </h2>
              <p class="mt-0.5 font-mono text-xs text-white/85">
                {{ formatMonthYear(event.date) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4 sm:p-5">
          <div v-if="event.location" class="flex items-center gap-2 text-sm">
            <UIcon name="i-tabler-map-pin" class="text-muted size-4 shrink-0" aria-hidden="true" />
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
    <UCard v-if="allVisibleEventsLackPhotos" class="mt-8">
      <div class="flex items-center justify-center gap-3 text-center">
        <UIcon name="i-tabler-camera" class="text-primary-500 size-6" aria-hidden="true" />
        <p class="text-muted">
          {{ t('gallery.comingSoon') }}
        </p>
      </div>
    </UCard>
  </section>
</template>

<style scoped>
/* Designed no-cover tile: aurora-tinted gradient instead of a skeleton */
.gallery-fallback-tile {
  background:
    radial-gradient(
      circle at 20% 18%,
      color-mix(in oklab, var(--color-ember-400) 18%, transparent),
      transparent 60%
    ),
    radial-gradient(
      circle at 82% 78%,
      color-mix(in oklab, var(--color-amber-400) 14%, transparent),
      transparent 55%
    ),
    linear-gradient(
      160deg,
      color-mix(in oklab, var(--color-ember-400) 8%, var(--ui-bg-elevated)),
      var(--ui-bg-elevated)
    );
}
</style>
