<script setup lang="ts">
import gsap from 'gsap'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const { getCoverAlt } = useGalleryImages()
const { formatDate } = useDateFormatter()
const formatMonthYear = (dateStr: string) => formatDate(dateStr, { year: 'numeric', month: 'long' })

const { allEvents } = useGalleryEvents()

// Asymmetric mosaic: latest four events with a cover, newest tile doubled.
const mosaicEvents = computed(() => allEvents.value.filter((event) => event.cover).slice(0, 4))

// Feed the credential PHOTO PASS: the traveling badge cycles these covers
// while docked at this section.
const journey = useCredentialJourney()
onMounted(() => {
  watchEffect(() => {
    journey.galleryCovers.value = mosaicEvents.value
      .map((event) => event.cover?.src)
      .filter((src): src is string => Boolean(src))
  })
})

const getEventSlug = (event: { path: string }) => event.path.split('/').pop()

const sectionEl = useTemplateRef<HTMLElement>('sectionEl')

// Depth: each tile drifts at a slightly different speed while the section
// crosses the viewport (desktop only; scrubbed, so it settles with the scroll).
useGsapMatchMedia(sectionEl, (ctx) => {
  if (!ctx.conditions?.fullMotion) return

  const tiles = sectionEl.value ? Array.from(sectionEl.value.querySelectorAll('.gallery-tile')) : []
  for (const [index, tile] of tiles.entries()) {
    gsap.fromTo(
      tile,
      { y: 24 + (index % 3) * 18 },
      {
        y: -(12 + (index % 3) * 10),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  }
})
</script>

<template>
  <section
    :id="id"
    ref="sectionEl"
    class="scroll-mt-24 py-20 sm:py-28"
    :aria-labelledby="`${id}-title`"
  >
    <div class="flex flex-wrap items-start justify-between gap-6">
      <RevealHeading
        :title="t('gallery.title')"
        :heading-id="`${id}-title`"
        :intro="t('gallery.intro')"
        accent="ember"
        class="min-w-0 flex-1"
      />
      <CredentialAnchor section="galeria" class="hidden shrink-0 lg:block" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      <NuxtLink
        v-for="(event, index) in mosaicEvents"
        :key="event.id"
        v-spotlight
        :to="localePath(`/galeria/${getEventSlug(event)}`)"
        :aria-label="`${event.title}. ${formatMonthYear(event.date)}`"
        class="gallery-tile motion-link-card reveal group relative block overflow-hidden rounded-2xl"
        :class="index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''"
      >
        <NuxtImg
          v-if="event.cover"
          :src="event.cover.src"
          :alt="getCoverAlt(event.title, event.cover.alt)"
          :style="{ viewTransitionName: `gallery-cover-${getEventSlug(event)}` }"
          class="motion-link-media size-full object-cover"
          loading="lazy"
          width="800"
          height="450"
          quality="75"
          sizes="xs:100vw md:50vw lg:40vw"
        />
        <!-- Title scrim confined to the bottom band -->
        <div
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 from-0% to-transparent to-45%"
        >
          <div class="px-4 pt-10 pb-3">
            <h3
              class="line-clamp-2 leading-snug font-bold text-white drop-shadow-sm"
              :class="index === 0 ? 'text-xl' : 'text-base'"
            >
              {{ event.title }}
            </h3>
            <p class="mt-0.5 font-mono text-xs text-white/85">
              {{ formatMonthYear(event.date) }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="mt-8 flex justify-center">
      <UButton
        :to="localePath('/galeria')"
        color="primary"
        variant="outline"
        icon="i-tabler-photo"
        size="lg"
      >
        {{ t('gallery.viewAll') }}
      </UButton>
    </div>
  </section>
</template>

<style scoped>
.gallery-tile {
  aspect-ratio: 16 / 10;
}
</style>
