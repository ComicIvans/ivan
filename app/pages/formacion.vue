<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('training.title'),
  description: () => t('seo.pages.training'),
})

const academicIcons: Record<string, string> = {
  mugeps: 'i-tabler-briefcase',
  'cybersecurity-master': 'i-tabler-shield-lock',
  'math-degree': 'i-tabler-math-function',
  'data-analyst': 'i-simple-icons-googlecloud',
  'math-conferences': 'i-tabler-presentation',
}

const currentAcademic = ['mugeps']

const academicItems = computed(() => {
  const itemsData = tm('training.academic.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []
  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const title = getI18nStaticValue(itemData.title)
    const org = getI18nStaticValue(itemData.organization)
    const period = getI18nStaticValue(itemData.period)
    const description = getI18nStaticValue(itemData.description)
    return {
      id,
      title: rt(title),
      org: rt(org),
      period: rt(period),
      description: rt(description),
      icon: academicIcons[id] || 'i-tabler-certificate',
      current: currentAcademic.includes(id),
    }
  })
})

const languageFlags: Record<string, string> = {
  english: 'i-emojione-flag-for-united-kingdom',
  german: 'i-emojione-flag-for-germany',
  spanish: 'i-emojione-flag-for-spain',
}

const languageProgress: Record<string, number> = {
  english: 85,
  german: 15,
  spanish: 100,
}

const languages = computed(() => {
  const itemsData = tm('training.languages.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []
  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const name = getI18nStaticValue(itemData.name)
    const level = getI18nStaticValue(itemData.level)
    const description = getI18nStaticValue(itemData.description)
    return {
      id,
      name: rt(name),
      level: rt(level),
      description: rt(description),
      flag: languageFlags[id] || 'i-tabler-flag',
      progress: languageProgress[id] || 50,
    }
  })
})

const competencyIcons: Record<string, string> = {
  'project-management': 'i-tabler-list-check',
  'team-leadership': 'i-tabler-users',
  governance: 'i-tabler-building-bank',
  communication: 'i-tabler-speakerphone',
  systems: 'i-tabler-server-2',
  'cybersecurity-management': 'i-tabler-shield-lock',
  compliance: 'i-tabler-shield-check',
  automation: 'i-tabler-robot',
  'data-analysis': 'i-tabler-chart-dots',
  'problem-solving': 'i-tabler-puzzle',
  'strategic-thinking': 'i-tabler-brain',
}

const competencies = computed(() => {
  const itemsData = tm('training.competencies.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []
  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const name = getI18nStaticValue(itemData.name)
    return {
      name: rt(name),
      icon: competencyIcons[id] || 'i-tabler-star',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('training.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('training.title') }}
      </h1>
    </div>

    <!-- Academic Training -->
    <div class="mb-12">
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-school" class="size-7" />
        {{ t('training.academic.title') }}
      </h2>

      <div class="space-y-6">
        <UCard
          v-for="(item, index) in academicItems"
          :key="index"
          class="transition-all hover:shadow-lg"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              class="shrink-0 self-start rounded-xl p-3"
              :class="item.current ? 'bg-primary-500/10' : 'bg-elevated'"
            >
              <UIcon
                :name="item.icon"
                class="size-8"
                :class="item.current ? 'text-primary-500' : 'text-muted'"
              />
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-bold">{{ item.title }}</h3>
                <UBadge :color="item.current ? 'primary' : 'neutral'" size="sm">
                  {{ item.period }}
                </UBadge>
              </div>
              <p class="text-primary-400 mt-1 font-medium">{{ item.org }}</p>
              <p class="text-muted mt-2">{{ item.description }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Languages -->
    <div class="mb-12">
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-language" class="size-7" />
        {{ t('training.languages.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard v-for="lang in languages" :key="lang.name">
          <div class="flex items-center gap-3">
            <UIcon :name="lang.flag" class="size-10" />
            <div>
              <h3 class="font-bold">{{ lang.name }}</h3>
              <p class="text-primary-500 text-sm">{{ lang.level }}</p>
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
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-certificate" class="size-7" />
        {{ t('training.other.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UCard>
          <div class="flex items-center gap-3">
            <div class="bg-primary-500/10 shrink-0 rounded-xl p-3">
              <UIcon name="i-tabler-car" class="text-primary-500 size-6" />
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
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-bulb" class="size-7" />
        {{ t('training.competencies.title') }}
      </h2>

      <div class="flex flex-wrap gap-3">
        <div
          v-for="comp in competencies"
          :key="comp.name"
          class="border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          <UIcon :name="comp.icon" class="text-primary-500 size-5" />
          <span class="font-medium">{{ comp.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
