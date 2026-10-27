import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { readReadingAnchor, scrollToReadingAnchor } from '~/utils/readingAnchor'

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

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
 * - Fresh navigations with a hash (/#contacto, the legacy 301 redirects, the
 *   language switch, the navbar pills on another page): the browser or the
 *   router scrolls to the hash while the setups are still settling, a refresh
 *   cuts a smooth scroll short and the projects pin adds height above the
 *   later sections. The page lands on the hash target until the visitor
 *   scrolls.
 * - Back/forward and reloads: the router restores the position it recorded
 *   when the visitor left the page (vue-router saves it on pagehide too, and
 *   Nuxt hands it to scrollBehavior on its first replace), and that position
 *   is held instead of the hash target, as a browser would do natively.
 * - The visitor scrolled the server-rendered page before it mounted: the
 *   section they were reading goes back to where it was in the viewport.
 * - A media condition of the setups flips (the motion tier across a resize,
 *   the reduced-motion setting): GSAP reverts and re-runs every setup at
 *   once, and ScrollTrigger can drop the page to the top on the way (killing
 *   the last trigger of the old layout wipes the scroll position it had
 *   recorded). The section being read goes back to the same place in the
 *   viewport: not the same pixel offset, as the height above it changes.
 * The positions from before the mount come from the reading-position plugin.
 */
export function useHomeReadingPosition() {
  const nuxtApp = useNuxtApp()
  // The navigation that mounts the page.
  const fullPath = useRoute().fullPath
  let cleanup: (() => void) | null = null

  onMounted(() => {
    const { $readingPosition } = nuxtApp
    const early = $readingPosition.takeEarlyAnchor()
    const restored = $readingPosition.takeRestoredScroll(fullPath)
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
    let releaseHold: (() => void) | null = null
    if (early) {
      releaseHold = holdPosition(() => scrollToReadingAnchor(early), 5000)
    } else if (restored) {
      releaseHold = holdPosition(
        () => window.scrollTo({ left: restored.left, top: restored.top, behavior: 'instant' }),
        5000
      )
    } else if (target) {
      releaseHold = holdPosition(() => target.scrollIntoView({ behavior: 'instant' }), 5000)
    }

    // Read on every scroll, before anything moves the page: the scrolls GSAP
    // makes while it rebuilds only reach this listener in a later frame.
    let anchor = readReadingAnchor()
    const track = () => {
      anchor = readReadingAnchor()
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
          scrollToReadingAnchor(reading)
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
