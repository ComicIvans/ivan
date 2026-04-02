import { getQuery } from 'h3'
import { fetchGalleryEvents } from '~~/server/utils/gallery'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = typeof query.locale === 'string' ? query.locale : undefined

  return fetchGalleryEvents(event, locale)
})
