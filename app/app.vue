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
const router = useRouter()
const pendingPagePath = useState<string | null>('page-nav-pending-path', () => null)

const nuxtUiLocale = computed(() => getNuxtUiLocale(locale.value))
const alternateOgLocales = computed(() =>
  localeCodes.value.filter((code) => code !== locale.value).map((code) => getOgLocale(code))
)
const dir = computed(() => nuxtUiLocale.value.dir)
const pageTransitionsEnabled = ref(false)

let removeRoutePendingHook: (() => void) | null = null
let removeRouteErrorHook: (() => void) | null = null
let removeRouteAfterHook: (() => void) | null = null

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

// Site-wide tags only. Every page sets its own title, description, Open Graph
// and Twitter tags through usePageSeo.
useSeoMeta({
  titleTemplate: (title) => withSiteName(title, t('seo.title')),
  description: () => t('seo.description'),
  ogSiteName: siteConfig.name,
  ogLocale: () => getOgLocale(locale.value),
  ogLocaleAlternate: () => alternateOgLocales.value,
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

  // A cancelled or aborted navigation (another click while the page chunk
  // loads) is a failure, not an error, and no page leaves: without this the
  // current page would stay hidden and unclickable.
  removeRouteAfterHook = router.afterEach((_to, _from, failure) => {
    if (failure) clearPendingPagePath()
  })
})

onBeforeUnmount(() => {
  removeRoutePendingHook?.()
  removeRouteErrorHook?.()
  removeRouteAfterHook?.()
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
  ...new Set([
    ...profile.topics.value,
    ...profile.competencies.value.map((competency) => competency.name),
    ...profile.stack.value.primary.map((tech) => tech.name),
  ]),
])

const personKnowsLanguage = computed(() =>
  profile.languages.value.map((language) => ({
    '@type': 'Language',
    name: language.name,
    alternateName: language.code,
  }))
)

// The WebSite node and its translations come from nuxt-schema-org. This
// Person keeps the default #identity id, which schemaOrg.identity in
// nuxt.config declares as the site owner: the WebSite names it as publisher
// and the home page as its subject.
useSchemaOrg([
  definePerson({
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
        <!-- The same tree from the server render on: enabling the fallback
             after hydration only switches the transition on. Swapping in
             another tree would unmount the hydrated page and mount it again. -->
        <Transition
          :name="pageTransitionsEnabled ? 'page-shell' : undefined"
          :css="pageTransitionsEnabled"
          :mode="pageTransitionsEnabled ? 'out-in' : undefined"
          @after-leave="clearPendingPagePath"
        >
          <div :key="pageRoute.path" class="page-shell-node">
            <div
              class="page-shell-frame"
              :class="{
                'page-nav-pending': pageTransitionsEnabled && pendingPagePath === pageRoute.path,
              }"
            >
              <component :is="Component" />
            </div>
          </div>
        </Transition>
      </NuxtPage>
    </NuxtLayout>
  </UApp>
</template>
