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
