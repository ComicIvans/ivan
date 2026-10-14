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

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: isDev },

  // Section/credential components keep their own descriptive names instead of
  // the directory-derived prefix (SectionsSectionHero would never resolve).
  components: [
    { path: '~/components/sections', pathPrefix: false },
    { path: '~/components/credential', pathPrefix: false },
    '~/components',
  ],

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
    build: {
      // Vendor code that rarely changes between deploys gets its own chunk
      // so a browser that already cached it doesn't re-download it just
      // because app code changed. Verified via bundle analysis (rollup-
      // plugin-visualizer, run ad hoc) that gsap/ogl/photoswipe are already
      // isolated or lazy and are NOT what makes the remaining shared chunk
      // large. That chunk is the Vue + vue-router + Nuxt UI runtime plus
      // layout chrome used on every route (LayoutHeader/Footer/Shell); it is
      // not reducible without dropping one of those dependencies. vue-i18n
      // + @intlify were pulled out into their own chunk below since they
      // version-bump independently of app code. Per-locale message data is
      // already lazy per @nuxtjs/i18n's own architecture (separate ~42 kB
      // chunks per locale, not part of either chunk here). Measured after
      // this split: framework/layout baseline ~394 kB min / ~131 kB gz,
      // i18n-runtime ~143 kB min / ~53 kB gz. chunkSizeWarningLimit applies
      // the same ceiling to every chunk (it is not tracked per chunk); 420
      // sits just above the framework/layout chunk specifically, since that
      // is the one with almost no headroom left. i18n-runtime has plenty of
      // room under 420 and won't trip the warning until it roughly triples,
      // but the framework/layout chunk will flag on only modest growth —
      // which is the point: it's the one actually worth re-checking.
      chunkSizeWarningLimit: 420,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Bonus plugins ride the lazy credential chunks, not the eager
            // gsap chunk that every page downloads at startup.
            if (/node_modules\/gsap\/(MorphSVGPlugin|DrawSVGPlugin)/.test(id)) return undefined
            if (id.includes('node_modules/gsap')) return 'gsap'
            if (id.includes('node_modules/ogl')) return 'ogl'
            if (id.includes('node_modules/vue-i18n') || id.includes('node_modules/@intlify')) {
              return 'i18n-runtime'
            }
          },
        },
      },
    },
  },

  // Runtime secrets are injected at container start, not baked into the image.
  // Nuxt only overrides these from NUXT_-prefixed env vars at runtime, so the
  // defaults are empty and the real values come from NUXT_SMTP_* (see .env).
  runtimeConfig: {
    siteUrl,
    smtpHost: '',
    smtpPort: '',
    smtpSecure: '',
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpToEmail: '',
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
    // Legacy standalone pages now live as sections of the home page.
    '/experiencia': { redirect: { to: '/#experiencia', statusCode: 301 } },
    '/proyectos': { redirect: { to: '/#proyectos', statusCode: 301 } },
    '/formacion': { redirect: { to: '/#formacion', statusCode: 301 } },
    '/representacion': { redirect: { to: '/#representacion', statusCode: 301 } },
    '/contacto': { redirect: { to: '/#contacto', statusCode: 301 } },
    '/en/experience': { redirect: { to: '/en#experiencia', statusCode: 301 } },
    '/en/projects': { redirect: { to: '/en#proyectos', statusCode: 301 } },
    '/en/education': { redirect: { to: '/en#formacion', statusCode: 301 } },
    '/en/representation': { redirect: { to: '/en#representacion', statusCode: 301 } },
    '/en/contact': { redirect: { to: '/en#contacto', statusCode: 301 } },
    '/de/erfahrung': { redirect: { to: '/de#experiencia', statusCode: 301 } },
    '/de/projekte': { redirect: { to: '/de#proyectos', statusCode: 301 } },
    '/de/ausbildung': { redirect: { to: '/de#formacion', statusCode: 301 } },
    '/de/vertretung': { redirect: { to: '/de#representacion', statusCode: 301 } },
    '/de/kontakt': { redirect: { to: '/de#contacto', statusCode: 301 } },
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
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
    '/full-pic.webp': {
      headers: {
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
    '/profile-pic.webp': {
      headers: {
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
  },

  modules: [
    'nuxt-security',
    '@nuxt/ui',
    '@nuxt/fonts',
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

  // Fonts are downloaded at build time and self-hosted from /_fonts, so the
  // CSP font-src 'self' directive keeps holding at runtime.
  fonts: {
    families: [
      { name: 'Space Grotesk', weights: [500, 700], subsets: ['latin', 'latin-ext'] },
      { name: 'IBM Plex Mono', weights: [400, 500], subsets: ['latin', 'latin-ext'] },
    ],
  },

  security: {
    // Own file-based limiter (server/utils/rateLimit.ts) is used instead.
    rateLimiter: false,
    allowedMethodsRestricter: {
      methods: ['GET', 'HEAD', 'POST'],
    },
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
        'form-action': ["'self'"],
        'script-src': [
          "'self'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          ...(umamiOrigin ? [umamiOrigin] : []),
        ],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:', siteImageHostname],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", ...(umamiOrigin ? [umamiOrigin] : [])],
        'report-uri': ['/api/csp-report'],
        'upgrade-insecure-requests': true,
      },
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
    // Native cross-page morphs where supported; the manual page-shell
    // transition in app.vue stays wired as the universal fallback.
    viewTransition: true,
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
    exclude: ['/legal', '/en/legal', '/de/legal'],
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
    domains: Array.from(new Set([siteImageHostname, ...(isDev ? ['localhost', '127.0.0.1'] : [])])),
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
