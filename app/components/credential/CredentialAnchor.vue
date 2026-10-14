<script setup lang="ts">
import { variantsById, type SectionId } from './credentialVariants'

const props = defineProps<{ section: SectionId }>()

const el = useTemplateRef<HTMLElement>('el')
const journey = useCredentialJourney()
const tier = useMotionTier()

// Static badge variants only exist on lite/static tiers; on full the single
// traveling badge homes onto this (empty) anchor. Rendered client-only after
// the tier resolves — the tier is unknowable during SSR.
const showStatic = computed(() => tier.value !== 'full')

onMounted(() => journey.registerSlot(props.section, el.value!))
onBeforeUnmount(() => journey.unregisterSlot(props.section))
</script>

<template>
  <div ref="el" class="credential-anchor" :data-section="section">
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

.anchor-static {
  width: 100%;
  height: 100%;
}
</style>
