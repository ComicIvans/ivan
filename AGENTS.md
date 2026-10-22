# Iván Portfolio — Agent Instructions

## Project Overview

This repository contains the personal website and portfolio for **Iván Salido Cobo**.

Goals:

- A fast, accessible, SEO-friendly public site.
- A multilingual presentation of Iván's profile, work, education, representation roles, and contact details.
- A maintainable gallery workflow based on Markdown content with stable locale fallback behavior.

Current scope includes:

- A one-page home (`app/pages/index.vue`) whose sections are, in order: `inicio` (hero), `experiencia`, `representacion`, `proyectos`, `formacion`, `galeria` and `contacto` (the contact form). The former standalone pages (`/experiencia`, `/en/projects`, `/de/kontakt`…) answer a 301 to their home section (`routeRules` in `nuxt.config.ts`).
- A multilingual gallery powered by Nuxt Content: `/galeria`, `/en/gallery`, `/de/galerie` and one page per event.
- A legal page: `/legal`, `/en/legal`, `/de/impressum`.
- A contact form delivered through SMTP.
- Docker-based deployment for local and VPS environments.

`CONTENIDO.md` (Spanish) is the owner's guide to editing content: where each piece lives, how to add items, the gallery workflow and the `pnpm verify` error messages. Keep it in step with the content model.

---

## Tech Stack

- **Framework:** Nuxt 4 + Nitro.
- **UI:** Nuxt UI + Tailwind CSS.
- **Content:** `@nuxt/content`.
- **i18n:** `@nuxtjs/i18n` with JSON locale files.
- **SEO:** `@nuxtjs/seo` + OG image generation.
- **Images:** `@nuxt/image`.
- **Motion:** GSAP (see Frontend & Motion Conventions).
- **Email:** Nodemailer.

---

## Repository Structure

- `app/` — Vue components, layouts, pages, composables, utilities, and CSS.
  - `app/pages/` — `index.vue` (the one-page home), `galeria/` (list and event pages), `legal.vue`.
  - `app/components/sections/` — one component per home section (`SectionHero`, `SectionExperience`, …).
  - `app/components/credential/` — the traveling credential badge (see below).
  - `app/components/content/` — MDC components for gallery Markdown (`::event-about`, `::event-participation`).
  - `app/utils/sections.ts` — `SECTIONS`, the single ordered list of home sections.
- `content/` — Profile data (`content/profile/*.yml`) and gallery content grouped by locale.
- `i18n/locales/` — Public translation message files (UI chrome).
- `server/api/` — Nitro route handlers (`/api/profile`, `/api/gallery/*`, `/api/contact`, `/api/csp-report`, `/api/health`, the sitemap source).
- `server/utils/` — Shared server helpers and runtime config access.
- `shared/` — Runtime-safe shared utilities, constants (locales, social links, theme) and the content schemas (`shared/content/schemas.ts`).
- `scripts/` — `pnpm verify` checks and `pnpm gallery:add`.
- `public/` — Static assets served as-is. `public/gallery/` is not in git (see Gallery Content Conventions).
- `modules/` — Local Nuxt module patches or adjustments.
- `docs/` — Operator notes (recommended nginx vhost).

### Home Sections

`SECTIONS` in `app/utils/sections.ts` drives the home: `pages/index.vue` renders it in order, and the navbar (`SiteNavBar`), the dot rail (`SectionDotRail`), the scroll spy (`useScrollSpy`), the locale switcher and the credential layer read it. To add, remove or reorder a section, change that list, its `nav.*` label in the three locale files, its component in the `sectionComponents` record of `pages/index.vue` and its badge variant in `credential/credentialVariants.ts`; both records are typed by `SectionId`, so a missing entry is a type error. The section ids are also the URL hashes, so keep them stable.

The home hides the layout masthead (`definePageMeta({ masthead: false })`) because its hero carries the portrait and name; the gallery, legal and error pages keep it.

---

## Language & Content Rules

### Code vs UI Text

- **All code and code comments should be written in English.**
- Public UI text must be useful to end users. Do not add placeholder copy, filler labels, or explanatory text aimed only at the developer.

### Public Site i18n

- All public user-facing text must go through Nuxt i18n or locale-aware content selection.
- Supported locales today:
  - **Spanish (`es`)**: default and fallback.
  - **English (`en`)**
  - **German (`de`)**
