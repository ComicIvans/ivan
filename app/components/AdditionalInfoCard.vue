<script setup lang="ts">
const { t } = useI18n()

const editions = [
  { key: 'edition1' },
  { key: 'edition2' },
  { key: 'edition3' },
  { key: 'edition4' },
  { key: 'edition5' },
]
</script>

<template>
  <article
    class="card-border card w-full bg-base-100 shadow-lg transition-shadow hover:shadow-xl"
    aria-labelledby="additional-info-title"
  >
    <div class="card-body gap-4">
      <h2 id="additional-info-title" class="card-title gap-2">
        <Icon name="tabler:presentation" class="h-6 w-6 text-primary" aria-hidden="true" />
        {{ t('conferences.title') }}
      </h2>

      <div class="space-y-4">
        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="conferences.intro" tag="span">
            <template #link>
              <a
                href="https://www.anem.es/web/que-es-el-enem/"
                class="link link-primary"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t('conferences.enemLink') }}</a
              >
            </template>
            <template #bold>
              <strong>{{ t('conferences.enemBold') }}</strong>
            </template>
          </i18n-t>
        </p>

        <ul class="list rounded-box bg-base-200" role="list">
          <li v-for="edition in editions" :key="edition.key" class="list-row px-3 py-2">
            <Icon
              name="tabler:calendar-event"
              class="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{{ t(`conferences.${edition.key}`) }}</span>
          </li>
        </ul>

        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="conferences.organizer" tag="span">
            <template #bold>
              <strong class="text-secondary">{{ t('conferences.organizerBold') }}</strong>
            </template>
          </i18n-t>
        </p>

        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="conferences.congressDetails" tag="span">
            <template #bold>
              <strong>{{ t('conferences.congressBold') }}</strong>
            </template>
            <template #bold2>
              <strong>{{ t('conferences.congressBold2') }}</strong>
            </template>
          </i18n-t>
        </p>

        <div class="divider my-2"></div>

        <p class="leading-relaxed text-base-content/90">
          <i18n-t keypath="conferences.creup" tag="span">
            <template #bold>
              <strong class="text-secondary">{{ t('conferences.creupBold') }}</strong>
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </article>
</template>
