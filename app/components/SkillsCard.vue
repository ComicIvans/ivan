<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <article
    class="card card-border bg-base-100 shadow-lg transition-shadow hover:shadow-xl w-full"
    aria-labelledby="skills-title"
  >
    <div class="card-body gap-4">
      <h2 id="skills-title" class="card-title gap-2">
        <Icon
          name="tabler:device-desktop"
          class="w-6 h-6 text-primary"
          aria-hidden="true"
        />
        {{ t("skills.title") }}
      </h2>

      <!-- Ciberseguridad -->
      <div>
        <h3 class="text-lg font-bold text-secondary mb-2">
          {{ t("skills.cybersecurity") }}
        </h3>
        <ul class="list bg-base-200 rounded-box" role="list">
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:shield-check"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.cyber1Title") }}</span>
              {{ t("skills.cyber1Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:scale"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.cyber2Title") }}</span>
              {{ t("skills.cyber2Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:server"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.cyber3Title") }}</span>
              {{ t("skills.cyber3Desc") }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Lenguajes -->
      <div>
        <h3 class="text-lg font-bold text-secondary mb-2">
          {{ t("skills.languages") }}
        </h3>
        <ul class="list bg-base-200 rounded-box" role="list">
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:brand-javascript"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.lang1Title") }}</span>
              {{ t("skills.lang1Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:brand-python"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.lang2Title") }}</span>
              {{ t("skills.lang2Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:brand-php"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.lang3Title") }}</span>
              {{ t("skills.lang3Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:code"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.lang4Title") }}</span>
              {{ t("skills.lang4Desc") }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Frameworks -->
      <div>
        <h3 class="text-lg font-bold text-secondary mb-2">
          {{ t("skills.frameworks") }}
        </h3>
        <ul class="list bg-base-200 rounded-box" role="list">
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:brand-nuxt"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t("skills.fw1Title") }}</span>
              {{ t("skills.fw1Desc") }}
            </div>
          </li>
          <li class="list-row py-2 px-3">
            <Icon
              name="tabler:world"
              class="w-5 h-5 text-primary shrink-0"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <i18n-t keypath="skills.fw2Desc" tag="span">
                <template #link>
                  <a
                    href="https://www.creup.es"
                    class="link link-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    >CREUP</a
                  >
                </template>
              </i18n-t>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
