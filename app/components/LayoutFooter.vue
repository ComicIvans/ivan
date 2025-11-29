<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

// Responsividad
const { width, height } = useWindowSize();
const isMobile = computed(
  () => width.value < height.value || width.value < 868
);
</script>

<template>
  <footer
    class="footer footer-center p-4 bg-base-300 text-base-content"
    :class="{ 'pb-24': isMobile }"
    role="contentinfo"
  >
    <aside
      class="w-11/12 max-w-7xl mx-auto"
      :class="
        isMobile
          ? 'flex flex-col items-center gap-3'
          : 'grid grid-cols-3 items-center'
      "
    >
      <!-- Copyright -->
      <div
        class="flex items-center gap-2 text-left"
        :class="{ 'justify-start': !isMobile }"
      >
        <Icon
          name="tabler:copyright"
          class="w-5 h-5 shrink-0"
          aria-hidden="true"
        />
        <p class="text-sm">
          <i18n-t keypath="footer.copyright" tag="span">
            <template #link>
              <a
                class="link link-primary"
                href="https://github.com/ComicIvans/cv"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t("footer.github") }}</a
              >
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- Aviso legal -->
      <NuxtLink
        :to="localePath('/legal')"
        class="link link-hover text-sm opacity-70 hover:opacity-100"
        :class="{ 'text-center': !isMobile }"
      >
        {{ t("legal.title") }}
      </NuxtLink>

      <!-- Redes sociales -->
      <nav
        class="flex gap-4"
        :class="{ 'justify-end': !isMobile }"
        aria-label="Redes sociales"
      >
        <a
          class="link link-hover social-icon"
          href="https://www.linkedin.com/in/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.linkedinLabel')"
        >
          <Icon name="tabler:brand-linkedin" class="w-6 h-6" />
        </a>
        <a
          class="link link-hover social-icon"
          href="https://www.instagram.com/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.instagramLabel')"
        >
          <Icon name="tabler:brand-instagram" class="w-6 h-6" />
        </a>
        <a
          class="link link-hover social-icon"
          href="https://github.com/ComicIvans/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.githubLabel')"
        >
          <Icon name="tabler:brand-github" class="w-6 h-6" />
        </a>
      </nav>
    </aside>
  </footer>
</template>
