const handlers = new WeakMap<HTMLElement, (event: PointerEvent) => void>()

/**
 * v-spotlight: marks an element as a cursor-lit card. Pointer coordinates are
 * written as --spot-x/--spot-y via the CSSOM (not style attributes), so it
 * stays compatible with a strict CSP. The visual gate (fine pointer, hover,
 * reduced motion) lives in the .spotlight-card CSS.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement>('spotlight', {
    getSSRProps: () => ({}),
    mounted(el) {
      el.classList.add('spotlight-card')

      const onPointerMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
        el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
      }

      handlers.set(el, onPointerMove)
      el.addEventListener('pointermove', onPointerMove, { passive: true })
    },
    unmounted(el) {
      const handler = handlers.get(el)
      if (handler) {
        el.removeEventListener('pointermove', handler)
        handlers.delete(el)
      }
    },
  })
})
