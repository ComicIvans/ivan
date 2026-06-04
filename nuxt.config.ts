import 'dotenv/config'
import tailwindcss from '@tailwindcss/vite'
import { requireConfigUrl } from './shared/utils/config'
import { defaultLocale, siteLocales } from './shared/constants/locales'
import { profileName } from './shared/constants/profile'

const isDev = process.env.NODE_ENV !== 'production'
const hasUmami = Boolean(process.env.NUXT_UMAMI_ID && process.env.NUXT_UMAMI_HOST)
const siteUrl = requireConfigUrl(process.env.SITE_URL, 'SITE_URL')
const siteImageHostname = new URL(siteUrl).hostname

const umamiOrigin = (() => {
  if (!process.env.NUXT_UMAMI_HOST) return null
  try {
    return new URL(process.env.NUXT_UMAMI_HOST).origin
  } catch {
    return null
  }
})()

// Report-only CSP (phase 1): emitted as Content-Security-Policy-Report-Only so it
// never blocks, only reports violations to /api/csp-report. nuxt-security does not
// substitute the SSR nonce in report-only mode, so inline scripts/styles are allowed
// via 'unsafe-inline' to avoid false positives; tighten + flip to enforced later.
const cspReportOnlyValue = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${umamiOrigin ? ` ${umamiOrigin}` : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${siteImageHostname}`,
  "font-src 'self' data:",
  `connect-src 'self'${umamiOrigin ? ` ${umamiOrigin}` : ''}`,
  'report-uri /api/csp-report',
].join('; ')

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
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  routeRules: {
    // Report-only CSP for all routes in production (phase 1, non-blocking).
    ...(isDev
      ? {}
      : {
          '/**': {
            headers: {
              'Content-Security-Policy-Report-Only': cspReportOnlyValue,
            },
          },
        }),
    '/api/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    },
    // Contact body is validated by our zod schema; the generic XSS validator
    // produces false 400s on legitimate free-text messages.
    '/api/contact': {
      security: {
        xssValidator: false,
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
    'nuxt-security',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/a11y',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    ...(hasUmami ? ['nuxt-umami'] : []),
    '@nuxt/content',
    './modules/fix-mdc-optimize-deps',
  ],

  security: {
    // Own file-based limiter (server/utils/rateLimit.ts) is used instead.
    rateLimiter: false,
    headers: {
      // CSP handled in report-only mode via routeRules below (phase 1).
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: 'cross-origin',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
      },
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'SAMEORIGIN',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
      },
    },
  },

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

  // OG image defaults. Runtime generation (Satori) is required because routes
  // are SSR and not prerendered; zeroRuntime would emit no og:image at all.
  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
    enabled: true,
  },

  // Sitemap configuration
  sitemap: {
    autoLastmod: true,
    xsl: false,
    sources: ['/api/__sitemap__/urls'],
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
    strategy: 'prefix_except_default',
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
    // File-based storage for the contact rate limiter (persisted on the /data volume).
    storage: {
      ratelimit: {
        driver: 'fs',
        base: process.env.RATE_LIMIT_DIR || '/data/ratelimit',
      },
    },
    devStorage: {
      ratelimit: {
        driver: 'fs',
        base: './.data/ratelimit',
      },
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
