import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Staggered entrance for cards as they scroll into view. Call it inside a
 * GSAP (matchMedia) context, which reverts what it sets; the returned
 * function removes the focus listener.
 *
 * - The cards fade with `opacity`, never `visibility` (autoAlpha): a hidden
 *   link or button drops out of the tab order, and keyboard users would skip
 *   every card the page has not scrolled to yet.
 * - A card that receives focus before its entrance shows at once: focusing
 *   it may scroll it into view short of the trigger line.
 * - When the entrance ends, the card's transform goes back to CSS, so its
 *   hover lift (the `translate` property, which GSAP overrides while it
 *   owns the transform) works again.
 */
export function revealOnScroll(container: HTMLElement, cards: HTMLElement[]): () => void {
  if (!cards.length) return () => {}

  gsap.set(cards, { opacity: 0, y: 32 })
  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'transform',
      }),
  })

  const onFocusIn = (event: FocusEvent) => {
    const card = cards.find((element) => element.contains(event.target as Node))
    if (card && Number(gsap.getProperty(card, 'opacity')) < 1) {
      gsap.set(card, { opacity: 1, clearProps: 'transform', overwrite: true })
    }
  }
  container.addEventListener('focusin', onFocusIn)
  return () => container.removeEventListener('focusin', onFocusIn)
}
