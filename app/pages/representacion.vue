<script setup lang="ts">
const { t, tm, rt } = useI18n()

// SEO meta para la página de representación
useSeoMeta({
  title: () => t('representation.title'),
  description: () => t('seo.pages.representation'),
})

const currentItems = ['creup-digitalization', 'upv-delegate']

const timelineItems = computed(() => {
  const timeline = tm('representation.timeline') as Array<{
    id: string
    date: string
    title: string
    description: string
    highlights: string[]
  }>
  return timeline.map((item) => ({
    id: item.id,
    date: rt(item.date),
    title: rt(item.title),
    description: rt(item.description),
    highlights: item.highlights.map((h) => rt(h)),
    current: currentItems.includes(item.id),
  }))
})
</script>

<template>
  <section role="region" :aria-label="t('representation.title')" class="section-enter">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
        {{ t('representation.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-base text-base-content/80 sm:text-lg">
        {{ t('representation.intro') }}
      </p>
    </div>

    <!-- Timeline -->
    <ul
      class="timeline timeline-vertical timeline-snap-icon mx-auto max-w-4xl max-md:timeline-compact"
      role="list"
      :aria-label="t('representation.timelineLabel')"
    >
      <li v-for="(item, index) in timelineItems" :key="index">
        <hr v-if="index > 0" :class="item.current ? '' : 'bg-primary'" />
        <div class="timeline-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-5 w-5"
            :class="item.current ? 'text-primary' : 'text-primary'"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="mb-10" :class="index % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'">
          <time class="font-mono text-sm italic text-base-content/70">{{ item.date }}</time>
          <h2 class="text-lg font-black text-secondary">{{ item.title }}</h2>
          <p class="mt-1 text-base-content/80">
            {{ item.description }}
          </p>
          <div
            v-if="item.highlights.length > 0"
            class="mt-2 flex flex-wrap gap-2"
            :class="index % 2 === 0 ? 'md:justify-end' : ''"
          >
            <span
              v-for="highlight in item.highlights"
              :key="highlight"
              class="badge badge-primary badge-outline"
            >
              {{ highlight }}
            </span>
          </div>
        </div>
        <hr v-if="index < timelineItems.length - 1" :class="item.current ? '' : 'bg-primary'" />
      </li>
    </ul>
  </section>
</template>
