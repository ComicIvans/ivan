<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    value: number
    label: string
    duration?: number
    suffix?: string
  }>(),
  {
    duration: 1.4,
    suffix: '',
  }
)

const emit = defineEmits<{ finished: [] }>()

// SSR renders the final value, so crawlers and no-JS users see real data;
// the count-up only replaces it client-side when motion is allowed.
const shown = ref(props.value)
const root = useTemplateRef<HTMLElement>('root')
let tween: gsap.core.Tween | null = null
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('finished')
    return
  }
  const el = root.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      observer = null

      const counter = { n: 0 }
      shown.value = 0
      tween = gsap.to(counter, {
        n: props.value,
        duration: props.duration,
        ease: 'power2.out',
        snap: { n: 1 },
        onUpdate: () => {
          shown.value = counter.n
        },
        onComplete: () => emit('finished'),
      })
    },
    { threshold: 0.4 }
  )
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  tween?.kill()
})
</script>

<template>
  <div ref="root" class="flex flex-col">
    <span class="text-highlighted font-mono text-3xl font-semibold tabular-nums sm:text-4xl">
      {{ shown }}{{ suffix }}
    </span>
    <span class="text-muted mt-1 text-sm">{{ label }}</span>
  </div>
</template>