- Locale-specific gallery content must keep Spanish as the source of truth and fallback.
- vue-i18n falls back to Spanish (`i18n/i18n.config.ts`), but every key must still exist in all three files (`pnpm verify:i18n`).
- In i18n messages `|` separates plural forms, `{x}` is a placeholder and `@` starts a linked message; write literal characters as `{'|'}`, `{'{'}`, `{'}'}` and `{'@'}`.
- Prefer shared locale helpers such as `app/utils/locales.ts`, `app/utils/nuxtUiLocale.ts`, and the existing gallery composables instead of scattering raw locale checks.
- The language cookie (`i18n_redirected`) is written only by the language switcher (`HeaderLocaleSwitcher`). `@nuxtjs/i18n` runs with `detectBrowserLanguage.useCookie: false`, so page views and the browser-language redirect on `/` store nothing; the module still reads the cookie to open `/` in the chosen language. The legal page states exactly this, so change both together.

### Emails

- Contact emails can remain **Spanish-only by design** unless the feature explicitly requires localized email templates.
- Keep outbound email copy short, practical, and safe for plain-text clients.

### Public Copy Outside JSON Messages

- Legal copy, gallery Markdown, and page-specific public text must remain coherent with the active locale and stable Spanish fallback behavior.
- Do not introduce hard-coded copy in components when the content belongs in locale files or content documents.

---

## Engineering Principles

### Keep It Simple

- Prefer the simplest working solution.
- Avoid abstractions unless they reduce duplication or configuration risk.
- Keep changes small, readable, and easy to maintain.

### UI: Prefer Nuxt UI

- Use Nuxt UI components whenever possible.
- Use Tailwind for layout and restrained visual adjustments, not to build a second component system.
- Reuse the shared motion utilities in `app/assets/css/main.css` when adding hover or entrance effects.

### Accessibility

- Use semantic HTML first.
- Keep keyboard navigation and visible focus states intact.
- Provide meaningful alt text for images and gallery content.
- Respect `prefers-reduced-motion` when introducing or adjusting animations.

### SEO and Structured Data

- Keep page-level SEO in composables or page setup blocks (`usePageSeo`).
- Public metadata should reflect the current locale where applicable.
- Avoid shipping duplicate or conflicting canonical/OG metadata.

---

## Gallery Content Conventions

- Gallery content lives in `content/<locale>/gallery/*.md` (flat: the file name is the slug).
- Spanish content is the base entry; translated entries may override only the fields they actually localize. The server merges them (`server/utils/gallery.ts`).
- Translated photos are matched by `src` and carry only `alt`/`description`; order and sizes come from Spanish.
- Events have `date` and optional `endDate` (`YYYY-MM-DD`); the displayed duration is derived from them.
- Every Spanish entry names its `organizer` (`name` and `url`) for the Event JSON-LD; translations may localize only `organizer.name`. Both fields are required because the schema.org resolver otherwise fills them with the site owner and the site's own address.
- Photos are published as WebP through `pnpm gallery:add` (originals stay in the ignored `gallery-src/`). `public/gallery/` is ignored too: the images reach production only through the local Docker build context, so `verify:gallery` runs locally and not in CI.
- Do not replace a valid Spanish value with an empty localized value.
- Image alt text should stay descriptive for third parties, not for internal notes.

---

## Profile Content Conventions

- Profile sections live in `content/profile/<section>.yml` (`highlights`, `experience`, `representation`, `projects`, `training`), one Nuxt Content data collection each, validated by the zod schemas in `shared/content/schemas.ts`.
- Text fields are a plain string when identical in every language, or `{ es, en, de }` with `es` required; a missing translation falls back to Spanish.
- Facts are typed fields, never copy: dates as `YYYY` / `YYYY-MM` (`start`/`end`, no `end` = current), Iconify names, CEFR levels, tags, accents (theme tokens), URLs.
- Links are data too: `showLink: true` on an experience role shows its `organizationUrl` as a visible link, a project's optional `repository` (GitHub URL) adds a "GitHub" link, and `current: true` on a representation milestone makes its date read "May 2026 – Present".
- `topics` in `highlights.yml` names subjects that only appear in prose (the degree, student representation) for the Person JSON-LD `knowsAbout`.
- Components read the data through `useProfile()`, which resolves the locale and derives counters, the current role and studies, years active and the badge role lines. Do not hard-code profile facts or id maps in components.
- The Person JSON-LD is derived in `app.vue` through `useLoadedProfile()`, the same view without a request of its own: it fills in once the home has loaded the profile, so other pages emit the base Person only and keep the profile out of their payload.
- A page that renders profile sections awaits `loadProfile()` in its setup (see `app/pages/index.vue`), so after a client-side navigation the sections mount with their content and GSAP setups and hash scrolling measure the final layout.
- `/api/profile` formats the dates for every locale on the server; the client only picks the right string, so SSR and hydration print the same month names.
- Project accents are `ember`/`amber`/`blue` shade tokens; `main.css` keeps those ramps in the build. Extend both together.
- On the desktop motion tier the projects scene (`SectionProjects.vue`) pins one card row inside a single fixed window, so nothing below its bottom edge can be scrolled or tabbed to. Its cover height (`100svh - 26rem`) and pin floor (`pinFits`, `32rem`) budget about 15rem for the tallest card text in any locale (year, title, description, metrics, tags, links). After lengthening a project's text, tags or metrics, tab through the card links in a 1280x600 window and raise those two values together if a link ends up below the window.
- Section titles and UI words ("Actualidad", "En curso") stay in the i18n JSON files.
- A change to the content model touches `shared/content/schemas.ts`, `scripts/verify-content.mjs` when it needs a check zod cannot express, `useProfile()` and `CONTENIDO.md`.

