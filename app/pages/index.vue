<script setup lang="ts">
const { t } = useI18n();

// SEO meta dinámico según idioma
useSeoMeta({
  title: () => t("seo.pageTitle"),
  description: () => t("seo.description"),
  ogTitle: () => t("seo.title"),
  ogDescription: () => t("seo.description"),
  ogImage: "/profile-pic.jpg",
  ogType: "profile",
  twitterCard: "summary",
  twitterTitle: () => t("seo.title"),
  twitterDescription: () => t("seo.description"),
  twitterImage: "/profile-pic.jpg",
});

// Schema.org structured data
useSchemaOrg([
  defineWebSite({
    name: "Iván Salido Cobo",
    url: "https://ivan.wupp.dev",
  }),
  definePerson({
    name: "Iván Salido Cobo",
    url: "https://ivan.wupp.dev",
    image: "/profile-pic.jpg",
    sameAs: [
      "https://www.linkedin.com/in/ivansalidocobo/",
      "https://www.instagram.com/ivansalidocobo/",
      "https://github.com/ComicIvans/",
    ],
    jobTitle: () => t("schema.jobTitle"),
  }),
]);
</script>

<template>
  <section role="region" :aria-label="t('nav.about')" class="section-enter">
    <!-- Layout adaptativo para ContactCard y DescriptionHero -->
    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- ContactCard: más estrecha en desktop grande -->
      <div class="w-full lg:w-1/3 shrink-0">
        <ContactCard />
      </div>

      <!-- DescriptionHero: ocupa el resto en desktop grande -->
      <div class="w-full lg:w-2/3">
        <DescriptionHero />
      </div>
    </div>
  </section>
</template>
