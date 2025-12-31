// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpToEmail: process.env.SMTP_TO_EMAIL,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },

  vite: {
    server:
      process.env.NODE_ENV === 'development'
        ? {
            allowedHosts: true,
          }
        : {},
  },

  sourcemap: false,

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@formkit/auto-animate/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'nuxt-umami',
    '@nuxt/content',
  ],

  umami: {
    id: 'c3dac3c3-bdd7-46d3-886b-7c21c097a7b3',
    host: 'https://analytics.wupp.dev',
    autoTrack: true,
    enabled: process.env.NODE_ENV !== 'development',
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'light',
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'Iván Salido Cobo',
  },

  sitemap: {
    zeroRuntime: true,
  },

  ogImage: {
    enabled: true,
    compatibility: {
      dev: {
        resvg: 'wasm',
      },
      runtime: {
        resvg: 'wasm',
      },
      prerender: {
        resvg: 'wasm',
      },
    },
  },

  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
    ],
    defaultLocale: 'es',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
})
