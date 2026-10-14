export type MotionTier = 'full' | 'lite' | 'static'

/**
 * Capability ladder for every JS-driven effect:
 * - 'full': fine pointer, hover, >=1024px, motion allowed — spotlight, tilt,
 *   magnetic hover, WebGL and text choreography may run.
 * - 'lite': motion allowed but touch/small viewport — short transform/opacity
 *   reveals only.
 * - 'static': prefers-reduced-motion — a designed still composition.
 *
 * All values resolve on the client; during SSR the tier reads as 'lite'.
 * Gate BEHAVIOR with it (never server-rendered markup) to avoid hydration
 * mismatches.
 */
export function useMotionTier() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const largeViewport = useMediaQuery('(min-width: 1024px)')

  return computed<MotionTier>(() => {
    if (reducedMotion.value) return 'static'
    if (finePointer.value && largeViewport.value) return 'full'
    return 'lite'
  })
}
