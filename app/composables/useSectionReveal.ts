import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ShallowRef } from 'vue'

/**
 * Staggered scroll-in for every `selector` element inside `scope`.
 *
 * ScrollTrigger.batch resolves selector strings GLOBALLY (context scoping only
 * applies to tween targets), so the elements are collected by hand from the
 * scope — otherwise every section's call would grab every `.reveal-item` on
 * the page and stack duplicate triggers.
 */
export function useSectionReveal(
  scope: Readonly<ShallowRef<HTMLElement | null>>,
  selector = '.reveal-item'
) {
  useGsapMatchMedia(scope, (ctx) => {
    const items = scope.value ? Array.from(scope.value.querySelectorAll(selector)) : []
    if (!items.length) return

    if (ctx.conditions?.reduceMotion) {
      gsap.set(items, { autoAlpha: 1 })
      return
    }

    gsap.set(items, { autoAlpha: 0, y: 32 })
    ScrollTrigger.batch(items, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }),
    })
  })
}
