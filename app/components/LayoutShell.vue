<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const CursorGlow = defineAsyncComponent(() => import('~/components/CursorGlow.vue'))

const showCursorGlow = ref(false)

let desktopPointerQuery: MediaQueryList | null = null
let reducedMotionQuery: MediaQueryList | null = null

const updateCursorGlowVisibility = () => {
  showCursorGlow.value = Boolean(desktopPointerQuery?.matches) && !reducedMotionQuery?.matches
}

onMounted(() => {
  desktopPointerQuery = window.matchMedia(
    '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
  )
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  desktopPointerQuery.addEventListener('change', updateCursorGlowVisibility)
  reducedMotionQuery.addEventListener('change', updateCursorGlowVisibility)

  updateCursorGlowVisibility()
})

onBeforeUnmount(() => {
  desktopPointerQuery?.removeEventListener('change', updateCursorGlowVisibility)
  reducedMotionQuery?.removeEventListener('change', updateCursorGlowVisibility)
})
</script>

<template>
  <div class="layout-surface bg-default flex min-h-screen flex-col">
    <ClientOnly>
      <CursorGlow v-if="showCursorGlow" />
    </ClientOnly>

    <a
      href="#main-content"
      class="bg-primary-500 sr-only rounded px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
    >
      {{ $t('nav.skipLink') }}
    </a>

    <div class="mx-auto w-11/12 max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
      <LayoutHeader />
    </div>

    <main id="main-content" class="grow" role="main">
      <div class="mx-auto w-11/12 max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
        <slot />
      </div>
    </main>

    <LayoutFooter />
  </div>
</template>
