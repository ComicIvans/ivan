import { useMediaQuery } from '@vueuse/core'

/**
 * True only on desktop-class devices with a fine pointer and hover, and when the
 * user has not requested reduced motion. Single source of truth for pointer-driven
 * effects (shared by LayoutShell and CursorGlow). SSR-safe (false on the server).
 */
export function useDesktopPointerSupport() {
  const isDesktopPointer = useMediaQuery(
    '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
  )
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return computed(() => isDesktopPointer.value && !prefersReducedMotion.value)
}
