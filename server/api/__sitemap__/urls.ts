import { fetchGalleryEvents } from '~~/server/utils/gallery'
import { getRequiredSiteUrl } from '~~/server/utils/runtimeConfig'
import { defaultLocale, siteLocales } from '~~/shared/constants/locales'
import { galleryBasePathByLocale } from '~~/shared/constants/routes'

const getEventSlug = (path: string) => path.split('/').pop() || ''

const localizedGalleryPath = (localeCode: string, slug: string) => {
  const base = galleryBasePathByLocale[localeCode as keyof typeof galleryBasePathByLocale]
  const prefix = localeCode === defaultLocale ? '' : `/${localeCode}`
  return `${prefix}${base}/${slug}`
}

/**
 * Sitemap source for dynamic gallery event detail pages. Static pages are added
 * automatically by the @nuxtjs/seo i18n integration; only the dynamic
 * `/galeria/[slug]` routes need to be contributed here, one entry per locale
 * with cross-locale hreflang alternates.
 */
export default defineSitemapEventHandler(async (event) => {
  const siteUrl = getRequiredSiteUrl(event).replace(/\/$/, '')
  const baseEvents = await fetchGalleryEvents(event, defaultLocale)

  return baseEvents.flatMap((galleryEvent) => {
    const slug = getEventSlug(galleryEvent.path)
    if (!slug) {
      return []
    }

    const alternatives: { hreflang: string; href: string }[] = siteLocales.map(({ code }) => ({
      hreflang: code as string,
      href: `${siteUrl}${localizedGalleryPath(code, slug)}`,
    }))
    alternatives.push({
      hreflang: 'x-default',
      href: `${siteUrl}${localizedGalleryPath(defaultLocale, slug)}`,
    })

    return siteLocales.map(({ code }) => ({
      loc: localizedGalleryPath(code, slug),
      lastmod: galleryEvent.date,
      alternatives,
    }))
  })
})
