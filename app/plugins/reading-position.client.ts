import type { RouterConfig } from 'nuxt/schema'
// The router options Nuxt builds from nuxt.config, app/router.options and its
// own defaults. Its router plugin reads `scrollBehavior` from this object
// when it scrolls, so a wrapper set here sees every call.
import routerOptions from '#build/router.options.mjs'
import { readReadingAnchor, type ReadingAnchor } from '~/utils/readingAnchor'

const USER_INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

interface ScrollPosition {
  left: number
  top: number
}

/**
 * What the home's useHomeReadingPosition needs from before it mounts:
 * - The position the router restores for a navigation. On back and forward,
 *   vue-router hands the scroll behavior the position it recorded when the
 *   visitor left the entry. It keeps that one in memory: history.state can
 *   hold an older position, or none.
 * - Where the visitor was reading, if they scrolled the server-rendered first
 *   page before it mounted, so the home keeps them there instead of jumping
 *   to the URL hash.
 */
export default defineNuxtPlugin({
  name: 'reading-position',
  setup() {
    const options = routerOptions as RouterConfig
    let restored: { fullPath: string; position: ScrollPosition | null } | null = null
    const scrollBehavior = options.scrollBehavior
    if (scrollBehavior) {
      options.scrollBehavior = (to, from, savedPosition) => {
        restored = { fullPath: to.fullPath, position: savedPosition }
        return scrollBehavior(to, from, savedPosition)
      }
    }

    // Input on the first page starts tracking the section being read, on
    // every scroll, until the home mounts or the visitor moves to another page.
    let onFirstPage = true
    let earlyAnchor: ReadingAnchor | null = null
    const track = () => {
      earlyAnchor = readReadingAnchor()
    }
    const startTracking = () => {
      for (const type of USER_INPUT_EVENTS) {
        window.removeEventListener(type, startTracking, { capture: true })
      }
      track()
      window.addEventListener('scroll', track, { passive: true })
    }
    const stopTracking = () => {
      for (const type of USER_INPUT_EVENTS) {
        window.removeEventListener(type, startTracking, { capture: true })
      }
      window.removeEventListener('scroll', track)
    }
    for (const type of USER_INPUT_EVENTS) {
      window.addEventListener(type, startTracking, { capture: true, passive: true })
    }

    useRouter().beforeEach((to, from) => {
      // `from` matches no route on the initial navigation.
      if (onFirstPage && from.matched.length > 0 && to.path !== from.path) {
        onFirstPage = false
        earlyAnchor = null
        stopTracking()
      }
    })

    return {
      provide: {
        readingPosition: {
          /** The position the router restores for this navigation, if any. */
          takeRestoredScroll(fullPath: string): ScrollPosition | null {
            const record = restored
            restored = null
            return record?.fullPath === fullPath ? record.position : null
          },
          /**
           * Where the visitor was reading when the first page mounts, if they
           * scrolled it before. Ends the tracking either way.
           */
          takeEarlyAnchor(): ReadingAnchor | null {
            stopTracking()
            const anchor = earlyAnchor
            earlyAnchor = null
            return anchor
          },
        },
      },
    }
  },
})
