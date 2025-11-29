// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    server:
      process.env.NODE_ENV === 'development'
        ? {
            allowedHosts: true,
          }
        : {},
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/icon',
    '@vueuse/nuxt',
    '@formkit/auto-animate/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
  ],

  site: {
    url: 'https://ivan.wupp.dev',
    name: 'Iván Salido Cobo',
  },

  seo: {
    redirectToCanonicalSiteUrl: true,
  },

  icon: {
    serverBundle: 'remote',
    clientBundle: {
      scan: true,
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    dataValue: 'theme',
  },

  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
})
