<script setup lang="ts">
import { profileRepositoryUrl, socialProfiles } from '~~/shared/constants/profile'

const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const socialLinks = computed(() => [
  {
    icon: 'i-tabler-mail',
    // Contact lives as a home section now; deep-link via anchor
    to: { path: localePath('/'), hash: '#contacto' },
    label: t('footer.contactLabel'),
    external: false,
  },
  {
    icon: 'i-tabler-brand-linkedin',
    to: socialProfiles.linkedin,
    label: t('footer.linkedinLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-instagram',
    to: socialProfiles.instagram,
    label: t('footer.instagramLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-github',
    to: socialProfiles.github,
    label: t('footer.githubLabel'),
    external: true,
  },
])
</script>

<template>
  <footer class="footer-band text-muted p-4 pb-6 md:pb-4" role="contentinfo">
    <div
      class="mx-auto flex w-11/12 max-w-7xl flex-col items-center gap-4 pt-2 text-center md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
    >
      <!-- Wordmark + copyright -->
      <div class="flex flex-col items-center gap-1 md:items-start md:text-left">
        <span class="type-display text-highlighted text-lg" aria-hidden="true">
          {{ t('header.title') }}
        </span>
        <p class="text-sm">
          <i18n-t keypath="footer.copyright" tag="span" scope="global">
            <template #link>
              <ULink
                :to="profileRepositoryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-link"
              >
                {{ t('footer.github') }}
              </ULink>
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- Legal notice -->
      <ULink :to="localePath('/legal')" class="muted-link text-sm md:text-center">
        {{ t('legal.title') }}
      </ULink>

      <!-- Social links -->
      <nav class="flex gap-3 md:justify-end" :aria-label="t('footer.socialNav')">
        <UButton
          v-for="link in socialLinks"
          :key="link.icon"
          :to="link.to"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          :icon="link.icon"
          color="neutral"
          variant="ghost"
          size="lg"
          class="social-icon"
          :aria-label="link.label"
        />
      </nav>
    </div>
  </footer>
</template>

<style scoped>
/* Aurora hairline instead of a hard color break against the page backdrop */
.footer-band {
  position: relative;
  background: color-mix(in oklab, var(--ui-bg-elevated) 82%, transparent);
}

.footer-band::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--color-ember-400) 45%, transparent) 30%,
    color-mix(in oklab, var(--color-amber-400) 35%, transparent) 70%,
    transparent
  );
  pointer-events: none;
}
</style>
