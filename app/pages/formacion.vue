<script setup lang="ts">
const { t, tm, rt } = useI18n()

// SEO meta para la página de formación
useSeoMeta({
  title: () => t('training.title'),
  description: () => t('seo.pages.training'),
})

const academicIcons: Record<string, string> = {
  mugeps: 'tabler:briefcase',
  'cybersecurity-master': 'tabler:shield-lock',
  'math-degree': 'tabler:math-function',
  'data-analyst': 'simple-icons:googlecloud',
  'math-conferences': 'tabler:presentation',
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
      icon: academicIcons[id] || 'tabler:certificate',
      current: currentAcademic.includes(id),
    }
  })
})

const languageFlags: Record<string, string> = {
  english: 'emojione:flag-for-united-kingdom',
  german: 'emojione:flag-for-germany',
  spanish: 'emojione:flag-for-spain',
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
      flag: languageFlags[id] || 'tabler:flag',
      progress: languageProgress[id] || 50,
    }
  })
})

const competencyIcons: Record<string, string> = {
  'project-management': 'tabler:list-check',
  'team-leadership': 'tabler:users',
  governance: 'tabler:building-bank',
  communication: 'tabler:speakerphone',
  systems: 'tabler:server-2',
  'cybersecurity-management': 'tabler:shield-lock',
  compliance: 'tabler:shield-check',
  automation: 'tabler:robot',
  'data-analysis': 'tabler:chart-dots',
  'problem-solving': 'tabler:puzzle',
  'strategic-thinking': 'tabler:brain',
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
      icon: competencyIcons[id] || 'tabler:star',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('training.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-primary lg:text-5xl">
        {{ t('training.title') }}
      </h1>
    </div>

    <!-- Academic Training -->
    <div class="mb-12">
      <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
        <Icon name="tabler:school" class="h-7 w-7" />
        {{ t('training.academic.title') }}
      </h2>

      <div class="space-y-6">
        <article
          v-for="(item, index) in academicItems"
          :key="index"
          class="card-border card bg-base-100 transition-all hover:shadow-lg"
        >
          <div class="card-body">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                class="shrink-0 self-start rounded-xl p-3"
                :class="item.current ? 'bg-primary/10' : 'bg-base-300'"
              >
                <Icon
                  :name="item.icon"
                  class="h-8 w-8"
                  :class="item.current ? 'text-primary' : 'text-base-content/60'"
                />
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-lg font-bold">{{ item.title }}</h3>
                  <span v-if="item.current" class="badge badge-primary badge-sm">
                    {{ item.period }}
                  </span>
                  <span v-else class="badge badge-ghost badge-sm">
                    {{ item.period }}
                  </span>
                </div>
                <p class="mt-1 font-medium text-secondary">{{ item.org }}</p>
                <p class="mt-2 text-base-content/70">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Languages -->
    <div class="mb-12">
      <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
        <Icon name="tabler:language" class="h-7 w-7" />
        {{ t('training.languages.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div v-for="lang in languages" :key="lang.name" class="card-border card bg-base-100">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <Icon :name="lang.flag" class="h-10 w-10" />
              <div>
                <h3 class="font-bold">{{ lang.name }}</h3>
                <p class="text-sm text-primary">{{ lang.level }}</p>
              </div>
            </div>
            <p class="mt-2 text-sm text-base-content/70">{{ lang.description }}</p>
            <div class="mt-3">
              <div class="mb-1 flex justify-between text-xs text-base-content/60">
                <span>{{ t('training.languages.proficiency') }}</span>
                <span>{{ lang.progress }}%</span>
              </div>
              <progress
                class="progress progress-primary w-full"
                :value="lang.progress"
                max="100"
              ></progress>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Other Certifications -->
    <div class="mb-12">
      <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
        <Icon name="tabler:certificate" class="h-7 w-7" />
        {{ t('training.other.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Permiso de conducir -->
        <div class="card-border card bg-base-100">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <div class="shrink-0 rounded-xl bg-primary/10 p-3">
                <Icon name="tabler:car" class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="font-bold">{{ t('training.other.drivingLicense.title') }}</h3>
                <p class="text-sm text-base-content/70">
                  {{ t('training.other.drivingLicense.description') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Transversal Competencies -->
    <div>
      <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
        <Icon name="tabler:bulb" class="h-7 w-7" />
        {{ t('training.competencies.title') }}
      </h2>

      <div class="flex flex-wrap gap-3">
        <div
          v-for="comp in competencies"
          :key="comp.name"
          class="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 transition-colors hover:bg-primary/10"
        >
          <Icon :name="comp.icon" class="h-5 w-5 text-primary" />
          <span class="font-medium">{{ comp.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
