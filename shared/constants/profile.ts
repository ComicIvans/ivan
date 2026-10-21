export const profileName = 'Iván Salido Cobo'
export const profileRepositoryUrl = 'https://github.com/ComicIvans/ivan'

/** Where a social profile link is shown. */
export type SocialPlacement = 'hero' | 'contact' | 'footer'

export interface SocialLink {
  id: string
  /** Brand name, shown as the button label and inside its accessible name. */
  name: string
  url: string
  icon: string
  showIn: readonly SocialPlacement[]
}

/**
 * Public social profiles: rendered by SocialLinks in each placement and used
 * as the Person `sameAs` list.
 */
export const socialLinks: readonly SocialLink[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/ivansalidocobo/',
    icon: 'i-tabler-brand-linkedin',
    showIn: ['hero', 'contact', 'footer'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/ivansalidocobo/',
    icon: 'i-tabler-brand-instagram',
    showIn: ['hero', 'contact', 'footer'],
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/ComicIvans/',
    icon: 'i-tabler-brand-github',
    showIn: ['footer'],
  },
]

export const profileSameAs = socialLinks.map((link) => link.url)
