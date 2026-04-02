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
    <LayoutShell>
      <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <UCard class="max-w-md">
          <h1 class="text-primary-500 text-9xl font-bold">
            {{ error?.statusCode || 500 }}
          </h1>

          <h2 class="mt-4 text-2xl font-semibold sm:text-3xl">
            {{ errorTitle }}
          </h2>

          <p class="text-muted mt-2">
            {{ errorDescription }}
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
              <pre class="bg-elevated mt-2 overflow-auto rounded p-4 text-left text-xs">{{
                error.message
              }}</pre>
            </template>
          </UCollapsible>
        </UCard>
      </div>
    </LayoutShell>
  </UApp>
</template>
