<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const CursorGlow = defineAsyncComponent(() => import('~/components/CursorGlow.vue'))

withDefaults(
  defineProps<{
    /** Portrait, name and subtitle above the page (pages without their own hero). */
    masthead?: boolean
  }>(),
  { masthead: true }
)

const motionTier = useMotionTier()
const showCursorGlow = computed(() => motionTier.value === 'full')
</script>

<template>
  <div class="layout-surface flex min-h-screen flex-col bg-default pt-[var(--navbar-h)]">
    <ClientOnly>
      <CursorGlow v-if="showCursorGlow" />
    </ClientOnly>

    <!-- Reading progress hairline (CSS scroll-driven; hidden when unsupported) -->
    <div class="scroll-progress" aria-hidden="true" />

    <a
      href="#main-content"
      class="sr-only rounded bg-primary-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
    >
      {{ $t('nav.skipLink') }}
    </a>

    <SiteNavBar />

    <div v-if="masthead" class="mx-auto w-11/12 max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
      <LayoutHeader />
    </div>

    <main id="main-content" class="grow" :class="{ 'pt-4 sm:pt-6': !masthead }">
      <div class="mx-auto w-11/12 max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
        <slot />
      </div>
    </main>

    <LayoutFooter />
  </div>
</template>
