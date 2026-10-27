<script setup lang="ts">
import type { NuxtError } from '#app'
import { getNuxtUiLocale } from '~/utils/nuxtUiLocale'

const props = defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const nuxtUiLocale = computed(() => getNuxtUiLocale(locale.value))

const isDev = import.meta.dev

const is404 = computed(() => (props.error?.statusCode || 500) === 404)

const errorTitle = computed(() => {
  const statusCode = props.error?.statusCode || 500

  switch (statusCode) {
    case 400:
      return t('error.titles.400')
    case 401:
      return t('error.titles.401')
    case 403:
      return t('error.titles.403')
    case 404:
      return t('error.titles.404')
    case 500:
      return t('error.titles.500')
    case 502:
      return t('error.titles.502')
    case 503:
      return t('error.titles.503')
    default:
      return t('error.titles.default')
  }
})

const errorDescription = computed(() => {
  const statusCode = props.error?.statusCode || 500

  switch (statusCode) {
    case 400:
      return t('error.descriptions.400')
    case 401:
      return t('error.descriptions.401')
    case 403:
      return t('error.descriptions.403')
    case 404:
      return t('error.descriptions.404')
    case 500:
      return t('error.descriptions.500')
    case 502:
      return t('error.descriptions.502')
    case 503:
      return t('error.descriptions.503')
    default:
      return t('error.descriptions.default')
  }
})

const handleError = () => {
  if (import.meta.client) {
    window.location.reload()
  }
}

const goHome = () => {
  reloadNuxtApp({ path: localePath('/') })
}

useSeoMeta({
  title: () => `${props.error?.statusCode || 500} - ${errorTitle.value}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <LayoutShell class="error-searchlight">
      <div class="reveal flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div class="surface-glass w-full max-w-md rounded-2xl p-4 sm:p-6">
          <div class="relative">
            <div class="error-bloom" aria-hidden="true" />
            <!-- Decorative status code: the title below is the page heading -->
            <p
              class="type-display ink-gradient relative text-[8rem] leading-none tracking-tight sm:text-9xl"
              aria-hidden="true"
            >
              {{ error?.statusCode || 500 }}
            </p>
          </div>

          <h1 class="mt-4 text-2xl font-semibold sm:text-3xl">
            {{ errorTitle }}
          </h1>

          <p class="mt-2 text-muted">
            {{ errorDescription }}
          </p>

          <p v-if="is404" class="mt-3 font-mono text-sm text-muted">
            {{ t('error.searchlight') }}
          </p>

          <div class="mt-6 flex flex-wrap justify-center gap-4">
            <UButton color="primary" icon="i-tabler-home" @click="goHome">
              {{ $t('error.backHome') }}
            </UButton>
            <UButton variant="outline" icon="i-tabler-refresh" @click="handleError">
              {{ $t('error.tryAgain') }}
            </UButton>
          </div>

          <UCollapsible v-if="error?.message && isDev" class="mt-6">
            <UButton variant="ghost" size="sm" class="w-full justify-between">
              {{ $t('error.technicalDetails') }}
              <template #trailing>
                <UIcon name="i-tabler-chevron-down" class="size-4" />
              </template>
            </UButton>
            <template #content>
              <pre class="mt-2 overflow-auto rounded bg-elevated p-4 text-left text-xs">{{
                error.message
              }}</pre>
            </template>
          </UCollapsible>
        </div>
      </div>
    </LayoutShell>
  </UApp>
</template>

<style scoped>
/* Soft bloom behind the status code. */
.error-bloom {
  position: absolute;
  inset: -15%;
  pointer-events: none;
  background: radial-gradient(circle, var(--glow-soft), transparent 70%);
  filter: blur(40px);
}

/* Narrow the ambient cursor glow into a searchlight on this page. The
   translate offset must stay at half the diameter so the beam keeps
   following the cursor center. Touch/reduced-motion hiding still applies. */
:global(.error-searchlight .pointer-glow) {
  width: 12rem;
  height: 12rem;
  filter: blur(28px);
  transform: translate3d(calc(var(--glow-x, 50vw) - 6rem), calc(var(--glow-y, 40vh) - 6rem), 0);
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--color-ember-400) 18%, transparent),
    color-mix(in oklab, var(--color-amber-400) 9%, transparent) 44%,
    transparent 74%
  );
}

:global(.dark .error-searchlight .pointer-glow) {
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--color-ember-400) 24%, transparent),
    color-mix(in oklab, var(--color-blue-500) 12%, transparent) 44%,
    transparent 74%
  );
}
</style>
