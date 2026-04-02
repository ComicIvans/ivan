export interface GalleryEvent {
  id: string
  path: string
  title: string
  location: string
  date: string
  duration?: string
  description: string
  about?: string
  participation?: string
  links?: Array<{
    label: string
    url: string
  }>
  seo?: {
    title?: string
    description?: string
  }
  tags: string[]
  cover?: {
    src: string
    alt: string
  }
  photos: Array<{
    src: string
    alt?: string
    description?: string
  }>
  icon?: string
  draft?: boolean
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
