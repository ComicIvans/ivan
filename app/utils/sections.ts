/**
 * The one-page home sections, in page order. The home page renders them from
 * this list, and the navbar, the dot rail, the scroll spy and the credential
 * journey read it too, so adding, removing or reordering a section happens
 * here (plus its `nav.*` label in the locale files and its component in
 * pages/index.vue).
 */
export const SECTIONS = [
  { id: 'inicio', navKey: 'nav.home', icon: 'i-tabler-home' },
  { id: 'experiencia', navKey: 'nav.experience', icon: 'i-tabler-briefcase' },
  { id: 'representacion', navKey: 'nav.representation', icon: 'i-tabler-building-bank' },
  { id: 'proyectos', navKey: 'nav.projects', icon: 'i-tabler-code' },
  { id: 'formacion', navKey: 'nav.training', icon: 'i-tabler-school' },
  { id: 'galeria', navKey: 'nav.gallery', icon: 'i-tabler-photo' },
  { id: 'contacto', navKey: 'nav.contact', icon: 'i-tabler-mail' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map((section) => section.id)
