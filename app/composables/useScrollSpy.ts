/** Id of the home section currently being read; null off the home. */
export const useActiveSectionId = () =>
  useState<string | null>('section-scroll-spy-active', () => null)

/**
 * Where the reading line sits, as a fraction of the viewport height from the
 * top: the active section is the last one whose top has passed it.
 */
export const ACTIVE_SECTION_LINE = 0.35

// pick() of the mounted spy (there is one for the whole app).
let pickActiveSection: (() => void) | null = null

/**
 * Re-derives the active section now. For moves that may cross no observed
 * band, such as putting the page back in place after a layout rebuild.
 */
export function refreshScrollSpy() {
  pickActiveSection?.()
}

/**
 * Deterministic scroll spy for the anchor navigation. IntersectionObserver
 * only signals WHEN to recompute; pick() decides WHAT is active: the observed
 * section whose top sits closest to (without passing) the activation line.
 * Relying on entry order alone misreports the active section when two
 * sections cross the band at once or a pinned scene stretches one of them.
 */
export function useScrollSpy(sectionIds: Readonly<string[]>) {
  const activeId = useActiveSectionId()
  const initialized = useState<boolean>('section-scroll-spy-initialized', () => false)
  const nuxtApp = useNuxtApp()

  const pick = () => {
    const line = window.innerHeight * ACTIVE_SECTION_LINE
    let best: string | null = null
    let bestDist = Infinity
    let anyFound = false
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (!el) continue
      anyFound = true
      const top = el.getBoundingClientRect().top
      const dist = Math.abs(top - line)
      if (top <= line + 1 && dist < bestDist) {
        bestDist = dist
        best = id
      }
    }
    // Above the first section: fall back to it. No sections on this route: null.
    activeId.value = best ?? (anyFound ? (sectionIds[0] ?? null) : null)
  }

  onMounted(() => {
    // One observer for the whole app: the persistent navbar owns it and the
    // other consumers (dot rail) only read the shared state.
    if (initialized.value) return
    initialized.value = true
    pickActiveSection = pick
    const observer = new IntersectionObserver(() => pick(), {
      rootMargin: '-35% 0px -60% 0px',
      threshold: [0, 1],
    })

    const observeAll = () => {
      observer.disconnect()
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      }
      pick() // initial state (covers deep links landing on a hash)
    }

    observeAll()
    // Sections unmount and remount across route changes while the navbar
    // persists; page:finish fires once the new page is in the DOM, also
    // after a fallback page transition has swapped the old page out.
    const removePageHook = nuxtApp.hook('page:finish', () => {
      requestAnimationFrame(observeAll)
    })
    // A resize can move the sections without any band crossing.
    window.addEventListener('resize', pick, { passive: true })

    onBeforeUnmount(() => {
      observer.disconnect()
      removePageHook()
      window.removeEventListener('resize', pick)
      pickActiveSection = null
      initialized.value = false
    })
  })

  return { activeId }
}
