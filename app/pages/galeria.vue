<script setup lang="ts">
const { t, tm, rt } = useI18n()

// SEO meta para la página de galería
useSeoMeta({
  title: () => t('gallery.title'),
  description: () => t('seo.pages.gallery'),
})

// Eventos de la galería
const eventIcons: Record<string, string> = {
  'enem-2025': 'tabler:math-function',
  'creup-riano': 'tabler:users-group',
  'ceeina-2025': 'tabler:school',
  'creup-ago-78': 'tabler:building-bank',
}

const galleryEvents = computed(() => {
  const eventsData = tm('gallery.events') as unknown
  const events = Array.isArray(eventsData) ? eventsData : []
  return events.map((event: unknown) => {
    const eventData = (event as Record<string, any>) || {}
    const id = getI18nStaticValue(eventData.id)
    const title = getI18nStaticValue(eventData.title)
    const date = getI18nStaticValue(eventData.date)
    const description = getI18nStaticValue(eventData.description)
    return {
      id,
      titulo: rt(title),
      fecha: rt(date),
      descripcion: rt(description),
      icon: eventIcons[id] || 'tabler:photo',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('gallery.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
        {{ t('gallery.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-base text-base-content/80 sm:text-lg">
        {{ t('gallery.intro') }}
      </p>
    </div>

    <!-- Gallery Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <article
        v-for="event in galleryEvents"
        :key="event.id"
        class="card-border card bg-base-100 transition-all hover:shadow-lg"
      >
        <!-- Skeleton para imagen -->
        <figure class="relative aspect-video w-full overflow-hidden bg-base-300">
          <div class="skeleton absolute inset-0 rounded-none"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon :name="event.icon" class="h-16 w-16 text-base-content/20" aria-hidden="true" />
          </div>
          <span class="badge badge-neutral badge-sm absolute bottom-2 right-2">
            {{ t('gallery.photoSoon') }}
          </span>
        </figure>
        <div class="card-body">
          <h2 class="card-title text-secondary">
            <Icon :name="event.icon" class="h-5 w-5 text-primary" aria-hidden="true" />
            {{ event.titulo }}
          </h2>
          <p class="text-sm font-medium text-primary">{{ event.fecha }}</p>
          <p class="text-base-content/80">{{ event.descripcion }}</p>
        </div>
      </article>
    </div>

    <!-- Nota informativa -->
    <div
      class="mt-8 flex items-center justify-center gap-3 rounded-box bg-base-200 p-4 text-center"
    >
      <Icon name="tabler:camera" class="h-6 w-6 text-primary" aria-hidden="true" />
      <p class="text-base-content/70">
        {{ t('gallery.comingSoon') }}
      </p>
    </div>
  </section>
</template>
