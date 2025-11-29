<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t("legal.seo.pageTitle"),
  description: () => t("legal.seo.description"),
  ogTitle: () => t("legal.seo.title"),
});
</script>

<template>
  <main id="main-content" class="section-enter">
    <div class="card card-border bg-base-100 shadow-sm">
      <div class="card-body prose max-w-none">
        <h1 class="card-title text-2xl mb-6">{{ t("legal.title") }}</h1>

        <!-- Información del sitio -->
        <section>
          <h2 class="text-xl font-semibold mb-3">
            {{ t("legal.siteInfo.title") }}
          </h2>
          <p>{{ t("legal.siteInfo.description") }}</p>
          <ul class="list-disc list-inside mt-2">
            <li>
              <strong>{{ t("legal.siteInfo.owner") }}:</strong> Iván Salido Cobo
            </li>
            <li>
              <strong>{{ t("legal.siteInfo.email") }}:</strong>
              <a href="mailto:isalidocobo@gmail.com" class="link link-primary">
                isalidocobo@gmail.com
              </a>
            </li>
            <li>
              <strong>{{ t("legal.siteInfo.purpose") }}:</strong>
              {{ t("legal.siteInfo.purposeText") }}
            </li>
          </ul>
        </section>

        <!-- Cookies -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold mb-3">
            {{ t("legal.cookies.title") }}
          </h2>
          <p>{{ t("legal.cookies.description") }}</p>

          <div class="overflow-x-auto mt-4">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>{{ t("legal.cookies.table.name") }}</th>
                  <th>{{ t("legal.cookies.table.purpose") }}</th>
                  <th>{{ t("legal.cookies.table.duration") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>nuxt-color-mode</code></td>
                  <td>{{ t("legal.cookies.colorMode") }}</td>
                  <td>{{ t("legal.cookies.year") }}</td>
                </tr>
                <tr>
                  <td><code>i18n_redirected</code></td>
                  <td>{{ t("legal.cookies.i18n") }}</td>
                  <td>{{ t("legal.cookies.year") }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="mt-4">{{ t("legal.cookies.note") }}</p>
        </section>

        <!-- Privacidad -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold mb-3">
            {{ t("legal.privacy.title") }}
          </h2>
          <p>{{ t("legal.privacy.description") }}</p>
          <ul class="list-disc list-inside mt-2">
            <li>{{ t("legal.privacy.noTracking") }}</li>
            <li>{{ t("legal.privacy.noAnalytics") }}</li>
            <li>{{ t("legal.privacy.noThirdParty") }}</li>
            <li>{{ t("legal.privacy.noPersonalData") }}</li>
          </ul>
        </section>

        <!-- Derechos -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold mb-3">
            {{ t("legal.rights.title") }}
          </h2>
          <p>{{ t("legal.rights.description") }}</p>
        </section>

        <!-- Última actualización -->
        <p class="text-sm text-base-content/60 mt-8">
          {{ t("legal.lastUpdate") }}: {{ t("legal.updateDate") }}
        </p>
      </div>
    </div>
  </main>
</template>
