/**
 * Composable for managing gallery images
 * - Generates automatic alt text based on event title if not specified
 */

/**
 * Generates alt text for an image based on context
 * @param options - Options to generate the alt text
 * @returns Generated alt text
 */
export function generateImageAlt(options: {
  eventTitle: string
  photoIndex?: number
  customAlt?: string
  isCover?: boolean
  t?: (key: string, params?: Record<string, unknown>) => string
}): string {
  const { eventTitle, photoIndex, customAlt, isCover, t } = options

  // If there's a custom alt, use it
  if (customAlt) {
    return customAlt
  }

  // If it's the cover image
  if (isCover) {
    return eventTitle
  }

  // If there's a translation function and an index
  if (t && typeof photoIndex === 'number') {
    return `${eventTitle} - ${t('gallery.event.photoAlt', { number: photoIndex + 1 })}`
  }

  // Fallback
  return typeof photoIndex === 'number' ? `${eventTitle} - Photo ${photoIndex + 1}` : eventTitle
}

/**
 * Hook to use image utilities in components
 */
export function useGalleryImages() {
  const { t } = useI18n()

  /**
   * Gets the photo src (pass-through, extension must be included)
   */
  const getPhotoSrc = (src: string) => src

  /**
   * Gets the photo alt, generating it automatically if needed
   */
  const getPhotoAlt = (options: {
    eventTitle: string
    photoIndex?: number
    customAlt?: string
    isCover?: boolean
  }) => {
    return generateImageAlt({ ...options, t })
  }

  /**
   * Gets the cover image alt
   */
  const getCoverAlt = (eventTitle: string, customAlt?: string) => {
    return generateImageAlt({ eventTitle, customAlt, isCover: true, t })
  }

  return {
    getPhotoSrc,
    getPhotoAlt,
    getCoverAlt,
    generateImageAlt,
  }
}
