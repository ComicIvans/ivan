<template>
  <div class="min-w-screen flex min-h-screen flex-col bg-base-200">
    <!-- Skip link para accesibilidad -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
    >
      {{ $t('nav.skipLink') }}
    </a>

    <main id="main-content" class="main-content" role="main">
      <div class="mx-auto w-11/12 max-w-7xl p-4 sm:p-6">
        <LayoutHeader />

        <!-- Contenido del error -->
        <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body items-center text-center">
              <!-- Código de error -->
              <h1 class="text-9xl font-bold text-primary">
                {{ error?.statusCode || 500 }}
              </h1>

              <!-- Título del error -->
              <h2 class="mt-4 text-2xl font-semibold sm:text-3xl">
                {{ errorTitle }}
              </h2>

              <!-- Descripción del error -->
              <p class="mt-2 max-w-md text-base-content/70">
                {{ errorDescription }}
              </p>

              <!-- Acciones -->
              <div class="card-actions mt-6 flex-wrap justify-center gap-4">
                <button class="btn btn-primary" @click="goHome">
                  <Icon name="tabler:home" class="size-5" />
                  {{ $t('error.backHome') }}
                </button>
                <button class="btn btn-outline" @click="handleError">
                  <Icon name="tabler:refresh" class="size-5" />
                  {{ $t('error.tryAgain') }}
                </button>
              </div>

              <!-- Información adicional para desarrollo -->
              <details
                v-if="error?.message && isDev"
                class="collapse collapse-arrow mt-6 bg-base-200"
              >
                <summary class="collapse-title text-sm font-medium">
                  {{ $t('error.technicalDetails') }}
                </summary>
                <div class="collapse-content">
                  <pre class="mt-2 overflow-auto rounded bg-base-300 p-4 text-left text-xs">{{
                    error.message
                  }}</pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const isDev = import.meta.dev

// Títulos y descripciones personalizadas según el código de error
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
  // Recargar la página actual para intentar de nuevo
  if (import.meta.client) {
    window.location.reload()
  }
}

const goHome = () => {
  // Usar reloadNuxtApp con path para navegar y recargar limpiamente
  reloadNuxtApp({ path: localePath('/') })
}

// SEO para la página de error
useSeoMeta({
  title: () => `${props.error?.statusCode || 500} - ${errorTitle.value}`,
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.main-content {
  flex-grow: 1;
  /* Padding para el dock en móvil */
  padding-bottom: 4rem;
}

/* En desktop (con hover), no necesitamos padding extra */
@media (hover: hover) and (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}
</style>
