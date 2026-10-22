export interface GalleryPhoto {
  src: string
  alt?: string
  description?: string
  width?: number
  height?: number
}

/**
 * What the gallery listings need (home teaser, /galeria cards, search).
 * The text fields are already merged for the requested locale, and the date
 * texts are formatted for it on the server.
 */
export interface GalleryEventSummary {
  slug: string
  title: string
  location: string
  /** First day, `YYYY-MM-DD`. */
  date: string
  /** Last day, `YYYY-MM-DD`; equal to `date` for a one-day event. */
  endDate: string
  /** Calendar days from `date` to `endDate`, both included. */
  days: number
  /** Full date or date range ("16–21 de septiembre de 2025"). */
  dateText: string
  /** Month and year of the first day ("septiembre de 2025"). */
  monthText: string
  description: string
  tags: string[]
  cover?: {
    src: string
    alt?: string
  }
  icon?: string
  photoCount: number
}

/** A single event page: the summary plus organizer, links, SEO fields, photos and body. */
export interface GalleryEvent extends GalleryEventSummary {
  /** Who organized the event, for its structured data. */
  organizer?: {
    name: string
    url?: string
  }
  links?: Array<{
    label: string
    url: string
  }>
  seo?: {
    title?: string
    description?: string
  }
  photos: GalleryPhoto[]
  body?: unknown
}

export interface GalleryQueryOptions {
  search?: string
  tags?: string[]
  sortBy?: 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}
