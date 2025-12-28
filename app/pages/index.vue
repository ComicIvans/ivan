<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

// SEO meta dinámico según idioma
useSeoMeta({
  title: () => t('seo.pageTitle'),
  description: () => t('seo.description'),
})

const highlightIcons: Record<string, string> = {
  governance: 'uil:university',
  infrastructure: 'uil:server-network',
  events: 'tabler:calendar-event',
}

const highlights = computed(() => {
  const itemsData = tm('home.highlights.items') as unknown
  const items = Array.isArray(itemsData) ? itemsData : []

  return items.map((item: unknown) => {
    const itemData = (item as Record<string, any>) || {}

    const id = getI18nStaticValue(itemData.id)
    const title = getI18nStaticValue(itemData.title)
    const description = getI18nStaticValue(itemData.description)

    const icon = highlightIcons[id]

    return {
      id,
      title: rt(title),
      description: rt(description),
      icon: icon || 'tabler:star',
    }
  })
})
</script>

<template>
  <section role="region" :aria-label="t('nav.home')" class="section-enter">
    <!-- Hero Section -->
    <div class="hero min-h-[40vh] rounded-box bg-base-100">
      <div class="hero-content flex-col gap-8 text-center lg:flex-row lg:text-left">
        <figure class="shrink-0">
          <NuxtImg
            src="/full-pic.jpg"
            class="max-w-[180px] rounded-box shadow-xl sm:max-w-[220px] xl:max-w-[280px]"
            :alt="t('header.profileAlt')"
            loading="eager"
            width="560"
            height="746"
            format="webp"
            quality="85"
          />
        </figure>
        <div class="max-w-2xl">
          <h1 class="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            {{ t('home.hero.title') }}
          </h1>
          <p
            v-if="t('home.hero.subtitle')"
            class="mt-2 text-lg font-medium text-secondary sm:text-xl lg:text-2xl"
          >
            {{ t('home.hero.subtitle') }}
          </p>
          <p class="mt-6 text-base leading-relaxed text-base-content/90 sm:text-lg">
            {{ t('home.hero.pitch') }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <NuxtLink :to="localePath('/experiencia')" class="btn btn-primary">
              <Icon name="tabler:briefcase" class="h-5 w-5" />
              {{ t('home.cta.experience') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/contacto')" class="btn btn-outline btn-secondary">
              <Icon name="tabler:mail" class="h-5 w-5" />
              {{ t('home.cta.contact') }}
            </NuxtLink>
            <a
              href="https://www.linkedin.com/in/ivansalidocobo/"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline"
              :aria-label="t('contact.linkedinLabel')"
            >
              <Icon name="tabler:brand-linkedin" class="h-5 w-5" />
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/ivansalidocobo/"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline"
              :aria-label="t('contact.instagramLabel')"
            >
              <Icon name="tabler:brand-instagram" class="h-5 w-5" />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider my-8"></div>

    <!-- Highlights Section -->
    <div>
      <h2 class="mb-8 text-center text-2xl font-bold text-primary sm:text-3xl">
        {{ t('home.highlights.title') }}
      </h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article
          v-for="(highlight, index) in highlights"
          :key="index"
          class="card-border card bg-base-100 transition-all hover:shadow-lg"
        >
          <div class="card-body items-center text-center">
            <div class="mb-4 rounded-full bg-primary/10 p-4">
              <Icon :name="highlight.icon" class="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
            <h3 class="card-title text-lg text-secondary">
              {{ highlight.title }}
            </h3>
            <p class="text-base-content/80">
              {{ highlight.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
