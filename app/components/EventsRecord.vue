<script setup lang="ts">
const { t } = useI18n();

// Responsividad propia del componente
const { width, height } = useWindowSize();
const isMobile = computed(
  () => width.value < height.value || width.value < 868
);

const events = computed(() => [
  {
    dateKey: "event1Date",
    titleKey: "event1Title",
    descKey: "event1Desc",
    hasLinks: false,
    position: "start",
  },
  {
    dateKey: "event2Date",
    titleKey: "event2Title",
    descKey: "event2Desc",
    hasLinks: true,
    position: "end",
  },
  {
    dateKey: "event3Date",
    titleKey: "event3Title",
    descKey: "event3Desc",
    hasLinks: false,
    position: "start",
  },
  {
    dateKey: "event4Date",
    titleKey: "event4Title",
    descKey: "event4Desc",
    hasLinks: false,
    position: "end",
  },
  {
    dateKey: "event5Date",
    titleKey: "event5Title",
    descKey: "event5Desc",
    hasLinks: false,
    position: "start",
    isLast: true,
  },
]);
</script>

<template>
  <section
    class="flex flex-col items-center justify-center"
    aria-labelledby="events-title"
  >
    <header
      class="flex items-center gap-2 text-xl font-bold bg-base-300 rounded-box px-5 py-3 mb-4"
    >
      <Icon
        name="tabler:calendar-event"
        class="w-6 h-6 text-primary"
        aria-hidden="true"
      />
      <h2 id="events-title">{{ t("events.title") }}</h2>
    </header>
    <ol
      :class="{ 'timeline-compact': isMobile }"
      class="timeline timeline-snap-icon timeline-vertical mx-auto"
      role="list"
      :aria-label="t('events.ariaLabel')"
    >
      <li v-for="(event, index) in events" :key="index">
        <hr v-if="index > 0" class="bg-primary" />
        <div class="timeline-middle text-primary" aria-hidden="true">
          <Icon name="tabler:circle-check-filled" class="w-5 h-5" />
        </div>
        <div
          :class="[
            event.position === 'start' ? 'timeline-start' : 'timeline-end',
            { 'text-end': !isMobile && event.position === 'start' },
          ]"
          class="mb-10 timeline-box bg-base-200 border-base-300"
        >
          <time class="badge badge-soft badge-secondary badge-sm mb-2">
            {{ t(`events.${event.dateKey}`) }}
          </time>
          <h3 class="text-lg font-bold text-secondary">
            {{ t(`events.${event.titleKey}`) }}
          </h3>
          <p class="text-base-content/90 mt-1">
            <template v-if="event.hasLinks">
              <i18n-t :keypath="`events.${event.descKey}`" tag="span">
                <template #link1>
                  <a
                    class="link link-primary"
                    href="https://github.com/defcUGR/bingo"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ t("events.event2Link") }}</a
                  >
                </template>
                <template #link2>
                  <a
                    class="link link-primary"
                    href="https://github.com/defcUGR/bingo-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ t("events.event2Link") }}</a
                  >
                </template>
              </i18n-t>
            </template>
            <span v-else>{{ t(`events.${event.descKey}`) }}</span>
          </p>
        </div>
        <hr v-if="!event.isLast" class="bg-primary" />
      </li>
    </ol>
  </section>
</template>
