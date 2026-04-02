<template>
  <div class="layout-surface bg-default flex min-h-screen flex-col">
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
