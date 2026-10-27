<script setup lang="ts">
import gsap from 'gsap'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

const { stack, projects } = useProfile()

// Icon tile tint per stack category (set per item in content/profile/projects.yml).
const techTileClasses = {
  ember: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
} as const

// Cover plate aurora tints come from theme colour tokens in the content data.
const defaultAccent = { from: 'ember-500', to: 'amber-400' }

function accentStyle(accent: { from: string; to: string } | undefined) {
  const { from, to } = accent ?? defaultAccent
  return { '--card-accent': `var(--color-${from})`, '--card-accent-2': `var(--color-${to})` }
}

// An engine without :focus-visible throws here; count its focus as keyboard
// focus so the clipped cards stay reachable there.
function isKeyboardFocus(el: Element) {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

const sceneEl = useTemplateRef<HTMLElement>('sceneEl')
const trackEl = useTemplateRef<HTMLElement>('trackEl')
const journey = useCredentialJourney()

function setupScene(ctx: gsap.Context) {
  const scene = sceneEl.value
  const cards = scene ? Array.from(scene.querySelectorAll<HTMLElement>('.project-card')) : []
  if (!scene || !cards.length) return

  if (ctx.conditions?.reduceMotion) return

  if (ctx.conditions?.fullMotion && ctx.conditions?.pinFits && trackEl.value) {
    // Horizontal showcase: the scene pins while the card track translates
    // sideways; snapping parks one project per beat. The pin spacer is
    // GSAP-managed layout, not a scroll-dependent height (no feedback loops).
    // The row layout itself only exists while this pin drives it
    // (data-pinned); every other tier, a window too short to hold a parked
    // card, and the page before JS runs keep the grid so no project is
    // clipped out of reach.
    const track = trackEl.value
    scene.dataset.pinned = ''
    const getScroll = () => Math.max(0, track.scrollWidth - track.clientWidth)
    const snapToCard = gsap.utils.snap(1 / Math.max(1, cards.length - 1))
    // Set while a keyboard focus jump settles: snapping would otherwise read
    // the jump as momentum and carry it on to a neighbouring card.
    let focusSnap: { progress: number; until: number } | null = null
    const showcase = gsap.to(track, {
      x: () => -getScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        pin: true,
        scrub: 1,
        end: () => `+=${getScroll()}`,
        onUpdate: (self) => {
          // DEMO PASS index tracks the snapped project (numeric, unlocalized)
          const index = Math.round(self.progress * (cards.length - 1)) + 1
          journey.projectIndex.value = `P-${String(index).padStart(2, '0')}`
        },
        snap:
          cards.length > 1
            ? {
                snapTo: (value: number) =>
                  focusSnap && performance.now() < focusSnap.until
                    ? focusSnap.progress
                    : snapToCard(value),
                duration: 0.3,
                ease: 'power1.inOut',
              }
            : undefined,
        invalidateOnRefresh: true,
        // Pin spacers must exist before any later fixed-layer trigger measures.
        refreshPriority: 1,
      },
    })
    const pin = showcase.scrollTrigger

    // Keyboard focus: the clipped row cannot scroll itself into view, so move
    // the page to the scroll position where the focused card is parked.
    // Pointer focus is left alone: Chromium focuses a link on mousedown, and
    // jumping then would slide the link away before mouseup and swallow the
    // click.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !isKeyboardFocus(target)) return
      const card = target.closest('.project-card')
      const index = card ? cards.indexOf(card as HTMLElement) : -1
      if (!pin || index < 0) return
      const progress = cards.length > 1 ? index / (cards.length - 1) : 0
      focusSnap = { progress, until: performance.now() + 1500 }
      pin.scroll(pin.start + (pin.end - pin.start) * progress)
    }
    track.addEventListener('focusin', onFocusIn)

    return () => {
      track.removeEventListener('focusin', onFocusIn)
      delete scene.dataset.pinned
    }
  }

  // Mobile / tablet, or a short desktop window: the grid with a staggered
  // entrance.
  return revealOnScroll(scene, cards)
}

useGsapMatchMedia(sceneEl, setupScene, {
  // The shortest window whose pinned scene still holds a whole card with the
  // cover at its minimum height (see .project-cover below). matchMedia swaps
  // the pin for the grid when a resize crosses it.
  pinFits: '(min-height: 32rem)',
})
</script>

