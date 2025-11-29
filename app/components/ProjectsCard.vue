<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <article
    class="card card-border bg-base-100 shadow-lg transition-shadow hover:shadow-xl w-full"
    aria-labelledby="projects-title"
  >
    <div class="card-body gap-4">
      <h2 id="projects-title" class="card-title gap-2">
        <Icon
          name="tabler:code"
          class="w-6 h-6 text-primary"
          aria-hidden="true"
        />
        {{ t("projects.title") }}
      </h2>

      <!-- Servidor personal -->
      <div class="bg-base-200 rounded-box p-4">
        <h3
          class="text-lg font-bold text-secondary mb-2 flex items-center gap-2"
        >
          <Icon name="tabler:server" class="w-5 h-5" aria-hidden="true" />
          {{ t("projects.server") }}
        </h3>
        <p class="text-base-content/90 leading-relaxed">
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
                >{{ t("projects.serverGuide") }}</a
              >
            </template>
            <template #bold>
              <strong>{{ t("projects.serverBold") }}</strong>
            </template>
          </i18n-t>
        </p>
      </div>

      <!-- CEEBI -->
      <div class="bg-base-200 rounded-box p-4">
        <h3
          class="text-lg font-bold text-secondary mb-2 flex items-center gap-2"
        >
          <Icon name="tabler:world-www" class="w-5 h-5" aria-hidden="true" />
          {{ t("projects.ceebi") }}
        </h3>
        <p class="text-base-content/90 leading-relaxed">
          <i18n-t keypath="projects.ceebiDesc" tag="span">
            <template #bold>
              <strong>{{ t("projects.ceebiBold") }}</strong>
            </template>
            <template #link>
              <a
                class="link link-primary"
                href="https://ceebi.wupp.dev"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t("projects.ceebiLink") }}</a
              >
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </article>
</template>
