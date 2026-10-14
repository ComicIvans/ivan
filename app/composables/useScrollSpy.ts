/**
 * Deterministic scroll spy for the anchor navigation. IntersectionObserver
 * only signals WHEN to recompute; pick() decides WHAT is active: the observed
 * section whose top sits closest to (without passing) the activation line.
 * Relying on entry order alone misreports the active section when two
 * sections cross the band at once or a pinned scene stretches one of them.
 */
export function useScrollSpy(sectionIds: Readonly<string[]>) {
  const activeId = useState<string | null>('section-scroll-spy-active', () => null)
  const initialized = useState<boolean>('section-scroll-spy-initialized', () => false)
  const route = useRoute()

  const ACTIVATION_LINE = 0.35 // fraction of viewport height

  const pick = () => {
    const line = window.innerHeight * ACTIVATION_LINE
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
    if (initialized.value) return
    initialized.value = true
    const observer = new IntersectionObserver(() => pick(), {
      rootMargin: '-35% 0px -60% 0px',
      threshold: [0, 1],
    })

    const observeAll = () => {
      observer.disconnect()
      let found = 0
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          observer.observe(el)
          found++
        }
      }
      pick() // initial state (covers deep links landing on a hash)
      return found
    }

    // The consumer (fixed navbar / dot rail) can mount before the page slot
    // renders its sections, so retry across a few frames until they exist.
    let attempts = 0
    const tryObserve = () => {
      if (observeAll() > 0 || attempts >= 20) return
      attempts++
      requestAnimationFrame(tryObserve)
    }
    void nextTick(tryObserve)

    // Sections unmount/remount across route changes while the navbar persists.
    watch(
      () => route.path,
      async () => {
        await nextTick()
        attempts = 0
        tryObserve()
      }
    )

    onBeforeUnmount(() => {
      observer.disconnect()
      initialized.value = false
    })
  })

  return { activeId }
}
