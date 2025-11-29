<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article
    class="card-border card w-full bg-base-100 shadow-lg transition-shadow hover:shadow-xl"
    aria-labelledby="skills-title"
  >
    <div class="card-body gap-4">
      <h2 id="skills-title" class="card-title gap-2">
        <Icon name="tabler:device-desktop" class="h-6 w-6 text-primary" aria-hidden="true" />
        {{ t('skills.title') }}
      </h2>

      <!-- Ciberseguridad -->
      <div>
        <h3 class="mb-2 text-lg font-bold text-secondary">
          {{ t('skills.cybersecurity') }}
        </h3>
        <ul class="list rounded-box bg-base-200" role="list">
          <li class="list-row px-3 py-2">
            <Icon
              name="tabler:shield-check"
              class="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.cyber1Title') }}</span>
              {{ t('skills.cyber1Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon name="tabler:scale" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.cyber2Title') }}</span>
              {{ t('skills.cyber2Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon name="tabler:server" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.cyber3Title') }}</span>
              {{ t('skills.cyber3Desc') }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Lenguajes -->
      <div>
        <h3 class="mb-2 text-lg font-bold text-secondary">
          {{ t('skills.languages') }}
        </h3>
        <ul class="list rounded-box bg-base-200" role="list">
          <li class="list-row px-3 py-2">
            <Icon
              name="tabler:brand-javascript"
              class="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.lang1Title') }}</span>
              {{ t('skills.lang1Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon
              name="tabler:brand-python"
              class="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.lang2Title') }}</span>
              {{ t('skills.lang2Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon
              name="tabler:brand-php"
              class="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.lang3Title') }}</span>
              {{ t('skills.lang3Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon name="tabler:code" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.lang4Title') }}</span>
              {{ t('skills.lang4Desc') }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Frameworks -->
      <div>
        <h3 class="mb-2 text-lg font-bold text-secondary">
          {{ t('skills.frameworks') }}
        </h3>
        <ul class="list rounded-box bg-base-200" role="list">
          <li class="list-row px-3 py-2">
            <Icon
              name="tabler:brand-nuxt"
              class="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div class="list-col-grow">
              <span class="font-semibold">{{ t('skills.fw1Title') }}</span>
              {{ t('skills.fw1Desc') }}
            </div>
          </li>
          <li class="list-row px-3 py-2">
            <Icon name="tabler:world" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
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
