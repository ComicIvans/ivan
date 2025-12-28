<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

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
    <UCard class="mx-auto max-w-4xl">
      <div class="prose prose-neutral dark:prose-invert max-w-none">
        <h1 class="text-primary-500 text-2xl font-bold">{{ t('legal.title') }}</h1>

        <!-- Información del sitio -->
        <section class="mt-8">
          <h2 class="text-primary-400 text-xl font-semibold">
            {{ t('legal.siteInfo.title') }}
          </h2>
          <p class="text-muted mt-2">{{ t('legal.siteInfo.description') }}</p>
          <ul class="text-muted mt-2 list-inside list-disc">
            <li>
              <strong>{{ t('legal.siteInfo.owner') }}:</strong> Iván Salido Cobo
            </li>
            <li>
              <strong>{{ t('legal.siteInfo.email') }}:</strong>
              <ULink :to="localePath('/contacto')" class="text-primary-500 hover:underline">
                {{ t('legal.siteInfo.contactForm') }}
              </ULink>
            </li>
            <li>
              <strong>{{ t('legal.siteInfo.purpose') }}:</strong>
              {{ t('legal.siteInfo.purposeText') }}
            </li>
          </ul>
        </section>

        <USeparator class="my-6" />

        <!-- Cookies -->
        <section>
          <h2 class="text-primary-400 text-xl font-semibold">
            {{ t('legal.cookies.title') }}
          </h2>
          <p class="text-muted mt-2">{{ t('legal.cookies.description') }}</p>

          <div class="mt-4 overflow-x-auto">
            <UTable
              :data="cookieItems"
              :columns="[
                { accessorKey: 'name', header: t('legal.cookies.table.name') },
                { accessorKey: 'purpose', header: t('legal.cookies.table.purpose') },
                { accessorKey: 'duration', header: t('legal.cookies.table.duration') },
              ]"
            />
          </div>

          <p class="text-muted mt-4">{{ t('legal.cookies.note') }}</p>
        </section>

        <USeparator class="my-6" />

        <!-- Formulario de contacto -->
        <section>
          <h2 class="text-primary-400 text-xl font-semibold">
            {{ t('legal.contactForm.title') }}
          </h2>
          <p class="text-muted mt-2">{{ t('legal.contactForm.description') }}</p>

          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.dataCollected.title') }}</h3>
          <ul class="text-muted mt-2 list-inside list-disc">
            <li v-for="(item, index) in contactFormDataItems" :key="index">{{ item }}</li>
          </ul>

          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.purpose.title') }}</h3>
          <p class="text-muted mt-1">{{ t('legal.contactForm.purpose.description') }}</p>

          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.legitimation.title') }}</h3>
          <p class="text-muted mt-1">
            {{ t('legal.contactForm.legitimation.description') }}
          </p>

          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.retention.title') }}</h3>
          <p class="text-muted mt-1">
            {{ t('legal.contactForm.retention.description') }}
          </p>

          <h3 class="mt-4 font-medium">{{ t('legal.contactForm.recipients.title') }}</h3>
          <p class="text-muted mt-1">
            {{ t('legal.contactForm.recipients.description') }}
          </p>
        </section>

        <USeparator class="my-6" />

        <!-- Privacidad -->
        <section>
          <h2 class="text-primary-400 text-xl font-semibold">
            {{ t('legal.privacy.title') }}
          </h2>
          <p class="text-muted mt-2">{{ t('legal.privacy.description') }}</p>
          <ul class="text-muted mt-2 list-inside list-disc">
            <li v-for="(item, index) in privacyItems" :key="index">{{ item }}</li>
          </ul>
        </section>

        <USeparator class="my-6" />

        <!-- Derechos -->
        <section>
          <h2 class="text-primary-400 text-xl font-semibold">
            {{ t('legal.rights.title') }}
          </h2>
          <p class="text-muted mt-2">{{ t('legal.rights.description') }}</p>
          <ul class="text-muted mt-2 list-inside list-disc">
            <li v-for="(item, index) in rightsItems" :key="index">{{ item }}</li>
          </ul>
          <p class="text-muted mt-4">{{ t('legal.rights.contact') }}</p>
          <p class="text-muted mt-2">{{ t('legal.rights.cookiesNote') }}</p>
        </section>

        <!-- Última actualización -->
        <p class="text-dimmed mt-8 text-sm">
          {{ t('legal.lastUpdate') }}: {{ t('legal.updateDate') }}
        </p>
      </div>
    </UCard>
  </section>
</template>
