<script setup lang="ts">
import type { SectionId } from '~/utils/sections'
import { variantsById } from './credentialVariants'

const props = defineProps<{ section: SectionId }>()

const el = useTemplateRef<HTMLElement>('el')
const journey = useCredentialJourney()
const tier = useMotionTier()

// Without the traveling badge (lite/static tiers) only the hero and contact
// show a badge; every other anchor is just a dock for the traveling badge,
// so it collapses there (CSS below, so the server-rendered page is right).
const keepsStaticBadge = props.section === 'inicio' || props.section === 'contacto'

// The hero slots in its own server-rendered badge; the contact badge renders
// client-only once the tier resolves, since the tier is unknowable during SSR.
const showStatic = computed(() => keepsStaticBadge && tier.value !== 'full')

onMounted(() => journey.registerSlot(props.section, el.value!))
onBeforeUnmount(() => journey.unregisterSlot(props.section))
</script>

<template>
  <div
    ref="el"
    class="credential-anchor"
    :class="{ 'dock-only': !keepsStaticBadge }"
    :data-section="section"
  >
    <!-- Hero: the SSR badge is slotted in by SectionHero (accessible instance) -->
    <slot>
      <ClientOnly>
        <div
          v-if="showStatic"
          class="anchor-static motion-safe:animate-[fadeSlideUp_0.5s_var(--motion-emphasized)_both]"
          aria-hidden="true"
        >
          <CredentialBadge :variant="variantsById[section]" />
        </div>
      </ClientOnly>
    </slot>
  </div>
</template>

<style scoped>
.credential-anchor {
  width: 200px;
  max-width: 100%;
  aspect-ratio: 2 / 3;
}

.credential-anchor[data-section='experiencia'],
.credential-anchor[data-section='formacion'] {
  width: 160px;
}

.credential-anchor[data-section='proyectos'] {
  width: 260px;
  aspect-ratio: 3 / 2;
}

/* Everywhere except the full motion tier (the same query as useMotionTier's
   'full'), where no badge travels to the dock-only anchors. */
@media not all and (min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .credential-anchor.dock-only {
    display: none;
  }
}

.anchor-static {
  width: 100%;
  height: 100%;
}
</style>
