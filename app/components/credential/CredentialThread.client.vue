<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Static import + module-level registration: this component is its own lazy
// chunk (Lazy* + .client) and CANNOT rely on CredentialLayer having loaded —
// a timeline can mount before the layer chunk arrives.
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

const props = withDefaults(
  defineProps<{
    accent?: 'ember' | 'blue'
  }>(),
  { accent: 'ember' }
)

const emit = defineEmits<{ milestone: [index: number] }>()

// url(#id) resolves against the whole document: several threads coexist
// (both timelines), so every gradient id must be unique per instance.
const gradientId = useId()

const svgEl = useTemplateRef<SVGSVGElement>('svgEl')
const pathEl = useTemplateRef<SVGPathElement>('pathEl')
const gradEl = useTemplateRef<SVGLinearGradientElement>('gradEl')

const toColor = computed(() =>
  props.accent === 'blue' ? 'var(--color-blue-500)' : 'var(--color-amber-400)'
)

onMounted(() => {
  const host = svgEl.value?.parentElement
  const path = pathEl.value
  if (!host || !path) return

  const setGeometry = () => {
    const h = host.clientHeight
    path.setAttribute('d', `M1 0 V${h}`)
    // A default (objectBoundingBox) gradient on a perfectly vertical path has
    // a zero-width bounding box and degenerates — userSpaceOnUse + explicit
    // vertical coords keep it valid, and y2 must track the measured height.
    gradEl.value?.setAttribute('y2', String(h))
  }
  setGeometry()

  const tween = gsap.fromTo(
    path,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: host,
        start: 'top 70%',
        end: 'bottom 45%',
        scrub: 0.5,
        invalidateOnRefresh: true, // DrawSVG caches px lengths at init
      },
    }
  )

  const resizeObserver = new ResizeObserver(() => {
    setGeometry()
    tween.invalidate()
    ScrollTrigger.refresh()
  })
  resizeObserver.observe(host)

  // Milestone lighting: one trigger per timeline item toggles .thread-lit on
  // its dot and reports the current index upward (SectionExperience maps it
  // to the badge role line; representation simply ignores the event).
  const items = Array.from(host.querySelectorAll('li'))
  const itemTriggers = items.map((item, index) => {
    const dot = item.querySelector('span')
    return ScrollTrigger.create({
      trigger: item,
      start: 'top 60%',
      invalidateOnRefresh: true,
      onEnter: () => {
        dot?.classList.add('thread-lit')
        emit('milestone', index)
      },
      onLeaveBack: () => {
        dot?.classList.remove('thread-lit')
        emit('milestone', Math.max(0, index - 1))
      },
    })
  })

  onBeforeUnmount(() => {
    resizeObserver.disconnect()
    tween.scrollTrigger?.kill()
    tween.kill()
    for (const st of itemTriggers) st.kill()
  })
})
</script>

<template>
  <svg ref="svgEl" class="credential-thread" aria-hidden="true">
    <defs>
      <linearGradient
        :id="gradientId"
        ref="gradEl"
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="0"
        x2="0"
        y2="100"
      >
        <stop offset="0" stop-color="var(--color-ember-500)" />
        <stop offset="1" :stop-color="toColor" />
      </linearGradient>
    </defs>
    <path
      ref="pathEl"
      d="M1 0 V100"
      fill="none"
      :stroke="`url(#${gradientId})`"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.credential-thread {
  position: absolute;
  inset-block: 1.25rem 0;
  inset-inline-start: var(--thread-x, calc(1.25rem - 1px));
  width: 2px;
  overflow: visible;
  pointer-events: none;
}
</style>
