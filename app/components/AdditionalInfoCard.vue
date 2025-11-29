<script setup lang="ts">
const { t } = useI18n();

const editions = [
  { key: "edition1" },
  { key: "edition2" },
  { key: "edition3" },
  { key: "edition4" },
  { key: "edition5" },
];
</script>

<template>
  <article
    class="card card-border bg-base-100 shadow-lg transition-shadow hover:shadow-xl w-full"
    aria-labelledby="additional-info-title"
  >
    <div class="card-body gap-4">
      <h2 id="additional-info-title" class="card-title gap-2">
        <Icon
          name="tabler:presentation"
          class="w-6 h-6 text-primary"
          aria-hidden="true"
        />
        {{ t("conferences.title") }}
      </h2>

      <div class="space-y-4">
        <p class="text-base-content/90 leading-relaxed">
          <i18n-t keypath="conferences.intro" tag="span">
            <template #link>
              <a
                href="https://www.anem.es/web/que-es-el-enem/"
                class="link link-primary"
                target="_blank"
                rel="noopener noreferrer"
                >{{ t("conferences.enemLink") }}</a
              >
            </template>
            <template #bold>
              <strong>{{ t("conferences.enemBold") }}</strong>
            </template>
          </i18n-t>
        </p>

        <ul class="list bg-base-200 rounded-box" role="list">
          <li
            v-for="edition in editions"
            :key="edition.key"
            class="list-row py-2 px-3"
          >
            <Icon
              name="tabler:calendar-event"
              class="w-4 h-4 text-primary shrink-0"
              aria-hidden="true"
            />
            <span>{{ t(`conferences.${edition.key}`) }}</span>
          </li>
        </ul>

        <p class="text-base-content/90 leading-relaxed">
          <i18n-t keypath="conferences.organizer" tag="span">
            <template #bold>
              <strong class="text-secondary">{{
                t("conferences.organizerBold")
              }}</strong>
            </template>
          </i18n-t>
        </p>

        <p class="text-base-content/90 leading-relaxed">
          <i18n-t keypath="conferences.congressDetails" tag="span">
            <template #bold>
              <strong>{{ t("conferences.congressBold") }}</strong>
            </template>
            <template #bold2>
              <strong>{{ t("conferences.congressBold2") }}</strong>
            </template>
          </i18n-t>
        </p>

        <div class="divider my-2"></div>

        <p class="text-base-content/90 leading-relaxed">
          <i18n-t keypath="conferences.creup" tag="span">
            <template #bold>
              <strong class="text-secondary">{{
                t("conferences.creupBold")
              }}</strong>
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </article>
</template>
