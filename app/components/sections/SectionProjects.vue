<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectIcons, techIcons } from '~/constants/icons'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

// Icon tile tint per stack category: frontend (nuxt/vue) = ember, infrastructure (linux/docker) = blue.
const techTileClasses: Record<string, string> = {
  nuxt: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  vue: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  linux: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  docker: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

const primaryTech = useI18nList('projects.stack.primary.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    name: tr(raw.name),
    description: tr(raw.description),
    icon: techIcons[id] || 'i-tabler-code',
    tileClass: techTileClasses[id] || 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  }
})

const secondaryTech = useI18nList('projects.stack.secondary.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    name: tr(raw.name),
    icon: techIcons[id] || 'i-tabler-code',
  }
})

// Language-neutral technology / category tags shown across all locales.
const projectTags: Record<string, string[]> = {
  server: ['Linux', 'Docker', 'Self-hosted', 'Nginx'],
  firmas: ['Python', 'Vue.js', 'Full-stack'],
  'win-ens': ['PowerShell', 'ENS', 'Windows', 'Cybersecurity'],
  ceebi: ['Vue.js', 'Web', 'Events'],
}

// Cover plate aurora tints per project id, injected as CSS custom properties.
const projectAccents: Record<string, { from: string; to: string }> = {
  server: { from: 'var(--color-blue-500)', to: 'var(--color-blue-300)' },
  firmas: { from: 'var(--color-ember-500)', to: 'var(--color-ember-300)' },
  'win-ens': { from: 'var(--color-amber-500)', to: 'var(--color-amber-300)' },
  ceebi: { from: 'var(--color-ember-500)', to: 'var(--color-blue-400)' },
}

const defaultAccent = { from: 'var(--color-ember-500)', to: 'var(--color-amber-400)' }

const projects = useI18nList('projects.list.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  const link = value(raw.link)

  return {
    id,
    title: tr(raw.title),
    description: tr(raw.description),
    link: link.startsWith('http') ? link : `https://${link}`,
    linkText: link,
    icon: projectIcons[id] || 'i-tabler-folder-code',
    tags: projectTags[id] || [],
    accent: projectAccents[id] || defaultAccent,
  }
})

const sceneEl = useTemplateRef<HTMLElement>('sceneEl')
const trackEl = useTemplateRef<HTMLElement>('trackEl')
const journey = useCredentialJourney()

useGsapMatchMedia(sceneEl, (ctx) => {
  const cards = sceneEl.value ? Array.from(sceneEl.value.querySelectorAll('.project-card')) : []
  if (!cards.length) return

  if (ctx.conditions?.reduceMotion) {
    gsap.set(cards, { autoAlpha: 1 })
    return
  }

  if (ctx.conditions?.fullMotion && trackEl.value) {
    // Horizontal showcase: the scene pins while the card track translates
    // sideways; snapping parks one project per beat. The pin spacer is
    // GSAP-managed layout, not a scroll-dependent height (no feedback loops).
    const track = trackEl.value
    const getScroll = () => Math.max(0, track.scrollWidth - track.clientWidth)
    gsap.to(track, {
      x: () => -getScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: sceneEl.value,
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
            ? { snapTo: 1 / (cards.length - 1), duration: 0.3, ease: 'power1.inOut' }
            : undefined,
        invalidateOnRefresh: true,
        // Pin spacers must exist before any later fixed-layer trigger measures.
        refreshPriority: 1,
      },
    })
    return
  }

  // Mobile / tablet: vertical stack with a staggered entrance.
  gsap.set(cards, { autoAlpha: 0, y: 32 })
  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }),
  })
})
</script>

<template>
  <section :id="id" class="scroll-mt-24 py-20 sm:py-28" :aria-labelledby="`${id}-title`">
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

      <h3 class="text-muted mb-4 text-lg font-semibold">
        {{ t('projects.stack.primary.title') }}
      </h3>
      <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard v-for="tech in primaryTech" :key="tech.name" v-spotlight class="motion-card">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg"
              :class="tech.tileClass"
            >
              <UIcon :name="tech.icon" class="size-6" aria-hidden="true" />
            </div>
            <h4 class="font-bold">{{ tech.name }}</h4>
          </div>
          <p class="text-muted mt-2 text-sm">{{ tech.description }}</p>
        </UCard>
      </div>

      <h3 class="text-muted mb-4 text-lg font-semibold">
        {{ t('projects.stack.secondary.title') }}
      </h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="tech in secondaryTech"
          :key="tech.name"
          class="border-default bg-elevated/50 flex items-center gap-2 rounded-full border px-4 py-2"
        >
          <UIcon :name="tech.icon" class="text-muted size-5" aria-hidden="true" />
          <span class="font-medium">{{ tech.name }}</span>
        </div>
      </div>
    </div>

    <!-- Projects: pinned horizontal showcase on desktop, vertical stack below lg -->
    <div ref="sceneEl" class="relative mt-16 lg:flex lg:min-h-svh lg:flex-col lg:justify-center">
      <!-- Badge dock inside the pinned scene: stable coords while pinned -->
      <CredentialAnchor section="proyectos" class="absolute top-6 right-6 hidden lg:block" />
      <SectionHeader
        as="h3"
        index="02"
        :title="t('projects.list.title')"
        icon="i-tabler-folder-code"
        accent="ember"
        class="reveal"
      />

      <div class="lg:overflow-hidden">
        <div ref="trackEl" class="grid grid-cols-1 gap-6 lg:flex lg:w-full lg:gap-8">
          <article
            v-for="project in projects"
            :key="project.id"
            v-spotlight
            class="project-card motion-link-card bg-default ring-default overflow-hidden rounded-lg ring lg:w-[min(38rem,70vw)] lg:shrink-0"
            :style="{ '--card-accent': project.accent.from, '--card-accent-2': project.accent.to }"
          >
            <div class="relative aspect-[2/1] overflow-hidden" aria-hidden="true">
              <div class="cover-plate motion-link-media absolute inset-0">
                <UIcon
                  :name="project.icon"
                  class="plate-icon absolute right-6 bottom-0 size-24 translate-y-1/4"
                />
              </div>
            </div>
            <div class="p-4 sm:p-6">
              <h3 class="text-lg font-bold">{{ project.title }}</h3>
              <p class="text-muted mt-2">{{ project.description }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge v-for="tag in project.tags" :key="tag" variant="outline" size="sm">
                  {{ tag }}
                </UBadge>
              </div>
              <UButton
                :to="project.link"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                :trailing-icon="'i-tabler-external-link'"
                class="mt-3 p-0"
              >
                {{ project.linkText }}
              </UButton>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
