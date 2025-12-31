<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('experience.title'),
  description: () => t('seo.pages.experience'),
})

const roleIcons: Record<string, string> = {
  'creup-digitalization': 'i-tabler-server-2',
  'enem-treasurer': 'i-tabler-calculator',
  'ugr-council': 'i-tabler-building-bank',
  'dge-treasurer': 'i-tabler-coins',
}

const currentRoles = ['creup-digitalization']

interface Experience {
  id: string
  title: string
  org: string
  period: string
  description: string
  icon: string
  current: boolean
}

const experiences = computed<Experience[]>(() => {
  const rolesData = tm('experience.roles') as unknown
  const roles = Array.isArray(rolesData) ? rolesData : []

  return roles.map((role: unknown) => {
    const roleData = (role as Record<string, unknown>) || {}
    const id = getI18nStaticValue(roleData.id)
    const title = getI18nStaticValue(roleData.title)
    const org = getI18nStaticValue(roleData.organization)
    const period = getI18nStaticValue(roleData.period)
    const description = getI18nStaticValue(roleData.description)
    return {
      id,
      title: rt(title),
      org: rt(org),
      period: rt(period),
      description: rt(description),
      icon: roleIcons[id] || 'i-tabler-briefcase',
      current: currentRoles.includes(id),
    }
  })
})

// Find current role index to mark completed ones
const currentIndex = computed(() => {
  const idx = experiences.value.findIndex((exp) => exp.current)
  return idx >= 0 ? idx : experiences.value.length - 1
})

// Timeline items in UTimeline format with custom slots
const timelineItems = computed(() => {
  return experiences.value.map((exp, index) => ({
    date: exp.period,
    title: exp.title,
    description: exp.description,
    icon: exp.icon,
    slot: `exp-${index}`,
  }))
})
</script>

<template>
  <section role="region" :aria-label="t('experience.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('experience.title') }}
      </h1>
      <p class="text-muted mx-auto mt-4 max-w-2xl text-lg">
        {{ t('experience.intro') }}
      </p>
    </div>

    <!-- Timeline -->
    <div class="mx-auto max-w-2xl">
      <UTimeline :items="timelineItems" :model-value="currentIndex" color="primary">
        <template v-for="(exp, index) in experiences" :key="index" #[`exp-${index}-title`]>
          <span class="text-highlighted text-base font-semibold">{{ exp.title }}</span>
        </template>
        <template
          v-for="(exp, index) in experiences"
          :key="`desc-${index}`"
          #[`exp-${index}-description`]
        >
          <div class="flex flex-col gap-1">
            <span class="text-primary-500 text-sm font-medium">{{ exp.org }}</span>
            <p class="text-muted text-sm">{{ exp.description }}</p>
          </div>
        </template>
      </UTimeline>
    </div>

    <!-- Link to full experience -->
    <UCard class="mt-8">
      <div class="text-center">
        <p class="text-muted">
          {{ t('experience.fullExperience') }}
        </p>
        <UButton
          :to="localePath('/representacion')"
          color="primary"
          class="mt-3"
          icon="i-tabler-history"
        >
          {{ t('experience.viewRepresentation') }}
        </UButton>
      </div>
    </UCard>
  </section>
</template>
