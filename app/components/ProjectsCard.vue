<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article
    class="card-border card w-full bg-base-100 shadow-lg transition-shadow hover:shadow-xl"
    aria-labelledby="projects-title"
  >
    <div class="card-body gap-4">
      <h2 id="projects-title" class="card-title gap-2">
        <Icon name="tabler:code" class="h-6 w-6 text-primary" aria-hidden="true" />
        {{ t('projects.title') }}
      </h2>

      <!-- Servidor personal -->
      <div class="rounded-box bg-base-200 p-4">
        <h3 class="mb-2 flex items-center gap-2 text-lg font-bold text-secondary">
          <Icon name="tabler:server" class="h-5 w-5" aria-hidden="true" />
          {{ t('projects.server') }}
        </h3>
        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="projects.serverDesc" tag="span">
            <template #domain>
              <a
                class="link link-primary"
                href="https://www.wupp.dev/"
                target="_blank"
                rel="noopener noreferrer"
                >wupp.dev</a
              >
            </template>
            <template #guide>
              <a
                class="link link-primary"
                href="https://wupp-dev.github.io/server/equipo/historia.html"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('projects.serverGuide') }}</a
              >
            </template>
            <template #bold>
              <strong>{{ t('projects.serverBold') }}</strong>
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- CEEBI -->
      <div class="rounded-box bg-base-200 p-4">
        <h3 class="mb-2 flex items-center gap-2 text-lg font-bold text-secondary">
          <Icon name="tabler:world-www" class="h-5 w-5" aria-hidden="true" />
          {{ t('projects.ceebi') }}
        </h3>
        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="projects.ceebiDesc" tag="span">
            <template #bold>
              <strong>{{ t('projects.ceebiBold') }}</strong>
            </template>
            <template #link>
              <a
                class="link link-primary"
                href="https://ceebi.wupp.dev"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('projects.ceebiLink') }}</a
              >
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </article>
</template>
