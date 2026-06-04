import type { CSSProperties, Ref } from 'vue'

const createIndicatorStyle = (
  container: HTMLElement | null,
  activeItem: HTMLElement | null
): Partial<CSSProperties> | null => {
  if (!container || !activeItem) {
    return null
  }

  const containerRect = container.getBoundingClientRect()
  const activeItemRect = activeItem.getBoundingClientRect()

  return {
    width: `${activeItemRect.width}px`,
    height: `${activeItemRect.height}px`,
    transform: `translate3d(${activeItemRect.left - containerRect.left}px, ${activeItemRect.top - containerRect.top}px, 0)`,
  }
}

/**
 * Drives the sliding "active tab" pill: tracks per-tab element refs and computes
 * the indicator's position/size relative to its container. Used by both the
 * desktop and mobile nav so the geometry logic lives in one place.
 */
export function useActiveTabIndicator(activeBasePath: Ref<string | null>) {
  const containerRef = ref<HTMLElement | null>(null)
  const tabRefs = new Map<string, HTMLElement>()
  const indicatorStyle = ref<Partial<CSSProperties> | null>(null)

  const setTabRef = (basePath: string, element: Element | null) => {
    if (element instanceof HTMLElement) {
      tabRefs.set(basePath, element)
      return
    }

    tabRefs.delete(basePath)
  }

  const update = async () => {
    await nextTick()
    const active = activeBasePath.value
    indicatorStyle.value = active
      ? createIndicatorStyle(containerRef.value, tabRefs.get(active) ?? null)
      : null
  }

  return { containerRef, setTabRef, indicatorStyle, update }
}
