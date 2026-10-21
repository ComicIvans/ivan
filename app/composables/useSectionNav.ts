import type { SectionId } from '~/utils/sections'

/**
 * In-page navigation to a home section. Links (navbar, dot rail) let the
 * router scroll to their hash and call `arrive`; buttons call `goTo`, which
 * scrolls as well. Either way the credential badge goes straight to the
 * target instead of reprinting for every section on the way, and keyboard
 * focus moves to the section heading once the scroll is under way.
 */
export function useSectionNav() {
  const journey = useCredentialJourney()

  function arrive(id: SectionId) {
    const section = document.getElementById(id)
    if (!section) return
    journey.jumpTo(id)
    window.setTimeout(() => {
      const heading = section.querySelector<HTMLElement>('h1, h2')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }, 350)
  }

  function goTo(id: SectionId) {
    const section = document.getElementById(id)
    if (!section) return
    arrive(id)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return { arrive, goTo }
}
