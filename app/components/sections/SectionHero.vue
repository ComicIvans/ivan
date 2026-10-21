<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { auroraColorStops as auroraColorStopsByScheme } from '~~/shared/constants/theme'
import { variantsById } from '~/components/credential/credentialVariants'

defineProps<{ id: string }>()

// SSR badge visibility: once the traveling layer owns the visual, the hero
// instance hides (visibility keeps its box; SSR renders it visible).
const { layerMounted } = useCredentialJourney()

const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const colorMode = useColorMode()
const motionTier = useMotionTier()
const { getCoverAlt } = useGalleryImages()

const { highlights, currentRole, projects, representationStats, stack } = useProfile()

// Hero aurora: WebGL is a garnish, so it only mounts client-side on the full
// motion tier and when WebGL2 is actually available. The panel gradient in
// CSS stays as the SSR/static fallback.
const webgl2Available = ref(false)

onMounted(() => {
  try {
    webgl2Available.value = document.createElement('canvas').getContext('webgl2') !== null
  } catch {
    webgl2Available.value = false
  }
})

const showAurora = computed(() => webgl2Available.value && motionTier.value === 'full')

const auroraColorStops = computed(() => [
  ...(colorMode.value === 'dark' ? auroraColorStopsByScheme.dark : auroraColorStopsByScheme.light),
])

// Stats derived from content that already exists elsewhere on the page.
const projectsCount = computed(() => projects.value.length)
const rolesCount = computed(() => representationStats.value.roles)

const { allEvents, totalEvents } = useGalleryEvents()
const latestEvent = computed(() => allEvents.value[0] ?? null)
const latestEventLink = computed(() =>
  latestEvent.value ? localePath(`/galeria/${latestEvent.value.slug}`) : ''
)

const stackMarqueeItems = computed(() =>
  [...stack.value.primary, ...stack.value.secondary].map((tech) => ({
    label: tech.name,
    icon: tech.icon,
  }))
)

// Bento grid (md: 3 columns, lg: 4): the highlight tiles plus the "Now" tile
// close their rows whatever their number, and the stats/latest-event row
// stays full, so editing the content never leaves holes in the grid.
const leadTileCount = computed(() => highlights.value.length + (currentRole.value ? 1 : 0))
const LG_SPAN = ['', 'lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4'] as const

const lastLeadTileClass = computed(() => {
  const count = leadTileCount.value
  const lgRemainder = count % 4
  const lgSpan = lgRemainder ? 5 - lgRemainder : 1
  // md: two tiles left on the last row would push the 2-column stats tile
  // onto a new row, so the last lead tile widens to close its own row.
  const mdWide = count % 3 === 2
  return [mdWide ? 'md:col-span-2' : '', mdWide || lgSpan > 1 ? LG_SPAN[lgSpan] : '']
})

const statsTileClass = computed(() => [
  leadTileCount.value % 3 === 1 ? 'md:col-span-2' : 'md:col-span-3',
  latestEvent.value ? 'lg:col-span-2' : 'lg:col-span-4',
])

const isLastLeadTile = (index: number) =>
  !currentRole.value && index === highlights.value.length - 1

function scrollToSection(targetId: string) {
  const el = document.getElementById(targetId)
  if (!el) return
  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: motionOk ? 'smooth' : 'auto' })
}

const primaryCta = useTemplateRef<HTMLElement>('primaryCta')
useMagnet(primaryCta)

const sectionEl = useTemplateRef<HTMLElement>('sectionEl')
const heroTitle = useTemplateRef<HTMLElement>('heroTitle')

let heroSplit: SplitText | null = null

function createHeroSplit() {
  const el = heroTitle.value
  if (!el) return
  heroSplit?.revert()
  heroSplit = SplitText.create(el, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    aria: 'auto',
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.04,
      }),
  })
}

useGsapMatchMedia(sectionEl, (ctx) => {
  const tiles = '.bento-tile'

  if (ctx.conditions?.reduceMotion) {
    gsap.set(tiles, { autoAlpha: 1 })
    if (heroTitle.value) gsap.set(heroTitle.value, { autoAlpha: 1 })
    return
  }

  gsap.set(tiles, { autoAlpha: 0, y: 32 })
  ScrollTrigger.batch(tiles, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }),
  })

  // Hero recedes as the next content scrolls in (keyed to the panel, not the
  // whole section, so the bento grid below doesn't stretch the effect).
  const heroPanel = sectionEl.value?.querySelector('.home-hero-panel')
  if (heroPanel) {
    gsap.to('.hero-inner', {
      yPercent: -8,
      autoAlpha: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: heroPanel,
        start: 'bottom 85%',
        end: 'bottom 35%',
        scrub: true,
      },
    })
  }

  // Waiting for fonts avoids splitting lines that reflow once webfonts land.
  let cancelled = false
  document.fonts.ready.then(() => {
    if (!cancelled) createHeroSplit()
  })

  return () => {
    cancelled = true
    heroSplit?.revert()
    heroSplit = null
  }
})

