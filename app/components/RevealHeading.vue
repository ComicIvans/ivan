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

// Word-level entrance when the heading scrolls in. Content stays fully
// visible without JS or with reduced motion — the trigger only ever animates
// FROM a hidden state at the moment it fires.
useGsapMatchMedia(rootEl, (ctx) => {
  if (ctx.conditions?.reduceMotion) return

  let cancelled = false

  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      // Fonts first: splitting lines that reflow after webfonts land breaks masks.
      document.fonts.ready.then(() => {
        if (cancelled || !titleEl.value) return
        split?.revert()
        split = SplitText.create(titleEl.value, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              autoAlpha: 0,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.03,
            }),
        })
      })

      if (ruleEl.value) {
        gsap.fromTo(
          ruleEl.value,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.5,
            delay: 0.15,
            ease: 'power2.out',
            transformOrigin: 'left center',
          }
        )
      }

      if (introEl.value) {
        gsap.fromTo(
          introEl.value,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' }
        )
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
