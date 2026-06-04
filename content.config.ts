import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { siteLocales } from './shared/constants/locales'

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

// One gallery collection per locale, generated from siteLocales so adding a
// locale requires no change here.
const galleryCollections = Object.fromEntries(
  siteLocales.map(({ code }) => [
    `gallery_${code}`,
    defineCollection({
      type: 'page',
      source: {
        include: `${code}/gallery/**/*.md`,
        prefix: `/${code}`,
      },
      schema: eventSchema,
    }),
  ])
)

export default defineContentConfig({
  collections: galleryCollections,
})
