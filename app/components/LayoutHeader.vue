<script setup lang="ts">
const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

// Joke modal state and rendering live with SiteNavBar; this component only triggers it.
const { showRandomJoke } = useJokes()

const homePath = computed(() => localePath('/'))
</script>

<template>
  <header class="mb-6">
    <!-- Desktop masthead: portrait + identity (navigation lives in SiteNavBar) -->
    <div class="hidden items-center gap-x-6 lg:flex">
      <button
        type="button"
        class="focus-visible:ring-primary-600 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <span class="aurora-ring">
          <NuxtImg
            class="header-portrait header-portrait-idle size-24 rounded-full object-cover shadow-lg"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            width="192"
            height="192"
            sizes="96px"
            format="webp"
            quality="76"
          />
        </span>
      </button>

      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="homePath"
          class="type-display text-highlighted hover:text-primary-700 dark:hover:text-primary-400 block truncate text-3xl transition-colors"
        >
          {{ t('header.title') }}
        </NuxtLink>
        <p class="text-muted text-base">
          {{ t('header.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Mobile masthead -->
    <div class="flex flex-col items-center gap-3 lg:hidden">
      <button
        type="button"
        class="focus-visible:ring-primary-600 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <span class="aurora-ring">
          <NuxtImg
            class="header-portrait size-20 rounded-full object-cover shadow-lg sm:size-24"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            width="192"
            height="192"
            sizes="80px sm:96px"
            format="webp"
            quality="76"
          />
        </span>
      </button>

      <div class="space-y-1 text-center">
        <NuxtLink
          :to="homePath"
          class="type-display text-highlighted hover:text-primary-700 dark:hover:text-primary-400 text-xl transition-colors"
        >
          {{ t('header.title') }}
        </NuxtLink>
        <p class="text-muted text-sm">
          {{ t('header.subtitle') }}
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-portrait {
  transition: transform 500ms var(--motion-emphasized);
}

.header-portrait:hover {
  transform: translate3d(0, -0.25rem, 0) scale(1.01);
}

/* Idle float reuses the shared keyframe from main.css */
@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  .header-portrait-idle {
    animation: float-y 6s ease-in-out infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-portrait,
  .header-portrait:hover {
    transform: none !important;
    transition: none !important;
  }

  .header-portrait-idle {
    animation: none !important;
  }
}
</style>
