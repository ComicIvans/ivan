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

watch(currentPhotoPage, () => {
  loadedImages.clear()
})

function onImageLoad(index: number) {
  const key = `${currentPhotoPage.value}-${index}`
  loadedImages.add(key)
}

function isImageLoading(index: number) {
  const key = `${currentPhotoPage.value}-${index}`
  return !loadedImages.has(key)
}

const selectedPhotoIndex = ref(0)
const isModalOpen = ref(false)
const supportsSwipeNavigation = ref(false)
const modalLoadedPhotos = reactive(new Set<number>())
const modalPhotoPreloads = new Set<number>()

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
const lastTouchX = ref(0)
const lastTouchY = ref(0)
const pinchStartDistance = ref(0)
const pinchStartZoom = ref(1)
const isPinching = ref(false)

// Carousel state
const imageContainerRef = ref<HTMLElement | null>(null)
const carouselPointerId = ref<number | null>(null)
const carouselStartX = ref(0)
const carouselStartY = ref(0)
const carouselDragOffsetX = ref(0)
const isCarouselDragging = ref(false)
const carouselTransitionEnabled = ref(false)
const pendingCarouselDirection = ref<-1 | 0 | 1>(0)
const suppressCarouselTransition = ref(false)

let gestureMediaQuery: MediaQueryList | null = null

function getWrappedPhotoIndex(index: number) {
  const total = event.value?.photos.length ?? 0
  if (!total) return 0

  return ((index % total) + total) % total
}

function getModalPhoto(index: number) {
  return event.value?.photos[getWrappedPhotoIndex(index)] ?? null
}

function getActiveModalImage() {
  return imageContainerRef.value?.querySelector(
    '[data-slide-active="true"] img'
  ) as HTMLImageElement | null
}

function markModalPhotoAsLoaded(index: number) {
  modalLoadedPhotos.add(getWrappedPhotoIndex(index))
}

function preloadModalPhoto(index: number) {
  const normalizedIndex = getWrappedPhotoIndex(index)
  const photo = getModalPhoto(normalizedIndex)
  if (!photo || modalLoadedPhotos.has(normalizedIndex) || modalPhotoPreloads.has(normalizedIndex)) {
    return
  }

  modalPhotoPreloads.add(normalizedIndex)

  if (!import.meta.client) {
    modalPhotoPreloads.delete(normalizedIndex)
    return
  }

  const image = new Image()
  let settled = false
  const finalize = (loaded: boolean) => {
    if (settled) return
    settled = true

    if (loaded) {
      modalLoadedPhotos.add(normalizedIndex)
    }

    modalPhotoPreloads.delete(normalizedIndex)
  }

  image.onload = () => finalize(true)
  image.onerror = () => finalize(false)
  image.src = getPhotoSrc(photo.src)

  if (image.complete) {
    finalize(true)
  }
}

function preloadModalWindow() {
  if (!isModalOpen.value || !event.value?.photos.length) return
  ;[selectedPhotoIndex.value - 1, selectedPhotoIndex.value, selectedPhotoIndex.value + 1].forEach(
    preloadModalPhoto
  )
}

const selectedPhoto = computed(() => getModalPhoto(selectedPhotoIndex.value))
const selectedPhotoAlt = computed(() =>
  selectedPhoto.value
    ? getPhotoAlt({
        eventTitle: event.value?.title || '',
        photoIndex: selectedPhotoIndex.value,
        customAlt: selectedPhoto.value.alt,
      })
    : ''
)
const modalPositionLabel = computed(() =>
  t('gallery.event.modal.position', {
    current: selectedPhotoIndex.value + 1,
    total: event.value?.photos.length ?? 0,
  })
)
const modalDescription = computed(
  () => selectedPhoto.value?.description || modalPositionLabel.value
)
const isCurrentModalPhotoLoading = computed(() => !modalLoadedPhotos.has(selectedPhotoIndex.value))
const modalSlides = computed(() => {
  if (!selectedPhoto.value || !event.value?.photos.length) return []

  return [-1, 0, 1].map((offset) => {
    const index = getWrappedPhotoIndex(selectedPhotoIndex.value + offset)
    const photo = getModalPhoto(index)

    return {
      offset,
      index,
      photo,
      alt: photo
        ? getPhotoAlt({
            eventTitle: event.value?.title || '',
            photoIndex: index,
            customAlt: photo.alt,
          })
        : '',
      key: `${selectedPhotoIndex.value}:${offset}:${photo?.src ?? 'empty'}`,
    }
  })
})

