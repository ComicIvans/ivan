<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="min-w-screen min-h-screen flex flex-col bg-base-200">
    <!-- Skip link para accesibilidad -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-content focus:px-4 focus:py-2 focus:rounded"
    >
      {{ t("nav.skipLink") }}
    </a>

    <main id="main-content" class="main-content" role="main">
      <div class="w-11/12 max-w-7xl mx-auto p-4 sm:p-6">
        <LayoutHeader />

        <!-- Contenido de la página -->
        <slot />
      </div>
    </main>

    <LayoutFooter />
  </div>
</template>

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
