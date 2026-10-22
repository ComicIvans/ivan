<script setup lang="ts">
import { emblems } from './emblems'
import type { CredentialVariant } from './credentialVariants'

const props = withDefaults(
  defineProps<{
    variant: CredentialVariant
    holderName?: string
    /**
     * Static instances (SSR hero badge, lite/static anchor variants) render
     * their emblem reactively and never morph. The traveling layer instance
     * sets this false and drives the emblem imperatively through the refs.
     */
    staticEmblem?: boolean
  }>(),
  {
    holderName: 'Iván Salido',
    staticEmblem: true,
  }
)

const { t } = useI18n({ useScope: 'global' })

const journey = useCredentialJourney()
const { roleIndex, pins, projectIndex, photoSrc, galleryCovers, visitorName, accredited } = journey
const { experience, currentAcademic } = useProfile()

const accentVar = computed(
  () =>
    ({
      ember: 'var(--color-ember-500)',
      amber: 'var(--color-amber-500)',
      blue: 'var(--color-blue-500)',
    })[props.variant.accent]
)

const emblem = computed(() => emblems[props.variant.emblem])

// Holder photo: the site portrait; the gallery badge shows event covers instead.
const portraitSrc = '/profile-pic.webp'
const displayedPhotoSrc = computed(() => {
  if (props.variant.id !== 'galeria') return portraitSrc
  return photoSrc.value || galleryCovers.value[0] || portraitSrc
})

// Role line: the experience badge follows the entry the timeline thread lit,
// the diploma shows the current studies, every other dock the generic role.
// Resolved here from content data, so it always matches the active language.
const shownRole = computed(() => {
  if (props.variant.id === 'experiencia' && roleIndex.value !== null) {
    const entry = experience.value[roleIndex.value]
    if (entry) return entry.badgeRole
  }
  if (props.variant.id === 'formacion' && currentAcademic.value) {
    return currentAcademic.value.badgeRole
  }
  return t(props.variant.roleKey)
})
const tierLabel = computed(() => (props.variant.tierKey ? t(props.variant.tierKey) : ''))

// Imperative handles for the traveling instance (reprint / stamp / swing).
const emblemA = useTemplateRef<SVGPathElement>('emblemA')
const emblemB = useTemplateRef<SVGPathElement>('emblemB')
const emblemC = useTemplateRef<SVGPathElement>('emblemC')
const stampEl = useTemplateRef<HTMLElement>('stampEl')
const swingEl = useTemplateRef<HTMLElement>('swingEl')

defineExpose({ emblemA, emblemB, emblemC, stampEl, swingEl })
</script>