const carouselTrackStyle = computed(() => {
  const slideTranslate = 100 / 3
  const baseTranslate =
    pendingCarouselDirection.value === 1
      ? `-${slideTranslate * 2}%`
      : pendingCarouselDirection.value === -1
        ? '0%'
        : `-${slideTranslate}%`

  return {
    transform: `translate3d(calc(${baseTranslate} + ${carouselDragOffsetX.value}px), 0, 0)`,
    transition:
      suppressCarouselTransition.value || !carouselTransitionEnabled.value
        ? 'none'
        : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
  }
})
const activeImageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value}) translate(${panX.value / zoomLevel.value}px, ${panY.value / zoomLevel.value}px)`,
}))

function updateSwipeNavigationSupport() {
  supportsSwipeNavigation.value = gestureMediaQuery?.matches ?? false
}

function resetZoom() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  isPanning.value = false
}

function resetCarouselPointerState() {
  carouselPointerId.value = null
  carouselStartX.value = 0
  carouselStartY.value = 0
  carouselDragOffsetX.value = 0
  isCarouselDragging.value = false
}

function resetTouchState() {
  isPinching.value = false
  pinchStartDistance.value = 0
  pinchStartZoom.value = zoomLevel.value
  lastTouchX.value = 0
  lastTouchY.value = 0
  isPanning.value = false
  resetCarouselPointerState()
}

function resetModalInteractionState() {
  resetZoom()
  resetTouchState()
  pendingCarouselDirection.value = 0
  carouselTransitionEnabled.value = false
  suppressCarouselTransition.value = false
}

function closePhotoModal() {
  isModalOpen.value = false
  resetModalInteractionState()
}

function openPhotoModal(_: { src: string; alt?: string; description?: string }, index: number) {
  selectedPhotoIndex.value = index
  resetModalInteractionState()
  isModalOpen.value = true
}

function finalizeCarouselNavigation(direction: -1 | 1) {
  selectedPhotoIndex.value = getWrappedPhotoIndex(selectedPhotoIndex.value + direction)
  suppressCarouselTransition.value = true
  pendingCarouselDirection.value = 0
  carouselTransitionEnabled.value = false
  carouselDragOffsetX.value = 0

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressCarouselTransition.value = false
    })
  })
}

function handleCarouselTransitionEnd() {
  if (pendingCarouselDirection.value === 0) {
    carouselTransitionEnabled.value = false
    return
  }

  finalizeCarouselNavigation(pendingCarouselDirection.value)
}

function animateCarousel(direction: -1 | 1) {
  if (!event.value?.photos?.length || event.value.photos.length < 2) return

  resetZoom()
  resetTouchState()
  carouselTransitionEnabled.value = true
  pendingCarouselDirection.value = direction
  carouselDragOffsetX.value = 0
}

function nextPhoto() {
  animateCarousel(1)
}

function prevPhoto() {
  animateCarousel(-1)
}

function snapCarouselBack() {
  if (!isCarouselDragging.value && carouselDragOffsetX.value === 0) return

  isCarouselDragging.value = false
  carouselTransitionEnabled.value = true
  pendingCarouselDirection.value = 0
  carouselDragOffsetX.value = 0
}

function handleModalSlideLoad(index: number) {
  markModalPhotoAsLoaded(index)
}

function handleWheel(e: WheelEvent) {
  if (!isModalOpen.value || !imageContainerRef.value || isCarouselTransitioning()) return

  const delta = e.deltaY > 0 ? -zoomStep : zoomStep
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta))

  if (newZoom !== zoomLevel.value) {
    // Recenter the image progressively while zooming out.
    if (newZoom < zoomLevel.value) {
      const zoomRatio = newZoom / zoomLevel.value
      panX.value *= zoomRatio
      panY.value *= zoomRatio

      if (newZoom === minZoom) {
        panX.value = 0
        panY.value = 0
      }
    } else {
      // Keep the point under the cursor anchored while zooming in.
      const imgElement = getActiveModalImage()
      if (imgElement) {
        const imgRect = imgElement.getBoundingClientRect()

        // Cursor position relative to the center of the already scaled image.
        const imgCenterX = imgRect.left + imgRect.width / 2
        const imgCenterY = imgRect.top + imgRect.height / 2
        const offsetX = e.clientX - imgCenterX
        const offsetY = e.clientY - imgCenterY

        // Adjust pan so the point under the cursor stays in place.
        const zoomRatio = newZoom / zoomLevel.value
        panX.value = panX.value * zoomRatio + offsetX * (1 - zoomRatio)
        panY.value = panY.value * zoomRatio + offsetY * (1 - zoomRatio)
      }
    }

    zoomLevel.value = newZoom
    constrainPan()
  }
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
    // Recenter the image progressively while zooming out.
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

function constrainPan() {
  if (zoomLevel.value <= 1) {
    panX.value = 0
    panY.value = 0
    return
  }

  const imgElement = getActiveModalImage()
  if (!imgElement || !imageContainerRef.value) return

  const imgRect = imgElement.getBoundingClientRect()
  const containerRect = imageContainerRef.value.getBoundingClientRect()

  const overflowX = Math.max(0, (imgRect.width - containerRect.width) / 2)
  const overflowY = Math.max(0, (imgRect.height - containerRect.height) / 2)

  panX.value = Math.max(-overflowX, Math.min(overflowX, panX.value))
  panY.value = Math.max(-overflowY, Math.min(overflowY, panY.value))
}

function handleMouseDown(e: MouseEvent) {
  if (zoomLevel.value <= 1 || isCarouselTransitioning()) return

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

function captureCarouselPointer(e: PointerEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (target && !target.hasPointerCapture(e.pointerId)) {
    target.setPointerCapture(e.pointerId)
  }
}

function releaseCarouselPointer(e: PointerEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (target && target.hasPointerCapture(e.pointerId)) {
    target.releasePointerCapture(e.pointerId)
  }
}

function isCarouselTransitioning() {
  return carouselTransitionEnabled.value && !suppressCarouselTransition.value
}

function handlePointerDown(e: PointerEvent) {
  if (
    !isModalOpen.value ||
    !supportsSwipeNavigation.value ||
    zoomLevel.value > 1 ||
    isCarouselTransitioning() ||
    !event.value?.photos?.length ||
    event.value.photos.length < 2 ||
    carouselPointerId.value !== null
  ) {
    return
  }

  carouselPointerId.value = e.pointerId
  carouselStartX.value = e.clientX
  carouselStartY.value = e.clientY
  carouselDragOffsetX.value = 0
  isCarouselDragging.value = true
  carouselTransitionEnabled.value = false
  pendingCarouselDirection.value = 0
  captureCarouselPointer(e)
}

function handlePointerMove(e: PointerEvent) {
  if (!isModalOpen.value || carouselPointerId.value !== e.pointerId || !isCarouselDragging.value) {
    return
  }

  captureCarouselPointer(e)
  carouselDragOffsetX.value = e.clientX - carouselStartX.value
}

function handlePointerUp(e: PointerEvent) {
  if (carouselPointerId.value !== e.pointerId) return

  const deltaX = e.clientX - carouselStartX.value
  const deltaY = e.clientY - carouselStartY.value
  const width = imageContainerRef.value?.clientWidth ?? 0
  const threshold = Math.min(140, Math.max(56, width * 0.16))

  releaseCarouselPointer(e)

  if (
    isCarouselDragging.value &&
    Math.abs(deltaX) > threshold &&
    Math.abs(deltaX) > Math.abs(deltaY) * 1.2
  ) {
    carouselPointerId.value = null
    isCarouselDragging.value = false
    carouselTransitionEnabled.value = true
    pendingCarouselDirection.value = deltaX < 0 ? 1 : -1
    carouselDragOffsetX.value = 0
  } else {
    carouselPointerId.value = null
    snapCarouselBack()
  }
}

function handlePointerCancel(e: PointerEvent) {
  if (carouselPointerId.value === e.pointerId) {
    releaseCarouselPointer(e)
  }

  resetCarouselPointerState()
  pendingCarouselDirection.value = 0
}

function getTouchDistance(touches: TouchList) {
  if (touches.length < 2) return 0
  const firstTouch = touches[0]
  const secondTouch = touches[1]
  if (!firstTouch || !secondTouch) return 0

  return Math.hypot(
    secondTouch.clientX - firstTouch.clientX,
    secondTouch.clientY - firstTouch.clientY
  )
}

function handleTouchStart(e: TouchEvent) {
  if (!isModalOpen.value) return

  if (e.touches.length === 2) {
    resetCarouselPointerState()
    isPinching.value = true
    pinchStartDistance.value = getTouchDistance(e.touches)
    pinchStartZoom.value = zoomLevel.value
    isPanning.value = false
    return
  }

  if (e.touches.length !== 1 || zoomLevel.value <= 1) return

  const touch = e.touches[0]
  if (!touch) return

  lastTouchX.value = touch.clientX
  lastTouchY.value = touch.clientY
  isPanning.value = true
}

function handleTouchMove(e: TouchEvent) {
  if (!isModalOpen.value) return

  if (e.touches.length === 2) {
    const distance = getTouchDistance(e.touches)
    if (!distance || !pinchStartDistance.value) return

    const newZoom = Math.max(
      minZoom,
      Math.min(maxZoom, pinchStartZoom.value * (distance / pinchStartDistance.value))
    )

    zoomLevel.value = newZoom

    if (newZoom === minZoom) {
      panX.value = 0
      panY.value = 0
    }

    constrainPan()
    e.preventDefault()
    return
  }

  if (e.touches.length !== 1 || zoomLevel.value <= 1 || !isPanning.value) return

  const touch = e.touches[0]
  if (!touch) return

  panX.value += touch.clientX - lastTouchX.value
  panY.value += touch.clientY - lastTouchY.value
  lastTouchX.value = touch.clientX
  lastTouchY.value = touch.clientY
  constrainPan()
  e.preventDefault()
}

function handleTouchEnd(e: TouchEvent) {
  if (!isModalOpen.value) return

  if (e.touches.length === 2) {
    pinchStartDistance.value = getTouchDistance(e.touches)
    pinchStartZoom.value = zoomLevel.value
    return
  }

  if (e.touches.length === 1) {
    const touch = e.touches[0]
    if (!touch) {
      resetTouchState()
      return
    }

    lastTouchX.value = touch.clientX
    lastTouchY.value = touch.clientY
    isPinching.value = false
    isPanning.value = zoomLevel.value > 1
    return
  }

  isPanning.value = false
  isPinching.value = false
}

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

onMounted(() => {
  gestureMediaQuery = window.matchMedia('(max-width: 767px), (pointer: coarse)')
  updateSwipeNavigationSupport()
  gestureMediaQuery.addEventListener('change', updateSwipeNavigationSupport)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  gestureMediaQuery?.removeEventListener('change', updateSwipeNavigationSupport)
  window.removeEventListener('keydown', handleKeydown)
})

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

const modalContentRef = ref<HTMLElement | null>(null)

function onModalOpened() {
  nextTick(() => {
    modalContentRef.value?.focus()
  })
}

watch(eventSlug, () => {
  currentPhotoPage.value = 1
  modalLoadedPhotos.clear()
  modalPhotoPreloads.clear()
  closePhotoModal()
})

watch(isModalOpen, (open) => {
  if (open) {
    preloadModalWindow()
  } else {
    handleMouseUp()
    resetModalInteractionState()
  }
})

watch(selectedPhotoIndex, () => {
  preloadModalWindow()
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
            <img
              :src="getPhotoSrc(event.cover.src)"
              :alt="getCoverAlt(event.title, event.cover.alt)"
              class="h-auto w-full object-contain"
              decoding="async"
              fetchpriority="high"
              width="1280"
              height="720"
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
                class="motion-link-media size-full object-cover"
                loading="lazy"
                width="300"
                height="300"
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                densities="x1 x2"
                placeholder
                format="webp"
                quality="72"
                @load="onImageLoad(index)"
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

    <!-- Image modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="selectedPhotoAlt || t('gallery.event.photos')"
      :description="modalDescription"
      :aria-label="selectedPhotoAlt || t('gallery.event.photos')"
      :ui="{
        content:
          'max-h-[95vh] w-[calc(100vw-0.75rem)] max-w-[72rem] overflow-hidden md:w-[calc(100vw-2rem)]',
      }"
      @after-enter="onModalOpened"
    >
      <template #content>
        <div
          v-if="selectedPhoto"
          ref="modalContentRef"
          class="bg-default relative flex max-h-[92vh] flex-col overflow-hidden rounded-[1.5rem]"
          tabindex="-1"
        >
          <div
            ref="imageContainerRef"
            class="relative flex h-[58vw] max-h-96 min-h-56 flex-1 touch-none items-center justify-center overflow-hidden bg-black/95 md:h-[78vh] md:max-h-[78vh]"
            @wheel.prevent="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerCancel"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
          >
            <!-- Loading spinner -->
            <div
              v-if="isCurrentModalPhotoLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
            >
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-tabler-loader-2" class="size-12 animate-spin text-white" />
                <span class="text-sm text-white/70">{{ t('gallery.event.modal.loading') }}</span>
              </div>
            </div>

            <div class="h-full w-full overflow-hidden">
              <div
                class="flex h-full w-[300%]"
                :style="carouselTrackStyle"
                @transitionend="handleCarouselTransitionEnd"
              >
                <div
                  v-for="slide in modalSlides"
                  :key="slide.key"
                  class="flex h-full w-1/3 shrink-0 items-center justify-center md:px-6"
                  :data-slide-active="slide.offset === 0 ? 'true' : 'false'"
                >
                  <img
                    v-if="slide.photo"
                    :src="getPhotoSrc(slide.photo.src)"
                    :alt="slide.alt"
                    class="h-full w-full object-contain select-none"
                    :class="{
                      'cursor-grab': slide.offset === 0 && zoomLevel > 1 && !isPanning,
                      'cursor-grabbing': slide.offset === 0 && isPanning,
                      'pointer-events-none': slide.offset !== 0,
                      'transition-transform duration-200':
                        slide.offset === 0 &&
                        !isPanning &&
                        !isCarouselDragging &&
                        !isCarouselTransitioning(),
                    }"
                    :style="slide.offset === 0 ? activeImageStyle : undefined"
                    decoding="async"
                    :fetchpriority="slide.offset === 0 ? 'high' : 'low'"
                    @load="handleModalSlideLoad(slide.index)"
                    @dragstart.prevent="() => undefined"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              class="focus-visible:ring-primary-300 absolute top-4 right-4 flex items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :aria-label="t('gallery.event.modal.close')"
              @pointerdown.stop
              @pointerup.stop
              @mousedown.stop
              @touchstart.stop
              @click.stop="closePhotoModal"
            >
              <UIcon name="i-tabler-x" class="size-6" />
            </button>
          </div>

          <!-- Zoom indicator -->
          <div
            v-if="zoomLevel > 1"
            class="absolute top-4 left-4 hidden rounded-full bg-black/55 px-3 py-1.5 text-sm text-white md:block"
          >
            {{ Math.round(zoomLevel * 100) }}%
          </div>

          <!-- Zoom controls -->
          <div class="absolute top-4 left-1/2 hidden -translate-x-1/2 gap-2 md:flex">
            <button
              type="button"
              class="focus-visible:ring-primary-300 flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
              :disabled="zoomLevel <= minZoom"
              :aria-label="t('gallery.event.modal.zoomOut')"
              @pointerdown.stop
              @pointerup.stop
              @mousedown.stop
              @click.stop="zoomOut"
            >
              <UIcon name="i-tabler-zoom-out" class="size-5" />
            </button>
            <button
              type="button"
              class="focus-visible:ring-primary-300 flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :aria-label="t('gallery.event.modal.resetZoom')"
              @pointerdown.stop
              @pointerup.stop
              @mousedown.stop
              @click.stop="resetZoom"
            >
              <UIcon name="i-tabler-zoom-reset" class="size-5" />
            </button>
            <button
              type="button"
              class="focus-visible:ring-primary-300 flex items-center justify-center rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
              :disabled="zoomLevel >= maxZoom"
              :aria-label="t('gallery.event.modal.zoomIn')"
              @pointerdown.stop
              @pointerup.stop
              @mousedown.stop
              @click.stop="zoomIn"
            >
              <UIcon name="i-tabler-zoom-in" class="size-5" />
            </button>
          </div>

          <!-- Navigation controls -->
          <button
            type="button"
            class="focus-visible:ring-primary-300 absolute top-1/2 left-4 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:flex"
            :aria-label="t('gallery.event.modal.prev')"
            @pointerdown.stop
            @pointerup.stop
            @mousedown.stop
            @click.stop="prevPhoto"
          >
            <UIcon name="i-tabler-chevron-left" class="size-8" />
          </button>
          <button
            type="button"
            class="focus-visible:ring-primary-300 absolute top-1/2 right-4 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:flex"
            :aria-label="t('gallery.event.modal.next')"
            @pointerdown.stop
            @pointerup.stop
            @mousedown.stop
            @click.stop="nextPhoto"
          >
            <UIcon name="i-tabler-chevron-right" class="size-8" />
          </button>

          <div
            v-if="event?.photos.length"
            class="border-default bg-default/95 border-t px-4 py-4 text-center md:px-6"
          >
            <div
              class="bg-muted text-toned mx-auto mb-3 w-fit rounded-full px-3 py-1.5 text-xs font-medium"
              aria-live="polite"
            >
              {{ modalPositionLabel }}
            </div>
            <p class="text-sm font-semibold">{{ selectedPhotoAlt }}</p>
            <p v-if="selectedPhoto.description" class="text-muted mt-2 leading-relaxed">
              {{ selectedPhoto.description }}
            </p>
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>
