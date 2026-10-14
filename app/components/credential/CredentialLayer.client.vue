<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Static imports: this file is already a lazy chunk (Lazy* + .client), so the
// plugins ride along. NEVER await imports inside the matchMedia handler —
// context.revert() only tracks what is created synchronously in it.
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { emblems } from './emblems'
import { SECTION_IDS } from './credentialVariants'
import type CredentialBadge from './CredentialBadge.vue'

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin)

const journey = useCredentialJourney()
const {
  slots,
  active,
  isJumping,
  layerMounted,
  currentVariant,
  galleryCovers,
  photoSrc,
  accredited,
  setActive,
} = journey

const badgeBox = useTemplateRef<HTMLElement>('badgeBox')
const lanyardEl = useTemplateRef<SVGPathElement>('lanyardEl')
const badgeComp = useTemplateRef<InstanceType<typeof CredentialBadge>>('badgeComp')

const ready = ref(false)

// Gallery photo cycle: interval bound to THIS component's lifecycle (the
// journey module is SSR-evaluated and must not own timers).
let cycleTimer: ReturnType<typeof setInterval> | undefined
let coverCursor = 0
watch(active, (id) => {
  clearInterval(cycleTimer)
  if (id === 'galeria' && galleryCovers.value.length) {
    photoSrc.value = galleryCovers.value[0] ?? ''
    cycleTimer = setInterval(() => {
      coverCursor = (coverCursor + 1) % galleryCovers.value.length
      photoSrc.value = galleryCovers.value[coverCursor] ?? ''
    }, 2000)
  } else {
    photoSrc.value = ''
  }
})

// Submit reward: the envelope morphs into the paper plane and the stamp pops.
// (The stamp element itself is CSS-driven via the shared `accredited` flag.)
watch(accredited, (isAccredited) => {
  if (!isAccredited) return
  morphEmblemTo('plane')
  const stamp = badgeComp.value?.stampEl
  if (stamp) {
    gsap.fromTo(
      stamp,
      { scale: 1.4, autoAlpha: 0, rotation: -12 },
      {
        scale: 1,
        autoAlpha: 1,
        rotation: -8,
        duration: 0.5,
        ease: 'back.out(2)',
        overwrite: 'auto',
      }
    )
  }
})

