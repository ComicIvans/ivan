<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

// SEO meta para la página de experiencia
useSeoMeta({
  title: () => t('experience.title'),
  description: () => t('seo.pages.experience'),
})

const roleIcons: Record<string, string> = {
  'creup-digitalization': 'uil:server-network',
  'enem-treasurer': 'uil:calculator',
  'ugr-council': 'uil:university',
  'dge-treasurer': 'tabler:coins',
}

const currentRoles = ['creup-digitalization']

const experiences = computed(() => {
  const rolesData = tm('experience.roles') as unknown
  const roles = Array.isArray(rolesData) ? rolesData : []

  return roles.map((role: unknown) => {
    const roleData = (role as Record<string, any>) || {}
    const id = getI18nStaticValue(roleData.id)
    const title = getI18nStaticValue(roleData.title)
    const org = getI18nStaticValue(roleData.organization)
    const period = getI18nStaticValue(roleData.period)
    const description = getI18nStaticValue(roleData.description)
    const icon = roleIcons[id]
    return {
      id,
      title: rt(title),
      org: rt(org),
      period: rt(period),
      description: rt(description),
      icon: icon || 'tabler:briefcase',
      current: currentRoles.includes(id),
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('experience.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-primary lg:text-5xl">
        {{ t('experience.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-base-content/80">
        {{ t('experience.intro') }}
      </p>
    </div>

    <!-- Timeline -->
    <ul class="timeline timeline-vertical timeline-snap-icon max-md:timeline-compact">
      <li v-for="(exp, index) in experiences" :key="index">
        <div class="timeline-middle">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full"
            :class="exp.current ? 'bg-primary text-primary-content' : 'bg-base-300'"
          >
            <Icon :name="exp.icon" class="h-5 w-5" />
          </div>
        </div>
        <div
          class="timeline-box mb-10"
          :class="index % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'"
        >
          <div class="flex flex-col gap-1">
            <span
              class="inline-flex items-center gap-2 text-sm font-medium"
              :class="exp.current ? 'text-primary' : 'text-base-content/60'"
            >
              <Icon v-if="exp.current" name="tabler:point-filled" class="h-3 w-3 animate-pulse" />
              {{ exp.period }}
            </span>
            <h2 class="text-xl font-bold text-secondary">{{ exp.title }}</h2>
            <h3 class="font-medium text-base-content/80">{{ exp.org }}</h3>
            <p class="mt-2 text-base-content/70">{{ exp.description }}</p>
          </div>
        </div>
        <hr v-if="index < experiences.length - 1" />
      </li>
    </ul>

    <!-- Enlace a experiencia completa -->
    <div class="mt-8 rounded-box bg-base-200 p-6 text-center">
      <p class="text-base-content/80">
        {{ t('experience.fullExperience') }}
      </p>
      <NuxtLink :to="localePath('/representacion')" class="btn btn-primary btn-sm mt-3 gap-2">
        <Icon name="tabler:history" class="h-4 w-4" />
        {{ t('experience.viewRepresentation') }}
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.timeline-box {
  @apply rounded-box border border-base-300 bg-base-100 p-4 transition-shadow hover:shadow-lg;
}
</style>
