/**
 * Zod schemas for every content collection. content.config.ts builds the
 * Nuxt Content collections from them, and scripts/verify-content.mjs reuses
 * them to fail the build on invalid content (Nuxt Content itself stores a
 * field that breaks its schema as NULL instead of reporting it).
 *
 * This module is also imported by plain Node scripts through native type
 * stripping, so relative imports keep their `.ts` extension and app code must
 * only `import type` from here (zod stays out of the client bundle).
 */
import { z } from 'zod'
import { defaultLocale, siteLocales, type SiteLocaleCode } from '../constants/locales.ts'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const nonBlank = z.string().regex(/\S/, 'must not be empty')

const translationShape = Object.fromEntries(
  siteLocales.map(({ code }) => [code, code === defaultLocale ? nonBlank : nonBlank.optional()])
) as {
  [Code in SiteLocaleCode]: Code extends typeof defaultLocale
    ? typeof nonBlank
    : z.ZodOptional<typeof nonBlank>
}

/**
 * Text shown to visitors: a plain string (the same in every language: names,
 * acronyms, URLs) or one value per locale. Spanish is required and is the
 * fallback for any locale left out.
 */
export const localizedText = z.union([nonBlank, z.strictObject(translationShape)], {
  error: 'expected text, or one text per language (es required, en and de optional)',
})

/** Localized text whose every translation stays within `max` characters. */
const localizedShortText = (max: number) =>
  localizedText.refine(
    (value) =>
      (typeof value === 'string' ? [value] : Object.values(value)).every(
        (text) => text === undefined || text.length <= max
      ),
    `must be at most ${max} characters in every language`
  )

/** Lowercase kebab-case identifier, unique within its list. */
const itemId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'use lowercase-kebab-case')

/** Iconify name: `i-<collection>-<icon>` or `<collection>:<icon>`. */
const iconName = z
  .string()
  .regex(
    /^(i-[a-z0-9]+(-[a-z0-9]+)+|[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*)$/,
    'use an Iconify name such as i-tabler-star or circle-flags:es'
  )

const httpsUrl = z.string().regex(/^https:\/\/[^\s]+$/, 'use an absolute https:// URL')

/** Path of a file served from public/, e.g. /projects/server.webp. */
const publicImagePath = z
  .string()
  .regex(/^\/[\w./-]+\.(avif|webp|png|jpe?g)$/i, 'use a /public path to an image file')

/** `YYYY` or `YYYY-MM`. YAML reads an unquoted year as a number, so accept it too. */
export const yearMonth = z.union([
  z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'use YYYY or YYYY-MM'),
  z.number().int().min(1900).max(2999),
])
export type YearMonth = z.infer<typeof yearMonth>

/** Comparable `YYYY-MM` for a period bound (a bare year spans the whole year). */
export function yearMonthKey(value: YearMonth, bound: 'start' | 'end') {
  const text = String(value)
  if (text.length > 4) return text
  return `${text}-${bound === 'start' ? '01' : '12'}`
}

function uniqueIds(items: Array<{ id: string }>, ctx: z.RefinementCtx) {
  const seen = new Set<string>()
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({ code: 'custom', message: `duplicate id "${item.id}"`, path: [index, 'id'] })
    }
    seen.add(item.id)
  })
}

/** Ordered list of items with unique ids. */
const itemList = <T extends z.ZodType<{ id: string }>>(item: T) =>
  z.array(item).superRefine(uniqueIds)

// ---------------------------------------------------------------------------
// Profile sections (content/profile/*.yml)
// ---------------------------------------------------------------------------

/**
 * Shared period fields. No `end` means the item is still current, unless
 * `current` says otherwise. `periodLabel` replaces the formatted dates for
 * irregular periods ("Since 2019 (annual)").
 */
const periodFields = {
  start: yearMonth.optional(),
  end: yearMonth.optional(),
  current: z.boolean().optional(),
  periodLabel: localizedText.optional(),
}

function checkPeriod(
  item: { start?: YearMonth; end?: YearMonth; periodLabel?: unknown },
  ctx: z.RefinementCtx
) {
  if (item.start === undefined && item.end === undefined && item.periodLabel === undefined) {
    // A current item may omit every date; the period then reads "Ongoing".
    return
  }
  if (
    item.start !== undefined &&
    item.end !== undefined &&
    yearMonthKey(item.start, 'start') > yearMonthKey(item.end, 'end')
  ) {
    ctx.addIssue({ code: 'custom', message: 'end must not be before start', path: ['end'] })
  }
}

