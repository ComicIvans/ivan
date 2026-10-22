<script setup lang="ts">
const CEFR_SCALE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

const props = withDefaults(
  defineProps<{
    /** CEFR level; 'native' lights the full scale. */
    level: (typeof CEFR_SCALE)[number] | 'native'
    levelLabel: string
    /** Space-separated ids of the elements that name the meter. */
    labelledby?: string
    accent?: 'ember' | 'amber'
  }>(),
  {
    labelledby: undefined,
    accent: 'amber',
  }
)

const filledCount = computed(() =>
  props.level === 'native' ? CEFR_SCALE.length : CEFR_SCALE.indexOf(props.level) + 1
)

const filledClass = computed(
  () =>
    ({
      ember: 'bg-primary-500 shadow-[0_0_10px_-2px_var(--glow-soft)]',
      amber:
        'bg-amber-500 shadow-[0_0_10px_-2px_color-mix(in_oklab,var(--color-amber-500)_45%,transparent)]',
    })[props.accent]
)

const root = useTemplateRef<HTMLElement>('root')
// The segments only start empty once JS can fill them in: the server
// rendered (and no-JS) meter shows the level.
const armed = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealed.value = true
    return
  }
  armed.value = true
  const el = root.value
  if (!el) {
    revealed.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      revealed.value = true
      observer?.disconnect()
      observer = null
    },
    { threshold: 0.5 }
  )
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    role="meter"
    :aria-labelledby="labelledby"
    :aria-valuemin="0"
    :aria-valuemax="CEFR_SCALE.length"
    :aria-valuenow="filledCount"
    :aria-valuetext="levelLabel"
    :class="{ 'is-armed': armed }"
  >
    <div class="flex items-center gap-1.5">
      <span
        v-for="(step, index) in CEFR_SCALE"
        :key="step"
        class="h-2 flex-1 rounded-full"
        :class="[
          index < filledCount ? [filledClass, 'segment-fill'] : 'bg-elevated',
          index < filledCount && revealed ? 'segment-on' : '',
        ]"
        :style="{ '--segment-index': index }"
        aria-hidden="true"
      />
    </div>
    <div class="mt-2 flex items-center justify-between font-mono text-xs text-muted">
      <span>{{ levelLabel }}</span>
      <span aria-hidden="true">{{ level === 'native' ? 'C2' : level }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Filled segments sweep in left-to-right once the meter enters the viewport */
@media (prefers-reduced-motion: no-preference) {
  .is-armed .segment-fill {
    transform: scaleX(0);
    transform-origin: left center;
  }

  .is-armed .segment-fill.segment-on {
    transform: scaleX(1);
    transition: transform 400ms var(--motion-emphasized);
    transition-delay: calc(var(--segment-index, 0) * 90ms);
  }
}
</style>
