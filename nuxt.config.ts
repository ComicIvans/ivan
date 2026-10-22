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
      // because app code changed: Vue, gsap (eager, minus the bonus
      // plugins), ogl (lazy, WebGL background only) and vue-i18n +
      // @intlify, which version-bump independently of app code. Per-locale
      // message data is already lazy per @nuxtjs/i18n's own architecture.
      // The remaining shared chunk is the entry: vue-router + the Nuxt UI
      // runtime plus layout chrome used on every route; it is not reducible
      // without dropping one of those dependencies. Measured on Vite 8 /
      // Rolldown: entry ~232 kB min / ~72 kB gz, gsap ~128 / ~51 kB,
      // vue ~115 / ~44 kB, i18n-runtime ~50 / ~17 kB, ogl ~44 / ~13 kB.
      // chunkSizeWarningLimit applies the same ceiling to every chunk (it
      // is not tracked per chunk). 420 kB was set just above the previous
      // framework/layout chunk (~417 kB before Vue moved to its own group)
      // and is kept as the ceiling, so the build flags any chunk that
      // grows back towards that size.
      chunkSizeWarningLimit: 420,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              // Groups also capture their dependencies, so Vue gets its own
              // group first; otherwise it is pulled into i18n-runtime.
              { name: 'vue', test: /node_modules[\\/](?:vue|@vue)[\\/]/, priority: 1 },
              // Bonus plugins ride the lazy credential chunks, not the eager
              // gsap chunk that every page downloads at startup.
              {
                name: 'gsap',
                test: /node_modules[\\/]gsap[\\/](?!(?:MorphSVGPlugin|DrawSVGPlugin)\b)/,
              },
              { name: 'ogl', test: /node_modules[\\/]ogl[\\/]/ },
              { name: 'i18n-runtime', test: /node_modules[\\/](?:vue-i18n|@intlify)[\\/]/ },
            ],
          },
        },
      },
    },
    // Vite 8 minifies with Oxc and ignores the esbuild `drop` option that
    // nuxt-security's removeLoggers relies on, so console/debugger stripping
    // is configured on the client minifier directly (server logs stay intact).
    $client: {
      build: {
        rolldownOptions: {
          output: {
            minify: {
              compress: { dropConsole: true, dropDebugger: true },
              mangle: true,
            },
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
    // The legal page is noindex in every locale. The page sets the robots meta
    // tag itself; these rules make the X-Robots-Tag header agree with it and
    // also cover the Markdown copies that AI Ready serves at <path>.md.
    '/legal': { robots: 'noindex, follow' },
    '/legal.md': { robots: 'noindex, follow' },
    '/en/legal': { robots: 'noindex, follow' },
    '/en/legal.md': { robots: 'noindex, follow' },
    '/de/impressum': { robots: 'noindex, follow' },
    '/de/impressum.md': { robots: 'noindex, follow' },
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
    // CSP reports are only parsed and logged. The XSS validator would buffer
    // the whole body, without the handler's size cap, before the handler
    // reads it.
    '/api/csp-report': {
      security: {
        xssValidator: false,
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

  // Fonts are downloaded at build time and self-hosted from /_nuxt/fonts, so
  // the CSP font-src 'self' directive keeps holding at runtime. A failed
  // download fails the production build instead of shipping without fonts.
  fonts: {
    families: [
      { name: 'Space Grotesk', weights: [500, 700], subsets: ['latin', 'latin-ext'] },
      { name: 'IBM Plex Mono', weights: [400, 500], subsets: ['latin', 'latin-ext'] },
    ],
  },

  security: {
    // Own file-based limiter (server/utils/rateLimit.ts) is used instead.
    rateLimiter: false,
    // Its esbuild-based console stripping is a no-op on Vite 8; the client
    // minifier drops console/debugger instead (see vite.$client above).
    removeLoggers: false,
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
    // Serve icons only from the installed collections; never reach out to
    // the public Iconify API at runtime.
    fallbackToApi: false,
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
    // Every /_nuxt/ file name must change whenever its bytes change: the files
    // are cached as immutable and nuxt-security pins their SRI hash, so a
    // stale cached copy under an unchanged name is blocked and the page fails.
    // The entry import map breaks that rule. Chunks import the entry through
    // "#entry", so their [hash] no longer depends on the entry's, yet Vite
    // writes their __vite__mapDeps preload lists after hashing, and those
    // lists name the entry's CSS and its other dependencies. A change that
    // only renames the entry CSS (any edit to the entry or to the Tailwind
    // output) rewrites the page chunks without renaming them. Without the
    // import map every importer hashes the entry's final name again. The
    // trade-off: an entry change also renames every chunk that imports the
    // entry, so returning visitors download those again after such a deploy.
    entryImportMap: false,
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

  // Skew Protection needs old build assets kept between deploys, which the
  // clean Docker build never has, and it adds client polling for little gain
  // on a single-instance site.
  skewProtection: false,

  // AI Ready serves llms.txt and Markdown copies of each page. Its i18n
  // auto-detection rebuilds hreflang alternates from the locale prefix alone
  // and ignores the localized page paths (/en/gallery, /de/impressum), so its
  // Link headers would point at 404 URLs and contradict the hreflang links
  // that useLocaleHead renders. Those links stay the only hreflang source.
  aiReady: {
    autoI18n: false,
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
  // <NuxtImg> keeps the source format unless it gets a `format`, so the
  // components set format="webp" themselves (`image.format` only applies to
  // <NuxtPicture>, which the site does not use).
  image: {
    quality: 80,
    // IPX writes its own Cache-Control (a route rule for /_ipx/** is
    // overwritten). Resized images live under URLs made of the source path and
    // the resize options, so a photo, cover or portrait replaced in public/
    // under the same name keeps every variant URL: they expire after a day,
    // like the /gallery/** sources in routeRules. Revalidating is cheap because
    // IPX answers If-Modified-Since from the source file's mtime with a 304.
    ipx: {
      maxAge: 60 * 60 * 24,
    },
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
