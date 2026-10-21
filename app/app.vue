<script setup lang="ts">
import { profileName, profileSameAs } from '~~/shared/constants/profile'
import { themeColorMeta } from '~~/shared/constants/theme'
import { getOgLocale } from '~/utils/locales'
import { getNuxtUiLocale } from '~/utils/nuxtUiLocale'

const { t, locale, localeCodes } = useI18n({ useScope: 'global' })
const siteConfig = useSiteConfig()
const localeHead = useLocaleHead({ seo: true })
const siteUrl = computed(() => String(siteConfig.url ?? ''))
const siteRoot = computed(() => siteUrl.value.replace(/\/$/, ''))
const route = useRoute()
const router = useRouter()
const pendingPagePath = useState<string | null>('page-nav-pending-path', () => null)

const nuxtUiLocale = computed(() => getNuxtUiLocale(locale.value))
const availableLocaleCodes = computed(() => localeCodes.value.map((code) => String(code)))
const alternateOgLocales = computed(() =>
  localeCodes.value.filter((code) => code !== locale.value).map((code) => getOgLocale(code))
)
const dir = computed(() => nuxtUiLocale.value.dir)
const pageTransitionsEnabled = ref(false)

let removeRoutePendingHook: (() => void) | null = null
let removeRouteErrorHook: (() => void) | null = null

const clearPendingPagePath = () => {
  pendingPagePath.value = null
}

useHead(() => ({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs?.lang ?? locale.value,
    dir: (localeHead.value.htmlAttrs?.dir ?? dir.value) as 'auto' | 'ltr' | 'rtl',
  },
  link: [...(localeHead.value.link ?? [])],
  meta: [
    ...(localeHead.value.meta ?? []),
    { name: 'theme-color', content: themeColorMeta },
    { name: 'author', content: profileName },
  ],
}))

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | ${t('seo.title')}` : t('seo.title')),
  description: () => t('seo.description'),
  ogUrl: () => `${siteUrl.value}${route.path}`,
  ogType: 'profile',
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogSiteName: siteConfig.name,
  ogLocale: () => getOgLocale(locale.value),
  ogLocaleAlternate: () => alternateOgLocales.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.title'),
  twitterDescription: () => t('seo.description'),
  author: profileName,
  themeColor: themeColorMeta,
})

onMounted(() => {
  // The native View Transitions API (experimental.viewTransition) owns page
  // navigation where supported; the Vue transition below is the fallback.
  pageTransitionsEnabled.value = !('startViewTransition' in document)

  // Path, not fullPath: anchor links on the one-page only change the hash,
  // which must neither hide nor remount the page.
  removeRoutePendingHook = router.beforeEach((to, from) => {
    if (to.path !== from.path) {
      pendingPagePath.value = from.path
    }
  })

  removeRouteErrorHook = router.onError(() => {
    clearPendingPagePath()
  })
})

onBeforeUnmount(() => {
  removeRoutePendingHook?.()
  removeRouteErrorHook?.()
})

// Person details derived from the profile content, so the structured data
// follows the timeline (current roles, studies, languages) without edits here.
// They are added once the home has loaded the profile; other pages keep the
// base Person node and a lighter payload.
const profile = useLoadedProfile()

function nonEmpty<T>(items: T[]) {
  return items.length ? items : undefined
}

const uniqueByUrl = <T extends { url: string }>(items: T[]) =>
  items.filter((item, index) => items.findIndex((other) => other.url === item.url) === index)

const personWorksFor = computed(() =>
  uniqueByUrl(
    profile.experience.value.flatMap((role) =>
      role.current && role.organizationUrl
        ? [{ '@type': 'Organization', name: role.organization, url: role.organizationUrl }]
        : []
    )
  )
)

const personAlumniOf = computed(() =>
  uniqueByUrl(
    profile.academic.value.flatMap((item) =>
      item.organizationUrl
        ? [
            {
              '@type': 'EducationalOrganization',
              name: item.organization,
              url: item.organizationUrl,
            },
          ]
        : []
    )
  )
)

const personKnowsAbout = computed(() => [
  ...profile.competencies.value.map((competency) => competency.name),
  ...profile.stack.value.primary.map((tech) => tech.name),
])

const personKnowsLanguage = computed(() =>
  profile.languages.value.map((language) => ({
    '@type': 'Language',
    name: language.name,
    alternateName: language.code,
  }))
)

useSchemaOrg([
  defineWebSite({
    '@id': () => `${siteUrl.value}#website`,
    name: () => String(siteConfig.name ?? profileName),
    url: () => siteUrl.value,
    description: () => t('seo.description'),
    inLanguage: availableLocaleCodes.value,
  }),
  definePerson({
    '@id': () => `${siteUrl.value}#person`,
    name: profileName,
    givenName: 'Iván',
    familyName: 'Salido Cobo',
    url: () => siteUrl.value,
    image: () => `${siteRoot.value}/profile-pic.webp`,
    description: () => t('seo.description'),
    nationality: {
      '@type': 'Country',
      name: 'Spain',
    },
    sameAs: profileSameAs,
    jobTitle: () => t('schema.jobTitle'),
    worksFor: () => nonEmpty(personWorksFor.value),
    alumniOf: () => nonEmpty(personAlumniOf.value),
    knowsAbout: () => nonEmpty(personKnowsAbout.value),
    knowsLanguage: () => nonEmpty(personKnowsLanguage.value),
  }),
])
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage v-slot="{ Component, route: pageRoute }">
        <Transition
          v-if="pageTransitionsEnabled"
          name="page-shell"
          mode="out-in"
          @after-leave="clearPendingPagePath"
        >
          <div :key="pageRoute.path" class="page-shell-node">
            <div
              class="page-shell-frame"
              :class="{ 'page-nav-pending': pendingPagePath === pageRoute.path }"
            >
              <component :is="Component" />
            </div>
          </div>
        </Transition>
        <component :is="Component" v-else />
      </NuxtPage>
    </NuxtLayout>
  </UApp>
</template>
