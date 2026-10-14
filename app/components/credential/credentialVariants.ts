import type { EmblemName } from './emblems'

/**
 * Single source of truth for the one-page section ids. The home orchestrator,
 * the navbar scroll spy, the dot rail and the credential journey all consume
 * this list; keeping it here avoids drifting copies.
 */
export const SECTION_IDS = [
  'inicio',
  'experiencia',
  'representacion',
  'proyectos',
  'formacion',
  'galeria',
  'contacto',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface CredentialVariant {
  id: SectionId
  face: 'front' | 'back'
  accent: 'ember' | 'amber' | 'blue'
  emblem: EmblemName
  orientation: 'portrait' | 'landscape'
  /** i18n key for the role line under the holder name */
  roleKey: string
  /** i18n key for the badge tier line ("DELEGADO", "DIPLOMA", ...) */
  tierKey?: string
}

export const variantsById: Record<SectionId, CredentialVariant> = {
  inicio: {
    id: 'inicio',
    face: 'front',
    accent: 'ember',
    emblem: 'monogram',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
  },
  experiencia: {
    id: 'experiencia',
    face: 'front',
    accent: 'ember',
    emblem: 'briefcase',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
  },
  representacion: {
    id: 'representacion',
    face: 'front',
    accent: 'amber',
    emblem: 'shield',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
    tierKey: 'credential.delegate',
  },
  proyectos: {
    id: 'proyectos',
    face: 'back',
    accent: 'blue',
    emblem: 'brackets',
    orientation: 'landscape',
    roleKey: 'credential.role.hero',
    tierKey: 'credential.demoPass',
  },
  formacion: {
    id: 'formacion',
    face: 'front',
    accent: 'amber',
    emblem: 'cap',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
    tierKey: 'credential.diploma',
  },
  galeria: {
    id: 'galeria',
    face: 'front',
    accent: 'ember',
    emblem: 'camera',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
    tierKey: 'credential.photoPass',
  },
  contacto: {
    id: 'contacto',
    face: 'back',
    accent: 'ember',
    emblem: 'envelope',
    orientation: 'portrait',
    roleKey: 'credential.role.hero',
  },
}
