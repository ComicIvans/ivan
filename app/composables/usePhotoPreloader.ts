/**
 * Caches image aspect ratios and lazily preloads them off-DOM, so the lightbox
 * can open at the right size without layout shift. Extracted from the gallery
 * detail page to keep that component focused on layout.
 */
export function usePhotoPreloader() {
  const aspectRatios = ref<Record<number, number>>({})
  const preloads = new Map<number, Promise<number | null>>()

  function recordFromImage(index: number, image: HTMLImageElement | null | undefined) {
    if (image?.naturalWidth && image.naturalHeight) {
      aspectRatios.value[index] = image.naturalWidth / image.naturalHeight
    }
  }

  function preload(index: number, src: string): Promise<number | null> {
    const known = aspectRatios.value[index]
    if (known && Number.isFinite(known)) {
      return Promise.resolve(known)
    }

    const existing = preloads.get(index)
    if (existing) {
      return existing
    }

    if (!import.meta.client) {
      return Promise.resolve(null)
    }

    const promise = new Promise<number | null>((resolve) => {
      const image = new Image()
      const finalize = () => {
        const ratio =
          image.naturalWidth && image.naturalHeight
            ? image.naturalWidth / image.naturalHeight
            : null

        if (ratio) {
          aspectRatios.value[index] = ratio
        }

        preloads.delete(index)
        resolve(ratio)
      }

      image.decoding = 'async'
      image.onload = finalize
      image.onerror = finalize
      image.src = src

      if (image.complete) {
        finalize()
      }
    })

    preloads.set(index, promise)
    return promise
  }

  function reset() {
    aspectRatios.value = {}
    preloads.clear()
  }

  return { aspectRatios, recordFromImage, preload, reset }
}
