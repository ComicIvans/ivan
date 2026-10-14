<script setup lang="ts">
const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const localePath = useLocalePath()
const { formatDate } = useDateFormatter()
const { getPhotoAlt, getCoverAlt } = useGalleryImages()
const img = useImage()

const {
  aspectRatios: photoAspectRatios,
  recordFromImage,
  preload: preloadPhotoAspectRatio,
  reset: resetPreloader,
} = usePhotoPreloader()

definePageMeta({
  i18n: {
    paths: {
      es: '/galeria/[slug]',
      en: '/gallery/[slug]',
      de: '/galerie/[slug]',
    },
  },
})

const eventSlug = computed(() => route.params.slug as string)

const { event, isLoading } = await useGalleryEvent(eventSlug)

usePageSeo(
  () => event.value?.seo?.title || event.value?.title || t('gallery.title'),
  () => event.value?.seo?.description || event.value?.description || t('seo.pages.gallery'),
  { ogImage: () => event.value?.cover?.src }
)

useSchemaOrg([
  defineEvent({
    name: () => event.value?.title || t('gallery.title'),
    startDate: () => event.value?.date,
    location: () => event.value?.location,
    description: () => event.value?.description,
    image: () => event.value?.cover?.src,
  }),
])

const photosPerPage = 12
const currentPhotoPage = ref(1)

const totalPhotos = computed(() => event.value?.photos.length || 0)
const totalPhotoPages = computed(() => Math.ceil(totalPhotos.value / photosPerPage))

const paginatedPhotos = computed(() => {
  if (!event.value?.photos) return []
  const start = (currentPhotoPage.value - 1) * photosPerPage
  const end = start + photosPerPage
  return event.value.photos.slice(start, end)
})

function absoluteIndex(pageIndex: number) {
  return (currentPhotoPage.value - 1) * photosPerPage + pageIndex
}

const loadedImages = reactive(new Set<string>())

watch(currentPhotoPage, () => {
  loadedImages.clear()
})

function onImageLoad(pageIndex: number, photoIndex: number, event?: Event) {
  loadedImages.add(`${currentPhotoPage.value}-${pageIndex}`)
  recordFromImage(photoIndex, event?.target as HTMLImageElement | null)
}

function isImageLoading(pageIndex: number) {
  return !loadedImages.has(`${currentPhotoPage.value}-${pageIndex}`)
}

const photoGridRef = ref<HTMLElement | null>(null)

function warmPhotoRatio(index: number) {
  const photo = event.value?.photos[index]
  if (!photo || photoAspectRatios.value[index]) return

  // A small thumbnail is enough: only the aspect ratio matters here.
  void preloadPhotoAspectRatio(index, img(photo.src, { width: 320, quality: 60 }))
}

const PHOTO_HASH_PATTERN = /^#foto-(\d+)$/

function writePhotoHash(index: number) {
  if (!import.meta.client) return
  const { pathname, search } = window.location
  history.replaceState(history.state, '', `${pathname}${search}#foto-${index + 1}`)
}

function clearPhotoHash() {
  if (!import.meta.client) return
  const { pathname, search } = window.location
  history.replaceState(history.state, '', `${pathname}${search}`)
}

const { open: openLightbox, close: closeLightbox } = usePhotoSwipe({
  photos: () => event.value?.photos ?? [],
  eventTitle: () => event.value?.title ?? t('gallery.title'),
  aspectRatios: photoAspectRatios,
  getThumbnailEl: (index) =>
    photoGridRef.value?.querySelector<HTMLElement>(`[data-photo-index="${index}"]`),
  onRatio: (index, ratio) => {
    photoAspectRatios.value[index] = ratio
  },
  warmRatio: warmPhotoRatio,
  onIndexChange: writePhotoHash,
  onClose: clearPhotoHash,
})

function openPhoto(index: number) {
  void openLightbox(index)
}

function onThumbnailClick(mouseEvent: MouseEvent, index: number) {
  // Keep native anchor behavior for new-tab/window modifier clicks.
  if (mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.altKey) return
  mouseEvent.preventDefault()
  openPhoto(index)
}

onMounted(() => {
  const match = route.hash.match(PHOTO_HASH_PATTERN)
  if (!match) return

  const photoNumber = Number(match[1])
  if (!event.value || photoNumber < 1 || photoNumber > event.value.photos.length) return

  currentPhotoPage.value = Math.ceil(photoNumber / photosPerPage)
  openPhoto(photoNumber - 1)
})

function getEventIcon() {
  return event.value?.icon || 'i-tabler-photo'
}

const metaChips = computed(() => {
  if (!event.value) return []

  const chips = [{ icon: 'i-tabler-calendar', label: formatDate(event.value.date) }]
  if (event.value.location) chips.push({ icon: 'i-tabler-map-pin', label: event.value.location })
  if (event.value.duration) chips.push({ icon: 'i-tabler-clock', label: event.value.duration })
  if (event.value.photos.length > 0) {
    chips.push({
      icon: 'i-tabler-photo',
      label: t('gallery.event.photosCount', { count: event.value.photos.length }),
    })
  }
  return chips
})

