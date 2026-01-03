<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

// Gallery image utilities
const { getPhotoSrc, getPhotoAlt, getCoverAlt } = useGalleryImages()

// Get event slug from route
const eventSlug = computed(() => route.params.slug as string)

// Fetch event data
const { event, isLoading } = useGalleryEvent(eventSlug)

// SEO Meta
useSeoMeta({
  title: () => event.value?.seo?.title || event.value?.title || t('gallery.title'),
  description: () =>
    event.value?.seo?.description || event.value?.description || t('seo.pages.gallery'),
})

// Photo pagination
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

// Track loading state for each individual image using reactive object
const imageLoadingStates = reactive<Record<string, boolean>>({})

// Reset loading states when page changes
watch(currentPhotoPage, () => {
  // Clear all states
  Object.keys(imageLoadingStates).forEach((key) => delete imageLoadingStates[key])
})

function onImageLoad(index: number) {
  const key = `${currentPhotoPage.value}-${index}`
  imageLoadingStates[key] = false
}

function isImageLoading(index: number) {
  const key = `${currentPhotoPage.value}-${index}`
  // Si no existe la key, significa que aún no se ha registrado la carga
  return imageLoadingStates[key] !== false
}

// Photo modal state
const selectedPhoto = ref<{ src: string; alt?: string; description?: string } | null>(null)
const selectedPhotoIndex = ref(0)
const isModalOpen = ref(false)
const isModalImageLoading = ref(false)

const isTouchDevice = ref(false)
const touchControlsVisible = ref(true)

const showZoomControls = computed(() => !isTouchDevice.value)
const showOverlayControls = computed(() => !isTouchDevice.value || touchControlsVisible.value)
const showNavigationControls = computed(() => showOverlayControls.value)

// Zoom state
const zoomLevel = ref(1)
const minZoom = 1
const maxZoom = 3
const zoomStep = 0.2

// Pan state for zoomed images
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const imageContainerRef = ref<HTMLElement | null>(null)
const modalImageRef = ref<HTMLImageElement | null>(null)

function openPhotoModal(photo: { src: string; alt?: string; description?: string }, index: number) {
  selectedPhoto.value = photo
  selectedPhotoIndex.value = index
  isModalImageLoading.value = true
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  isModalOpen.value = true
  touchControlsVisible.value = true
}

