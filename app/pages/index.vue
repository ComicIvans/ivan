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

// The home's title already names the site: "Iván Salido Cobo · <fields>".
usePageSeo('seo.homeTitle', 'seo.description', { fullTitle: true })

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

// Keeps the page where it should be while the GSAP setups settle: on the URL
// hash after a fresh navigation, on the position the router restores after
// back/forward or a reload, and on the section being read when the visitor
// scrolled before the page mounted or the motion tier changes.
useHomeReadingPosition()

// Mount the sections with their content in place. After a client-side
// navigation the profile and the gallery events are fetched here: without
// them the sections' mount-time GSAP setups (pinned project track, credential
// thread) would measure empty lists, and the router's hash scroll would land
// before the hero's latest-event tile and the gallery mosaic add their height
// above #contacto.
const [{ error: profileError }] = await Promise.all([loadProfile(), loadGalleryEvents()])

// Without the profile every section would render empty. Answer with the
// error page and a 503 instead, so visitors get a retry button and crawlers
// do not index an empty home.
if (profileError.value) {
  throw createError({ statusCode: 503, statusMessage: 'Profile unavailable', fatal: true })
}
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