/** Short role line for the credential badge (falls back to the title). */
const badgeRole = localizedShortText(28)

export const highlightsSchema = z.strictObject({
  items: itemList(
    z.strictObject({
      id: itemId,
      icon: iconName,
      title: localizedText,
      description: localizedText,
    })
  ),
})

export const experienceSchema = z.strictObject({
  items: itemList(
    z
      .strictObject({
        id: itemId,
        icon: iconName,
        ...periodFields,
        organizationUrl: httpsUrl.optional(),
        title: localizedText,
        badgeRole: badgeRole.optional(),
        organization: localizedText,
        description: localizedText,
      })
      .superRefine(checkPeriod)
  ),
})

export const representationSchema = z.strictObject({
  items: itemList(
    z.strictObject({
      id: itemId,
      icon: iconName,
      date: yearMonth,
      /** Organisation initials stamped on the DELEGADO credential badge. */
      pin: z
        .string()
        .regex(/^[A-Z0-9]{1,4}$/, 'use 1-4 uppercase letters or digits')
        .optional(),
      title: localizedText,
      description: localizedText,
      /** Positions held from this milestone on; they feed the role counters. */
      roles: z.array(localizedText).optional(),
    })
  ),
})

/**
 * Theme colour token, read at runtime as var(--color-<token>). Tailwind only
 * emits the theme variables something references, so app/assets/css/main.css
 * keeps these exact ramps and shades in the build: change both together.
 */
const paletteToken = z
  .string()
  .regex(
    /^(ember|amber|blue)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    'use a theme colour token such as ember-500'
  )

const stackItem = z.strictObject({
  id: itemId,
  name: localizedText,
  icon: iconName,
  /** Icon tile tint on the primary stack cards. */
  tint: z.enum(['ember', 'blue']).optional(),
  description: localizedText.optional(),
})

export const projectsSchema = z.strictObject({
  stack: z.strictObject({
    primary: itemList(stackItem),
    secondary: itemList(stackItem),
  }),
  items: itemList(
    z.strictObject({
      id: itemId,
      icon: iconName,
      url: httpsUrl,
      year: z.number().int().min(1990).max(2999).optional(),
      title: localizedText,
      description: localizedText,
      tags: z.array(localizedText).optional(),
      /** Cover plate gradient, from/to theme colour tokens. */
      accent: z.strictObject({ from: paletteToken, to: paletteToken }).optional(),
      metrics: z
        .array(z.strictObject({ value: z.union([nonBlank, z.number()]), label: localizedText }))
        .optional(),
      /** Real screenshot shown instead of the decorative cover plate. */
      screenshot: z.strictObject({ src: publicImagePath, alt: localizedText }).optional(),
    })
  ),
})

export const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const

export const trainingSchema = z.strictObject({
  academic: itemList(
    z
      .strictObject({
        id: itemId,
        icon: iconName,
        ...periodFields,
        organizationUrl: httpsUrl.optional(),
        title: localizedText,
        badgeRole: badgeRole.optional(),
        organization: localizedText,
        description: localizedText,
      })
      .superRefine(checkPeriod)
  ),
  languages: itemList(
    z.strictObject({
      id: itemId,
      /** BCP 47 language code, used for structured data. */
      code: z.string().regex(/^[a-z]{2,3}$/, 'use a BCP 47 language code such as en'),
      flag: iconName,
      cefr: z.enum(cefrLevels),
      certificate: nonBlank.optional(),
      name: localizedText,
      /** Level text; generated from cefr + certificate when left out. */
      level: localizedText.optional(),
      description: localizedText,
    })
  ),
  certifications: itemList(
    z.strictObject({
      id: itemId,
      icon: iconName,
      title: localizedText,
      description: localizedText,
    })
  ),
  competencies: itemList(
    z.strictObject({
      id: itemId,
      icon: iconName,
      name: localizedText,
    })
  ),
})

/** One entry per content/profile/<file>.yml; the key is the collection suffix. */
export const profileSchemas = {
  highlights: highlightsSchema,
  experience: experienceSchema,
  representation: representationSchema,
  projects: projectsSchema,
  training: trainingSchema,
} as const

