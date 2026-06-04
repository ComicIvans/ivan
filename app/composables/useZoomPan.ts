import type { Ref } from 'vue'

interface ZoomPanDeps {
  minZoom: number
  zoomStep: number
  maxZoom: Ref<number>
  imageStageRef: Ref<HTMLElement | null>
  imageContainerRef: Ref<HTMLElement | null>
  isOpen: Ref<boolean>
  /** Returns the currently active <img> element inside the stage. */
  getActiveModalImage: () => HTMLImageElement | null
  /** Whether the carousel is mid-transition (zoom/pan is blocked during it). */
  isCarouselTransitioning: () => boolean
  /** Resets the carousel's pointer state (kept in sync on touch reset). */
  resetCarouselPointer: () => void
}

/**
 * Zoom + pan interactions for the lightbox image: wheel, mouse drag, pinch-zoom
 * and one-finger pan, plus the transform style for the active image. Extracted
 * from GalleryLightbox so the gesture math lives on its own.
 */
export function useZoomPan(deps: ZoomPanDeps) {
  const { minZoom, zoomStep, maxZoom } = deps

  const zoomLevel = ref(minZoom)
  const panX = ref(0)
  const panY = ref(0)
  const isPanning = ref(false)
  const panStartX = ref(0)
  const panStartY = ref(0)
  const lastTouchX = ref(0)
  const lastTouchY = ref(0)
  const pinchStartDistance = ref(0)
  const pinchStartZoom = ref(minZoom)
  const isPinching = ref(false)

  const activeImageStyle = computed(() => ({
    transform: `scale(${zoomLevel.value}) translate(${panX.value / zoomLevel.value}px, ${panY.value / zoomLevel.value}px)`,
  }))

  function resetZoom() {
    zoomLevel.value = minZoom
    panX.value = 0
    panY.value = 0
    isPanning.value = false
  }

  function resetTouchState() {
    isPinching.value = false
    pinchStartDistance.value = 0
    pinchStartZoom.value = zoomLevel.value
    lastTouchX.value = 0
    lastTouchY.value = 0
    isPanning.value = false
    deps.resetCarouselPointer()
  }

  function constrainPan() {
    if (zoomLevel.value <= minZoom) {
      panX.value = 0
      panY.value = 0
      return
    }

    const imageElement = deps.getActiveModalImage()
    const stageRect = deps.imageStageRef.value?.getBoundingClientRect()
    const imageRect = imageElement?.getBoundingClientRect()

    if (!imageRect || !stageRect) return

    const overflowX = Math.max(0, (imageRect.width - stageRect.width) / 2)
    const overflowY = Math.max(0, (imageRect.height - stageRect.height) / 2)

    panX.value = Math.max(-overflowX, Math.min(overflowX, panX.value))
    panY.value = Math.max(-overflowY, Math.min(overflowY, panY.value))
  }

  function applyZoom(nextZoom: number, origin?: { clientX: number; clientY: number }) {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom.value, nextZoom))
    if (clampedZoom === zoomLevel.value) return

    const imageElement = origin ? deps.getActiveModalImage() : null

    if (origin && imageElement) {
      const imageRect = imageElement.getBoundingClientRect()
      const imageCenterX = imageRect.left + imageRect.width / 2
      const imageCenterY = imageRect.top + imageRect.height / 2
      const offsetX = origin.clientX - imageCenterX
      const offsetY = origin.clientY - imageCenterY
      const zoomRatio = clampedZoom / zoomLevel.value

      panX.value = panX.value * zoomRatio + offsetX * (1 - zoomRatio)
      panY.value = panY.value * zoomRatio + offsetY * (1 - zoomRatio)
    } else if (clampedZoom < zoomLevel.value) {
      const zoomRatio = clampedZoom / zoomLevel.value
      panX.value *= zoomRatio
      panY.value *= zoomRatio
    }

    zoomLevel.value = clampedZoom

    if (clampedZoom === minZoom) {
      panX.value = 0
      panY.value = 0
    }

    constrainPan()
  }

  function zoomIn() {
    applyZoom(zoomLevel.value + zoomStep)
  }

  function zoomOut() {
    applyZoom(zoomLevel.value - zoomStep)
  }

  function handleWheel(event: WheelEvent) {
    if (!deps.isOpen.value || !deps.imageContainerRef.value || deps.isCarouselTransitioning())
      return

    const delta = event.deltaY > 0 ? -zoomStep : zoomStep
    applyZoom(zoomLevel.value + delta, { clientX: event.clientX, clientY: event.clientY })
  }

  function handleMouseDown(event: MouseEvent) {
    if (zoomLevel.value <= minZoom || deps.isCarouselTransitioning()) return

    isPanning.value = true
    panStartX.value = event.clientX - panX.value
    panStartY.value = event.clientY - panY.value
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isPanning.value || zoomLevel.value <= minZoom) return

    panX.value = event.clientX - panStartX.value
    panY.value = event.clientY - panStartY.value
    constrainPan()
  }

  function handleMouseUp() {
    isPanning.value = false
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

  function getTouchMidpoint(touches: TouchList) {
    const firstTouch = touches[0]
    const secondTouch = touches[1]

    if (!firstTouch || !secondTouch) {
      return null
    }

    return {
      clientX: (firstTouch.clientX + secondTouch.clientX) / 2,
      clientY: (firstTouch.clientY + secondTouch.clientY) / 2,
    }
  }

  function handleTouchStart(event: TouchEvent) {
    if (!deps.isOpen.value) return

    if (event.touches.length === 2) {
      deps.resetCarouselPointer()
      isPinching.value = true
      pinchStartDistance.value = getTouchDistance(event.touches)
      pinchStartZoom.value = zoomLevel.value
      isPanning.value = false
      return
    }

    if (event.touches.length !== 1 || zoomLevel.value <= minZoom) return

    const touch = event.touches[0]
    if (!touch) return

    lastTouchX.value = touch.clientX
    lastTouchY.value = touch.clientY
    isPanning.value = true
  }

  function handleTouchMove(event: TouchEvent) {
    if (!deps.isOpen.value) return

    if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches)
      const midpoint = getTouchMidpoint(event.touches)

      if (!distance || !pinchStartDistance.value) return

      applyZoom(pinchStartZoom.value * (distance / pinchStartDistance.value), midpoint ?? undefined)
      event.preventDefault()
      return
    }

    if (event.touches.length !== 1 || zoomLevel.value <= minZoom || !isPanning.value) return

    const touch = event.touches[0]
    if (!touch) return

    panX.value += touch.clientX - lastTouchX.value
    panY.value += touch.clientY - lastTouchY.value
    lastTouchX.value = touch.clientX
    lastTouchY.value = touch.clientY
    constrainPan()
    event.preventDefault()
  }

  function handleTouchEnd(event: TouchEvent) {
    if (!deps.isOpen.value) return

    if (event.touches.length === 2) {
      pinchStartDistance.value = getTouchDistance(event.touches)
      pinchStartZoom.value = zoomLevel.value
      return
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0]
      if (!touch) {
        resetTouchState()
        return
      }

      lastTouchX.value = touch.clientX
      lastTouchY.value = touch.clientY
      isPinching.value = false
      isPanning.value = zoomLevel.value > minZoom
      return
    }

    isPanning.value = false
    isPinching.value = false
  }

  return {
    zoomLevel,
    panX,
    panY,
    isPanning,
    isPinching,
    activeImageStyle,
    resetZoom,
    resetTouchState,
    constrainPan,
    applyZoom,
    zoomIn,
    zoomOut,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
