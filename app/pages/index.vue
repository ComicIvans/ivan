<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
// True only while the server-rendered page hydrates (not after client-side
// navigations, where the router owns the hash scroll).
const initialLoad = useNuxtApp().isHydrating
onMounted(() => {
  hydrated.value = true
  if (initialLoad) holdInitialHashTarget()
})

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

/**
 * Initial deep links (/#contacto, the legacy 301 redirects): the browser and
 * the router scroll to the hash while the GSAP setups are still settling.
 * Each ScrollTrigger refresh puts the page back at a recorded pixel offset,
 * which cuts a smooth scroll short, and the projects pin adds height above
 * the later sections. Land on the target after every refresh until the
 * visitor scrolls on their own.
 */
function holdInitialHashTarget() {
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
  if (!target) return
  const realign = () => target.scrollIntoView({ behavior: 'instant' })
  const release = () => {
    ScrollTrigger.removeEventListener('refresh', realign)
    for (const type of USER_SCROLL_EVENTS) window.removeEventListener(type, release)
  }
  ScrollTrigger.addEventListener('refresh', realign)
  for (const type of USER_SCROLL_EVENTS) window.addEventListener(type, release, { passive: true })
  window.setTimeout(release, 5000)
}

// Mount the sections with their content in place. After a client-side
// navigation the profile and the gallery events are fetched here: without
// them the sections' mount-time GSAP setups (pinned project track, credential
// thread) would measure empty lists, and the router's hash scroll would land
// before the hero's latest-event tile and the gallery mosaic add their height
// above #contacto.
await Promise.all([loadProfile(), loadGalleryEvents()])
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