export type ProfileSection = keyof typeof profileSchemas
export type LocalizedText = z.infer<typeof localizedText>
export type ProfileHighlights = z.infer<typeof highlightsSchema>
export type ProfileExperience = z.infer<typeof experienceSchema>
export type ProfileRepresentation = z.infer<typeof representationSchema>
export type ProfileProjects = z.infer<typeof projectsSchema>
export type ProfileTraining = z.infer<typeof trainingSchema>
export type CefrLevel = (typeof cefrLevels)[number]

export interface ProfileData {
  highlights: ProfileHighlights['items']
  experience: ProfileExperience['items']
  representation: ProfileRepresentation['items']
  projects: ProfileProjects
  training: ProfileTraining
}

// ---------------------------------------------------------------------------
// Gallery events (content/<locale>/gallery/*.md frontmatter)
// ---------------------------------------------------------------------------

/**
 * Storage shape of a gallery event. Translations reuse it and only set the
 * fields they localize, so nothing here is enforced at build time; the source
 * schemas below are what verify-content checks.
 */
export const galleryEventSchema = z.object({
  title: z.string(),
  location: z.string(),
  date: z.string(),
  endDate: z.string().optional(),
  duration: z.string().optional(),
  description: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  tags: z.array(z.string()).default([]),
  cover: z.object({ src: z.string(), alt: z.string().optional() }).optional(),
  photos: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        description: z.string().optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
      })
    )
    .default([]),
  icon: z.string().optional(),
  draft: z.boolean().default(false),
})

/** Calendar date `YYYY-MM-DD` that actually exists (no 2025-02-30). */
const isoDate = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}, 'use a real calendar date as YYYY-MM-DD')

const galleryImagePath = z
  .string()
  .regex(/^\/gallery\/[\w./-]+\.(avif|webp|png|jpe?g)$/i, 'use a /gallery/<slug>/<file> path')

const galleryLinks = z.array(z.strictObject({ label: nonBlank, url: httpsUrl }))
const gallerySeo = z.strictObject({ title: nonBlank.optional(), description: nonBlank.optional() })

/** Spanish source entry: every required field present and well formed. */
export const galleryEventSourceSchema = z
  .strictObject({
    title: nonBlank,
    location: nonBlank,
    date: isoDate,
    endDate: isoDate.optional(),
    duration: nonBlank.optional(),
    description: nonBlank,
    links: galleryLinks.optional(),
    seo: gallerySeo.optional(),
    tags: z.array(nonBlank).optional(),
    cover: z.strictObject({ src: galleryImagePath, alt: nonBlank.optional() }).optional(),
    photos: z
      .array(
        z.strictObject({
          src: galleryImagePath,
          alt: nonBlank.optional(),
          description: nonBlank.optional(),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
      )
      .optional(),
    icon: iconName.optional(),
    draft: z.boolean().optional(),
  })
  .superRefine((event, ctx) => {
    if (event.endDate && event.endDate < event.date) {
      ctx.addIssue({
        code: 'custom',
        message: 'endDate must not be before date',
        path: ['endDate'],
      })
    }
    const seen = new Set<string>()
    event.photos?.forEach((photo, index) => {
      if (seen.has(photo.src)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate photo "${photo.src}"`,
          path: ['photos', index, 'src'],
        })
      }
      seen.add(photo.src)
    })
  })

/**
 * Translated entry: only the fields it localizes. Dates, sizes and the photo
 * list itself come from the Spanish entry; photos are matched by `src`.
 */
export const galleryEventTranslationSchema = z.strictObject({
  title: nonBlank.optional(),
  location: nonBlank.optional(),
  duration: nonBlank.optional(),
  description: nonBlank.optional(),
  links: galleryLinks.optional(),
  seo: gallerySeo.optional(),
  tags: z.array(nonBlank).optional(),
  cover: z.strictObject({ src: galleryImagePath, alt: nonBlank.optional() }).optional(),
  photos: z
    .array(
      z.strictObject({
        src: galleryImagePath,
        alt: nonBlank.optional(),
        description: nonBlank.optional(),
      })
    )
    .optional(),
  draft: z.boolean().optional(),
})
