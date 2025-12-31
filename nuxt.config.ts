// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    // Private keys (only available on server) - SMTP configuration
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpToEmail: process.env.SMTP_TO_EMAIL,
    // Public keys (available on client and server)
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
  },

  css: ['~/assets/css/main.css'],

  // Nuxt UI configuration
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error'],
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'Iván Salido Cobo',
  },

  seo: {
    redirectToCanonicalSiteUrl: true,
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

  icon: {
    serverBundle: 'remote',
    clientBundle: {
      scan: true,
    },
  },

  // NuxtImage configuration for gallery optimization
  image: {
    quality: 80,
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    presets: {
      cover: {
        modifiers: {
          fit: 'cover',
          width: 1200,
          height: 630,
        },
      },
      gallery: {
        modifiers: {
          fit: 'cover',
          width: 400,
          height: 300,
        },
      },
      lightbox: {
        modifiers: {
          fit: 'inside',
          width: 1920,
          height: 1080,
        },
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
    langDir: 'locales',
    customRoutes: 'config',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
})