function closePhotoModal() {
  isModalOpen.value = false
  selectedPhoto.value = null
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Photo navigation in modal
function nextPhoto() {
  if (!event.value?.photos) return
  const totalPhotos = event.value.photos.length
  const newIndex = (selectedPhotoIndex.value + 1) % totalPhotos
  selectedPhotoIndex.value = newIndex
  selectedPhoto.value = event.value.photos[newIndex] ?? null
  isModalImageLoading.value = true
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function prevPhoto() {
  if (!event.value?.photos) return
  const totalPhotos = event.value.photos.length
  const newIndex = selectedPhotoIndex.value === 0 ? totalPhotos - 1 : selectedPhotoIndex.value - 1
  selectedPhotoIndex.value = newIndex
  selectedPhoto.value = event.value.photos[newIndex] ?? null
  isModalImageLoading.value = true
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Handle modal image load
function onModalImageLoad() {
  isModalImageLoading.value = false
}

// Zoom functions
function handleWheel(e: WheelEvent) {
  if (!isModalOpen.value || !imageContainerRef.value) return

  const delta = e.deltaY > 0 ? -zoomStep : zoomStep
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta))

  if (newZoom !== zoomLevel.value) {
    // Si estamos reduciendo el zoom, centrar la imagen gradualmente
    if (newZoom < zoomLevel.value) {
      const zoomRatio = newZoom / zoomLevel.value
      panX.value *= zoomRatio
      panY.value *= zoomRatio

      if (newZoom === minZoom) {
        panX.value = 0
        panY.value = 0
      }
    } else {
      // Al aumentar zoom, dirigirlo hacia el cursor
      const imgElement = imageContainerRef.value.querySelector('img')
      if (imgElement) {
        const imgRect = imgElement.getBoundingClientRect()

        // Posición del cursor relativa al centro de la imagen (que ya está escalada)
        const imgCenterX = imgRect.left + imgRect.width / 2
        const imgCenterY = imgRect.top + imgRect.height / 2
        const offsetX = e.clientX - imgCenterX
        const offsetY = e.clientY - imgCenterY

        // Ajustar el pan para que el punto bajo el cursor se mantenga fijo
        const zoomRatio = newZoom / zoomLevel.value
        panX.value = panX.value * zoomRatio + offsetX * (1 - zoomRatio)
        panY.value = panY.value * zoomRatio + offsetY * (1 - zoomRatio)
      }
    }

    zoomLevel.value = newZoom
    constrainPan()
  }
}

function resetZoom() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function zoomIn() {
  const newZoom = Math.min(maxZoom, zoomLevel.value + zoomStep)
  if (newZoom !== zoomLevel.value) {
    zoomLevel.value = newZoom
    constrainPan()
  }
}

function zoomOut() {
  const newZoom = Math.max(minZoom, zoomLevel.value - zoomStep)
  if (newZoom !== zoomLevel.value) {
    // Centrar gradualmente al reducir zoom
    const zoomRatio = newZoom / zoomLevel.value
    panX.value *= zoomRatio
    panY.value *= zoomRatio

    if (newZoom === minZoom) {
      panX.value = 0
      panY.value = 0
    }

    zoomLevel.value = newZoom
    constrainPan()
  }
}

// Constrain pan to image boundaries
function constrainPan() {
  if (zoomLevel.value <= 1) {
    panX.value = 0
    panY.value = 0
    return
  }

  const imgElement = imageContainerRef.value?.querySelector('img')
  if (!imgElement || !imageContainerRef.value) return

  // getBoundingClientRect() nos da el tamaño YA escalado por CSS transform
  const imgRect = imgElement.getBoundingClientRect()
  const containerRect = imageContainerRef.value.getBoundingClientRect()

  // Cuánto sobresale la imagen escalada fuera del contenedor (en cada dirección)
  const overflowX = Math.max(0, (imgRect.width - containerRect.width) / 2)
  const overflowY = Math.max(0, (imgRect.height - containerRect.height) / 2)

  // El CSS aplica: transform: scale(zoom) translate(panX/zoom, panY/zoom)
  // Esto significa que el desplazamiento real en pixels es: panX (no panX/zoom * zoom)
  // Pero el translate se aplica en el espacio pre-escalado, así que:
  // desplazamiento_real = (panX / zoom) * zoom = panX
  // Por tanto, los límites de pan son directamente el overflow
  const maxPanX = overflowX
  const maxPanY = overflowY

  panX.value = Math.max(-maxPanX, Math.min(maxPanX, panX.value))
  panY.value = Math.max(-maxPanY, Math.min(maxPanY, panY.value))
}

// Pan functions
function handleMouseDown(e: MouseEvent) {
  if (zoomLevel.value <= 1) return
  isPanning.value = true
  panStartX.value = e.clientX - panX.value
  panStartY.value = e.clientY - panY.value
}

function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value || zoomLevel.value <= 1) return
  panX.value = e.clientX - panStartX.value
  panY.value = e.clientY - panStartY.value
  constrainPan()
}

function handleMouseUp() {
  isPanning.value = false
}

function handleModalTap() {
  if (!isTouchDevice.value) return
  touchControlsVisible.value = !touchControlsVisible.value
}

// Keyboard shortcuts for navigation
function handleKeydown(e: KeyboardEvent) {
  if (!isModalOpen.value) return
  if (e.key === 'ArrowRight') nextPhoto()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'Escape') closePhotoModal()
  if (e.key === '+' || e.key === '=') {
    e.preventDefault()
    zoomIn()
  }
  if (e.key === '-') {
    e.preventDefault()
    zoomOut()
  }
  if (e.key === '0') {
    e.preventDefault()
    resetZoom()
  }
}

