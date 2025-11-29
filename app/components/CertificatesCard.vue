<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article
    class="card-border card w-full bg-base-100 shadow-lg transition-shadow hover:shadow-xl"
    aria-labelledby="certificates-title"
  >
    <div class="card-body gap-4">
      <h2 id="certificates-title" class="card-title gap-2">
        <Icon name="tabler:certificate" class="h-6 w-6 text-primary" aria-hidden="true" />
        {{ t('certificates.title') }}
      </h2>
      <ul class="list rounded-box bg-base-200" role="list">
        <li class="list-row px-3 py-2">
          <Icon name="tabler:car" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="list-col-grow">
            <span class="font-semibold">{{ t('certificates.license') }}</span>
            {{ t('certificates.licenseValue') }}
          </div>
        </li>
        <li class="list-row px-3 py-2">
          <Icon name="tabler:language" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="list-col-grow">
            <span class="font-semibold">{{ t('certificates.english') }}</span>
            {{ t('certificates.englishValue') }}
          </div>
        </li>
        <li class="list-row px-3 py-2">
          <Icon name="tabler:cloud" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="list-col-grow">
            <span class="font-semibold">{{ t('certificates.dataAnalyst') }}</span>
            <i18n-t keypath="certificates.dataAnalystDesc" tag="span">
              <template #link>
                <a
                  href="https://www.cloudskillsboost.google/public_profiles/9db40b9a-29c2-495c-9cb4-f648577ceac6"
                  class="link link-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ t('certificates.dataAnalystLink') }}</a
                >
              </template>
            </i18n-t>
          </div>
        </li>
      </ul>
    </div>
  </article>
</template>
