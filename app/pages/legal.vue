<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { profileName } from '~~/shared/constants/profile'
import {
  colorModeStorageKey,
  localeCookieName,
  nuxtReloadStorageKey,
} from '~~/shared/constants/storage'

const { t, tm, rt } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

// Everything the site stores in the browser. The names come from the same
// constants nuxt.config hands to the modules; purpose and duration are copy.
const storageItems = [
  { id: 'colorMode', name: colorModeStorageKey, type: 'localStorage' },
  { id: 'i18n', name: localeCookieName, type: 'cookie' },
  { id: 'reload', name: nuxtReloadStorageKey, type: 'sessionStorage' },
] as const

const storageFields = ['name', 'type', 'purpose', 'duration'] as const
type StorageRow = Record<(typeof storageFields)[number], string>

const storageRows = computed<StorageRow[]>(() =>
  storageItems.map((item) => ({
    name: item.name,
    type: t(`legal.cookies.types.${item.type}`),
    purpose: t(`legal.cookies.items.${item.id}.purpose`),
    duration: t(`legal.cookies.items.${item.id}.duration`),
  }))
)

// The cells wrap, except the storage names; the purpose column keeps a
// readable width.
const storageColumnClass: Partial<Record<(typeof storageFields)[number], string>> = {
  name: 'font-mono whitespace-nowrap',
  purpose: 'min-w-56',
}

const storageColumns = computed<TableColumn<StorageRow>[]>(() =>
  storageFields.map((field) => ({
    accessorKey: field,
    header: t(`legal.cookies.table.${field}`),
    meta: { class: { td: storageColumnClass[field] } },
  }))
)

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
        <div class="prose max-w-none prose-neutral dark:prose-invert">
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

            <!-- Below lg the four columns do not fit the card: one block per item -->
            <div class="not-prose mt-4 space-y-3 lg:hidden">
              <dl
                v-for="row in storageRows"
                :key="row.name"
                class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-lg border border-default p-4 text-sm"
              >
                <template v-for="field in storageFields" :key="field">
                  <dt class="text-muted">{{ t(`legal.cookies.table.${field}`) }}</dt>
                  <dd :class="field === 'name' ? 'font-mono break-all' : ''">{{ row[field] }}</dd>
                </template>
              </dl>
            </div>

            <!-- not-prose: UTable brings its own table styling -->
            <div class="not-prose mt-4 hidden overflow-x-auto lg:block">
              <UTable
                :data="storageRows"
                :columns="storageColumns"
                :ui="{ td: 'whitespace-normal align-top' }"
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
          <p class="mt-8 text-sm text-muted">
            {{ t('legal.lastUpdate') }}: {{ t('legal.updateDate') }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
