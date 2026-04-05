<script setup lang="ts">
const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const localePath = useLocalePath()

const { getPhotoSrc, getPhotoAlt, getCoverAlt } = useGalleryImages()

const eventSlug = computed(() => route.params.slug as string)

const { event, isLoading } = useGalleryEvent(eventSlug)

usePageSeo(
  () => event.value?.seo?.title || event.value?.title || t('gallery.title'),
  () => event.value?.seo?.description || event.value?.description || t('seo.pages.gallery'),
  {
    ogImage: () => event.value?.cover?.src,
  }
)

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

const loadedImages = reactive(new Set<string>())
const photoAspectRatios = ref<Record<number, number>>({})
const photoAspectRatioPreloads = new Map<number, Promise<number | null>>()

watch(currentPhotoPage, () => {
  loadedImages.clear()
})

function onImageLoad(pageIndex: number, absoluteIndex: number, event?: Event) {
  const key = `${currentPhotoPage.value}-${pageIndex}`
  loadedImages.add(key)

  const image = event?.target as HTMLImageElement | null
  if (image?.naturalWidth && image.naturalHeight) {
    photoAspectRatios.value[absoluteIndex] = image.naturalWidth / image.naturalHeight
  }
}

function isImageLoading(index: number) {
  const key = `${currentPhotoPage.value}-${index}`
  return !loadedImages.has(key)
}

const selectedPhotoIndex = ref(0)
const isModalOpen = ref(false)
const initialModalAspectRatio = ref<number | null>(null)
const initialModalAspectRatioIndex = ref<number | null>(null)

function preloadPhotoAspectRatio(index: number, src: string) {
  const knownRatio = photoAspectRatios.value[index]
  if (knownRatio && Number.isFinite(knownRatio)) {
    return Promise.resolve(knownRatio)
  }

  const existingPreload = photoAspectRatioPreloads.get(index)
  if (existingPreload) {
    return existingPreload
  }

  if (!import.meta.client) {
    return Promise.resolve(null)
  }

  const preload = new Promise<number | null>((resolve) => {
    const image = new Image()
    const finalize = () => {
      const ratio =
        image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : null

      if (ratio) {
        photoAspectRatios.value[index] = ratio
      }

      photoAspectRatioPreloads.delete(index)
      resolve(ratio)
    }

    image.decoding = 'async'
    image.onload = finalize
    image.onerror = finalize
    image.src = getPhotoSrc(src)

    if (image.complete) {
      finalize()
    }
  })

  photoAspectRatioPreloads.set(index, preload)
  return preload
}

