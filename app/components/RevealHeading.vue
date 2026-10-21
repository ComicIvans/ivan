<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

const props = withDefaults(
  defineProps<{
    title: string
    /** id for aria-labelledby wiring from the parent <section> */
    headingId?: string
    intro?: string
    accent?: 'ember' | 'amber' | 'blue'
  }>(),
  {
    headingId: undefined,
    intro: undefined,
    accent: 'ember',
  }
)

const ruleClass = computed(
  () =>
    ({
      ember: 'from-primary-500 to-amber-400',
      amber: 'from-amber-500 to-primary-400',
      blue: 'from-blue-500 to-primary-400',
    })[props.accent]
)

const rootEl = useTemplateRef<HTMLElement>('rootEl')
const titleEl = useTemplateRef<HTMLElement>('titleEl')
const ruleEl = useTemplateRef<HTMLElement>('ruleEl')
const introEl = useTemplateRef<HTMLElement>('introEl')

let split: SplitText | null = null

// Entrance when the heading scrolls in: the words rise on the full tier, the
// title fades up on the lite tier. The parts are hidden as soon as the setup
// runs, not when the trigger fires, so a heading never shows, blinks out and
// animates back in. Opacity only: the heading stays focusable (the navbar
// focuses it) and in the accessibility tree. Without JS or with reduced
// motion everything stays as rendered.
useGsapMatchMedia(rootEl, (ctx) => {
  const title = titleEl.value
  if (ctx.conditions?.reduceMotion || !title) return

  const splitWords = Boolean(ctx.conditions?.fullMotion)
  const rule = ruleEl.value
  const intro = introEl.value
  let cancelled = false

  gsap.set(title, splitWords ? { opacity: 0 } : { opacity: 0, y: 16 })
  if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })
  if (intro) gsap.set(intro, { opacity: 0, y: 12 })

  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      if (splitWords) {
        // Fonts first: splitting lines that reflow after webfonts land breaks masks.
        document.fonts.ready.then(() => {
          if (cancelled) return
          split?.revert()
          split = SplitText.create(title, {
            type: 'lines,words',
            mask: 'lines',
            autoSplit: true,
            aria: 'auto',
            onSplit: (self) => {
              gsap.set(title, { opacity: 1 })
              return gsap.from(self.words, {
                yPercent: 110,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.03,
              })
            },
          })
        })
      } else {
        gsap.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      }

      if (rule) gsap.to(rule, { scaleX: 1, duration: 0.5, delay: 0.15, ease: 'power2.out' })
      if (intro) {
        gsap.to(intro, { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' })
      }
    },
  })

  return () => {
    cancelled = true
    split?.revert()
    split = null
  }
})
</script>

<template>
  <header ref="rootEl" class="mb-10">
    <h2
      :id="headingId"
      ref="titleEl"
      class="type-display text-highlighted text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
    >
      {{ title }}
    </h2>
    <div
      ref="ruleEl"
      class="mt-4 h-[3px] w-10 rounded-full bg-gradient-to-r"
      :class="ruleClass"
      aria-hidden="true"
    />
    <p v-if="intro" ref="introEl" class="text-muted mt-4 max-w-2xl text-lg">
      {{ intro }}
    </p>
    <slot />
  </header>
</template>
