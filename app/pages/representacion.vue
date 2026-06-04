<script setup lang="ts">
import { representationIcons } from '~/constants/icons'

const { t } = useI18n({ useScope: 'global' })

defineI18nRoute({
  paths: {
    es: '/representacion',
    en: '/representation',
    de: '/vertretung',
  },
})

usePageSeo('representation.title', 'seo.pages.representation')

interface RepresentationItem {
  id: string
  date: string
  title: string
  description: string
  highlights: string[]
  icon: string
}

const representationData = useI18nList<RepresentationItem>(
  'representation.timeline',
  ({ raw, value, tr }) => {
    const id = value(raw.id)
    const highlights = (raw.highlights as unknown[]) || []

    return {
      id,
      date: tr(raw.date),
      title: tr(raw.title),
      description: tr(raw.description),
      highlights: highlights.map((highlight) => tr(highlight)),
      icon: representationIcons[id] || 'i-tabler-point',
    }
  }
)

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
  <section :aria-label="t('representation.title')" class="section-enter">
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
    <div class="mx-auto max-w-2xl" :aria-label="t('representation.timelineLabel')">
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
