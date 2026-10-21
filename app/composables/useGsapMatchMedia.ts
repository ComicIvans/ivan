import gsap from 'gsap'
import type { ShallowRef } from 'vue'

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
    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
        fullMotion:
          '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
        ...extraConditions,
      },
      handler,
      scope.value ?? undefined
    )
  })

  // revert() kills animations AND restores inline styles / pin spacers.
  onUnmounted(() => mm?.revert())
}
