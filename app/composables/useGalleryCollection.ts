import type { Collections } from '@nuxt/content'

/**
 * Composable to get the gallery collection based on the current locale
 */
export function useGalleryCollection() {
  const { locale } = useI18n()

  const collectionName = computed(() => {
    return `gallery_${locale.value}` as keyof Collections
  })

  return {
    collectionName,
    locale,
  }
}
