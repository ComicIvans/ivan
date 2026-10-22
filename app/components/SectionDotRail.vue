<script setup lang="ts">
import { SECTIONS, SECTION_IDS } from '~/utils/sections'

const { t } = useI18n({ useScope: 'global' })

const { activeId } = useScrollSpy(SECTION_IDS)
// The router scrolls to the hash; this sends the badge and the focus there.
const { arrive } = useSectionNav()
</script>

<template>
  <nav
    :aria-label="t('nav.sectionsNav')"
    class="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
  >
    <NuxtLink
      v-for="section in SECTIONS"
      :key="section.id"
      :to="`#${section.id}`"
      class="dot-btn inline-flex cursor-pointer items-center justify-center rounded-full"
      :class="{ 'is-active': activeId === section.id }"
      :aria-label="t(section.navKey)"
      :aria-current="activeId === section.id ? 'true' : undefined"
      @click="arrive(section.id, $event)"
    >
      <span aria-hidden="true" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
.dot-btn {
  width: 2rem;
  height: 2rem;
}

.dot-btn span {
  width: 0.65rem;
  height: 0.65rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  transition:
    transform 200ms ease,
    background-color 200ms ease;
}

.dot-btn:hover span,
.dot-btn.is-active span {
  background: var(--ui-primary);
}

.dot-btn.is-active span {
  transform: scale(1.25);
}
</style>
