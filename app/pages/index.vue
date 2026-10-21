<script setup lang="ts">
import type { Component } from 'vue'
import SectionContact from '~/components/sections/SectionContact.vue'
import SectionExperience from '~/components/sections/SectionExperience.vue'
import SectionGallery from '~/components/sections/SectionGallery.vue'
import SectionHero from '~/components/sections/SectionHero.vue'
import SectionProjects from '~/components/sections/SectionProjects.vue'
import SectionRepresentation from '~/components/sections/SectionRepresentation.vue'
import SectionTraining from '~/components/sections/SectionTraining.vue'
import { SECTIONS, type SectionId } from '~/utils/sections'

// The hero already carries the portrait, name and pitch.
definePageMeta({ masthead: false })

usePageSeo('seo.pageTitle', 'seo.description')

// Rendered in SECTIONS order; the record type makes a section without a
// component a type error.
const sectionComponents: Record<SectionId, Component> = {
  inicio: SectionHero,
  experiencia: SectionExperience,
  representacion: SectionRepresentation,
  proyectos: SectionProjects,
  formacion: SectionTraining,
  galeria: SectionGallery,
  contacto: SectionContact,
}

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
    <SectionDotRail />
    <!-- Traveling credential badge: home only, full motion tier only -->
    <LazyCredentialLayer v-if="hydrated && tier === 'full'" />
    <component
      :is="sectionComponents[section.id]"
      v-for="section in SECTIONS"
      :id="section.id"
      :key="section.id"
    />
  </div>
</template>
