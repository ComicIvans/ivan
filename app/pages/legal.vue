<script setup lang="ts">
import { profileName } from '~~/shared/constants/profile'
import { colorModeStorageKey, localeCookieName } from '~~/shared/constants/storage'

const { t, tm, rt } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

// Everything the site stores in the browser. The names come from the same
// constants nuxt.config hands to the modules; purpose and duration are copy.
const storageItems = [
  { id: 'colorMode', name: colorModeStorageKey, type: 'localStorage' },
  { id: 'i18n', name: localeCookieName, type: 'cookie' },
] as const

const storageRows = computed(() =>
  storageItems.map((item) => ({
    name: item.name,
    type: t(`legal.cookies.types.${item.type}`),
    purpose: t(`legal.cookies.items.${item.id}.purpose`),
    duration: t(`legal.cookies.items.${item.id}.duration`),
  }))
)

const storageColumns = computed(() => [
  { accessorKey: 'name', header: t('legal.cookies.table.name') },
  { accessorKey: 'type', header: t('legal.cookies.table.type') },
  { accessorKey: 'purpose', header: t('legal.cookies.table.purpose') },
  { accessorKey: 'duration', header: t('legal.cookies.table.duration') },
])

/** A list of messages; a key missing in this locale renders no items. */
function messageList(key: string) {
  const items: unknown = tm(key)
  return Array.isArray(items) ? items.map((item) => rt(item)) : []
}

const privacyItems = computed(() => messageList('legal.privacy.items'))
const contactFormDataItems = computed(() => messageList('legal.contactForm.dataCollected.items'))
const rightsItems = computed(() => messageList('legal.rights.items'))

definePageMeta({
  i18n: {
    paths: {
      es: '/legal',
      en: '/legal',
      de: '/impressum',
    },
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
                <strong>{{ t('legal.siteInfo.owner') }}:</strong> {{ profileName }}
              </li>
              <li>
                <strong>{{ t('legal.siteInfo.email') }}:</strong>
                <span class="mr-1" />
                <!-- raw + not-prose: ULink's colour utility and the prose link colour
                     would both override .inline-link -->
                <ULink
                  :to="{ path: localePath('/'), hash: '#contacto' }"
                  raw
                  class="inline-link not-prose"
                >
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
                :data="storageRows"
                :columns="storageColumns"
                :ui="{ td: 'font-mono text-sm' }"
              />
            </div>

            <p>{{ t('legal.cookies.note') }}</p>
          </section>

          <USeparator class="my-6" />

          <!-- Contact form (linked from the form's privacy note) -->
          <section id="formulario-contacto">
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
            <i18n-t keypath="legal.rights.contact" tag="p" scope="global">
              <template #form>
                <!-- raw + not-prose: see the contact link above -->
                <ULink
                  :to="{ path: localePath('/'), hash: '#contacto' }"
                  raw
                  class="inline-link not-prose"
                >
                  {{ t('legal.rights.formLink') }}
                </ULink>
              </template>
            </i18n-t>
            <p>{{ t('legal.rights.cookiesNote') }}</p>
          </section>

          <!-- Last update -->
          <p class="text-muted mt-8 text-sm">
            {{ t('legal.lastUpdate') }}: {{ t('legal.updateDate') }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
