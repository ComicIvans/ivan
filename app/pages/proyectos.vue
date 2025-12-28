<script setup lang="ts">
const { t, tm, rt } = useI18n()

// SEO meta para la página de proyectos
useSeoMeta({
  title: () => t('projects.title'),
  description: () => t('seo.pages.projects'),
})

const techIcons: Record<string, string> = {
  nuxt: 'simple-icons:nuxtdotjs',
  vue: 'simple-icons:vuedotjs',
  linux: 'simple-icons:linux',
  docker: 'simple-icons:docker',
  powershell: 'simple-icons:powershell',
  python: 'simple-icons:python',
  php: 'simple-icons:php',
  sql: 'tabler:database',
  nginx: 'simple-icons:nginx',
  dns: 'tabler:world-www',
  typescript: 'simple-icons:typescript',
  node: 'simple-icons:nodedotjs',
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
      icon: techIcons[id] || 'tabler:code',
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
      icon: techIcons[id] || 'tabler:code',
    }
  })
})

const projectIcons: Record<string, string> = {
  server: 'tabler:server-2',
  firmas: 'tabler:signature',
  'win-ens': 'tabler:shield-lock',
  ceebi: 'tabler:calendar-event',
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
      icon: projectIcons[id] || 'tabler:folder-code',
      tags: projectTags[id] || [],
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('projects.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-primary lg:text-5xl">
        {{ t('projects.title') }}
      </h1>
    </div>

    <!-- Tech Stack Section -->
    <div class="mb-12">
      <h2 class="mb-6 text-2xl font-bold text-secondary">
        <Icon name="tabler:stack-2" class="mr-2 inline h-6 w-6" />
        {{ t('projects.stack.title') }}
      </h2>

      <!-- Primary Technologies -->
      <h3 class="mb-4 text-lg font-semibold text-base-content/80">
        {{ t('projects.stack.primary.title') }}
      </h3>
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="tech in primaryTech"
          :key="tech.name"
          class="card-border card bg-base-100 transition-all hover:shadow-lg"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <Icon :name="tech.icon" class="h-6 w-6 text-primary" />
              </div>
              <h4 class="font-bold">{{ tech.name }}</h4>
            </div>
            <p class="mt-2 text-sm text-base-content/70">{{ tech.description }}</p>
          </div>
        </div>
      </div>

      <!-- Secondary Technologies -->
      <h3 class="mb-4 text-lg font-semibold text-base-content/80">
        {{ t('projects.stack.secondary.title') }}
      </h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="tech in secondaryTech"
          :key="tech.name"
          class="flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-2 transition-colors hover:bg-secondary/10"
        >
          <Icon :name="tech.icon" class="h-5 w-5 text-secondary" />
          <span class="font-medium">{{ tech.name }}</span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Projects Section -->
    <div>
      <h2 class="mb-6 text-2xl font-bold text-secondary">
        <Icon name="tabler:folder-code" class="mr-2 inline h-6 w-6" />
        {{ t('projects.list.title') }}
      </h2>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article
          v-for="project in projects"
          :key="project.title"
          class="card-border card bg-base-100 transition-all hover:shadow-lg"
        >
          <div class="card-body">
            <div class="flex items-start gap-4">
              <div class="shrink-0 rounded-xl bg-primary/10 p-3">
                <Icon :name="project.icon" class="h-8 w-8 text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="card-title text-lg">{{ project.title }}</h3>
                <p class="mt-2 text-base-content/70">{{ project.description }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span v-for="tag in project.tags" :key="tag" class="badge badge-outline badge-sm">
                    {{ tag }}
                  </span>
                </div>
                <a
                  :href="project.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-link btn-sm mt-3 gap-1 p-0 text-primary"
                >
                  {{ project.linkText }}
                  <Icon name="tabler:external-link" class="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
