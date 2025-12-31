<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('projects.title'),
  description: () => t('seo.pages.projects'),
})

const techIcons: Record<string, string> = {
  nuxt: 'i-simple-icons-nuxt',
  vue: 'i-simple-icons-vuedotjs',
  linux: 'i-simple-icons-linux',
  docker: 'i-simple-icons-docker',
  powershell: 'i-simple-icons-powershell',
  python: 'i-simple-icons-python',
  php: 'i-simple-icons-php',
  sql: 'i-tabler-database',
  nginx: 'i-simple-icons-nginx',
  dns: 'i-tabler-world-www',
  typescript: 'i-simple-icons-typescript',
  node: 'i-simple-icons-nodedotjs',
}

const primaryTech = computed(() => {
  const itemsData = tm('projects.stack.primary.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []
  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const name = getI18nStaticValue(itemData.name)
    const description = getI18nStaticValue(itemData.description)
    return {
      id,
      name: rt(name),
      description: rt(description),
      icon: techIcons[id] || 'i-tabler-code',
    }
  })
})

const secondaryTech = computed(() => {
  const itemsData = tm('projects.stack.secondary.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []
  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const name = getI18nStaticValue(itemData.name)
    return {
      id,
      name: rt(name),
      icon: techIcons[id] || 'i-tabler-code',
    }
  })
})

const projectIcons: Record<string, string> = {
  server: 'i-tabler-server-2',
  firmas: 'i-tabler-signature',
  'win-ens': 'i-tabler-shield-lock',
  ceebi: 'i-tabler-calendar-event',
}

const projectTags: Record<string, string[]> = {
  server: ['Linux', 'Docker', 'Self-hosted', 'Nginx'],
  firmas: ['Python', 'Vue.js', 'Full-stack'],
  'win-ens': ['PowerShell', 'ENS', 'Windows', 'Ciberseguridad'],
  ceebi: ['Vue.js', 'Web', 'Eventos'],
}

const projects = computed(() => {
  const itemsData = tm('projects.list.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []

  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const title = getI18nStaticValue(itemData.title)
    const description = getI18nStaticValue(itemData.description)
    const link = getI18nStaticValue(itemData.link)

    return {
      id,
      title: rt(title),
      description: rt(description),
      link: link.startsWith('http') ? link : `https://${link}`,
      linkText: link,
      icon: projectIcons[id] || 'i-tabler-folder-code',
      tags: projectTags[id] || [],
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('projects.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('projects.title') }}
      </h1>
    </div>

    <!-- Tech Stack Section -->
    <div class="mb-12">
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-stack-2" class="size-7" aria-hidden="true" />
        {{ t('projects.stack.title') }}
      </h2>

      <!-- Primary Technologies -->
      <h3 class="text-muted mb-4 text-lg font-semibold">
        {{ t('projects.stack.primary.title') }}
      </h3>
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard v-for="tech in primaryTech" :key="tech.name" class="transition-all hover:shadow-lg">
          <div class="flex items-center gap-3">
            <div
              class="bg-primary-500/10 flex size-10 shrink-0 items-center justify-center rounded-lg"
            >
              <UIcon :name="tech.icon" class="text-primary-500 size-6" aria-hidden="true" />
            </div>
            <h4 class="font-bold">{{ tech.name }}</h4>
          </div>
          <p class="text-muted mt-2 text-sm">{{ tech.description }}</p>
        </UCard>
      </div>

      <!-- Secondary Technologies -->
      <h3 class="text-muted mb-4 text-lg font-semibold">
        {{ t('projects.stack.secondary.title') }}
      </h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="tech in secondaryTech"
          :key="tech.name"
          class="border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
        >
          <UIcon :name="tech.icon" class="text-primary-500 size-5" aria-hidden="true" />
          <span class="font-medium">{{ tech.name }}</span>
        </div>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Projects Section -->
    <div>
      <h2 class="text-primary-400 mb-6 flex items-center gap-2 text-2xl font-bold">
        <UIcon name="i-tabler-folder-code" class="size-7" aria-hidden="true" />
        {{ t('projects.list.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UCard
          v-for="project in projects"
          :key="project.title"
          class="transition-all hover:shadow-lg"
        >
          <div class="flex items-start gap-4">
            <div
              class="bg-primary-500/10 flex size-16 shrink-0 items-center justify-center rounded-xl"
            >
              <UIcon :name="project.icon" class="text-primary-500 size-8" aria-hidden="true" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold">{{ project.title }}</h3>
              <p class="text-muted mt-2">{{ project.description }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge v-for="tag in project.tags" :key="tag" variant="outline" size="sm">
                  {{ tag }}
                </UBadge>
              </div>
              <UButton
                :to="project.link"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                :trailing-icon="'i-tabler-external-link'"
                class="mt-3 p-0"
              >
                {{ project.linkText }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