// Register keyboard events
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  isTouchDevice.value = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Format date for display
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(useI18n().locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Get event icon with fallback
function getEventIcon() {
  return event.value?.icon || 'i-tabler-photo'
}

// Modal content reference for focus management
const modalContentRef = ref<HTMLElement | null>(null)

// Remove focus from buttons when modal opens
function onModalOpened() {
  nextTick(() => {
    modalContentRef.value?.focus()
  })
}
</script>

<template>
  <section role="region" :aria-label="event?.title || t('gallery.title')" class="section-enter">
    <!-- Breadcrumb -->
    <nav class="mb-6">
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
              height="720"
              fit="contain"
              densities="x1 x2"
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
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-500 hover:text-primary-600 hover:underline"
            >
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
        <div
          role="list"
          :aria-label="t('gallery.event.photos')"
          class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <!-- Each photo with individual skeleton -->
          <button
            v-for="(photo, index) in paginatedPhotos"
            :key="`${currentPhotoPage}-${index}`"
            type="button"
            role="listitem"
            :aria-label="
              getPhotoAlt({
                eventTitle: event.title,
                photoIndex: (currentPhotoPage - 1) * photosPerPage + index,
                customAlt: photo.alt,
              })
            "
            class="group focus:ring-primary-500 relative aspect-square cursor-pointer overflow-hidden rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
            @click="openPhotoModal(photo, (currentPhotoPage - 1) * photosPerPage + index)"
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
              class="size-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              width="300"
              height="300"
              @load="onImageLoad(index)"
            />

            <!-- Skeleton overlay while loading -->
            <USkeleton v-if="isImageLoading(index)" class="absolute inset-0 size-full rounded-lg" />

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
        </div>

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

    <!-- Image modal -->
    <UModal
      v-model:open="isModalOpen"
      :ui="{ content: 'max-w-[95vw] max-h-[95vh]' }"
      @after-enter="onModalOpened"
    >
      <template #content>
        <div v-if="selectedPhoto" ref="modalContentRef" class="relative" tabindex="-1">
          <!-- Image container with loading state -->
          <div
            ref="imageContainerRef"
            class="relative flex items-center justify-center overflow-hidden bg-black/90"
            style="max-height: 80vh"
            @wheel.prevent="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @click="handleModalTap"
          >
            <!-- Loading spinner -->
            <div
              v-if="isModalImageLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
            >
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-tabler-loader-2" class="size-12 animate-spin text-white" />
                <span class="text-sm text-white/70">{{ t('gallery.event.modal.loading') }}</span>
              </div>
            </div>

            <!-- Image with zoom -->
            <NuxtImg
              :src="getPhotoSrc(selectedPhoto.src)"
              :alt="
                getPhotoAlt({
                  eventTitle: event?.title || '',
                  photoIndex: selectedPhotoIndex,
                  customAlt: selectedPhoto.alt,
                })
              "
              class="max-h-[80vh] max-w-full object-contain select-none"
              :class="{
                'cursor-grab': zoomLevel > 1 && !isPanning,
                'cursor-grabbing': isPanning,
                'transition-transform duration-200': !isPanning,
              }"
              :style="{
                transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
              }"
              width="1920"
              height="1080"
              fit="inside"
              quality="85"
              preload
              @load="onModalImageLoad"
              @dragstart.prevent
            />
          </div>

          <!-- Zoom indicator -->
          <div
            v-if="zoomLevel > 1"
            class="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white"
          >
            {{ Math.round(zoomLevel * 100) }}%
          </div>

          <!-- Zoom controls -->
          <div v-if="showZoomControls" class="absolute top-4 left-1/2 flex -translate-x-1/2 gap-2">
            <button
              type="button"
              class="flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50"
              :disabled="zoomLevel <= minZoom"
              :aria-label="t('gallery.event.modal.zoomOut')"
              @click.stop="zoomOut"
            >
              <UIcon name="i-tabler-zoom-out" class="size-5" />
            </button>
            <button
              type="button"
              class="flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
              :aria-label="t('gallery.event.modal.resetZoom')"
              @click.stop="resetZoom"
            >
              <UIcon name="i-tabler-zoom-reset" class="size-5" />
            </button>
            <button
              type="button"
              class="flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50"
              :disabled="zoomLevel >= maxZoom"
              :aria-label="t('gallery.event.modal.zoomIn')"
              @click.stop="zoomIn"
            >
              <UIcon name="i-tabler-zoom-in" class="size-5" />
            </button>
          </div>

          <!-- Navigation controls -->
          <button
            type="button"
            class="absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
            :aria-label="t('gallery.event.modal.prev')"
            v-if="showNavigationControls"
            @click.stop="prevPhoto"
          >
            <UIcon name="i-tabler-chevron-left" class="size-8" />
          </button>
          <button
            type="button"
            class="absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
            :aria-label="t('gallery.event.modal.next')"
            v-if="showNavigationControls"
            @click.stop="nextPhoto"
          >
            <UIcon name="i-tabler-chevron-right" class="size-8" />
          </button>

          <!-- Close button -->
          <button
            v-if="showOverlayControls"
            type="button"
            class="absolute top-4 right-4 flex items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white focus:outline-none"
            :aria-label="t('gallery.event.modal.close')"
            @click.stop="closePhotoModal"
          >
            <UIcon name="i-tabler-x" class="size-6" />
          </button>

          <!-- Counter -->
          <div
            v-if="showOverlayControls"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white"
            aria-live="polite"
          >
            {{ selectedPhotoIndex + 1 }} / {{ event?.photos.length }}
          </div>

          <!-- Photo description -->
          <div v-if="selectedPhoto.description" class="bg-muted/90 p-4">
            <p class="text-center">{{ selectedPhoto.description }}</p>
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>
