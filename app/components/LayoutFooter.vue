<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer
    class="footer footer-center bg-base-300 p-4 pb-28 text-base-content md:pb-4"
    role="contentinfo"
  >
    <aside
      class="mx-auto flex w-11/12 max-w-7xl flex-col items-center gap-3 text-center md:grid md:grid-cols-3 md:items-center"
    >
      <!-- Copyright -->
      <div
        class="flex flex-col items-center gap-2 text-center md:flex-row md:justify-start md:text-left"
      >
        <Icon name="tabler:copyright" class="h-5 w-5 shrink-0" aria-hidden="true" />
        <p class="text-sm">
          <i18n-t keypath="footer.copyright" tag="span">
            <template #link>
              <a
                class="link link-primary"
                href="https://github.com/ComicIvans/ivan"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('footer.github') }}</a
              >
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- Aviso legal -->
      <NuxtLink
        :to="localePath('/legal')"
        class="link-hover link text-sm opacity-70 hover:opacity-100 md:text-center"
      >
        {{ t('legal.title') }}
      </NuxtLink>

      <!-- Redes sociales -->
      <nav class="flex gap-4 md:justify-end" :aria-label="t('footer.socialNav')">
        <a
          class="social-icon link-hover link"
          href="https://www.linkedin.com/in/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.linkedinLabel')"
        >
          <Icon name="tabler:brand-linkedin" class="h-6 w-6" />
        </a>
        <a
          class="social-icon link-hover link"
          href="https://www.instagram.com/ivansalidocobo/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.instagramLabel')"
        >
          <Icon name="tabler:brand-instagram" class="h-6 w-6" />
        </a>
        <a
          class="social-icon link-hover link"
          href="https://github.com/ComicIvans/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.githubLabel')"
        >
          <Icon name="tabler:brand-github" class="h-6 w-6" />
        </a>
      </nav>
    </aside>
  </footer>
</template>
