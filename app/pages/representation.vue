<script setup lang="ts">
const { t } = useI18n()

// SEO meta para la página de representación
useSeoMeta({
  title: () => t('nav.representation'),
  description: () => t('seo.representationDescription'),
  ogTitle: () => `${t('nav.representation')} | ${t('seo.title')}`,
  ogDescription: () => t('seo.representationDescription'),
  ogImage: '/profile-pic.jpg',
  ogType: 'profile',
})
</script>

<template>
  <section role="region" :aria-label="t('nav.representation')" class="section-enter">
    <!-- Layout responsivo: columnas en desktop grande, apilado en móvil -->
    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="flex-1">
        <ProfessionalTimeline />
      </div>
      <div class="flex-1">
        <EventsRecord />
      </div>
    </div>
  </section>
</template>
