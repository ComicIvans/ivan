<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <footer
    class="footer footer-center p-4 pb-28 md:pb-4 bg-base-300 text-base-content"
    role="contentinfo"
  >
    <aside
      class="w-11/12 max-w-7xl mx-auto flex flex-col items-center gap-3 text-center md:grid md:grid-cols-3 md:items-center"
    >
      <!-- Copyright -->
      <div
        class="flex flex-col items-center gap-2 text-center md:flex-row md:justify-start md:text-left"
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
                href="https://github.com/ComicIvans/ivan"
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
        class="link link-hover text-sm opacity-70 hover:opacity-100 md:text-center"
      >
        {{ t("legal.title") }}
      </NuxtLink>

      <!-- Redes sociales -->
      <nav class="flex gap-4 md:justify-end" aria-label="Redes sociales">
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
