import { getLocaleConfig } from '~/utils/locales'
import { toAbsoluteUrl } from '~~/shared/utils/url'

// Derived from useSeoMeta so the accepted Open Graph types follow unhead.
type SeoOgType = Extract<NonNullable<Parameters<typeof useSeoMeta>[0]['ogType']>, string>

type SeoValue<T extends string = string> = T | (() => T | null | undefined)

interface UsePageSeoOptions {
  canonicalPath?: SeoValue
  ogImage?: SeoValue
  ogType?: SeoValue<SeoOgType>
  robots?: SeoValue
  /** The title already names the site: use it as is, without " | <site name>". */
  fullTitle?: boolean
}

const resolveLiteralValue = <T extends string>(value: SeoValue<T> | undefined): T | undefined => {
  if (typeof value === 'function') {
    return value() ?? undefined
  }

  if (typeof value === 'string') {
    return value
  }

  return undefined
}

const resolveTranslatedValue = (value: SeoValue, t: ReturnType<typeof useI18n>['t']) =>
  typeof value === 'function' ? (value() ?? undefined) : t(value)

export function usePageSeo(
  titleValue: SeoValue,
  descriptionValue: SeoValue,
  options: UsePageSeoOptions = {}
) {
  const { t, locale } = useI18n({ useScope: 'global' })
  const route = useRoute()
  const siteConfig = useSiteConfig()

  const title = () => resolveTranslatedValue(titleValue, t)
  const description = () => resolveTranslatedValue(descriptionValue, t)
  // Shared links carry the same title as the browser tab.
  const shareTitle = () => (options.fullTitle ? title() : withSiteName(title(), t('seo.title')))

  const canonicalUrl = computed(() => {
    const canonicalPath = resolveLiteralValue(options.canonicalPath) ?? route.path
    return toAbsoluteUrl(canonicalPath, String(siteConfig.url ?? '').trim()) ?? undefined
  })

  const ogImage = computed(() => {
    const imagePath = resolveLiteralValue(options.ogImage)
    return toAbsoluteUrl(imagePath, String(siteConfig.url ?? '').trim()) ?? undefined
  })

  const ogType = () => resolveLiteralValue(options.ogType) ?? 'website'
  const robots = () => resolveLiteralValue(options.robots)
  const languageTag = computed(() => getLocaleConfig(locale.value).language)

  // OG image: when the page supplies a real image (e.g. a gallery cover) emit it
  // directly via useSeoMeta below. Otherwise render the branded Satori template
  // with this page's own title/description (the og-image module then owns the
  // og:image / twitter:image tags).
  if (!ogImage.value) {
    defineOgImage('OgPortfolio', {
      title: title() ?? '',
      description: description() ?? '',
      showName: !options.fullTitle,
    })
  }

  // Canonical + hreflang are owned solely by useLocaleHead({ seo: true }) in
  // app.vue. We intentionally do NOT emit a second canonical link here.
  useSeoMeta({
    ...(options.fullTitle ? { titleTemplate: '%s' } : {}),
    title,
    description,
    ogTitle: shareTitle,
    ogDescription: description,
    ogUrl: () => canonicalUrl.value,
    ogImage: () => ogImage.value,
    ogType,
    robots,
    twitterCard: 'summary_large_image',
    twitterTitle: shareTitle,
    twitterDescription: description,
    twitterImage: () => ogImage.value,
  })

  useSchemaOrg([
    defineWebPage({
      '@id': () => (canonicalUrl.value ? `${canonicalUrl.value}#webpage` : undefined),
      name: title,
      description,
      url: () => canonicalUrl.value,
      inLanguage: () => languageTag.value,
    }),
  ])
}
