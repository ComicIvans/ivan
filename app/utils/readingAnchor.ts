import { ACTIVE_SECTION_LINE } from '~/composables/useScrollSpy'
import { SECTION_IDS } from '~/utils/sections'

/** A home section and where its top edge sits in the viewport. */
export interface ReadingAnchor {
  id: string
  top: number
}

/** The section being read: the last one whose top has passed the spy's line. */
export function readReadingAnchor(): ReadingAnchor | null {
  const line = window.innerHeight * ACTIVE_SECTION_LINE
  let anchor: ReadingAnchor | null = null
  for (const id of SECTION_IDS) {
    const top = document.getElementById(id)?.getBoundingClientRect().top
    if (top === undefined) continue
    if (!anchor || top <= line) anchor = { id, top }
  }
  return anchor
}

/** Puts the anchor's section back where it was in the viewport. */
export function scrollToReadingAnchor(anchor: ReadingAnchor) {
  const section = document.getElementById(anchor.id)
  if (!section) return
  // The section may have shrunk (the pinned projects scene becomes a grid).
  const offset = Math.min(-anchor.top, Math.max(0, section.offsetHeight - 1))
  const top = section.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
}
