import type { SiteLocaleCode } from './locales'

/**
 * Localized base segments for the gallery section, per locale. Must stay in sync
 * with the `definePageMeta({ i18n: { paths } })` declarations in:
 *   - app/pages/galeria/index.vue
 *   - app/pages/galeria/[slug].vue
 * Kept here (not derived) because `definePageMeta` is a compiler macro that only
 * accepts literal objects. This constant is consumed by the sitemap source.
 */
export const galleryBasePathByLocale: Record<SiteLocaleCode, string> = {
  es: '/galeria',
  en: '/gallery',
  de: '/galerie',
}
