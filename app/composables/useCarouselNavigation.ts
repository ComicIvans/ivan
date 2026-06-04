import type { CSSProperties, Ref, WritableComputedRef } from 'vue'

interface CarouselDeps {
  totalPhotos: Ref<number>
  selectedPhotoIndex: WritableComputedRef<number>
  getWrappedPhotoIndex: (index: number) => number
  hasLoadedPhoto: (index: number) => boolean
  preloadPhoto: (index: number) => Promise<void>
  isOpen: Ref<boolean>
  supportsSwipeNavigation: Ref<boolean>
  prefersReducedMotion: Ref<boolean>
  imageStageRef: Ref<HTMLElement | null>
  imageContainerRef: Ref<HTMLElement | null>
  /** Whether the image is currently zoomed in (swipe is disabled while zoomed). */
  isZoomed: () => boolean
  /** Reset zoom/pan before a navigation animation starts. */
  resetInteraction: () => void
}

/**
 * Carousel/swipe navigation for the lightbox: prev/next, the 3-slide sliding
 * track, drag-to-swipe pointer handling and preloaded-aware transitions.
 * Extracted from GalleryLightbox to isolate the navigation state machine.
 */
export function useCarouselNavigation(deps: CarouselDeps) {
  const {
    totalPhotos,
    selectedPhotoIndex,
    getWrappedPhotoIndex,
    hasLoadedPhoto,
    preloadPhoto,
    isOpen,
    supportsSwipeNavigation,
    prefersReducedMotion,
    imageStageRef,
    imageContainerRef,
  } = deps

  const carouselPointerId = ref<number | null>(null)
  const carouselStartX = ref(0)
  const carouselStartY = ref(0)
  const carouselDragOffsetX = ref(0)
  const isCarouselDragging = ref(false)
  const carouselTransitionEnabled = ref(false)
  const pendingCarouselDirection = ref<-1 | 0 | 1>(0)
  const suppressCarouselTransition = ref(false)
  const pendingNavigationDirection = ref<-1 | 0 | 1>(0)
  const navigationRequestId = ref(0)

  function resetCarouselPointerState() {
    carouselPointerId.value = null
    carouselStartX.value = 0
    carouselStartY.value = 0
    carouselDragOffsetX.value = 0
    isCarouselDragging.value = false
  }

  // The carousel-only flag portion of a full interaction reset (pointer state is
  // cleared separately via the zoom composable's resetTouchState).
  function resetCarouselFlags() {
    pendingCarouselDirection.value = 0
    carouselTransitionEnabled.value = false
    suppressCarouselTransition.value = false
    pendingNavigationDirection.value = 0
    navigationRequestId.value += 1
  }

  function isCarouselTransitioning() {
    return carouselTransitionEnabled.value && !suppressCarouselTransition.value
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
    if (totalPhotos.value < 2) return

    deps.resetInteraction()
    carouselTransitionEnabled.value = true
    pendingCarouselDirection.value = direction
    carouselDragOffsetX.value = 0
  }

  function requestPhotoNavigation(direction: -1 | 1) {
    if (
      totalPhotos.value < 2 ||
      isCarouselTransitioning() ||
      pendingNavigationDirection.value !== 0
    ) {
      return
    }

    const targetIndex = getWrappedPhotoIndex(selectedPhotoIndex.value + direction)

    if (hasLoadedPhoto(targetIndex)) {
      animateCarousel(direction)
      return
    }

    pendingNavigationDirection.value = direction
    carouselDragOffsetX.value = 0
    isCarouselDragging.value = false

    const requestId = ++navigationRequestId.value

    preloadPhoto(targetIndex).then(() => {
      if (navigationRequestId.value !== requestId || !isOpen.value) return

      pendingNavigationDirection.value = 0

      if (targetIndex !== getWrappedPhotoIndex(selectedPhotoIndex.value + direction)) return

      animateCarousel(direction)
    })
  }

  function nextPhoto() {
    requestPhotoNavigation(1)
  }

  function prevPhoto() {
    requestPhotoNavigation(-1)
  }

  function snapCarouselBack() {
    if (!isCarouselDragging.value && carouselDragOffsetX.value === 0) return

    isCarouselDragging.value = false
    carouselTransitionEnabled.value = true
    pendingCarouselDirection.value = 0
    carouselDragOffsetX.value = 0
  }

  function captureCarouselPointer(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement | null
    if (target && !target.hasPointerCapture(event.pointerId)) {
      target.setPointerCapture(event.pointerId)
    }
  }

  function releaseCarouselPointer(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement | null
    if (target && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (
      !isOpen.value ||
      !supportsSwipeNavigation.value ||
      deps.isZoomed() ||
      isCarouselTransitioning() ||
      totalPhotos.value < 2 ||
      carouselPointerId.value !== null
    ) {
      return
    }

    carouselPointerId.value = event.pointerId
    carouselStartX.value = event.clientX
    carouselStartY.value = event.clientY
    carouselDragOffsetX.value = 0
    isCarouselDragging.value = true
    carouselTransitionEnabled.value = false
    pendingCarouselDirection.value = 0
    captureCarouselPointer(event)
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isOpen.value || carouselPointerId.value !== event.pointerId || !isCarouselDragging.value) {
      return
    }

    captureCarouselPointer(event)
    carouselDragOffsetX.value = event.clientX - carouselStartX.value
  }

  function handlePointerUp(event: PointerEvent) {
    if (carouselPointerId.value !== event.pointerId) return

    const deltaX = event.clientX - carouselStartX.value
    const deltaY = event.clientY - carouselStartY.value
    const width = imageStageRef.value?.clientWidth ?? imageContainerRef.value?.clientWidth ?? 0
    const threshold = Math.min(140, Math.max(56, width * 0.16))

    releaseCarouselPointer(event)
    carouselPointerId.value = null

    if (
      isCarouselDragging.value &&
      Math.abs(deltaX) > threshold &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2
    ) {
      isCarouselDragging.value = false
      requestPhotoNavigation(deltaX < 0 ? 1 : -1)
      return
    }

    snapCarouselBack()
  }

  function handlePointerCancel(event: PointerEvent) {
    if (carouselPointerId.value === event.pointerId) {
      releaseCarouselPointer(event)
    }

    resetCarouselPointerState()
    pendingCarouselDirection.value = 0
  }

  const carouselTrackStyle = computed<Partial<CSSProperties>>(() => {
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
          : prefersReducedMotion.value
            ? 'transform 0.01ms linear'
            : 'transform 360ms var(--motion-emphasized)',
    }
  })

  return {
    carouselDragOffsetX,
    isCarouselDragging,
    carouselTransitionEnabled,
    pendingCarouselDirection,
    suppressCarouselTransition,
    pendingNavigationDirection,
    carouselTrackStyle,
    isCarouselTransitioning,
    resetCarouselPointerState,
    resetCarouselFlags,
    finalizeCarouselNavigation,
    handleCarouselTransitionEnd,
    animateCarousel,
    nextPhoto,
    prevPhoto,
    requestPhotoNavigation,
    snapCarouselBack,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }
}
