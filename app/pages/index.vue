<script setup lang="ts">
import { SECTION_IDS } from '~/components/credential/credentialVariants'

usePageSeo('seo.pageTitle', 'seo.description')

const sectionIds = SECTION_IDS
const tier = useMotionTier()

// The layer must stay absent during hydration: SSR renders a comment for the
// v-if, and the client's FIRST render must match it even though matchMedia
// already reports the real tier. It mounts one tick after hydration.
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

// Mount the sections with their content in place. After a client-side
// navigation the profile is fetched here, and the sections' mount-time GSAP
// setups (pinned project track, credential thread) and the hash scroll would
// otherwise measure empty lists.
await loadProfile()
</script>

<template>
  <div>
    <SectionDotRail :section-ids="[...sectionIds]" />
    <!-- Traveling credential badge: home only, full motion tier only -->
    <LazyCredentialLayer v-if="hydrated && tier === 'full'" />
    <SectionHero id="inicio" />
    <SectionExperience id="experiencia" />
    <SectionRepresentation id="representacion" />
    <SectionProjects id="proyectos" />
    <SectionTraining id="formacion" />
    <SectionGallery id="galeria" />
    <SectionContact id="contacto" />
  </div>
</template>
