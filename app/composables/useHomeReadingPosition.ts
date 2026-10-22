import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SECTION_IDS } from '~/utils/sections'

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

/** A section and where its top edge sits in the viewport. */
interface ReadingAnchor {
  id: string
  top: number
}

/** The section being read: the last one whose top has passed the spy's line. */
function readAnchor(): ReadingAnchor | null {
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
function scrollToAnchor(anchor: ReadingAnchor) {
  const section = document.getElementById(anchor.id)
  if (!section) return
  // The section may have shrunk (the pinned projects scene becomes a grid).
  const offset = Math.min(-anchor.top, Math.max(0, section.offsetHeight - 1))
  const top = section.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
}

/**
 * Repeats `align` whenever the page may have moved under it (a ScrollTrigger
 * refresh puts the page back at a recorded pixel offset; content above can
 * still grow or shrink) until the visitor scrolls on their own or `ms` pass.
 * Returns the function that stops it.
 */
function holdPosition(align: () => void, ms: number) {
  const observer = new ResizeObserver(() => align())
  const release = () => {
    window.clearTimeout(timer)
    observer.disconnect()
    ScrollTrigger.removeEventListener('refresh', align)
    for (const type of USER_SCROLL_EVENTS) window.removeEventListener(type, release)
  }
  const timer = window.setTimeout(release, ms)
  align()
  observer.observe(document.documentElement)
  ScrollTrigger.addEventListener('refresh', align)
  for (const type of USER_SCROLL_EVENTS) window.addEventListener(type, release, { passive: true })
  return release
}

/**
 * Keeps the home on the section being read while its GSAP setups rebuild the
 * page around it:
 * - Deep links (/#contacto, the legacy 301 redirects, the language switch,
 *   the navbar pills on another page): the browser or the router scrolls to
 *   the hash while the setups are still settling, a refresh cuts a smooth
 *   scroll short and the projects pin adds height above the later sections.
 *   The page lands on the hash target until the visitor scrolls.
 * - A media condition of the setups flips (the motion tier across a resize,
 *   the reduced-motion setting): GSAP reverts and re-runs every setup at
 *   once, and ScrollTrigger can drop the page to the top on the way (killing
 *   the last trigger of the old layout wipes the scroll position it had
 *   recorded). The section being read goes back to the same place in the
 *   viewport: not the same pixel offset, as the height above it changes.
 */
export function useHomeReadingPosition() {
  let cleanup: (() => void) | null = null

  onMounted(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
    let releaseHold = target
      ? holdPosition(() => target.scrollIntoView({ behavior: 'instant' }), 5000)
      : null

    // Read on every scroll, before anything moves the page: the scrolls GSAP
    // makes while it rebuilds only reach this listener in a later frame.
    let anchor = readAnchor()
    const track = () => {
      anchor = readAnchor()
    }
    window.addEventListener('scroll', track, { passive: true })

    // Every setup re-runs while the browser reports the media change; the
    // page goes back in place in the next animation frame, once they all
    // have, and stays there while the new layout settles.
    let restoreFrame = 0
    const removeMediaCallback = onGsapMediaChange(() => {
      if (restoreFrame || !anchor) return
      const reading = anchor
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = 0
        releaseHold?.()
        releaseHold = holdPosition(() => {
          scrollToAnchor(reading)
          refreshScrollSpy()
        }, 1500)
      })
    })

    cleanup = () => {
      releaseHold?.()
      window.removeEventListener('scroll', track)
      removeMediaCallback()
      cancelAnimationFrame(restoreFrame)
    }
  })

  onBeforeUnmount(() => cleanup?.())
}
