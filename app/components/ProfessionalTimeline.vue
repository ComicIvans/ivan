<script setup lang="ts">
const { t } = useI18n();

// Responsividad propia del componente
const { width, height } = useWindowSize();
const isMobile = computed(
  () => width.value < height.value || width.value < 868
);

const timelineItems = computed(() => [
  {
    dateKey: "item1Date",
    titleKey: "item1Title",
    descKey: "item1Desc",
    boldKeys: ["item1Bold1", "item1Bold2"],
    position: "start",
  },
  {
    dateKey: "item2Date",
    titleKey: "item2Title",
    descKey: "item2Desc",
    boldKeys: ["item2Bold"],
    position: "end",
  },
  {
    dateKey: "item3Date",
    titleKey: "item3Title",
    descKey: "item3Desc",
    boldKeys: [],
    position: "start",
  },
  {
    dateKey: "item4Date",
    titleKey: "item4Title",
    descKey: "item4Desc",
    boldKeys: [],
    position: "end",
  },
  {
    dateKey: "item5Date",
    titleKey: "item5Title",
    descKey: "item5Desc",
    boldKeys: [],
    position: "start",
    isLast: true,
  },
]);
</script>

<template>
  <section
    class="flex flex-col items-center justify-center"
    aria-labelledby="timeline-title"
  >
    <header
      class="flex items-center gap-2 text-xl font-bold bg-base-300 rounded-box px-5 py-3 mb-4"
    >
      <Icon
        name="tabler:building-bank"
        class="w-6 h-6 text-primary"
        aria-hidden="true"
      />
      <h2 id="timeline-title">{{ t("timeline.title") }}</h2>
    </header>
    <ol
      :class="{ 'timeline-compact': isMobile }"
      class="timeline timeline-snap-icon timeline-vertical mx-auto"
      role="list"
      :aria-label="t('timeline.ariaLabel')"
    >
      <li v-for="(item, index) in timelineItems" :key="index">
        <hr v-if="index > 0" class="bg-primary" />
        <div class="timeline-middle text-primary" aria-hidden="true">
          <Icon name="tabler:circle-check-filled" class="w-5 h-5" />
        </div>
        <div
          :class="[
            item.position === 'start' ? 'timeline-start' : 'timeline-end',
            { 'text-end': !isMobile && item.position === 'start' },
          ]"
          class="mb-10 timeline-box bg-base-200 border-base-300"
        >
          <time class="badge badge-soft badge-secondary badge-sm mb-2">
            {{ t(`timeline.${item.dateKey}`) }}
          </time>
          <h3 class="text-lg font-bold text-secondary">
            {{ t(`timeline.${item.titleKey}`) }}
          </h3>
          <p class="text-base-content/90 mt-1">
            <i18n-t
              v-if="item.boldKeys.length === 2"
              :keypath="`timeline.${item.descKey}`"
              tag="span"
            >
              <template #bold1>
                <strong>{{ t(`timeline.${item.boldKeys[0]}`) }}</strong>
              </template>
              <template #bold2>
                <strong>{{ t(`timeline.${item.boldKeys[1]}`) }}</strong>
              </template>
            </i18n-t>
            <i18n-t
              v-else-if="item.boldKeys.length === 1"
              :keypath="`timeline.${item.descKey}`"
              tag="span"
            >
              <template #bold>
                <strong>{{ t(`timeline.${item.boldKeys[0]}`) }}</strong>
              </template>
            </i18n-t>
            <span v-else>{{ t(`timeline.${item.descKey}`) }}</span>
          </p>
        </div>
        <hr v-if="!item.isLast" class="bg-primary" />
      </li>
    </ol>
  </section>
</template>
