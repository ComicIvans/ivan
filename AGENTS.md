# Iván Portfolio — Agent Instructions

## Project Overview

This repository contains the personal website and portfolio for **Iván Salido Cobo**.

Goals:

- A fast, accessible, SEO-friendly public site.
- A multilingual presentation of Iván's profile, work, education, representation roles, and contact details.
- A maintainable gallery workflow based on Markdown content with stable locale fallback behavior.

Current scope includes:

- Public pages for home, experience, projects, training, representation, contact, and legal information.
- A multilingual gallery powered by Nuxt Content.
- A contact form delivered through SMTP.
- Docker-based deployment for local and VPS environments.

---

## Tech Stack

- **Framework:** Nuxt 4 + Nitro.
- **UI:** Nuxt UI + Tailwind CSS.
- **Content:** `@nuxt/content`.
- **i18n:** `@nuxtjs/i18n` with JSON locale files.
- **SEO:** `@nuxtjs/seo` + OG image generation.
- **Images:** `@nuxt/image`.
- **Email:** Nodemailer.

---

## Repository Structure

- `app/` — Vue components, layouts, pages, composables, utilities, and CSS.
- `content/` — Gallery content grouped by locale.
- `i18n/locales/` — Public translation message files.
- `server/api/` — Nitro route handlers.
- `server/utils/` — Shared server helpers and runtime config access.
- `shared/` — Runtime-safe shared utilities.
- `public/` — Static assets served as-is.
- `modules/` — Local Nuxt module patches or adjustments.

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
- Prefer shared locale helpers such as `app/utils/locales.ts`, `app/utils/nuxtUiLocale.ts`, and the existing gallery composables instead of scattering raw locale checks.

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

- Keep page-level SEO in composables or page setup blocks.
- Public metadata should reflect the current locale where applicable.
- Avoid shipping duplicate or conflicting canonical/OG metadata.

---

## Gallery Content Conventions

- Gallery content lives in `content/<locale>/gallery/**`.
- Spanish content is the base entry; translated entries may override only the fields they actually localize.
- Do not replace a valid Spanish value with an empty localized value.
- Image alt text should stay descriptive for third parties, not for internal notes.

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
- Runtime config parsing should go through shared helpers in `shared/utils/config.ts` and `server/utils/runtimeConfig.ts`.
- Optional integrations should fail closed rather than partially misconfigure themselves.

---

## Frontend & Motion Conventions

- Preserve the existing visual language: a single warm "light" accent system
  (custom `ember` primary ramp, amber and blue as secondary accents) defined
  as tokens in `app/assets/css/main.css` — never hard-code raw accent colors.
- Do not add animation for its own sake; one signature effect per page.
- Typography: `.type-display` (Space Grotesk) for display headings,
  `.type-kicker` / `font-mono` (IBM Plex Mono) for kickers, dates and
  counters; body text stays on the default sans.
- Shared building blocks (prefer these over bespoke CSS):
  - Components: `PageHeader`, `SectionHeader`, `MarqueeStrip`, `StatCounter`,
    `LanguageLevel`.
  - Classes: `surface-glass`, `reveal` (scroll-driven entrance),
    `motion-card`/`motion-card-strong`/`motion-link-card`/`motion-link-media`
    (hover lift), `float-y`, `aurora-ring`, `ink-gradient`.
  - Directive `v-spotlight` for cursor-lit cards.
  - Composables: `useGsapMatchMedia` (scoped GSAP with reduced-motion
    conditions), `useMotionTier` (`full`/`lite`/`static` capability ladder),
    `useMagnet` (reserved for a single primary CTA).
- GSAP (ScrollTrigger + SplitText) is the only JS animation engine; register
  nothing else. Prefer CSS scroll-driven animations (`animation-timeline`)
  behind `@supports` for simple reveals.
- Respect `prefers-reduced-motion` in every effect: the reduced-motion state
  must look finished, not disabled. JS effects self-gate via `useMotionTier`.
- WebGL is limited to lazily-mounted, `<ClientOnly>` backgrounds gated on the
  `full` motion tier + WebGL2 support, with a CSS gradient fallback. No
  Draco/KTX2 loaders (they would require CSP changes).
- Keep animations subtle and content-supporting.

---

## Development Workflow

Common commands:

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`

Deployment commands:

- `pnpm deploy:local`
- `pnpm deploy`

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
- Added animations still respect reduced-motion users.
- SEO metadata remains coherent after the change.
- Runtime configuration is validated through shared helpers when relevant.
- Lint passes.
- Typecheck passes.