<template>
  <div
    class="credential-badge"
    aria-hidden="true"
    :style="{ '--badge-accent': accentVar }"
    :data-orientation="variant.orientation"
  >
    <div ref="swingEl" class="badge-swing">
      <div class="badge-3d" :class="variant.face === 'back' ? 'is-flipped' : ''">
        <div class="badge-face badge-front">
          <span class="badge-punch" />
          <div class="badge-photo">
            <NuxtImg
              :src="displayedPhotoSrc"
              :alt="holderName"
              width="160"
              height="200"
              sizes="160px"
              format="webp"
              quality="80"
              class="size-full object-cover"
            />
          </div>
          <p class="badge-name type-display">{{ holderName }}</p>
          <p class="badge-role font-mono">{{ shownRole }}</p>
          <p v-if="tierLabel" class="badge-tier font-mono">{{ tierLabel }}</p>
          <svg
            class="badge-emblem"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <template v-if="staticEmblem">
              <path :d="emblem.a" />
              <path :d="emblem.b" />
              <path :d="emblem.c" />
            </template>
            <template v-else>
              <path ref="emblemA" :d="emblems.monogram.a" />
              <path ref="emblemB" :d="emblems.monogram.b" />
              <path ref="emblemC" :d="emblems.monogram.c" />
            </template>
          </svg>
          <div class="badge-barcode" aria-hidden="true" />
          <!-- Organisation pins belong to the DELEGADO (representation) badge -->
          <div
            v-if="variant.id === 'representacion' && pins.length"
            class="badge-pins"
            aria-hidden="true"
          >
            <span v-for="pin in pins" :key="pin" class="badge-pin font-mono">{{ pin }}</span>
          </div>
        </div>

        <div class="badge-face badge-back">
          <template v-if="variant.id === 'proyectos'">
            <div class="badge-terminal font-mono">
              <p class="badge-back-title">{{ t('credential.demoPass') }}</p>
              <p class="badge-terminal-line">$ nuxt build</p>
              <p class="badge-terminal-line">$ docker compose up</p>
              <span class="badge-index">{{ projectIndex || 'P-01' }}</span>
            </div>
          </template>
          <template v-else>
            <div class="badge-vcard">
              <p class="badge-back-title font-mono">{{ t('credential.yourBadge') }}</p>
              <p class="badge-holder-label font-mono">{{ t('credential.holder') }}</p>
              <p class="badge-holder-line font-mono">
                {{ visitorName || '···' }}<span class="badge-caret" aria-hidden="true" />
              </p>
            </div>
          </template>
          <div ref="stampEl" class="badge-stamp" :class="accredited ? 'is-visible' : ''">
            {{ t('credential.accredited') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.credential-badge {
  aspect-ratio: 2 / 3;
  width: 100%;
  perspective: 1200px;
  color: var(--ui-text);
}

/* Landscape (DEMO PASS): governs the INTERNAL relayout only; the traveling
   badge's outer size comes from the anchor it homes onto. */
.credential-badge[data-orientation='landscape'] {
  aspect-ratio: 3 / 2;
}

.badge-swing,
.badge-3d {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Container query units inside (the holder name) follow the badge width */
.badge-swing {
  container-type: inline-size;
}

.badge-3d {
  transform-style: preserve-3d;
  transition: transform 0.8s var(--motion-emphasized);
}

.badge-3d.is-flipped {
  transform: rotateY(180deg);
}

.badge-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  border-radius: 1rem;
  padding: 1.5rem 1rem 1rem;
  background: color-mix(in oklab, var(--ui-bg) 82%, var(--badge-accent) 6%);
  box-shadow:
    inset 0 0 0 1px color-mix(in oklab, var(--badge-accent) 35%, transparent),
    0 12px 32px -16px rgb(0 0 0 / 0.45);
  backdrop-filter: blur(10px);
}

.badge-back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge-punch {
  position: absolute;
  top: 0.55rem;
  left: 50%;
  translate: -50% 0;
  width: 1.5rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: var(--ui-bg);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.3);
}

.badge-photo {
  margin: 0.75rem auto 0;
  width: 62%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 0.6rem;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--badge-accent) 30%, transparent);
}

.badge-name {
  margin-top: 0.6rem;
  text-align: center;
  font-size: clamp(0.8rem, 9cqw, 1.05rem);
  line-height: 1.15;
}

.badge-role {
  margin-top: 0.15rem;
  display: -webkit-box;
  min-height: 2.4em;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-align: center;
  font-size: 0.55rem;
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}

.badge-tier {
  margin-top: 0.35rem;
  text-align: center;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--badge-accent);
}

.badge-emblem {
  position: absolute;
  right: 0.55rem;
  top: 0.45rem;
  width: 1.6rem;
  height: 1.6rem;
  color: var(--badge-accent);
}

.badge-barcode {
  position: absolute;
  inset: auto 1rem 0.7rem;
  height: 1.1rem;
  opacity: 0.55;
  background: repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 5px);
}

.badge-pins {
  position: absolute;
  inset: auto auto 2.1rem 1rem;
  display: flex;
  gap: 0.3rem;
}

.badge-pin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  font-size: 0.5rem;
  font-weight: 700;
  color: var(--badge-accent);
  background: color-mix(in oklab, var(--badge-accent) 14%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--badge-accent) 40%, transparent);
}

.badge-back-title {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--badge-accent);
}

.badge-terminal {
  font-size: 0.6rem;
  line-height: 1.7;
  color: var(--ui-text-toned);
}

.badge-terminal-line {
  opacity: 0.85;
}

.badge-index {
  position: absolute;
  right: 0.8rem;
  bottom: 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--badge-accent);
}

.badge-holder-label {
  margin-top: 0.9rem;
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  color: var(--ui-text-muted);
}

.badge-holder-line {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  min-height: 1.2em;
}

@media (prefers-reduced-motion: no-preference) {
  .badge-caret {
    display: inline-block;
    width: 2px;
    height: 0.9em;
    margin-left: 2px;
    vertical-align: -0.1em;
    background: var(--badge-accent);
    animation: caret-blink 1.1s step-end infinite;
  }
}

.badge-stamp {
  position: absolute;
  right: 0.7rem;
  bottom: 2rem;
  padding: 0.2rem 0.5rem;
  rotate: -8deg;
  border: 2px solid var(--color-ember-600);
  border-radius: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--color-ember-600);
  opacity: 0;
  visibility: hidden;
}

/* Static tiers show the final state without animation */
.badge-stamp.is-visible {
  opacity: 1;
  visibility: visible;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
</style>
