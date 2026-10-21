<script lang="ts">
export interface TimelineSectionItem {
  title: string
  date: string
  organization?: string
  description: string
  icon: string
  highlights?: string[]
  current?: boolean
  /** External website shown under the description (opens in a new tab). */
  link?: { url: string; text: string }
}
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: TimelineSectionItem[]
    accent?: 'ember' | 'blue'
    ariaLabel?: string
    /** Badge text shown next to the entry flagged as current (e.g. "Actual"). */
    currentLabel?: string
    /**
     * Scroll-drawn thread spine (full motion tier): replaces the CSS spine
     * visually and lights milestones as it passes. The CSS spine stays as the
     * fallback everywhere else.
     */
    thread?: boolean
  }>(),
  {
    accent: 'ember',
    ariaLabel: undefined,
    currentLabel: undefined,
    thread: false,
  }
)

const emit = defineEmits<{ milestone: [index: number] }>()

const tier = useMotionTier()
const showThread = computed(() => props.thread && tier.value === 'full')

// Entries up to and including the current one count as reached, mirroring the
// completed/active progress a stepper would expose via model-value.
const currentIndex = computed(() => props.items.findIndex((item) => item.current))

const filledDotClass = computed(
  () =>
    ({
      ember: 'bg-primary-600 text-white',
      blue: 'bg-blue-600 text-white',
    })[props.accent]
)

const softDotClass = computed(
  () =>
    ({
      ember: 'bg-elevated text-primary-600 dark:text-primary-400 ring-1 ring-default',
      blue: 'bg-elevated text-blue-600 dark:text-blue-400 ring-1 ring-default',
    })[props.accent]
)

function dotClass(index: number) {
  const reached = currentIndex.value >= 0 && index <= currentIndex.value
  return reached ? filledDotClass.value : softDotClass.value
}
</script>

<template>
  <div class="timeline-wrap relative">
    <div class="timeline-spine" aria-hidden="true">
      <span class="timeline-spine-fill" :class="accent === 'blue' ? 'is-blue' : ''" />
    </div>

    <ClientOnly>
      <LazyCredentialThread
        v-if="showThread"
        :accent="accent"
        @milestone="emit('milestone', $event)"
      />
    </ClientOnly>

    <!-- role="list" keeps list semantics once list-style is removed (Safari/VoiceOver) -->
    <ol role="list" :aria-label="ariaLabel" class="relative flex list-none flex-col gap-6 p-0">
      <li v-for="(item, index) in items" :key="index" class="reveal relative flex gap-4 sm:gap-5">
        <span
          class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full"
          :class="[dotClass(index), item.current ? 'dot-current' : '']"
        >
          <UIcon :name="item.icon" class="size-5" aria-hidden="true" />
        </span>

        <div v-spotlight class="bg-elevated/50 min-w-0 flex-1 rounded-xl p-4">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="text-toned font-mono text-xs font-medium tracking-wide">
              {{ item.date }}
            </span>
            <UBadge v-if="item.current && currentLabel" color="warning" variant="subtle" size="sm">
              {{ currentLabel }}
            </UBadge>
          </div>
          <h3 class="text-highlighted mt-1.5 text-base font-semibold">{{ item.title }}</h3>
          <p v-if="item.organization" class="text-toned mt-0.5 text-sm font-medium">
            {{ item.organization }}
          </p>
          <p class="text-muted mt-1.5 text-sm">{{ item.description }}</p>
          <UButton
            v-if="item.link"
            :to="item.link.url"
            :label="item.link.text"
            target="_blank"
            rel="noopener noreferrer"
            variant="link"
            size="sm"
            trailing-icon="i-tabler-external-link"
            class="mt-2 max-w-full p-0"
            :ui="{ label: 'break-all whitespace-normal text-left' }"
          />
          <div v-if="item.highlights?.length" class="mt-3 flex flex-wrap gap-1.5">
            <UBadge
              v-for="highlight in item.highlights"
              :key="highlight"
              color="warning"
              variant="subtle"
            >
              {{ highlight }}
            </UBadge>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* "Thread of light" spine: a static track plus a gradient fill that sweeps in
   with scroll position. Pure CSS: browsers without scroll-driven animations
   (or with reduced motion) simply get the fully filled gradient line. */
.timeline-spine {
  position: absolute;
  inset-block: 1.25rem 0;
  inset-inline-start: calc(1.25rem - 1px);
  width: 2px;
  border-radius: 9999px;
  background: var(--ui-border);
  pointer-events: none;
  /* Dissolve past the last indicator instead of hard-stopping mid-card */
  mask-image: linear-gradient(180deg, #000 0%, #000 calc(100% - 5rem), transparent 100%);
}

.timeline-spine-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, var(--color-ember-500), var(--color-amber-400));
}

.timeline-spine-fill.is-blue {
  background: linear-gradient(180deg, var(--color-ember-500), var(--color-blue-500));
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .timeline-spine-fill {
      animation: spine-sweep linear both;
      animation-timeline: view();
      animation-range: cover 5% cover 75%;
    }
  }
}

@keyframes spine-sweep {
  from {
    clip-path: inset(0 0 100% 0);
  }

  to {
    clip-path: inset(0 0 0 0);
  }
}

.dot-current {
  box-shadow: 0 0 24px -6px var(--glow-soft);
}

/* While the drawn thread is mounted it IS the spine; the CSS one steps aside.
   Presence-based (:has) so it cannot drift from the actual DOM state. */
.timeline-wrap:has(> .credential-thread) .timeline-spine {
  opacity: 0;
}

/* Milestones light up as the thread reaches them */
:deep(.thread-lit) {
  background: var(--color-ember-500) !important;
  color: #fff !important;
  box-shadow: 0 0 20px -4px var(--glow-soft);
  transition:
    background-color 300ms ease,
    box-shadow 300ms ease;
}
</style>
