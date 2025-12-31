import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Common schema for gallery events
const eventSchema = z.object({
  // Required fields
  title: z.string(),
  location: z.string(),
  date: z.string(), // Event date (YYYY-MM-DD)
  duration: z.string().optional(), // E.g. "3 days", "1 week"
  description: z.string(),

  // Related links
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),

  // SEO
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),

  // Tags for filtering
  tags: z.array(z.string()).default([]),

  // Cover image
  cover: z
    .object({
      src: z.string(),
      alt: z.string().optional(), // Alt optional, auto-generated if not specified
    })
    .optional(),

  // Photo gallery
  photos: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .default([]),

  // Icon to display in the list
  icon: z.string().optional(),

  // Publication status
  draft: z.boolean().default(false),
})

export default defineContentConfig({
  collections: {
    // Spanish events collection (default language)
    gallery_es: defineCollection({
      type: 'page',
      source: {
        include: 'es/gallery/**/*.md',
        prefix: '/es',
      },
      schema: eventSchema,
    }),

    // English events collection
    gallery_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/gallery/**/*.md',
        prefix: '/en',
      },
      schema: eventSchema,
    }),

    // German events collection
    gallery_de: defineCollection({
      type: 'page',
      source: {
        include: 'de/gallery/**/*.md',
        prefix: '/de',
      },
      schema: eventSchema,
    }),
  },
})
