<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('representation.title'),
  description: () => t('seo.pages.representation'),
})

const currentItems = ['creup-digitalization', 'upv-delegate']

// Iconos específicos para cada hito
const itemIcons: Record<string, string> = {
  'start-2020': 'i-tabler-rocket',
  'end-first-term': 'i-tabler-refresh',
  'external-relations': 'i-tabler-world',
  'academic-vicecoord': 'i-tabler-school',
  'creup-digitalization': 'i-tabler-server-2',
  'dge-advisor': 'i-tabler-shield-check',
  'upv-delegate': 'i-tabler-users',
}

interface RepresentationItem {
  id: string
  date: string
  title: string
  description: string
  highlights: string[]
  current: boolean
  icon: string
}

const representationData = computed<RepresentationItem[]>(() => {
  const timeline = tm('representation.timeline') as Array<{
    id: string
    date: string
    title: string
    description: string
    highlights: string[]
  }>
  return timeline.map((item) => ({
    id: item.id,
    date: rt(item.date),
    title: rt(item.title),
    description: rt(item.description),
    highlights: item.highlights.map((h) => rt(h)),
    current: currentItems.includes(item.id),
    icon: itemIcons[item.id] || 'i-tabler-point',
  }))
})

// Encontrar el índice del elemento actual
const currentIndex = computed(() => {
  const idx = representationData.value.findIndex((item) => item.current)
  return idx >= 0 ? idx : representationData.value.length - 1
})

// Timeline items en formato UTimeline con slot para mostrar highlights
const timelineItems = computed(() => {
  return representationData.value.map((item, index) => ({
    date: item.date,
    title: item.title,
    description: item.description,
    icon: item.icon,
    slot: `item-${index}`,
  }))
})
</script>

<template>
  <section role="region" :aria-label="t('representation.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('representation.title') }}
      </h1>
      <p class="text-muted mx-auto mt-4 max-w-2xl">
        {{ t('representation.intro') }}
      </p>
    </div>

    <!-- Timeline -->
    <div class="mx-auto max-w-2xl" role="list" :aria-label="t('representation.timelineLabel')">
      <UTimeline :items="timelineItems" :model-value="currentIndex" color="primary">
        <template v-for="(item, index) in representationData" :key="index" #[`item-${index}-title`]>
          <span class="text-highlighted text-base font-semibold">{{ item.title }}</span>
        </template>
        <template v-for="(item, index) in representationData" :key="`desc-${index}`" #[`item-${index}-description`]>
          <div class="flex flex-col gap-2">
            <p class="text-muted text-sm">{{ item.description }}</p>
            <div v-if="item.highlights.length > 0" class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="highlight in item.highlights"
                :key="highlight"
                variant="subtle"
                color="primary"
                size="sm"
              >
                {{ highlight }}
              </UBadge>
            </div>
          </div>
        </template>
      </UTimeline>
    </div>
  </section>
</template>
