import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const eventSchema = z.object({
  title: z.string(),
  location: z.string(),
  date: z.string(),
  duration: z.string().optional(),
  description: z.string(),

  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),

  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),

  tags: z.array(z.string()).default([]),

  cover: z
    .object({
      src: z.string(),
      alt: z.string().optional(),
    })
    .optional(),

  photos: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .default([]),

  icon: z.string().optional(),

  draft: z.boolean().default(false),
})

export default defineContentConfig({
  collections: {
    gallery_es: defineCollection({
      type: 'page',
      source: {
        include: 'es/gallery/**/*.md',
        prefix: '/es',
      },
      schema: eventSchema,
    }),

    gallery_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/gallery/**/*.md',
        prefix: '/en',
      },
      schema: eventSchema,
    }),

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
