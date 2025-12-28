<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.pageTitle'),
  description: () => t('seo.description'),
})

const highlightIcons: Record<string, string> = {
  governance: 'i-tabler-building-bank',
  infrastructure: 'i-tabler-server-2',
  events: 'i-tabler-calendar-event',
}

const highlights = computed(() => {
  const itemsData = tm('home.highlights.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []

  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}
    const id = getI18nStaticValue(itemData.id)
    const title = getI18nStaticValue(itemData.title)
    const description = getI18nStaticValue(itemData.description)

    return {
      id,
      title: rt(title),
      description: rt(description),
      icon: highlightIcons[id] || 'i-tabler-star',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('nav.home')" class="section-enter">
    <!-- Hero Section -->
    <div class="bg-default rounded-2xl py-12">
      <div class="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
        <figure class="shrink-0">
          <NuxtImg
            src="/full-pic.jpg"
            class="max-w-45 rounded-2xl shadow-xl sm:max-w-55 xl:max-w-70"
            :alt="t('header.profileAlt')"
            loading="eager"
            width="560"
            height="746"
            format="webp"
            quality="85"
          />
        </figure>
        <div class="max-w-2xl">
          <h1 class="text-primary-500 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {{ t('home.hero.title') }}
          </h1>
          <p
            v-if="t('home.hero.subtitle')"
            class="text-primary-400 mt-2 text-lg font-medium sm:text-xl lg:text-2xl"
          >
            {{ t('home.hero.subtitle') }}
          </p>
          <p class="text-muted mt-6 text-base leading-relaxed sm:text-lg">
            {{ t('home.hero.pitch') }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <UButton :to="localePath('/experiencia')" color="primary" icon="i-tabler-briefcase">
              {{ t('home.cta.experience') }}
            </UButton>
            <UButton
              :to="localePath('/contacto')"
              color="primary"
              variant="outline"
              icon="i-tabler-mail"
            >
              {{ t('home.cta.contact') }}
            </UButton>
            <UButton
              to="https://www.linkedin.com/in/ivansalidocobo/"
              target="_blank"
              color="neutral"
              variant="outline"
              icon="i-tabler-brand-linkedin"
              :aria-label="t('contact.linkedinLabel')"
            >
              LinkedIn
            </UButton>
            <UButton
              to="https://www.instagram.com/ivansalidocobo/"
              target="_blank"
              color="neutral"
              variant="outline"
              icon="i-tabler-brand-instagram"
              :aria-label="t('contact.instagramLabel')"
            >
              Instagram
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-8" />

    <!-- Highlights Section -->
    <div>
      <h2 class="text-primary-500 mb-8 text-center text-2xl font-bold sm:text-3xl">
        {{ t('home.highlights.title') }}
      </h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <UCard
          v-for="(highlight, index) in highlights"
          :key="index"
          class="transition-all hover:shadow-lg"
        >
          <div class="flex flex-col items-center text-center">
            <div
              class="bg-primary-500/10 mb-4 flex size-16 items-center justify-center rounded-full"
            >
              <UIcon :name="highlight.icon" class="text-primary-500 size-8" aria-hidden="true" />
            </div>
            <h3 class="text-primary-400 text-lg font-semibold">
              {{ highlight.title }}
            </h3>
            <p class="text-muted mt-2">
              {{ highlight.description }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
