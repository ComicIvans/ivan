<script setup lang="ts">
import { getOgLocale } from '~/utils/locales'

const { t, locale, localeCodes } = useI18n()
const siteConfig = useSiteConfig()

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | ${t('seo.title')}` : t('seo.title')),
  ogType: 'profile',
  ogSiteName: siteConfig.name,
  ogLocale: () => getOgLocale(locale.value),
  twitterCard: 'summary_large_image',
  themeColor: '#f87171',
})

// OG Image configuration
defineOgImage({
  component: 'NuxtSeo',
  siteLogo: '/favicon.ico',
  theme: '#f87171',
  colorMode: 'light',
} as Record<string, unknown>)

// Schema.org structured data
useSchemaOrg([
  defineWebSite({
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: () => localeCodes.value.toString(),
  }),
  definePerson({
    name: 'Iván Salido Cobo',
    givenName: 'Iván',
    familyName: 'Salido Cobo',
    gender: 'Male',
    url: siteConfig.url,
    image: `${siteConfig.url}/profile-pic.jpg`,
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
    sameAs: [
      'https://www.linkedin.com/in/ivansalidocobo/',
      'https://www.instagram.com/ivansalidocobo/',
      'https://github.com/ComicIvans/',
    ],
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
        alternateName: 'es',
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
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