function openPhotoModal(
  event: MouseEvent,
  photo: { src: string; alt?: string; description?: string },
  index: number
) {
  const trigger = event.currentTarget as HTMLElement | null
  const image = trigger?.querySelector('img')
  initialModalAspectRatio.value =
    image?.naturalWidth && image?.naturalHeight ? image.naturalWidth / image.naturalHeight : null
  initialModalAspectRatioIndex.value = index
  selectedPhotoIndex.value = index
  isModalOpen.value = true

  void preloadPhotoAspectRatio(index, photo.src).then((ratio) => {
    if (selectedPhotoIndex.value !== index || !isModalOpen.value || !ratio) return

    initialModalAspectRatio.value = ratio
    initialModalAspectRatioIndex.value = index
  })
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getEventIcon() {
  return event.value?.icon || 'i-tabler-photo'
}

watch(eventSlug, () => {
  currentPhotoPage.value = 1
  loadedImages.clear()
  selectedPhotoIndex.value = 0
  isModalOpen.value = false
  initialModalAspectRatio.value = null
  initialModalAspectRatioIndex.value = null
  photoAspectRatios.value = {}
  photoAspectRatioPreloads.clear()
})
</script>

<template>
  <section role="region" :aria-label="event?.title || t('gallery.title')" class="section-enter">
    <!-- Breadcrumb -->
    <nav class="mb-6" :aria-label="t('gallery.event.breadcrumb')">
      <UBreadcrumb
        :items="[
          { label: t('gallery.title'), to: localePath('/galeria') },
          { label: event?.title || '...' },
        ]"
      />
    </nav>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-6">
      <USkeleton class="h-10 w-3/4" />
      <div class="flex gap-4">
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-6 w-32" />
      </div>
      <USkeleton class="h-24 w-full" />
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <USkeleton v-for="i in 8" :key="i" class="aspect-square" />
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
      <!-- Event header -->
      <div class="mb-8">
        <div class="flex items-start gap-4">
          <div
            class="bg-primary-500/10 text-primary-500 hidden size-16 shrink-0 items-center justify-center rounded-2xl md:flex"
          >
            <UIcon :name="getEventIcon()" class="size-8" />
          </div>
          <div class="flex-1">
            <h1 class="text-primary-500 text-3xl font-bold lg:text-4xl">
              {{ event.title }}
            </h1>

            <!-- Metadata -->
            <div class="mt-3 flex flex-wrap gap-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-tabler-calendar" class="text-primary-500 size-5 shrink-0" />
                <span class="text-muted">{{ formatDate(event.date) }}</span>
              </div>
              <div v-if="event.location" class="flex items-center gap-2">
                <UIcon name="i-tabler-map-pin" class="text-primary-500 size-5 shrink-0" />
                <span class="text-muted">{{ event.location }}</span>
              </div>
              <div v-if="event.duration" class="flex items-center gap-2">
                <UIcon name="i-tabler-clock" class="text-primary-500 size-5 shrink-0" />
                <span class="text-muted">{{ event.duration }}</span>
              </div>
              <div v-if="event.photos.length > 0" class="flex items-center gap-2">
                <UIcon name="i-tabler-photo" class="text-primary-500 size-5 shrink-0" />
                <span class="text-muted">{{
                  t('gallery.event.photosCount', { count: event.photos.length })
                }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="event.tags.length > 0" class="mt-4 flex flex-wrap gap-2">
              <UBadge v-for="tag in event.tags" :key="tag" color="primary" variant="subtle">
                {{ tag }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <!-- Short description from frontmatter -->
      <UCard class="mb-8">
        <p class="text-base leading-relaxed">{{ event.description }}</p>
      </UCard>

      <!-- Cover image -->
      <UCard v-if="event.cover" class="mb-8 overflow-hidden">
        <template #header>
          <div class="flex h-fit items-center justify-center overflow-hidden">
            <NuxtImg
              :src="getPhotoSrc(event.cover.src)"
              :alt="getCoverAlt(event.title, event.cover.alt)"
              class="h-auto w-full object-contain"
              fetchpriority="high"
              width="1280"
              height="720"
              format="webp"
              quality="74"
            />
          </div>
        </template>
      </UCard>

      <!-- Render MDC body content (EventAbout, EventParticipation components) -->
      <ContentRenderer v-if="event.body" :value="event.body" />

      <!-- Links section -->
      <UCard v-if="event.links && event.links.length > 0" class="mb-8">
        <h2 class="mb-4 flex items-center gap-2 text-xl font-bold">
          <UIcon name="i-tabler-link" class="text-primary-500 size-6" />
          {{ t('gallery.event.links') }}
        </h2>
        <ul class="space-y-2">
          <li v-for="link in event.links" :key="link.url" class="flex items-center gap-2">
            <UIcon name="i-tabler-external-link" class="text-primary-500 size-4" />
            <a :href="link.url" target="_blank" rel="noopener noreferrer" class="inline-link">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </UCard>

      <!-- Photo gallery -->
      <UCard v-if="event.photos.length > 0">
        <h2 class="mb-6 flex items-center gap-2 text-xl font-bold">
          <UIcon name="i-tabler-photo" class="text-primary-500 size-6" />
          {{ t('gallery.event.photos') }}
          <UBadge color="primary" variant="subtle" size="sm">{{ event.photos.length }}</UBadge>
        </h2>

        <!-- Photo grid -->
        <ul
          :aria-label="t('gallery.event.photos')"
          class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <!-- Each photo with individual skeleton -->
          <li v-for="(photo, index) in paginatedPhotos" :key="photo.src" class="list-none">
            <button
              type="button"
              :aria-label="
                getPhotoAlt({
                  eventTitle: event.title,
                  photoIndex: (currentPhotoPage - 1) * photosPerPage + index,
                  customAlt: photo.alt,
                })
              "
              class="motion-link-card group focus:ring-primary-500 relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
              @click="openPhotoModal($event, photo, (currentPhotoPage - 1) * photosPerPage + index)"
            >
              <!-- Image always rendered to trigger load event -->
              <NuxtImg
                :src="getPhotoSrc(photo.src)"
                :alt="
                  getPhotoAlt({
                    eventTitle: event.title,
                    photoIndex: (currentPhotoPage - 1) * photosPerPage + index,
                    customAlt: photo.alt,
                  })
                "
                class="motion-link-media size-full object-cover"
                loading="lazy"
                width="300"
                height="300"
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                densities="x1 x2"
                placeholder
                format="webp"
                quality="72"
                @load="onImageLoad(index, (currentPhotoPage - 1) * photosPerPage + index, $event)"
              />

              <!-- Skeleton overlay while loading -->
              <USkeleton
                v-if="isImageLoading(index)"
                class="absolute inset-0 size-full rounded-lg"
              />

              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40"
              >
                <UIcon
                  name="i-tabler-zoom-in"
                  class="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <!-- Description indicator -->
              <div v-if="photo.description" class="absolute right-2 bottom-2">
                <UIcon name="i-tabler-info-circle" class="size-5 text-white drop-shadow-lg" />
              </div>
            </button>
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
      </UCard>

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

    <GalleryLightbox
      v-if="event?.photos.length"
      v-model:open="isModalOpen"
      v-model:index="selectedPhotoIndex"
      :photos="event.photos"
      :event-title="event.title"
      :aspect-ratios="photoAspectRatios"
      :initial-aspect-ratio="initialModalAspectRatio"
      :initial-aspect-ratio-index="initialModalAspectRatioIndex"
    />
  </section>
</template>
