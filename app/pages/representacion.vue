<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('representation.title'),
  description: () => t('seo.pages.representation'),
})

// Specific icons for each milestone
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
  icon: string
}

const representationData = computed<RepresentationItem[]>(() => {
  const timelineData = tm('representation.timeline') as unknown
  const timeline = Array.isArray(timelineData) ? timelineData : []

  return timeline.map((item: unknown) => {
    const itemData = (item as Record<string, unknown>) || {}
    const id = getI18nStaticValue(itemData.id)
    const date = getI18nStaticValue(itemData.date)
    const title = getI18nStaticValue(itemData.title)
    const description = getI18nStaticValue(itemData.description)
    const highlights = (itemData.highlights as unknown[]) || []

    return {
      id,
      date: rt(date),
      title: rt(title),
      description: rt(description),
      highlights: highlights.map((h) => rt(getI18nStaticValue(h))),
      icon: itemIcons[id] || 'i-tabler-point',
    }
  })
})

// Timeline items in UTimeline format
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
      <UTimeline :items="timelineItems" color="neutral">
        <template v-for="(item, index) in representationData" :key="index" #[`item-${index}-title`]>
          <span class="text-highlighted text-base font-semibold">{{ item.title }}</span>
        </template>
        <template
          v-for="(item, index) in representationData"
          :key="`desc-${index}`"
          #[`item-${index}-description`]
        >
          <div class="flex flex-col gap-2">
            <p class="text-muted">{{ item.description }}</p>
            <div v-if="item.highlights.length > 0" class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="highlight in item.highlights"
                :key="highlight"
                variant="subtle"
                color="primary"
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
