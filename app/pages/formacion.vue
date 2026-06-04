<script setup lang="ts">
import { academicIcons, competencyIcons, languageFlags } from '~/constants/icons'

const { t } = useI18n({ useScope: 'global' })

defineI18nRoute({
  paths: {
    es: '/formacion',
    en: '/education',
    de: '/ausbildung',
  },
})

usePageSeo('training.title', 'seo.pages.training')

const currentAcademic = ['mugeps']

const academicItems = useI18nList('training.academic.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    title: tr(raw.title),
    org: tr(raw.organization),
    period: tr(raw.period),
    description: tr(raw.description),
    icon: academicIcons[id] || 'i-tabler-certificate',
    current: currentAcademic.includes(id),
  }
})

const languageProgress: Record<string, number> = {
  english: 85,
  german: 15,
  spanish: 100,
}

const languages = useI18nList('training.languages.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    name: tr(raw.name),
    level: tr(raw.level),
    description: tr(raw.description),
    flag: languageFlags[id] || 'i-tabler-flag',
    progress: languageProgress[id] || 50,
  }
})

const competencies = useI18nList('training.competencies.items', ({ raw, value, tr }) => ({
  name: tr(raw.name),
  icon: competencyIcons[value(raw.id)] || 'i-tabler-star',
}))
</script>

<template>
  <section :aria-label="t('training.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('training.title') }}
      </h1>
    </div>

    <!-- Academic Training -->
    <div class="mb-12">
      <h2 class="text-highlighted mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-school" class="size-7" aria-hidden="true" />
        {{ t('training.academic.title') }}
      </h2>

      <div class="section-stagger space-y-6">
        <UCard
          v-for="(item, index) in academicItems"
          :key="index"
          :style="{ '--stagger-index': index }"
          class="motion-card"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              class="flex size-14 shrink-0 items-center justify-center self-start rounded-xl"
              :class="item.current ? 'bg-primary-500/10' : 'bg-elevated'"
            >
              <UIcon
                :name="item.icon"
                class="size-8"
                :class="item.current ? 'text-primary-500' : 'text-muted'"
                aria-hidden="true"
              />
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-bold">{{ item.title }}</h3>
                <UBadge :color="item.current ? 'primary' : 'neutral'" size="sm">
                  {{ item.period }}
                </UBadge>
              </div>
              <p class="text-toned mt-1 font-medium">{{ item.org }}</p>
              <p class="text-muted mt-2">{{ item.description }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Languages -->
    <div class="mb-12">
      <h2 class="text-highlighted mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-language" class="size-7" aria-hidden="true" />
        {{ t('training.languages.title') }}
      </h2>

      <div class="section-stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard
          v-for="(lang, index) in languages"
          :key="lang.name"
          :style="{ '--stagger-index': index }"
          class="motion-card"
        >
          <div class="flex items-center gap-3">
            <UIcon :name="lang.flag" class="size-10" aria-hidden="true" />
            <div>
              <h3 class="font-bold">{{ lang.name }}</h3>
              <p class="text-toned text-sm">{{ lang.level }}</p>
            </div>
          </div>
          <p class="text-muted mt-2 text-sm">{{ lang.description }}</p>
          <div class="mt-3">
            <div class="text-muted mb-1 flex justify-between text-xs">
              <span>{{ t('training.languages.proficiency') }}</span>
              <span>{{ lang.progress }}%</span>
            </div>
            <UProgress :model-value="lang.progress" color="primary" />
          </div>
        </UCard>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Other Certifications -->
    <div class="mb-12">
      <h2 class="text-highlighted mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-certificate" class="size-7" aria-hidden="true" />
        {{ t('training.other.title') }}
      </h2>

      <div class="section-stagger grid grid-cols-1 gap-4 md:grid-cols-2">
        <UCard class="motion-card">
          <div class="flex items-center gap-3">
            <div
              class="bg-primary-500/10 flex size-12 shrink-0 items-center justify-center rounded-xl"
            >
              <UIcon name="i-tabler-car" class="text-primary-500 size-6" aria-hidden="true" />
            </div>
            <div>
              <h3 class="font-bold">{{ t('training.other.drivingLicense.title') }}</h3>
              <p class="text-muted text-sm">
                {{ t('training.other.drivingLicense.description') }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Transversal Competencies -->
    <div>
      <h2 class="text-highlighted mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-bulb" class="size-7" aria-hidden="true" />
        {{ t('training.competencies.title') }}
      </h2>

      <div class="section-stagger flex flex-wrap gap-3">
        <div
          v-for="(comp, index) in competencies"
          :key="comp.name"
          :style="{ '--stagger-index': index }"
          class="border-primary-500/20 bg-primary-500/5 motion-card flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          <UIcon :name="comp.icon" class="text-primary-500 size-5" aria-hidden="true" />
          <span class="font-medium">{{ comp.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
