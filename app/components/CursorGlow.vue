<script setup lang="ts">
const glowRef = ref<HTMLElement | null>(null)

let rafId = 0
let mediaQuery: MediaQueryList | null = null
let reducedMotionQuery: MediaQueryList | null = null
let currentX = 0
let currentY = 0
let nextX = 0
let nextY = 0

const setGlowVisible = (visible: boolean) => {
  if (!glowRef.value) {
    return
  }

  glowRef.value.style.opacity = visible ? '1' : '0'
}

const renderGlow = () => {
  if (!glowRef.value) {
    rafId = 0
    return
  }

  currentX += (nextX - currentX) * 0.14
  currentY += (nextY - currentY) * 0.14

  glowRef.value.style.setProperty('--glow-x', `${currentX}px`)
  glowRef.value.style.setProperty('--glow-y', `${currentY}px`)

  const shouldContinue = Math.abs(nextX - currentX) > 0.5 || Math.abs(nextY - currentY) > 0.5

  if (shouldContinue) {
    rafId = window.requestAnimationFrame(renderGlow)
    return
  }

  currentX = nextX
  currentY = nextY
  glowRef.value.style.setProperty('--glow-x', `${currentX}px`)
  glowRef.value.style.setProperty('--glow-y', `${currentY}px`)
  rafId = 0
}

const queueRender = () => {
  if (rafId) {
    return
  }

  rafId = window.requestAnimationFrame(renderGlow)
}

const updateGlowAvailability = () => {
  const isEnabled = Boolean(mediaQuery?.matches) && !reducedMotionQuery?.matches

  if (!glowRef.value) {
    return
  }

  glowRef.value.hidden = !isEnabled

  if (!isEnabled) {
    setGlowVisible(false)
  }
}

const handlePointerMove = (event: PointerEvent) => {
  if (!glowRef.value || glowRef.value.hidden) {
    return
  }

  nextX = event.clientX
  nextY = event.clientY

  if (!currentX && !currentY) {
    currentX = nextX
    currentY = nextY
  }

  setGlowVisible(true)
  queueRender()
}

const handlePointerLeave = () => {
  setGlowVisible(false)
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    setGlowVisible(false)
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  mediaQuery.addEventListener('change', updateGlowAvailability)
  reducedMotionQuery.addEventListener('change', updateGlowAvailability)

  updateGlowAvailability()

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerdown', handlePointerMove, { passive: true })
  window.addEventListener('blur', handlePointerLeave)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  document.documentElement.addEventListener('mouseleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateGlowAvailability)
  reducedMotionQuery?.removeEventListener('change', updateGlowAvailability)

  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerdown', handlePointerMove)
  window.removeEventListener('blur', handlePointerLeave)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.documentElement.removeEventListener('mouseleave', handlePointerLeave)

  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
})
</script>

<template>
  <div ref="glowRef" class="pointer-glow" aria-hidden="true" hidden />
</template>
