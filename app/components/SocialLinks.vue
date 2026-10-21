<script setup lang="ts">
import { socialLinks, type SocialPlacement } from '~~/shared/constants/profile'

const props = defineProps<{ placement: SocialPlacement }>()

const { t } = useI18n({ useScope: 'global' })

const links = computed(() => socialLinks.filter((link) => link.showIn.includes(props.placement)))
// The footer shows compact icon buttons; the hero and contact show labels.
const iconOnly = computed(() => props.placement === 'footer')
</script>

<template>
  <UButton
    v-for="link in links"
    :key="link.id"
    :to="link.url"
    target="_blank"
    rel="noopener noreferrer"
    :icon="link.icon"
    :label="iconOnly ? undefined : link.name"
    :aria-label="t('social.profileLabel', { network: link.name })"
    color="neutral"
    :variant="iconOnly ? 'ghost' : 'outline'"
    :size="iconOnly ? 'lg' : 'md'"
    :class="{ 'social-icon': iconOnly }"
  />
</template>
