import type { ShallowRef } from 'vue'

/**
 * Magnetic hover: the element eases a few pixels toward the pointer and
 * springs back on leave. Reserved for a single primary CTA — gated to fine
 * pointers on the full motion tier.
 */
export function useMagnet(
  target: Readonly<ShallowRef<HTMLElement | null>>,
  { strength = 6 }: { strength?: number } = {}
) {
  const tier = useMotionTier()

  let rafId = 0
  let currentX = 0
  let currentY = 0
  let targetX = 0
  let targetY = 0

  const tick = () => {
    currentX += (targetX - currentX) * 0.18
    currentY += (targetY - currentY) * 0.18
    const el = target.value
    if (el) {
      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`
    }
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = 0
    }
  }

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (tier.value !== 'full') return
    const el = target.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = (event.clientX - rect.left) / rect.width - 0.5
    const relY = (event.clientY - rect.top) / rect.height - 0.5
    targetX = relX * strength * 2
    targetY = relY * strength * 2
    schedule()
  }

  const onPointerLeave = () => {
    targetX = 0
    targetY = 0
    schedule()
  }

  onMounted(() => {
    const el = target.value
    if (!el) return
    el.addEventListener('pointermove', onPointerMove, { passive: true })
    el.addEventListener('pointerleave', onPointerLeave, { passive: true })
  })

  onBeforeUnmount(() => {
    const el = target.value
    if (el) {
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerLeave)
      el.style.transform = ''
    }
    if (rafId) cancelAnimationFrame(rafId)
  })
}
