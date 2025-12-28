<script setup lang="ts">
const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('gallery.title'),
  description: () => t('seo.pages.gallery'),
})

const eventIcons: Record<string, string> = {
  'enem-2025': 'i-tabler-math-function',
  'creup-riano': 'i-tabler-users-group',
  'ceeina-2025': 'i-tabler-school',
  'creup-ago-78': 'i-tabler-building-bank',
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
      icon: eventIcons[id] || 'i-tabler-photo',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('gallery.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-primary-500 text-4xl font-bold lg:text-5xl">
        {{ t('gallery.title') }}
      </h1>
      <p class="text-muted mx-auto mt-4 max-w-2xl">
        {{ t('gallery.intro') }}
      </p>
    </div>

    <!-- Gallery Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <UCard
        v-for="event in galleryEvents"
        :key="event.id"
        class="overflow-hidden transition-all hover:shadow-lg"
      >
        <!-- Skeleton para imagen -->
        <template #header>
          <div class="bg-elevated relative aspect-video w-full overflow-hidden">
            <USkeleton class="absolute inset-0 rounded-none" />
            <div class="absolute inset-0 flex items-center justify-center">
              <UIcon :name="event.icon" class="text-dimmed size-16" aria-hidden="true" />
            </div>
            <UBadge color="neutral" size="sm" class="absolute right-2 bottom-2">
              {{ t('gallery.photoSoon') }}
            </UBadge>
          </div>
        </template>

        <div>
          <h2 class="text-primary-400 flex items-center gap-2 text-lg font-bold">
            <UIcon :name="event.icon" class="text-primary-500 size-5" aria-hidden="true" />
            {{ event.titulo }}
          </h2>
          <p class="text-primary-500 mt-1 text-sm font-medium">{{ event.fecha }}</p>
          <p class="text-muted mt-2">{{ event.descripcion }}</p>
        </div>
      </UCard>
    </div>

    <!-- Nota informativa -->
    <UCard class="mt-8">
      <div class="flex items-center justify-center gap-3 text-center">
        <UIcon name="i-tabler-camera" class="text-primary-500 size-6" aria-hidden="true" />
        <p class="text-muted">
          {{ t('gallery.comingSoon') }}
        </p>
      </div>
    </UCard>
  </section>
</template>
