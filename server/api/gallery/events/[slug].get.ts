import { createError, getQuery, getRouterParam } from 'h3'
import { fetchGalleryEvent } from '~~/server/utils/gallery'

const GALLERY_MISSING_EVENT_SLUG = 'GALLERY_MISSING_EVENT_SLUG'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: GALLERY_MISSING_EVENT_SLUG,
    })
  }

  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : undefined

  return fetchGalleryEvent(event, locale, slug)
})
