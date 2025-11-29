<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="hero rounded-box bg-base-100" aria-labelledby="about-title">
    <div class="hero-content flex-col-reverse gap-8 lg:flex-row-reverse">
      <figure class="shrink-0">
        <NuxtImg
          src="/full-pic.jpg"
          class="max-w-[200px] rounded-box shadow-xl xl:max-w-[300px]"
          :alt="t('about.imageAlt')"
          loading="lazy"
          width="300"
          height="400"
          format="webp"
          quality="85"
        />
      </figure>
      <div class="max-w-2xl">
        <h2 id="about-title" class="text-4xl font-bold text-primary lg:text-5xl">
          {{ t('about.title') }}
        </h2>

        <h3 class="mb-3 mt-6 text-xl font-bold text-secondary lg:text-2xl">
          {{ t('about.descriptionTitle') }}
        </h3>
        <p class="leading-relaxed text-base-content/90">
          {{ t('about.description') }}
        </p>

        <h3 class="mb-3 mt-6 text-xl font-bold text-secondary lg:text-2xl">
          {{ t('about.studiesTitle') }}
        </h3>
        <p class="mb-4 leading-relaxed text-base-content/90">
          <i18n-t keypath="about.studies1" tag="span">
            <template #university>
              <strong class="text-primary">{{ t('about.university') }}</strong>
            </template>
          </i18n-t>
        </p>
        <p class="leading-relaxed text-base-content/90">
          {{ t('about.studies2') }}
        </p>
      </div>
    </div>
  </section>
</template>
