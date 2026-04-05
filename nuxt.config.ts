import 'dotenv/config'
import tailwindcss from '@tailwindcss/vite'
import { requireConfigUrl } from './shared/utils/config'
import { defaultLocale, siteLocales } from './shared/constants/locales'
import { profileName } from './shared/constants/profile'

const isDev = process.env.NODE_ENV !== 'production'
const hasUmami = Boolean(process.env.NUXT_UMAMI_ID && process.env.NUXT_UMAMI_HOST)
const siteUrl = requireConfigUrl(process.env.SITE_URL, 'SITE_URL')
const siteImageHostname = new URL(siteUrl).hostname

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: isDev },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
      ],
    },
    server: {
      allowedHosts: isDev ? ['.trycloudflare.com'] : [],
    },
  },

  runtimeConfig: {
    siteUrl,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFromEmail: process.env.SMTP_FROM_EMAIL,
    smtpToEmail: process.env.SMTP_TO_EMAIL,
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  routeRules: {
    '/api/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    },
    '/_ipx/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, stale-while-revalidate=86400',
      },
    },
    '/gallery/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
    '/full-pic.webp': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
    '/profile-pic.webp': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/a11y',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    ...(hasUmami ? ['nuxt-umami'] : []),
    '@nuxt/content',
    './modules/fix-mdc-optimize-deps',
  ],

  icon: {
    collections: ['tabler', 'circle-flags', 'simple-icons'],
  },

  ...(hasUmami
    ? {
        umami: {
          id: process.env.NUXT_UMAMI_ID,
          host: process.env.NUXT_UMAMI_HOST,
          autoTrack: true,
          ignoreLocalhost: true,
          enabled: !isDev,
        },
      }
    : {}),

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'light',
  },

  experimental: {
    payloadExtraction: !isDev,
    renderJsonPayloads: !isDev,
  },

  // Nuxt SEO configuration
  site: {
    url: siteUrl,
    name: profileName,
    defaultLocale,
    trailingSlash: false,
    env: isDev ? 'development' : 'production',
    indexable: !isDev,
  },

  // OG image defaults
  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
    enabled: true,
    zeroRuntime: true,
  },

  // Sitemap configuration
  sitemap: {
    autoLastmod: true,
    xsl: false,
    zeroRuntime: true,
  },

  // Robots configuration
  robots: {
    allow: ['/'],
  },

  // Link checker
  linkChecker: {
    enabled: false,
  },

  i18n: {
    baseUrl: siteUrl,
    locales: siteLocales.map(({ code, language, name, file }) => ({
      code,
      language,
      name,
      file,
    })),
    defaultLocale,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  content: {
    ...(isDev
      ? {}
      : {
          database: {
            type: 'sqlite',
            filename: '/data/nuxt-content.sqlite',
          },
        }),
  },

  hooks: {
    'nitro:config': (nitroConfig) => {
      if (!isDev) return

      nitroConfig.runtimeConfig ||= {}
      nitroConfig.runtimeConfig.content ||= {}
      nitroConfig.runtimeConfig.content.integrityCheck = false
    },
  },

  // Nitro optimizations
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: false,
      failOnError: false,
    },
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'avif', 'png', 'jpg'],
    domains: Array.from(new Set([siteImageHostname, 'localhost', '127.0.0.1'])),
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },

  // Accessibility checks in development
  a11y: {
    enabled: isDev,
    defaultHighlight: false,
    logIssues: true,
  },
})
