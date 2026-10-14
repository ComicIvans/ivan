<script setup lang="ts">
const props = defineProps<{ sectionIds: string[] }>()

const { t } = useI18n({ useScope: 'global' })

const labelKeys: Record<string, string> = {
  inicio: 'nav.home',
  experiencia: 'nav.experience',
  representacion: 'nav.representation',
  proyectos: 'nav.projects',
  formacion: 'nav.training',
  galeria: 'nav.gallery',
  contacto: 'nav.contact',
}

const { activeId } = useScrollSpy(props.sectionIds)
const journey = useCredentialJourney()

function activateSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  journey.jumpTo(id as Parameters<typeof journey.jumpTo>[0])
  window.setTimeout(() => {
    const heading = el.querySelector<HTMLElement>('h1, h2')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, 350)
}
</script>

<template>
  <nav
    :aria-label="t('nav.mainNav')"
    class="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
  >
    <NuxtLink
      v-for="id in sectionIds"
      :key="id"
      :to="`#${id}`"
      class="dot-btn inline-flex cursor-pointer items-center justify-center rounded-full"
      :class="{ 'is-active': activeId === id }"
      :aria-label="t(labelKeys[id] ?? 'nav.home')"
      :aria-current="activeId === id ? 'true' : undefined"
      @click="activateSection(id)"
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