watch(eventSlug, () => {
  currentPhotoPage.value = 1
  loadedImages.clear()
  resetPreloader()
  closeLightbox()
})
</script>

<template>
  <section :aria-label="event?.title || t('gallery.title')">
    <!-- Breadcrumb -->
    <nav class="mb-6" :aria-label="t('gallery.event.breadcrumb')">
      <ol class="text-muted flex min-w-0 items-center gap-1.5 text-sm">
        <li class="shrink-0">
          <NuxtLink :to="localePath('/galeria')" class="hover:text-default transition-colors">
            {{ t('gallery.title') }}
          </NuxtLink>
        </li>
        <li class="flex shrink-0" aria-hidden="true">
          <UIcon name="i-tabler-chevron-right" class="size-4" />
        </li>
        <li class="text-highlighted min-w-0 flex-1 truncate font-semibold">
          {{ event?.title || '...' }}
        </li>
      </ol>
    </nav>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="space-y-6"
      role="status"
      aria-busy="true"
      :aria-label="t('gallery.loading')"
    >
      <div aria-hidden="true" class="space-y-6">
        <USkeleton class="h-64 w-full rounded-2xl" />
        <div class="flex gap-4">
          <USkeleton class="h-6 w-32" />
          <USkeleton class="h-6 w-32" />
        </div>
        <USkeleton class="h-24 w-full" />
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <USkeleton v-for="i in 8" :key="i" class="aspect-square" />
        </div>
      </div>
    </div>

    <!-- Event not found -->
    <UCard v-else-if="!event" class="text-center">
      <div class="flex flex-col items-center gap-4 py-12">
        <UIcon name="i-tabler-photo-off" class="text-muted size-20" />
        <h2 class="text-2xl font-bold">{{ t('gallery.eventNotFound.title') }}</h2>
        <p class="text-muted">{{ t('gallery.eventNotFound.description') }}</p>
        <UButton :to="localePath('/galeria')" variant="soft">
          {{ t('gallery.eventNotFound.backToGallery') }}
        </UButton>
      </div>
    </UCard>

    <!-- Event content -->
    <template v-else>
      <!-- Cover hero: full-width image with the title overlaid on a scrim -->
      <div v-if="event.cover" class="relative mb-8 overflow-hidden rounded-2xl">
        <NuxtImg
          :src="event.cover.src"
          :alt="getCoverAlt(event.title, event.cover.alt)"
          :style="{ viewTransitionName: `gallery-cover-${eventSlug}` }"
          class="max-h-[62vh] w-full object-cover"
          fetchpriority="high"
          width="1600"
          quality="78"
          sizes="xs:100vw xl:1200px"
        />
        <!-- Scrim confined to the bottom half so the cover reads clearly above the title -->
        <div
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 from-0% to-transparent to-50%"
        >
          <div class="p-4 pt-16 sm:p-6 sm:pt-20">
            <h1 class="type-display text-3xl text-white drop-shadow-sm lg:text-4xl">
              {{ event.title }}
            </h1>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="chip in metaChips"
                :key="chip.icon"
                class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md"
              >
                <UIcon :name="chip.icon" class="size-4 shrink-0" aria-hidden="true" />
                {{ chip.label }}
              </span>
            </div>
          </div>
        </div>
        <div
          class="absolute top-4 left-4 hidden size-12 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-md md:flex"
          aria-hidden="true"
        >
          <UIcon :name="getEventIcon()" class="size-6" />
        </div>
      </div>

      <!-- Header without cover -->
      <div v-else class="mb-8 flex items-start gap-4">
        <div
          class="bg-primary-500/10 text-primary-600 dark:text-primary-400 hidden size-16 shrink-0 items-center justify-center rounded-2xl md:flex"
        >
          <UIcon :name="getEventIcon()" class="size-8" aria-hidden="true" />
        </div>
        <div class="flex-1">
          <h1 class="type-display text-highlighted text-3xl lg:text-4xl">
            {{ event.title }}
          </h1>
          <div
            class="from-primary-500 mt-3 h-[3px] w-10 rounded-full bg-gradient-to-r to-amber-400"
            aria-hidden="true"
          />
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="chip in metaChips"
              :key="chip.icon"
              class="bg-elevated text-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
            >
              <UIcon
                :name="chip.icon"
                class="text-primary-600 dark:text-primary-400 size-4 shrink-0"
                aria-hidden="true"
              />
              {{ chip.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="event.tags.length > 0" class="mb-8 flex flex-wrap gap-2">
        <UBadge v-for="tag in event.tags" :key="tag" color="primary" variant="subtle">
          {{ tag }}
        </UBadge>
      </div>

      <!-- Short description from frontmatter -->
      <UCard class="reveal mb-8">
        <p class="text-base leading-relaxed">{{ event.description }}</p>
      </UCard>

      <!-- Render MDC body content (EventAbout, EventParticipation components) -->
      <ContentRenderer v-if="event.body" :value="event.body" />

      <!-- Links section -->
      <UCard v-if="event.links && event.links.length > 0" class="reveal mb-8">
        <SectionHeader as="h2" :title="t('gallery.event.links')" icon="i-tabler-link" />
        <ul class="space-y-2">
          <li v-for="link in event.links" :key="link.url" class="flex items-center gap-2">
            <UIcon name="i-tabler-external-link" class="text-primary-500 size-4" />
            <a :href="link.url" target="_blank" rel="noopener noreferrer" class="inline-link">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </UCard>

      <!-- Photo wall -->
      <div v-if="event.photos.length > 0" class="mt-10">
        <div class="mb-6">
          <h2 class="text-highlighted flex items-center gap-2 text-2xl font-bold">
            <UIcon
              name="i-tabler-photo"
              class="text-primary-600 dark:text-primary-400 size-7 shrink-0"
              aria-hidden="true"
            />
            {{ t('gallery.event.photos') }}
            <UBadge color="primary" variant="subtle" size="sm">{{ event.photos.length }}</UBadge>
          </h2>
          <div
            class="from-primary-500 mt-2 h-[3px] w-10 rounded-full bg-gradient-to-r to-amber-400"
            aria-hidden="true"
          />
        </div>

        <!-- Masonry wall: CSS columns preserve each photo's natural ratio -->
        <ul
          ref="photoGridRef"
          :aria-label="t('gallery.event.photos')"
          class="columns-2 gap-4 md:columns-3 lg:columns-4"
        >
          <li
            v-for="(photo, index) in paginatedPhotos"
            :key="photo.src"
            class="mb-4 break-inside-avoid"
          >
            <a
              :href="`#foto-${absoluteIndex(index) + 1}`"
              :data-photo-index="absoluteIndex(index)"
              :style="
                photo.width && photo.height
                  ? { aspectRatio: `${photo.width} / ${photo.height}` }
                  : undefined
              "
              :aria-label="
                getPhotoAlt({
                  eventTitle: event.title,
                  photoIndex: absoluteIndex(index),
                  customAlt: photo.alt,
                })
              "
              class="motion-link-card group focus-visible:ring-primary-500 relative block w-full cursor-zoom-in overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              @click="onThumbnailClick($event, absoluteIndex(index))"
            >
              <NuxtImg
                :src="photo.src"
                :alt="
                  getPhotoAlt({
                    eventTitle: event.title,
                    photoIndex: absoluteIndex(index),
                    customAlt: photo.alt,
                  })
                "
                class="motion-link-media h-auto w-full"
                loading="lazy"
                :width="photo.width || 600"
                :height="photo.height"
                quality="72"
                densities="x1 x2"
                @load="onImageLoad(index, absoluteIndex(index), $event)"
              />

              <!-- Skeleton overlay while loading -->
              <USkeleton
                v-if="isImageLoading(index)"
                aria-hidden="true"
                class="absolute inset-0 size-full rounded-xl"
              />

              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
              >
                <span
                  class="flex size-11 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <UIcon name="i-tabler-zoom-in" class="size-6" aria-hidden="true" />
                </span>
              </div>

              <!-- Description indicator -->
              <div v-if="photo.description" class="absolute right-2 bottom-2">
                <UIcon
                  name="i-tabler-info-circle"
                  class="size-5 text-white drop-shadow-lg"
                  aria-hidden="true"
                />
              </div>
            </a>
          </li>
        </ul>

        <!-- Photo pagination -->
        <div v-if="totalPhotoPages > 1" class="mt-6 flex justify-center">
          <UPagination
            v-model:page="currentPhotoPage"
            :total="totalPhotos"
            :items-per-page="photosPerPage"
            show-edges
            show-controls
          />
        </div>
      </div>

      <!-- No photos -->
      <UCard v-else class="text-center">
        <div class="flex flex-col items-center gap-4 py-8">
          <UIcon name="i-tabler-camera" class="text-muted size-16" />
          <h3 class="text-lg font-semibold">{{ t('gallery.event.noPhotos.title') }}</h3>
          <p class="text-muted">{{ t('gallery.event.noPhotos.description') }}</p>
        </div>
      </UCard>

      <!-- Back button -->
      <div class="mt-8">
        <UButton :to="localePath('/galeria')" variant="ghost" icon="i-tabler-arrow-left">
          {{ t('gallery.event.backToGallery') }}
        </UButton>
      </div>
    </template>
  </section>
</template>

<style>
/* PhotoSwipe renders outside the component tree, so these rules cannot be
   scoped. The captions come from the dynamic-caption plugin. */
.pswp-caption-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.6);
}

.pswp-caption-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(255 255 255 / 0.78);
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.6);
}

/* Default counter is semi-transparent white over a variable photo edge,
   which fails contrast checks depending on the image behind it. Give it an
   opaque backing pill so contrast holds regardless of slide content. */
.pswp__counter {
  height: auto;
  margin: 12px;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  opacity: 1;
  text-shadow: none;
}
</style>
