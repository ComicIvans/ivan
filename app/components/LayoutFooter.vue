<script setup lang="ts">
import { profileRepositoryUrl, socialProfiles } from '~~/shared/constants/profile'

const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const socialLinks = computed(() => [
  {
    icon: 'i-tabler-mail',
    to: localePath('/contacto'),
    label: t('footer.contactLabel'),
    external: false,
  },
  {
    icon: 'i-tabler-brand-linkedin',
    href: socialProfiles.linkedin,
    label: t('footer.linkedinLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-instagram',
    href: socialProfiles.instagram,
    label: t('footer.instagramLabel'),
    external: true,
  },
  {
    icon: 'i-tabler-brand-github',
    href: socialProfiles.github,
    label: t('footer.githubLabel'),
    external: true,
  },
])
</script>

<template>
  <footer class="bg-elevated text-muted p-4 pb-6 md:pb-4" role="contentinfo">
    <div
      class="mx-auto flex w-11/12 max-w-7xl flex-col items-center gap-4 text-center md:grid md:grid-cols-3 md:items-center"
    >
      <!-- Copyright -->
      <div
        class="flex flex-col items-center gap-2 text-center md:flex-row md:justify-start md:text-left"
      >
        <UIcon name="i-tabler-copyright" class="size-5 shrink-0" aria-hidden="true" />
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
        <template v-for="link in socialLinks" :key="link.icon">
          <UButton
            v-if="!link.external"
            :to="link.to"
            :icon="link.icon"
            color="neutral"
            variant="ghost"
            size="lg"
            class="social-icon"
            :aria-label="link.label"
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
            :aria-label="link.label"
          />
        </template>
      </nav>
    </div>
  </footer>
</template>