---

## Server/API Conventions

### Keep Route Handlers Small

`server/api/**` files should mainly:

- Read request data.
- Validate and sanitize untrusted input.
- Use shared runtime config helpers when configuration is required.
- Return a small, stable payload.

If a handler becomes hard to read, extract helpers into `server/utils/`.

### Error Handling

- Use `createError` with the correct status code.
- Keep public error messages concise and safe.
- Log operational details on the server, but do not leak implementation details to the client.

### Configuration

- Prefer `SITE_URL` as the canonical site URL variable.
- `.env` holds what the app reads (dev/build values, and the container's runtime
  settings through the compose `env_file`); `.env.deploy` holds deploy-only settings
  (image build args, VPS, GHCR) read by `deploy.sh` and `deploy-local.sh`. Keep
  deploy secrets out of `.env`.
- Production runs behind a single nginx proxy (`docs/nginx.md`): the app sends the
  security headers itself and trusts only the last `X-Forwarded-For` entry.
- Runtime config parsing should go through shared helpers in `shared/utils/config.ts` and `server/utils/runtimeConfig.ts`.
- Optional integrations should fail closed rather than partially misconfigure themselves.

---

## Frontend & Motion Conventions

### Visual Language

- Preserve the existing visual language: a single warm "light" accent system
  (custom `ember` primary ramp, amber and blue as secondary accents) defined
  as tokens in `app/assets/css/main.css` — never hard-code raw accent colors.
- Typography: `.type-display` (Space Grotesk) for display headings,
  `font-mono` (IBM Plex Mono) for kickers, dates and counters; body text
  stays on the default sans. Both fonts are self-hosted by `@nuxt/fonts`.

### Motion Tiers

`useMotionTier()` is the capability ladder every JS effect gates on:

- `full`: fine pointer with hover, at least 1024px wide, motion allowed. Runs
  the traveling badge and its timeline thread, SplitText, scrubbed parallax,
  the pinned projects scene, WebGL, the cursor glow and magnetic hover.
- `lite`: motion allowed on touch or small screens. Short transform/opacity
  reveals only: no SplitText, pinning, parallax or WebGL.
- `static`: `prefers-reduced-motion`. A designed still composition: the
  reduced-motion state must look finished, not disabled.

The tier resolves on the client (SSR reads `lite`): gate behavior with it,
never server-rendered markup, or hydration breaks. Inside GSAP setups use
`useGsapMatchMedia`, whose conditions (`isDesktop`, `isMobile`, `fullMotion`,
`reduceMotion`) re-run the setup when they flip.

### Signature Effect: the Credential Badge

One signature effect per page; on the home it is the traveling credential
badge, and every other effect supports it. Do not add animation for its own
sake.

- `CredentialLayer.client.vue` mounts on the home only, on the `full` tier,
  one tick after hydration (`LazyCredentialLayer` in `pages/index.vue`). It
  flies one badge between the `CredentialAnchor` docks of the sections,
  reprints it per section (`credentialVariants.ts`), morphs its emblem and
  stamps it when the contact form is sent.
- `useCredentialJourney()` is the shared state (anchors, active section,
  visitor name, pins); `useSectionNav()` keeps the badge in step with in-page
  jumps; `CredentialThread.client.vue` draws the scroll-driven thread of the
  experience and representation timelines (`TimelineSection`, `full` tier
  only) and reports the entry it reaches, whose role the experience badge
  prints.
- Outside the `full` tier there is no traveling badge: only the hero and
  contact sections show a static badge, and the other anchors collapse.
- Every badge is decorative (`aria-hidden`); its information is in the page
  text.
- Do not add decorative extras to the badge (tassel, pin animation, barcode
  sweep, mouse sway, stack chips).

### Animation Engines

GSAP is the animation engine. Use only this approved set and justify anything
new:

- GSAP core, ScrollTrigger and SplitText, registered once in
  `app/plugins/gsap.client.ts`.
- DrawSVGPlugin and MorphSVGPlugin, imported statically and registered at
  module level only inside the lazily loaded, client-only credential
  components (`CredentialLayer`, `CredentialThread`), so they stay out of the
  main bundle.
