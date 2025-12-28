<template>
  <div class="bg-default flex min-h-screen min-w-screen flex-col">
    <!-- Skip link para accesibilidad -->
    <a
      href="#main-content"
      class="bg-primary-500 sr-only rounded px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
    >
      {{ $t('nav.skipLink') }}
    </a>

    <main id="main-content" class="main-content grow" role="main">
      <div class="mx-auto w-11/12 max-w-7xl p-4 sm:p-6">
        <LayoutHeader />
        <slot />
      </div>
    </main>

    <LayoutFooter />
  </div>
</template>

<style scoped>
.main-content {
  /* Padding para navegación móvil */
  padding-bottom: 4rem;
}

@media (hover: hover) and (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}
</style>
