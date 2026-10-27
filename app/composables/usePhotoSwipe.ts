import 'photoswipe/style.css'
import 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css'
import type PhotoSwipeLightbox from 'photoswipe/lightbox'
import type { PhotoSwipeOptions, SlideData } from 'photoswipe'
import type { GalleryPhoto } from '~~/shared/types/gallery'

interface UsePhotoSwipeOptions {
  photos: MaybeRefOrGetter<GalleryPhoto[]>
  eventTitle: MaybeRefOrGetter<string>
  /** Known aspect ratios (naturalWidth / naturalHeight) keyed by absolute photo index. */
  aspectRatios: MaybeRefOrGetter<Record<number, number>>
  /** Thumbnail element for an absolute index when it is rendered on the current page. */
  getThumbnailEl?: (index: number) => HTMLElement | null | undefined
  /** Called when a slide's exact aspect ratio becomes known (full image loaded). */
  onRatio?: (index: number, ratio: number) => void
  /** Warm the aspect ratio of a neighbor photo whose thumbnail is not rendered. */
  warmRatio?: (index: number) => void
  onIndexChange?: (index: number) => void
  onClose?: () => void
}

// Layout width PhotoSwipe sizes slides against; real pixels come from srcset.
const LAYOUT_WIDTH = 2400
const FALLBACK_HEIGHT = 1600
const DISPLAY_WIDTH = 1600
const SRCSET_WIDTHS = [800, 1200, 1600, 2400]
const IMAGE_MODIFIERS = { quality: 75, format: 'webp' }

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * PhotoSwipe v5 lightbox over the full photo list of a gallery event. The
 * dataSource spans ALL photos (not just the current pagination page), so
 * wrap-around navigation covers the whole event. Slide dimensions come from
 * the shared aspect-ratio map and are corrected once the full image loads.
 */
