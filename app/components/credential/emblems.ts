/**
 * Badge emblems for MorphSVG: every emblem is exactly three stroke sub-paths
 * (a/b/c) on a shared 48x48 viewBox so morphs are always 3<->3. Simple icons
 * park their unused sub-path on an invisible center dot. Keep stroke budgets
 * and winding direction consistent when refining shapes — morph quality
 * depends on it far more than on point counts.
 */
export interface Emblem {
  a: string
  b: string
  c: string
}

const DOT = 'M24 24l0.01 0'

export const emblems = {
  /** Hero: IS monogram */
  monogram: {
    a: 'M16 14 V34',
    b: 'M32 16 c-5 -3 -9 0 -9 3 c0 5 10 4 10 9 c0 4 -5 6 -10 3',
    c: DOT,
  },
  /** Experience: briefcase */
  briefcase: {
    a: 'M12 20 h24 a2 2 0 0 1 2 2 v12 a2 2 0 0 1 -2 2 h-24 a2 2 0 0 1 -2 -2 v-12 a2 2 0 0 1 2 -2 Z',
    b: 'M19 20 v-3 a3 3 0 0 1 3 -3 h4 a3 3 0 0 1 3 3 v3',
    c: 'M21 27 h6',
  },
  /** Representation: delegate shield with laurels */
  shield: {
    a: 'M24 12 l9 4 v8 c0 7 -4 10 -9 12 c-5 -2 -9 -5 -9 -12 v-8 Z',
    b: 'M11 26 c-2 3 -2 6 0 9',
    c: 'M37 26 c2 3 2 6 0 9',
  },
  /** Projects: code brackets */
  brackets: {
    a: 'M19 13 c-4 0 -4 4 -4 6 c0 2 0 4 -3 5 c3 1 3 3 3 5 c0 2 0 6 4 6',
    b: 'M29 13 c4 0 4 4 4 6 c0 2 0 4 3 5 c-3 1 -3 3 -3 5 c0 2 0 6 -4 6',
    c: DOT,
  },
  /** Training: graduation cap */
  cap: {
    a: 'M14 27 v5 c0 3 5 5 10 5 s10 -2 10 -5 v-5',
    b: 'M24 14 l15 7 -15 7 -15 -7 Z',
    c: 'M39 21 v7 c0 2 -1 3 -2 4',
  },
  /** Gallery: camera */
  camera: {
    a: 'M12 19 h6 l3 -4 h6 l3 4 h6 a2 2 0 0 1 2 2 v13 a2 2 0 0 1 -2 2 h-24 a2 2 0 0 1 -2 -2 v-13 a2 2 0 0 1 2 -2 Z',
    b: 'M24 22 a5.5 5.5 0 1 1 -0.01 0 Z',
    c: 'M33 22 h2',
  },
  /** Contact dock: envelope (paper plane is submit-only, see below) */
  envelope: {
    a: 'M11 17 h26 a1 1 0 0 1 1 1 v12 a1 1 0 0 1 -1 1 h-26 a1 1 0 0 1 -1 -1 v-12 a1 1 0 0 1 1 -1 Z',
    b: 'M10 18 l14 10 14 -10',
    c: DOT,
  },
  /** Contact submit reward: paper plane */
  plane: {
    a: 'M39 13 L11 24 l11 4 Z',
    b: 'M39 13 L22 28 l3 8 Z',
    c: 'M8 31 h6',
  },
} as const satisfies Record<string, Emblem>

export type EmblemName = keyof typeof emblems
