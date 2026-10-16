import { defineContentConfig, defineCollection } from '@nuxt/content'
import { siteLocales } from './shared/constants/locales'
import { galleryEventSchema, profileSchemas } from './shared/content/schemas'

// One gallery collection per locale, generated from siteLocales so adding a
// locale requires no change here. Events live directly in the gallery folder:
// the file name is the URL slug, so subfolders are not read.
const galleryCollections = Object.fromEntries(
  siteLocales.map(({ code }) => [
    `gallery_${code}`,
    defineCollection({
      type: 'page',
      source: {
        include: `${code}/gallery/*.md`,
        prefix: `/${code}`,
      },
      schema: galleryEventSchema,
    }),
  ])
)

// Profile sections: one data collection per content/profile/<section>.yml,
// with every language side by side in the same file.
const profileCollections = Object.fromEntries(
  Object.entries(profileSchemas).map(([section, schema]) => [
    `profile_${section}`,
    defineCollection({
      type: 'data',
      source: `profile/${section}.yml`,
      schema,
    }),
  ])
)

export default defineContentConfig({
  collections: {
    ...galleryCollections,
    ...profileCollections,
  },
})
