import gsap from 'gsap'
import type { ShallowRef } from 'vue'

const mediaChangeCallbacks = new Set<() => void>()

/**
 * Calls `callback` whenever a media condition of a mounted GSAP setup flips
 * (a resize across a breakpoint, the reduced-motion setting changing). GSAP
 * then reverts and re-runs the setups, synchronously, and ScrollTrigger can
 * lose the scroll position on the way. Returns a function that removes the
 * callback.
 */
export function onGsapMediaChange(callback: () => void) {
  mediaChangeCallbacks.add(callback)
  return () => {
    mediaChangeCallbacks.delete(callback)
  }
}

/**
 * Runs GSAP setup after mount inside gsap.matchMedia() and reverts everything
 * on unmount. The handler receives context.conditions booleans (isDesktop,
 * isMobile, fullMotion, reduceMotion), plus any `extraConditions` a component
 * needs for itself; matchMedia re-runs the handler whenever one of them flips.
 * Selector text is scoped to `scope`, so '.card' cannot leak into sibling
 * components.
 */
export function useGsapMatchMedia(
  scope: Readonly<ShallowRef<HTMLElement | null>>,
  handler: gsap.ContextFunc,
  extraConditions: Record<string, string> = {}
) {
  let mm: gsap.MatchMedia | undefined

  onMounted(() => {
    mm = gsap.matchMedia(scope.value ?? undefined)
    // isDesktop and isMobile always match one way or the other, so the
    // handler runs again after every flip: every run but the first is one.
    let setUp = false
    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
        fullMotion:
          '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
        ...extraConditions,
      },
      (context, contextSafe) => {
        if (setUp) for (const callback of mediaChangeCallbacks) callback()
        setUp = true
        return handler(context, contextSafe)
      },
      scope.value ?? undefined
    )
  })

  // revert() kills animations AND restores inline styles / pin spacers.
  onUnmounted(() => mm?.revert())
}
