<script setup lang="ts">
import { profileRepositoryUrl } from '~~/shared/constants/profile'

const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
</script>

<template>
  <footer class="footer-band text-toned p-4 pb-6 md:pb-4" role="contentinfo">
    <!-- The text links are raw ULinks: the default ULink colour utilities
         would override .inline-link and .muted-link. -->
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
                raw
                class="inline-link"
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
        raw
        class="muted-link text-sm md:text-center"
        active-class="text-primary"
      >
        {{ t('legal.title') }}
      </ULink>

      <!-- Social links -->
      <nav class="flex gap-3 md:justify-end" :aria-label="t('footer.socialNav')">
        <!-- Contact lives as a home section; deep-link via anchor -->
        <UButton
          :to="{ path: localePath('/'), hash: '#contacto' }"
          icon="i-tabler-mail"
          color="neutral"
          variant="ghost"
          size="lg"
          class="social-icon"
          :aria-label="t('footer.contactLabel')"
        />
        <SocialLinks placement="footer" />
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
