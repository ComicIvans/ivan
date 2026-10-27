<script setup lang="ts">
/**
 * Shared card for gallery event prose sections rendered from markdown
 * (::event-about / ::event-participation wrap this component).
 */
defineProps<{
  icon: string
  titleKey: string
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <UCard class="reveal mb-8">
    <SectionHeader :title="t(titleKey)" :icon="icon" />
    <div
      class="event-prose prose max-w-none prose-gray dark:prose-invert prose-headings:mt-6 prose-headings:mb-3 prose-headings:font-bold prose-headings:text-highlighted prose-h3:text-lg prose-p:my-3 prose-strong:text-primary-700 dark:prose-strong:text-primary-400 prose-ul:my-3 prose-li:my-1"
    >
      <slot />
    </div>
  </UCard>
</template>

<style scoped>
/* Gradient underline for prose headings, matching the shared heading style */
.event-prose :deep(:where(h2, h3, h4))::after {
  content: '';
  display: block;
  margin-top: 0.4rem;
  height: 2px;
  width: 2rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--color-ember-500), var(--color-amber-400));
}
</style>
