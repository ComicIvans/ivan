<script setup lang="ts">
import gsap from 'gsap'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const { getCoverAlt } = useGalleryImages()

const { allEvents } = useGalleryEvents()

// Asymmetric mosaic: up to five events with a cover, the newest one doubled.
const mosaicEvents = computed(() => allEvents.value.filter((event) => event.cover).slice(0, 5))

/**
 * Spans of the tiles that share the 2 x 2 lg block next to the newest event,
 * by how many there are, so the 4 x 2 lg grid never shows a hole.
 */
const LG_BLOCK_SPANS: Record<number, { class: string; columns: number }[]> = {
  0: [],
  1: [{ class: 'lg:col-span-2 lg:row-span-2', columns: 2 }],
  2: [
    { class: 'lg:col-span-2', columns: 2 },
    { class: 'lg:col-span-2', columns: 2 },
  ],
  3: [
    { class: '', columns: 1 },
    { class: '', columns: 1 },
    { class: 'lg:col-span-2', columns: 2 },
  ],
  4: [
    { class: '', columns: 1 },
    { class: '', columns: 1 },
    { class: '', columns: 1 },
    { class: '', columns: 1 },
  ],
}

// Rendered width of one lg column (a quarter of the 1232 px content box).
const LG_COLUMN_PX = 320

/**
 * Tile layout for 1–5 events. sm–md (2 columns): the newest tile takes a full
 * row, and so does the last one when the others are an odd number. lg: the
 * newest tile fills 2 x 2 cells (all 4 x 2 when it is alone). `sizes` follows
 * the rendered width of each tile.
 *
 * Nuxt Image derives each srcset candidate from the lower edge of its
 * breakpoint (xs:100vw yields 320 px x 1 and x 2), so the half-width tiles,
 * which fill the row on phones, would top out at 768w on a high-density
 * screen. They add an x3 density to reach about 1150w; tiles that span a full
 * row already get 1280w from their sm:100vw.
 */
const mosaicTiles = computed(() => {
  const [newest, ...others] = mosaicEvents.value
  if (!newest) return []

  const featuredColumns = others.length === 0 ? 4 : 2
  const featured = {
    event: newest,
    featured: true,
    class: `sm:col-span-2 lg:row-span-2 ${featuredColumns === 4 ? 'lg:col-span-4' : 'lg:col-span-2'}`,
    sizes: `xs:100vw sm:100vw lg:${featuredColumns * LG_COLUMN_PX}px`,
    densities: undefined,
  }

  const spans = LG_BLOCK_SPANS[others.length] ?? []
  return [
    featured,
    ...others.map((event, index) => {
      const fullRow = others.length % 2 === 1 && index === others.length - 1
      const lg = spans[index] ?? { class: '', columns: 1 }
      return {
        event,
        featured: false,
        class: `${fullRow ? 'sm:col-span-2 sm:aspect-[32/10]' : ''} ${lg.class}`,
        sizes: `xs:100vw ${fullRow ? 'sm:100vw' : 'sm:50vw md:50vw'} lg:${lg.columns * LG_COLUMN_PX}px`,
        densities: fullRow ? undefined : 'x1 x2 x3',
      }
    }),
  ]
})

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
  <section :id="id" ref="sectionEl" class="py-20 sm:py-28" :aria-labelledby="`${id}-title`">
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

    <!-- Tiles keep a CSS ratio, so the covers need no width/height. lg: a fixed
         4 x 2 grid whose cells keep the 16:10 tile ratio. Each cell is a
         wrapper that carries the layout and the entrance or parallax
         transform, and the link inside it fills it (a one-cell grid stretches
         it), so the link's own hover lift never competes with them. min-h-0
         keeps the cover's own ratio from stretching the wrapper. -->
    <div
      v-if="mosaicTiles.length > 0"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:aspect-[32/10] lg:grid-cols-4 lg:grid-rows-2"
    >
      <div
        v-for="tile in mosaicTiles"
        :key="tile.event.slug"
        class="gallery-tile reveal grid aspect-[16/10] min-h-0 min-w-0 lg:aspect-auto"
        :class="tile.class"
      >
        <NuxtLink
          v-spotlight
          :to="localePath(`/galeria/${tile.event.slug}`)"
          :aria-label="`${tile.event.title}. ${tile.event.monthText}`"
          class="motion-link-card group relative block overflow-hidden rounded-2xl"
        >
          <NuxtImg
            v-if="tile.event.cover"
            :src="tile.event.cover.src"
            :alt="getCoverAlt(tile.event.title, tile.event.cover.alt)"
            :style="{ viewTransitionName: `gallery-cover-${tile.event.slug}` }"
            class="motion-link-media size-full object-cover"
            loading="lazy"
            format="webp"
            quality="75"
            :sizes="tile.sizes"
            :densities="tile.densities"
          />
          <!-- Title scrim confined to the bottom band -->
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 from-0% to-transparent to-45%"
          >
            <div class="px-4 pt-10 pb-3">
              <h3
                class="line-clamp-2 leading-snug font-bold text-white drop-shadow-sm"
                :class="tile.featured ? 'text-xl' : 'text-base'"
              >
                {{ tile.event.title }}
              </h3>
              <p class="mt-0.5 font-mono text-xs text-white/85">
                {{ tile.event.monthText }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
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
/* Full motion tier (the same query as useMotionTier's 'full'): the scrubbed
   parallax owns the tile transform. The .reveal entrance animates transform
   too, and a running CSS animation would override it, so the tiles keep the
   CSS entrance only on the other tiers. */
@media (min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .gallery-tile {
    animation: none;
  }
}
</style>
