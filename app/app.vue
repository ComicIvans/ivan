<script setup lang="ts">
import { defaultLocale } from '~~/shared/constants/locales'
import { profileName, profileSameAs } from '~~/shared/constants/profile'
import { getOgLocale } from '~/utils/locales'
import { getNuxtUiLocale } from '~/utils/nuxtUiLocale'

const { t, locale, localeCodes } = useI18n({ useScope: 'global' })
const siteConfig = useSiteConfig()
const localeHead = useLocaleHead({ seo: true })
const siteUrl = computed(() => String(siteConfig.url ?? ''))
const router = useRouter()
const pendingPageFullPath = useState<string | null>('page-nav-pending-path', () => null)

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
  pendingPageFullPath.value = null
}

useHead(() => ({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs?.lang ?? locale.value,
    dir: (localeHead.value.htmlAttrs?.dir ?? dir.value) as 'auto' | 'ltr' | 'rtl',
  },
  link: [
    ...(localeHead.value.link ?? []).filter((link) => link.rel !== 'icon'),
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
  meta: [
    ...(localeHead.value.meta ?? []),
    { name: 'theme-color', content: '#f87171' },
    { name: 'author', content: profileName },
  ],
}))

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | ${t('seo.title')}` : t('seo.title')),
  description: () => t('seo.description'),
  ogUrl: () => siteUrl.value,
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
  themeColor: '#f87171',
})

defineOgImage('NuxtSeoSatori', {
  siteLogo: '/favicon.ico',
  theme: '#f87171',
  colorMode: 'light',
})

onMounted(() => {
  pageTransitionsEnabled.value = true

  removeRoutePendingHook = router.beforeEach((to, from) => {
    if (to.fullPath !== from.fullPath) {
      pendingPageFullPath.value = from.fullPath
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
    gender: 'Male',
    url: () => siteUrl.value,
    image: () => `${siteUrl.value}/profile-pic.webp`,
    description: () => t('seo.description'),
    nationality: {
      '@type': 'Country',
      name: 'Spain',
    },
    birthPlace: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ES',
        addressLocality: 'Santa María de los Llanos',
        addressRegion: 'Castilla-La Mancha',
        postalCode: '16639',
      },
    },
    sameAs: profileSameAs,
    jobTitle: () => t('schema.jobTitle'),
    worksFor: [
      {
        '@type': 'Organization',
        name: 'Coordinadora de Representantes de Estudiantes de Universidades Públicas - CREUP',
        url: 'https://www.creup.es/',
      },
    ],
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Universitat Politècnica de València (UPV)',
        url: 'https://www.upv.es/',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Universidad de Granada (UGR)',
        url: 'https://www.ugr.es/',
      },
    ],
    knowsAbout: [
      'Cybersecurity',
      'Mathematics',
      'Project Management',
      'Strategic Management',
      'Student Representation',
      'Vue.js',
    ],
    knowsLanguage: [
      {
        '@type': 'Language',
        name: 'Spanish',
        alternateName: defaultLocale,
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en',
      },
      {
        '@type': 'Language',
        name: 'German',
        alternateName: 'de',
      },
    ],
  }),
])
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage v-slot="{ Component, route }">
        <Transition
          v-if="pageTransitionsEnabled"
          name="page-shell"
          mode="out-in"
          @after-leave="clearPendingPagePath"
        >
          <div :key="route.fullPath" class="page-shell-node">
            <div
              class="page-shell-frame"
              :class="{ 'page-nav-pending': pendingPageFullPath === route.fullPath }"
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
