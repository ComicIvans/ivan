<script setup lang="ts">
const { t } = useI18n();

// SEO meta para la página de habilidades
useSeoMeta({
  title: () => t("nav.skills"),
  description: () => t("seo.skillsDescription"),
  ogTitle: () => `${t("nav.skills")} | ${t("seo.title")}`,
  ogDescription: () => t("seo.skillsDescription"),
  ogImage: "/profile-pic.jpg",
  ogType: "profile",
});
</script>

<template>
  <section role="region" :aria-label="t('nav.skills')" class="section-enter">
    <!-- Grid de 2 columnas en pantallas grandes -->
    <div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <SkillsCard />
      <AdditionalInfoCard />
      <CertificatesCard />
      <ProjectsCard />
    </div>
  </section>
</template>
