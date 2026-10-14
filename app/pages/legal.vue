<script setup lang="ts">
const { t, tm, rt } = useI18n({ useScope: 'global' })
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

defineI18nRoute({
  paths: {
    es: '/legal',
    en: '/legal',
    de: '/impressum',
  },
})

usePageSeo('legal.title', 'seo.pages.legal', { robots: 'noindex, follow' })
</script>

<template>
  <section :aria-label="t('legal.title')">
    <div class="mx-auto max-w-3xl">
      <PageHeader :title="t('legal.title')" />

      <UCard class="reveal">
        <div class="prose prose-neutral dark:prose-invert max-w-none">
          <!-- Site information -->
          <section>
            <h2>{{ t('legal.siteInfo.title') }}</h2>
            <p>{{ t('legal.siteInfo.description') }}</p>
            <ul>
              <li>
                <strong>{{ t('legal.siteInfo.owner') }}:</strong> Iván Salido Cobo
              </li>
              <li>
                <strong>{{ t('legal.siteInfo.email') }}:</strong>
                <span class="mr-1" />
                <ULink :to="{ path: localePath('/'), hash: '#contacto' }" class="inline-link">
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
            <h2>{{ t('legal.cookies.title') }}</h2>
            <p>{{ t('legal.cookies.description') }}</p>

            <!-- not-prose: UTable brings its own table styling -->
            <div class="not-prose mt-4 overflow-x-auto">
              <UTable
                :data="cookieItems"
                :columns="[
                  { accessorKey: 'name', header: t('legal.cookies.table.name') },
                  { accessorKey: 'purpose', header: t('legal.cookies.table.purpose') },
                  { accessorKey: 'duration', header: t('legal.cookies.table.duration') },
                ]"
                :ui="{ td: 'font-mono text-sm' }"
              />
            </div>

            <p>{{ t('legal.cookies.note') }}</p>
          </section>

          <USeparator class="my-6" />

          <!-- Contact form -->
          <section>
            <h2>{{ t('legal.contactForm.title') }}</h2>
            <p>{{ t('legal.contactForm.description') }}</p>

            <h3>{{ t('legal.contactForm.dataCollected.title') }}</h3>
            <ul>
              <li v-for="(item, index) in contactFormDataItems" :key="index">{{ item }}</li>
            </ul>

            <h3>{{ t('legal.contactForm.purpose.title') }}</h3>
            <p>{{ t('legal.contactForm.purpose.description') }}</p>

            <h3>{{ t('legal.contactForm.legitimation.title') }}</h3>
            <p>{{ t('legal.contactForm.legitimation.description') }}</p>

            <h3>{{ t('legal.contactForm.retention.title') }}</h3>
            <p>{{ t('legal.contactForm.retention.description') }}</p>

            <h3>{{ t('legal.contactForm.recipients.title') }}</h3>
            <p>{{ t('legal.contactForm.recipients.description') }}</p>
          </section>

          <USeparator class="my-6" />

          <!-- Privacy -->
          <section>
            <h2>{{ t('legal.privacy.title') }}</h2>
            <p>{{ t('legal.privacy.description') }}</p>
            <ul>
              <li v-for="(item, index) in privacyItems" :key="index">{{ item }}</li>
            </ul>
          </section>

          <USeparator class="my-6" />

          <!-- Rights -->
          <section>
            <h2>{{ t('legal.rights.title') }}</h2>
            <p>{{ t('legal.rights.description') }}</p>
            <ul>
              <li v-for="(item, index) in rightsItems" :key="index">{{ item }}</li>
            </ul>
            <p>{{ t('legal.rights.contact') }}</p>
            <p>{{ t('legal.rights.cookiesNote') }}</p>
          </section>

          <!-- Last update -->
          <p class="text-dimmed mt-8 text-sm">
            {{ t('legal.lastUpdate') }}: {{ t('legal.updateDate') }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
