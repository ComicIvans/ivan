import type { SectionId } from '~/utils/sections'

/**
 * A click with a modifier key or another button opens the link elsewhere (a
 * new tab or window): the router leaves this page alone, and so does `arrive`.
 * `defaultPrevented` is not checked: the router link itself cancels plain
 * clicks, possibly before this handler runs.
 */
export function isNewTabClick(event: MouseEvent | undefined) {
  return (
    event !== undefined &&
    (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
  )
}

/**
 * In-page navigation to a home section. Links (navbar, dot rail) let the
 * router scroll to their hash and call `arrive` with their click event;
 * buttons call `goTo`, which scrolls as well. Either way the credential badge
 * goes straight to the target instead of reprinting for every section on the
 * way, and keyboard focus moves to the section heading once the scroll is
 * under way.
 */
export function useSectionNav() {
  const journey = useCredentialJourney()

  function arrive(id: SectionId, event?: MouseEvent) {
    if (isNewTabClick(event)) return
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
