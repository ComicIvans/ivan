<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const socialLinks = [
  {
    icon: 'i-tabler-mail',
    to: localePath('/contacto'),
    label: () => t('footer.contactLabel'),
    external: false,
  },
  {
    icon: 'i-tabler-brand-linkedin',
    href: 'https://www.linkedin.com/in/ivansalidocobo/',
    label: () => t('footer.linkedinLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-instagram',
    href: 'https://www.instagram.com/ivansalidocobo/',
    label: () => t('footer.instagramLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-github',
    href: 'https://github.com/ComicIvans/',
    label: () => t('footer.githubLabel'),
    external: true,
  },
]
</script>

<template>
  <footer class="bg-elevated text-muted p-4 pb-28 md:pb-4" role="contentinfo">
    <div
      class="mx-auto flex w-11/12 max-w-7xl flex-col items-center gap-4 text-center md:grid md:grid-cols-3 md:items-center"
    >
      <!-- Copyright -->
      <div
        class="flex flex-col items-center gap-2 text-center md:flex-row md:justify-start md:text-left"
      >
        <UIcon name="i-tabler-copyright" class="size-5 shrink-0" aria-hidden="true" />
        <p class="text-sm">
          <i18n-t keypath="footer.copyright" tag="span">
            <template #link>
              <ULink
                to="https://github.com/ComicIvans/ivan"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-500 hover:underline"
              >
                {{ t('footer.github') }}
              </ULink>
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- Legal notice -->
      <ULink
        :to="localePath('/legal')"
        class="text-sm opacity-70 transition-opacity hover:opacity-100 md:text-center"
      >
        {{ t('legal.title') }}
      </ULink>

      <!-- Social links -->
      <nav class="flex gap-3 md:justify-end" :aria-label="t('footer.socialNav')">
        <template v-for="link in socialLinks" :key="link.icon">
          <UButton
            v-if="!link.external"
            :to="link.to"
            :icon="link.icon"
            color="neutral"
            variant="ghost"
            size="lg"
            class="social-icon"
            :aria-label="link.label()"
          />
          <UButton
            v-else
            :to="link.href"
            target="_blank"
            rel="noopener noreferrer"
            :icon="link.icon"
            color="neutral"
            variant="ghost"
            size="lg"
            class="social-icon"
            :aria-label="link.label()"
          />
        </template>
      </nav>
    </div>
  </footer>
</template>
