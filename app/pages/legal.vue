<script setup lang="ts">
const { t, tm, rt } = useI18n()

const cookieItems = computed(() => {
  const items = tm('legal.cookies.items') as Array<{
    id: string
    purpose: string
    duration: string
  }>
  return items.map((item) => ({
    id: item.id,
    name: item.id === 'colorMode' ? 'nuxt-color-mode' : 'i18n_redirected',
    purpose: rt(item.purpose),
    duration: rt(item.duration),
  }))
})

const privacyItems = computed(() => {
  const items = tm('legal.privacy.items') as string[]
  return items.map((item) => rt(item))
})

const contactFormDataItems = computed(() => {
  const items = tm('legal.contactForm.dataCollected.items') as string[]
  return items.map((item) => rt(item))
})

const rightsItems = computed(() => {
  const items = tm('legal.rights.items') as string[]
  return items.map((item) => rt(item))
})

useSeoMeta({
  title: () => t('legal.title'),
  description: () => t('seo.pages.legal'),
  ogType: 'website',
})
</script>

<template>
  <section role="region" :aria-label="t('legal.title')" class="section-enter">
    <div class="card-border card bg-base-100 shadow-sm">
      <div class="prose card-body max-w-none">
        <h1 class="card-title mb-6 text-2xl">{{ t('legal.title') }}</h1>

        <!-- Información del sitio -->
        <section>
          <h2 class="mb-3 text-xl font-semibold">
            {{ t('legal.siteInfo.title') }}
          </h2>
          <p>{{ t('legal.siteInfo.description') }}</p>
          <ul class="mt-2 list-inside list-disc">
            <li>
              <strong>{{ t('legal.siteInfo.owner') }}:</strong> Iván Salido Cobo
            </li>
            <li>
              <strong>{{ t('legal.siteInfo.email') }}:</strong>
              <a href="mailto:isalidocobo@gmail.com" class="link link-primary">
                isalidocobo@gmail.com
              </a>
            </li>
            <li>
              <strong>{{ t('legal.siteInfo.purpose') }}:</strong>
              {{ t('legal.siteInfo.purposeText') }}
            </li>
          </ul>
        </section>

        <!-- Cookies -->
        <section class="mt-8">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t('legal.cookies.title') }}
          </h2>
          <p>{{ t('legal.cookies.description') }}</p>

          <div class="mt-4 overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>{{ t('legal.cookies.table.name') }}</th>
                  <th>{{ t('legal.cookies.table.purpose') }}</th>
                  <th>{{ t('legal.cookies.table.duration') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cookie in cookieItems" :key="cookie.id">
                  <td>
                    <code>{{ cookie.name }}</code>
                  </td>
                  <td>{{ cookie.purpose }}</td>
                  <td>{{ cookie.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="mt-4">{{ t('legal.cookies.note') }}</p>
        </section>

        <!-- Formulario de contacto -->
        <section class="mt-8">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t('legal.contactForm.title') }}
          </h2>
          <p>{{ t('legal.contactForm.description') }}</p>

          <!-- Datos recopilados -->
          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.dataCollected.title') }}</h3>
          <ul class="mt-2 list-inside list-disc">
            <li v-for="(item, index) in contactFormDataItems" :key="index">{{ item }}</li>
          </ul>

          <!-- Finalidad -->
          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.purpose.title') }}</h3>
          <p class="mt-1">{{ t('legal.contactForm.purpose.description') }}</p>

          <!-- Base legal -->
          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.legitimation.title') }}</h3>
          <p class="mt-1">{{ t('legal.contactForm.legitimation.description') }}</p>

          <!-- Conservación -->
          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.retention.title') }}</h3>
          <p class="mt-1">{{ t('legal.contactForm.retention.description') }}</p>

          <!-- Destinatarios -->
          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.recipients.title') }}</h3>
          <p class="mt-1">{{ t('legal.contactForm.recipients.description') }}</p>
        </section>

        <!-- Privacidad -->
        <section class="mt-8">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t('legal.privacy.title') }}
          </h2>
          <p>{{ t('legal.privacy.description') }}</p>
          <ul class="mt-2 list-inside list-disc">
            <li v-for="(item, index) in privacyItems" :key="index">{{ item }}</li>
          </ul>
        </section>

        <!-- Derechos -->
        <section class="mt-8">
          <h2 class="mb-3 text-xl font-semibold">
            {{ t('legal.rights.title') }}
          </h2>
          <p>{{ t('legal.rights.description') }}</p>
          <ul class="mt-2 list-inside list-disc">
            <li v-for="(item, index) in rightsItems" :key="index">{{ item }}</li>
          </ul>
          <p class="mt-4">{{ t('legal.rights.contact') }}</p>
          <p class="mt-2">{{ t('legal.rights.cookiesNote') }}</p>
        </section>

        <!-- Última actualización -->
        <p class="mt-8 text-sm text-base-content/60">
          {{ t('legal.lastUpdate') }}: {{ t('legal.updateDate') }}
        </p>
      </div>
    </div>
  </section>
</template>