// The split caches the headline text, so rebuild it after a locale switch.
watch(locale, async () => {
  if (!heroSplit) return
  await nextTick()
  createHeroSplit()
})
</script>

<template>
  <section :id="id" ref="sectionEl" :aria-label="t('nav.home')">
    <!-- Hero panel: fills the first viewport under the navbar -->
    <div
      class="home-hero-panel relative flex min-h-[calc(88svh-var(--navbar-h))] items-center py-12"
    >
      <ClientOnly>
        <!-- Lazy prefix code-splits Aurora (and its ogl dependency) into its
             own async chunk so it never reaches the initial page bundle. -->
        <LazyBitsAurora
          v-if="showAurora"
          class="pointer-events-none absolute inset-0 opacity-50 dark:opacity-65"
          :color-stops="auroraColorStops"
          :amplitude="0.8"
          :speed="0.6"
          :blend="0.55"
        />
      </ClientOnly>
      <div
        class="hero-inner relative flex w-full flex-col items-center gap-8 text-center lg:flex-row lg:text-left"
      >
        <!-- Event credential: the SSR instance every tier sees first; on the
             full tier the fixed layer takes over and this one hides. -->
        <CredentialAnchor
          section="inicio"
          class="order-last mx-auto shrink-0 lg:mx-0 lg:self-center"
        >
          <div :style="{ visibility: layerMounted ? 'hidden' : 'visible' }" class="size-full">
            <CredentialBadge :variant="variantsById.inicio" />
          </div>
        </CredentialAnchor>

        <figure class="shrink-0">
          <NuxtImg
            src="/full-pic.webp"
            class="home-hero-portrait float-y max-w-45 rounded-2xl shadow-xl sm:max-w-55 xl:max-w-70"
            :alt="t('header.profileAlt')"
            loading="eager"
            fetchpriority="high"
            width="560"
            height="746"
            sizes="180px sm:220px xl:280px"
            preload
            format="webp"
            quality="78"
          />
        </figure>
        <div class="max-w-2xl">
          <h1
            ref="heroTitle"
            class="type-display text-highlighted text-4xl sm:text-5xl lg:text-6xl"
            :aria-label="t('home.hero.title')"
          >
            {{ t('home.hero.titleLead') }}
            <span class="ink-gradient">{{ t('home.hero.titleAccent') }}</span>
          </h1>
          <p class="text-muted mt-6 text-base leading-relaxed sm:text-lg">
            {{ t('home.hero.pitch') }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <div ref="primaryCta" class="inline-flex">
              <UButton
                color="primary"
                icon="i-tabler-briefcase"
                @click="scrollToSection('experiencia')"
              >
                {{ t('home.cta.experience') }}
              </UButton>
            </div>
            <UButton
              color="primary"
              variant="outline"
              icon="i-tabler-mail"
              @click="scrollToSection('contacto')"
            >
              {{ t('home.cta.contact') }}
            </UButton>
            <div class="flex gap-3">
              <SocialLinks placement="hero" />
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll cue -->
      <button
        type="button"
        class="hero-scroll-cue text-muted hover:text-highlighted absolute bottom-4 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 font-mono text-xs transition-colors"
        @click="scrollToSection('experiencia')"
      >
        {{ t('home.hero.scrollCue') }}
        <UIcon name="i-tabler-chevron-down" class="size-5" aria-hidden="true" />
      </button>
    </div>

    <!-- Highlights Bento Grid -->
    <div class="mt-14">
      <SectionHeader :title="t('home.highlights.title')" index="01" class="reveal" />
      <div class="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        <article
          v-for="(highlight, index) in highlights"
          :key="highlight.id"
          v-spotlight
          class="bento-tile surface-glass motion-card rounded-2xl p-5 sm:p-6"
          :class="isLastLeadTile(index) ? lastLeadTileClass : ''"
        >
          <div class="bg-primary-500/10 flex size-12 items-center justify-center rounded-xl">
            <UIcon
              :name="highlight.icon"
              class="text-primary-600 dark:text-primary-400 size-6"
              aria-hidden="true"
            />
          </div>
          <h3 class="text-highlighted mt-4 text-lg font-semibold">
            {{ highlight.title }}
          </h3>
          <p class="text-muted mt-2 text-sm leading-relaxed">
            {{ highlight.description }}
          </p>
        </article>

        <button
          v-if="currentRole"
          v-spotlight
          type="button"
          class="bento-tile surface-glass motion-link-card block cursor-pointer rounded-2xl p-5 text-left sm:p-6"
          :class="lastLeadTileClass"
          @click="scrollToSection('experiencia')"
        >
          <p class="text-primary flex items-center gap-2 text-xs font-medium tracking-wide">
            <span class="relative flex size-2" aria-hidden="true">
              <span
                class="now-dot-ping bg-primary-500 absolute inline-flex size-full rounded-full"
              />
              <span class="bg-primary-500 relative inline-flex size-2 rounded-full" />
            </span>
            {{ t('home.now.title') }}
          </p>
          <p class="text-highlighted mt-3 font-semibold">
            {{ currentRole.title }}
          </p>
          <p class="text-muted mt-1 text-sm leading-snug">
            {{ currentRole.organization }}
          </p>
        </button>

        <div
          v-spotlight
          class="bento-tile surface-glass motion-card rounded-2xl p-5 sm:p-6"
          :class="statsTileClass"
        >
          <div class="grid h-full grid-cols-3 items-center gap-4">
            <StatCounter :value="projectsCount" :label="t('home.stats.projects')" />
            <StatCounter :value="rolesCount" :label="t('home.stats.roles')" />
            <StatCounter :value="totalEvents" :label="t('home.stats.events')" />
          </div>
        </div>

        <NuxtLink
          v-if="latestEvent"
          v-spotlight
          :to="latestEventLink"
          :aria-label="`${t('home.tiles.gallery')}: ${latestEvent.title}`"
          class="bento-tile surface-glass motion-link-card group relative block min-h-48 overflow-hidden rounded-2xl md:col-span-3 lg:col-span-2"
        >
          <NuxtImg
            v-if="latestEvent.cover"
            :src="latestEvent.cover.src"
            :alt="getCoverAlt(latestEvent.title, latestEvent.cover.alt)"
            class="motion-link-media absolute inset-0 size-full object-cover"
            loading="lazy"
            width="640"
            height="360"
            sizes="xs:100vw lg:520px"
          />
          <div v-else class="bg-elevated absolute inset-0 flex items-center justify-center">
            <UIcon name="i-tabler-photo" class="text-dimmed size-12" aria-hidden="true" />
          </div>
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 from-0% to-transparent to-45% p-5 pt-14"
          >
            <p class="text-xs font-medium tracking-wide text-white/75">
              {{ t('home.tiles.gallery') }}
            </p>
            <p class="mt-1 text-lg font-semibold text-white">{{ latestEvent.title }}</p>
          </div>
        </NuxtLink>

        <div class="bento-tile surface-glass rounded-2xl px-4 py-5 md:col-span-3 lg:col-span-4">
          <MarqueeStrip
            :items="stackMarqueeItems"
            :duration="50"
            :aria-label="t('projects.stack.title')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference '../../assets/css/main.css';

.home-hero-panel {
  @apply border-default bg-default/80 dark:bg-elevated/75 relative overflow-hidden rounded-[2rem] border px-6 py-10 shadow-sm shadow-black/5 backdrop-blur-xl sm:px-8 sm:py-12 dark:shadow-black/30;
}

.home-hero-panel::after {
  content: '';
  position: absolute;
  inset: auto -10% -35% auto;
  width: 18rem;
  height: 18rem;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--color-ember-400) 14%, transparent),
    transparent 68%
  );
  pointer-events: none;
}

:global(.dark) .home-hero-panel::after {
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--color-ember-400) 10%, transparent),
    transparent 68%
  );
}

.home-hero-portrait {
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.home-hero-portrait:hover {
  transform: translate3d(0, -0.25rem, 0) scale(1.01);
}

@media (prefers-reduced-motion: no-preference) {
  .now-dot-ping {
    animation: now-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .hero-scroll-cue > span,
  .hero-scroll-cue :deep(svg) {
    animation: cue-bob 2.2s ease-in-out infinite;
  }
}

@keyframes now-ping {
  75%,
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes cue-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(0.3rem);
  }
}
</style>
