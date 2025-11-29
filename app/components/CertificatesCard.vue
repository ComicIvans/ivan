<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <article
    class="card card-border bg-base-100 shadow-lg transition-shadow hover:shadow-xl w-full"
    aria-labelledby="certificates-title"
  >
    <div class="card-body gap-4">
      <h2 id="certificates-title" class="card-title gap-2">
        <Icon
          name="tabler:certificate"
          class="w-6 h-6 text-primary"
          aria-hidden="true"
        />
        {{ t("certificates.title") }}
      </h2>
      <ul class="list bg-base-200 rounded-box" role="list">
        <li class="list-row py-2 px-3">
          <Icon
            name="tabler:car"
            class="w-5 h-5 text-primary shrink-0"
            aria-hidden="true"
          />
          <div class="list-col-grow">
            <span class="font-semibold">{{ t("certificates.license") }}</span>
            {{ t("certificates.licenseValue") }}
          </div>
        </li>
        <li class="list-row py-2 px-3">
          <Icon
            name="tabler:language"
            class="w-5 h-5 text-primary shrink-0"
            aria-hidden="true"
          />
          <div class="list-col-grow">
            <span class="font-semibold">{{ t("certificates.english") }}</span>
            {{ t("certificates.englishValue") }}
          </div>
        </li>
        <li class="list-row py-2 px-3">
          <Icon
            name="tabler:cloud"
            class="w-5 h-5 text-primary shrink-0"
            aria-hidden="true"
          />
          <div class="list-col-grow">
            <span class="font-semibold">{{
              t("certificates.dataAnalyst")
            }}</span>
            <i18n-t keypath="certificates.dataAnalystDesc" tag="span">
              <template #link>
                <a
                  href="https://www.cloudskillsboost.google/public_profiles/9db40b9a-29c2-495c-9cb4-f648577ceac6"
                  class="link link-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ t("certificates.dataAnalystLink") }}</a
                >
              </template>
            </i18n-t>
          </div>
        </li>
      </ul>
    </div>
  </article>
</template>
