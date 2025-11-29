<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section class="hero bg-base-100 rounded-box" aria-labelledby="about-title">
    <div class="hero-content flex-col-reverse lg:flex-row-reverse gap-8">
      <figure class="shrink-0">
        <NuxtImg
          src="/full-pic.jpg"
          class="max-w-[200px] xl:max-w-[300px] rounded-box shadow-xl"
          :alt="t('about.imageAlt')"
          loading="lazy"
          width="300"
          height="400"
          format="webp"
          quality="85"
        />
      </figure>
      <div class="max-w-2xl">
        <h2
          id="about-title"
          class="text-4xl lg:text-5xl font-bold text-primary"
        >
          {{ t("about.title") }}
        </h2>

        <h3 class="text-xl lg:text-2xl font-bold text-secondary mt-6 mb-3">
          {{ t("about.descriptionTitle") }}
        </h3>
        <p class="text-base-content/90 leading-relaxed">
          {{ t("about.description") }}
        </p>

        <h3 class="text-xl lg:text-2xl font-bold text-secondary mt-6 mb-3">
          {{ t("about.studiesTitle") }}
        </h3>
        <p class="text-base-content/90 leading-relaxed mb-4">
          <i18n-t keypath="about.studies1" tag="span">
            <template #university>
              <strong class="text-primary">{{ t("about.university") }}</strong>
            </template>
          </i18n-t>
        </p>
        <p class="text-base-content/90 leading-relaxed">
          {{ t("about.studies2") }}
        </p>
      </div>
    </div>
  </section>
</template>
