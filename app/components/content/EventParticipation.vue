<script setup lang="ts">
/**
 * MDC component for the "My participation" section in gallery events
 * Usage in markdown:
 * ::event-participation
 * Your content here with **markdown** support
 *
 * And blank lines that are preserved.
 * ::
 */
const { t } = useI18n()
</script>

<template>
  <UCard class="mb-8">
    <h2 class="mb-4 flex items-center gap-2 text-xl font-bold">
      <UIcon name="i-tabler-user-check" class="text-primary-500 size-6" />
      {{ t('gallery.event.myParticipation') }}
    </h2>
    <div
      class="prose prose-gray dark:prose-invert prose-headings:text-primary-500 prose-headings:mt-6 prose-headings:mb-3 prose-headings:font-semibold prose-h3:text-lg prose-p:my-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-primary-600 dark:prose-strong:text-primary-400 max-w-none"
    >
      <slot />
    </div>
  </UCard>
</template>