<template>
  <section :id="id" class="py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <RevealHeading :title="t('projects.title')" :heading-id="`${id}-title`" accent="ember" />

    <!-- Tech Stack -->
    <div class="reveal">
      <SectionHeader
        as="h3"
        index="01"
        :title="t('projects.stack.title')"
        icon="i-tabler-stack-2"
        accent="ember"
      />

      <h4 class="mb-4 text-lg font-semibold text-muted">
        {{ t('projects.stack.primary.title') }}
      </h4>
      <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard v-for="tech in stack.primary" :key="tech.id" v-spotlight class="motion-card">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg"
              :class="techTileClasses[tech.tint]"
            >
              <UIcon :name="tech.icon" class="size-6" aria-hidden="true" />
            </div>
            <h5 class="font-bold">{{ tech.name }}</h5>
          </div>
          <p v-if="tech.description" class="mt-2 text-sm text-muted">{{ tech.description }}</p>
        </UCard>
      </div>

      <h4 class="mb-4 text-lg font-semibold text-muted">
        {{ t('projects.stack.secondary.title') }}
      </h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="tech in stack.secondary"
          :key="tech.id"
          class="flex items-center gap-2 rounded-full border border-default bg-elevated/50 px-4 py-2"
        >
          <UIcon :name="tech.icon" class="size-5 text-muted" aria-hidden="true" />
          <span class="font-medium">{{ tech.name }}</span>
        </div>
      </div>
    </div>

    <!-- Projects: a grid; on the full motion tier the scene pins and the track
         becomes a horizontal row (data-pinned, set by the pin setup above). -->
    <div ref="sceneEl" class="projects-scene relative mt-16">
      <!-- Badge dock inside the pinned scene: stable coords while pinned -->
      <CredentialAnchor section="proyectos" class="projects-dock" />
      <SectionHeader
        as="h3"
        index="02"
        :title="t('projects.list.title')"
        icon="i-tabler-folder-code"
        accent="ember"
        class="reveal"
      />

      <div class="projects-viewport">
        <div ref="trackEl" class="projects-track grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article
            v-for="project in projects"
            :key="project.id"
            v-spotlight
            class="project-card motion-link-card min-w-0 overflow-hidden rounded-lg bg-default ring ring-default"
            :style="accentStyle(project.accent)"
          >
            <div class="project-cover relative aspect-[2/1] overflow-hidden">
              <NuxtImg
                v-if="project.screenshot"
                :src="project.screenshot.src"
                :alt="project.screenshot.alt"
                class="motion-link-media absolute inset-0 size-full object-cover"
                loading="lazy"
                width="1216"
                height="608"
                sizes="100vw sm:640px lg:608px"
              />
              <div v-else class="cover-plate motion-link-media absolute inset-0" aria-hidden="true">
                <UIcon
                  :name="project.icon"
                  class="plate-icon absolute right-6 bottom-0 size-24 translate-y-1/4"
                />
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <p v-if="project.year" class="font-mono text-xs text-muted">{{ project.year }}</p>
              <h4 class="text-lg font-bold">{{ project.title }}</h4>
              <p class="mt-2 text-muted">{{ project.description }}</p>
              <dl v-if="project.metrics.length" class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                <div v-for="metric in project.metrics" :key="metric.label">
                  <dt class="text-xs text-muted">{{ metric.label }}</dt>
                  <dd class="font-mono text-lg font-semibold text-highlighted tabular-nums">
                    {{ metric.value }}
                  </dd>
                </div>
              </dl>
              <div v-if="project.tags.length" class="mt-3 flex flex-wrap gap-2">
                <UBadge v-for="tag in project.tags" :key="tag" variant="outline" size="sm">
                  {{ tag }}
                </UBadge>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <UButton
                  :to="project.url"
                  :label="project.linkText"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="link"
                  size="sm"
                  trailing-icon="i-tabler-external-link"
                  class="max-w-full p-0"
                  :ui="{ label: 'break-all whitespace-normal text-left' }"
                />
                <UButton
                  v-if="project.repository"
                  :to="project.repository"
                  label="GitHub"
                  :aria-label="t('projects.list.repositoryLabel', { project: project.title })"
                  icon="i-simple-icons-github"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="link"
                  size="sm"
                  class="p-0"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Horizontal showcase, only while the pin drives the track. The scene pins
   flush with the viewport top, so its padding keeps the content and the
   badge dock clear of the fixed navbar. Everything inside must fit one
   viewport: the scene stays fixed while pinned, so whatever overflows it
   (the card links first) can never be scrolled or tabbed into view. */
.projects-scene[data-pinned] {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  justify-content: center;
  padding-top: var(--navbar-h);
}

.projects-dock {
  position: absolute;
  top: calc(var(--navbar-h) + 1.5rem);
  right: 1.5rem;
  display: none;
}

.projects-scene[data-pinned] .projects-dock {
  display: block;
}

/* clip, unlike hidden, is not a scroll container: focusing a card that sits
   off to the side cannot scroll the row out of step with the pin. */
.projects-scene[data-pinned] .projects-viewport {
  overflow: clip;
}

@supports not (overflow: clip) {
  .projects-scene[data-pinned] .projects-viewport {
    overflow: hidden;
  }
}

.projects-scene[data-pinned] .projects-track {
  display: flex;
  width: 100%;
  gap: 2rem;
}

.projects-scene[data-pinned] .project-card {
  width: min(38rem, 70vw);
  flex-shrink: 0;
}

/* The cover gives way first on shorter windows: 26rem is the rest of the
   pinned scene (navbar 3.5rem, sub-heading and its margin 4.5rem, the
   tallest card text 15rem) plus 3rem of air; 19rem is the 2:1 cover of a
   38rem card. Below 8rem the pin is dropped (pinFits above). */
.projects-scene[data-pinned] .project-cover {
  aspect-ratio: auto;
  height: clamp(8rem, 100svh - 26rem, 19rem);
}

/* Decorative cover band: per-project aurora wash on an adaptive elevated base. */
.cover-plate {
  background:
    radial-gradient(
      120% 150% at 12% -10%,
      color-mix(in oklab, var(--card-accent) 28%, transparent),
      transparent 58%
    ),
    radial-gradient(
      110% 140% at 90% 110%,
      color-mix(in oklab, var(--card-accent-2) 24%, transparent),
      transparent 62%
    ),
    color-mix(in oklab, var(--ui-bg-elevated) 70%, transparent);
}

/* Same film-grain tile used by the global layout surface. */
.cover-plate::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  background-size: 160px 160px;
  opacity: 0.35;
}

.plate-icon {
  color: var(--card-accent);
  opacity: 0.22;
  transform: rotate(-8deg);
}
</style>