function morphEmblemTo(name: keyof typeof emblems) {
  const target = emblems[name]
  const paths = [badgeComp.value?.emblemA, badgeComp.value?.emblemB, badgeComp.value?.emblemC]
  const shapes = [target.a, target.b, target.c]
  paths.forEach((pathRef, index) => {
    if (!pathRef) return
    gsap.to(pathRef, {
      morphSVG: { shape: shapes[index]!, map: 'complexity' },
      duration: 0.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
  })
}

// Reprint: morph the three emblem paths on dock change. Face flip and
// orientation are reactive (CredentialBadge binds them to the variant).
watch(currentVariant, (variant) => {
  // Once accredited, the contact dock keeps the reward plane, not the envelope.
  const emblemName = accredited.value && variant.id === 'contacto' ? 'plane' : variant.emblem
  morphEmblemTo(emblemName)
})

// No gsap.matchMedia here: this layer only exists while the tier is 'full'
// (index.vue v-if unmounts it on tier change), so a plain mounted/unmounted
// pair with explicit cleanup is the whole media logic.
let cleanup: (() => void) | null = null

onMounted(async () => {
  await nextTick() // template refs and section anchors are all settled

  const box = badgeBox.value
  const heroSlot = slots.get('inicio')
  if (!box || !heroSlot) return

  // Seed the follower from the SSR hero badge, then own the visual.
  const seed = heroSlot.getBoundingClientRect()
  const pos = { x: seed.left, y: seed.top, w: seed.width, h: seed.height }
  gsap.set(box, { x: pos.x, y: pos.y, width: pos.w, height: pos.h })
  layerMounted.value = true
  ready.value = true

  let settled = false

  // Hero lanyard: the badge hangs from a thread reaching the viewport top
  // while docked at the hero; it lets go as soon as the journey starts.
  const lanyard = lanyardEl.value
  let lanyardTween: gsap.core.Tween | null = null

  const updateLanyardGeometry = () => {
    if (!lanyard || active.value !== 'inicio') return
    lanyard.setAttribute('d', `M ${pos.x + pos.w / 2} 0 V ${pos.y + 10}`)
  }

  const drawLanyard = (delay = 0) => {
    if (!lanyard) return
    lanyardTween?.kill()
    updateLanyardGeometry()
    lanyardTween = gsap.fromTo(
      lanyard,
      { drawSVG: '0%', autoAlpha: 1 },
      {
        drawSVG: '100%',
        duration: 1.1,
        delay,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(lanyard, { clearProps: 'strokeDasharray,strokeDashoffset' })
          lanyardTween = null
        },
      }
    )
  }

  const releaseLanyard = () => {
    if (!lanyard) return
    lanyardTween?.kill()
    lanyardTween = gsap.to(lanyard, {
      drawSVG: '100% 100%',
      duration: 0.4,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(lanyard, { autoAlpha: 0 })
        lanyardTween = null
      },
    })
  }

  const stopLanyardWatch = watch(active, (id, previousId) => {
    if (id === 'inicio') drawLanyard()
    else if (previousId === 'inicio') releaseLanyard()
  })
  drawLanyard(0.3)

  const home = () => {
    const slot = slots.get(active.value)
    if (!slot) return
    const r = slot.getBoundingClientRect() // layer is fixed → viewport coords match
    const k = 0.14 // homing factor ≈ 0.8s settle at 60fps
    const dx = r.left - pos.x
    const dy = r.top - pos.y
    const dw = r.width - pos.w
    const dh = r.height - pos.h
    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dw) + Math.abs(dh) < 0.5) {
      if (!settled) {
        // Snap once to whole px → crisp text; then stop writing while parked.
        Object.assign(pos, { x: r.left, y: r.top, w: r.width, h: r.height })
        updateLanyardGeometry()
        gsap.set(box, {
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          width: Math.round(pos.w),
          height: Math.round(pos.h),
        })
        box.classList.remove('in-transit')
        settled = true
      }
      return
    }
    if (settled) {
      settled = false
      box.classList.add('in-transit')
    }
    pos.x += dx * k
    pos.y += dy * k
    updateLanyardGeometry()
    // width/height cost layout — only write them while the size actually
    // differs (between sections with different anchors), never during plain
    // scrolling where x/y transform is the only per-frame write.
    const sizeMoving = Math.abs(dw) + Math.abs(dh) > 0.5
    if (sizeMoving) {
      pos.w += dw * k
      pos.h += dh * k
      gsap.set(box, { x: pos.x, y: pos.y, width: pos.w, height: pos.h })
    } else {
      gsap.set(box, { x: pos.x, y: pos.y })
    }
  }
  gsap.ticker.add(home)

  // One trigger per section feeds `active` — ignored mid-jump. Kept in a list
  // so the scrollEnd handler can re-derive the truth after a jump.
  const sectionTriggers = SECTION_IDS.map((sectionId) =>
    ScrollTrigger.create({
      trigger: `#${sectionId}`,
      start: 'top 55%',
      end: 'bottom 55%',
      invalidateOnRefresh: true,
      onToggle: (self) => self.isActive && !isJumping.value && setActive(sectionId),
    })
  )
  const sectionIdOf = new Map(sectionTriggers.map((st, index) => [st, SECTION_IDS[index]!]))

  // Swing by scroll velocity — on the inner wrapper, never the box home() writes.
  const swingTarget = badgeComp.value?.swingEl
  const swing = swingTarget
    ? gsap.quickTo(swingTarget, 'rotation', { duration: 0.9, ease: 'elastic.out(1, 0.35)' })
    : null
  const velocityTrigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => swing?.(gsap.utils.clamp(-4, 4, self.getVelocity() / -600)),
  })

  // Named listener: matchMedia.revert() does NOT clean static listeners.
  const onScrollEnd = () => {
    swing?.(0)
    if (isJumping.value) {
      isJumping.value = false
      // Toggles fired during the jump were suppressed (including interrupted
      // jumps that stopped elsewhere) — re-derive `active` from reality.
      const live = sectionTriggers.find((st) => st.isActive)
      if (live) setActive(sectionIdOf.get(live)!)
    }
  }
  ScrollTrigger.addEventListener('scrollEnd', onScrollEnd)

  cleanup = () => {
    gsap.ticker.remove(home)
    clearInterval(cycleTimer)
    stopLanyardWatch()
    lanyardTween?.kill()
    ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd)
    for (const st of sectionTriggers) st.kill()
    velocityTrigger.kill()
    layerMounted.value = false
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
    <svg class="lanyard-svg">
      <path
        ref="lanyardEl"
        d="M 0 0"
        fill="none"
        stroke="var(--color-ember-500)"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0"
      />
    </svg>
    <div ref="badgeBox" class="badge-box" :class="ready ? '' : 'invisible'">
      <CredentialBadge ref="badgeComp" :variant="currentVariant" :static-emblem="false" />
    </div>
  </div>
</template>

<style scoped>
.lanyard-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.badge-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  will-change: transform;
}

.badge-box :deep(.credential-badge) {
  height: 100%;
}

/* Mid-flight: drop the blur so the compositor stays cheap */
.badge-box.in-transit :deep(.badge-face) {
  backdrop-filter: none;
}
</style>