- `@formkit/auto-animate` (`v-auto-animate`), only for the gallery grid reflow
  when filters change (`app/plugins/auto-animate.client.ts`, with an SSR
  directive stub in `auto-animate.server.ts`). It disables itself under
  reduced motion.
- PhotoSwipe's own transitions for the gallery lightbox.
- `ogl` for the hero Aurora (`components/bits/Aurora.vue`): WebGL only in a
  lazily mounted `<ClientOnly>` background gated on the `full` tier and WebGL2
  support, with a CSS gradient fallback. No Draco/KTX2 loaders (they would
  require CSP changes).

Prefer CSS scroll-driven animations (`animation-timeline`) behind `@supports`
for simple reveals (the `reveal` class).

### Shared Building Blocks

Prefer these over bespoke CSS or new components:

- Layout: `LayoutShell` (navbar, optional masthead, footer, `CursorGlow` on
  the `full` tier), `SiteNavBar` (section tabs and mobile menu),
  `SectionDotRail`, `LayoutHeader` (masthead), `LayoutFooter`, `SocialLinks`
  (links from `shared/constants/profile.ts`).
- Content: `RevealHeading` (home section headings: SplitText words on `full`,
  a fade on `lite`), `PageHeader` (gallery and legal pages), `SectionHeader`,
  `TimelineSection` (experience and representation timelines),
  `MarqueeStrip`, `StatCounter`, `LanguageLevel`.
- Classes: `surface-glass`, `reveal` (scroll-driven entrance),
  `motion-card`/`motion-link-card`/`motion-link-media` (hover lift),
  `float-y`, `aurora-ring`, `ink-gradient`.
- Directive `v-spotlight` for cursor-lit cards (adds `.spotlight-card`; the
  CSS gates it to fine pointers without reduced motion).
- Composables: `useGsapMatchMedia` (scoped GSAP with reduced-motion
  conditions), `useMotionTier`, `useMagnet` (reserved for a single primary
  CTA), `useSectionNav` (in-page jumps to a home section that keep the
  credential badge in step), `useScrollSpy`, `useHomeReadingPosition` (while
  the GSAP setups rebuild the page, holds the home on the hash target after a
  fresh navigation, on the position the router restores after back/forward
  or a reload, and on the section being read when the visitor scrolled
  before the mount or the motion tier changes; the `reading-position` client
  plugin records the restored position and that early scrolling),
  `useProfile`/`loadProfile`,
  `useGalleryEvents`/`loadGalleryEvents`, `useGalleryImages` (alt fallbacks),
  `usePageSeo`.
- GSAP helper `revealOnScroll` (`app/utils/gsapReveal.ts`) for staggered card
  entrances. Entrances fade `opacity`, never `autoAlpha`: `visibility: hidden`
  takes links and buttons out of the tab order until they scroll in.

Keep animations subtle and content-supporting, and respect
`prefers-reduced-motion` in every effect.

---

## Development Workflow

Common commands:

- `pnpm dev`
- `pnpm build` (runs `pnpm verify` first)
- `pnpm preview`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm verify`, which runs:
  - `verify:content`: the profile YAML and the gallery frontmatter against the zod schemas, plus icons that exist, project screenshots on disk, unique slugs, translations that only reference Spanish photos, and warnings for missing translations.
  - `verify:i18n`: the same key tree, ids and placeholders in the three locale files, and no accidental `|`, `@`, `{` or `}`.
  - `verify:gallery`: every gallery image exists with its exact case and every Spanish photo declares its real `width`/`height` (needs `public/gallery/`, so it runs locally only).
- `pnpm gallery:add <slug> [sourceDir] [--cover <file>] [--write] [--force]` converts the originals in `gallery-src/<slug>/` to WebP in `public/gallery/<slug>/` and updates the event's photo list.

CI (`.github/workflows/quality.yml`, on pull requests and pushes to `main`) runs `verify:content`, `verify:i18n`, `lint`, `typecheck` and `nuxt build`.

Deployment commands:

- `pnpm deploy:local`
- `pnpm deploy:vps` (not `pnpm deploy`, which is pnpm's built-in workspace command)

---

## Commit Guidelines

Follow Conventional Commits:

```text
feat: add locale-aware gallery pagination
fix: correct smtp configuration fallback
docs: update portfolio setup guide
refactor: extract runtime config helpers
perf: reduce gallery image payload
```

---

## Change Checklist

- Public text uses i18n or localized content where appropriate.
- Spanish remains the default and fallback locale.
- Added animations stay within the approved engines and motion tiers, and still respect reduced-motion users.
- SEO metadata remains coherent after the change.
- Runtime configuration is validated through shared helpers when relevant.
- Content model changes are reflected in `CONTENIDO.md`.
- `pnpm verify` passes.
- Lint passes.
- Typecheck passes.