export function usePhotoSwipe(config: UsePhotoSwipeOptions) {
  const { t, locale } = useI18n({ useScope: 'global' })
  const { getPhotoAlt } = useGalleryImages()
  const img = useImage()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  let lightbox: PhotoSwipeLightbox | null = null
  let pendingLightbox: Promise<PhotoSwipeLightbox> | null = null
  // Bumped by destroy(): an instance whose creation was still pending is
  // dropped instead of opening on a page that has moved on.
  let generation = 0

  function slideDimensions(index: number): { width: number; height: number } {
    const photo = toValue(config.photos)[index]
    const ratio =
      toValue(config.aspectRatios)[index] ??
      (photo?.width && photo.height ? photo.width / photo.height : undefined)
    return {
      width: LAYOUT_WIDTH,
      height: ratio && Number.isFinite(ratio) ? Math.round(LAYOUT_WIDTH / ratio) : FALLBACK_HEIGHT,
    }
  }

  function buildSlide(photo: GalleryPhoto, index: number): SlideData {
    const element = config.getThumbnailEl?.(index) ?? undefined
    const thumbImage = element?.querySelector('img')

    return {
      src: img(photo.src, { width: DISPLAY_WIDTH, ...IMAGE_MODIFIERS }),
      srcset: SRCSET_WIDTHS.map(
        (width) => `${img(photo.src, { width, ...IMAGE_MODIFIERS })} ${width}w`
      ).join(', '),
      ...slideDimensions(index),
      alt: getPhotoAlt({
        eventTitle: toValue(config.eventTitle),
        photoIndex: index,
        customAlt: photo.alt,
      }),
      element,
      msrc: thumbImage?.currentSrc || undefined,
      galleryDescription: photo.description,
    }
  }

  function buildDataSource(): SlideData[] {
    return toValue(config.photos).map((photo, index) => buildSlide(photo, index))
  }

  function buildCaption(data: SlideData): string {
    const parts: string[] = []
    if (data.alt) {
      parts.push(`<p class="pswp-caption-title">${escapeHtml(data.alt)}</p>`)
    }
    if (typeof data.galleryDescription === 'string' && data.galleryDescription) {
      parts.push(`<p class="pswp-caption-desc">${escapeHtml(data.galleryDescription)}</p>`)
    }
    return parts.join('')
  }

  function warmNeighborRatios(currentIndex: number) {
    if (!config.warmRatio) return

    const total = toValue(config.photos).length
    if (!total) return

    for (const offset of [-2, -1, 1, 2]) {
      config.warmRatio((((currentIndex + offset) % total) + total) % total)
    }
  }

  async function createLightbox(): Promise<PhotoSwipeLightbox> {
    const [{ default: Lightbox }, { default: PhotoSwipeDynamicCaption }] = await Promise.all([
      import('photoswipe/lightbox'),
      import('photoswipe-dynamic-caption-plugin'),
    ])

    const reducedMotionOptions: PhotoSwipeOptions = reducedMotion.value
      ? {
          showHideAnimationType: 'none',
          showAnimationDuration: 0,
          hideAnimationDuration: 0,
          zoomAnimationDuration: 0,
        }
      : {}

    const instance = new Lightbox({
      pswpModule: () => import('photoswipe'),
      counter: true,
      loop: true,
      preload: [1, 2],
      closeTitle: t('gallery.event.modal.close'),
      zoomTitle: t('gallery.event.modal.zoomIn'),
      arrowPrevTitle: t('gallery.event.modal.prev'),
      arrowNextTitle: t('gallery.event.modal.next'),
      errorMsg: t('gallery.event.modal.error'),
      ...reducedMotionOptions,
    })

    new PhotoSwipeDynamicCaption(instance, {
      type: 'auto',
      captionContent: (slide) => buildCaption(slide.data),
    })

    // Ratios learned after the dataSource snapshot still reach slides created
    // later (PhotoSwipe re-applies this filter per slide).
    instance.addFilter('itemData', (itemData, index) => ({
      ...itemData,
      ...slideDimensions(index),
    }))

    // PhotoSwipe's root .pswp element carries role="dialog" but ships no
    // accessible name of its own; without one it fails the ARIA
    // dialog-has-name rule. Compose one from the event title + position and
    // keep it in sync as the visible slide changes.
    function updateDialogAccessibleName() {
      const pswp = instance.pswp
      if (!pswp?.element) return
      const label = t('gallery.event.modal.dialogLabel', {
        title: toValue(config.eventTitle),
        current: pswp.currIndex + 1,
        total: pswp.getNumItems(),
      })
      pswp.element.setAttribute('aria-label', label)
    }

    instance.on('firstUpdate', updateDialogAccessibleName)

    instance.on('change', () => {
      const pswp = instance.pswp
      if (!pswp) return
      warmNeighborRatios(pswp.currIndex)
      config.onIndexChange?.(pswp.currIndex)
      updateDialogAccessibleName()
    })

    instance.on('close', () => {
      config.onClose?.()
    })

    // Photos whose ratio was unknown open with fallback dimensions; fix the
    // slide box as soon as the real image reports its natural size.
    instance.on('loadComplete', ({ slide, isError }) => {
      if (isError) return

      const imageEl = slide.content.element
      if (!(imageEl instanceof HTMLImageElement) || !imageEl.naturalWidth) return

      const ratio = imageEl.naturalWidth / imageEl.naturalHeight
      config.onRatio?.(slide.index, ratio)

      const height = Math.round(LAYOUT_WIDTH / ratio)
      if (Math.abs((slide.data.height ?? 0) - height) > 1) {
        slide.data.width = LAYOUT_WIDTH
        slide.data.height = height
        slide.updateContentSize(true)
      }
    })

    instance.init()
    return instance
  }

  async function open(index: number) {
    if (!import.meta.client) return

    if (!lightbox) {
      // Clicks that arrive while PhotoSwipe is still loading share one
      // instance; its loadAndOpen() keeps only the latest request.
      const currentGeneration = generation
      const pending = (pendingLightbox ??= createLightbox())
      let instance: PhotoSwipeLightbox
      try {
        instance = await pending
      } catch (error) {
        // A failed import (flaky network, chunk names changed by a deploy)
        // must not stick: the next click loads PhotoSwipe again.
        if (pendingLightbox === pending) pendingLightbox = null
        throw error
      }
      if (currentGeneration !== generation) {
        instance.destroy()
        return
      }
      pendingLightbox = null
      lightbox = instance
    }

    lightbox.loadAndOpen(index, buildDataSource())
  }

  function close() {
    lightbox?.pswp?.close()
  }

  function destroy() {
    generation += 1
    pendingLightbox = null
    lightbox?.destroy()
    lightbox = null
  }

  // UI chrome labels are baked in at construction time, so a locale switch
  // requires a fresh instance (built lazily on the next open()).
  watch(locale, destroy)

  onUnmounted(destroy)

  return { open, close }
}
