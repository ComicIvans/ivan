<script setup lang="ts">
import type { TimelineSectionItem } from '~/components/TimelineSection.vue'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

const { representation, representationStats } = useProfile()

const timelineItems = computed<TimelineSectionItem[]>(() =>
  representation.value.map((item) => ({
    title: item.title,
    date: item.date,
    description: item.description,
    icon: item.icon,
    highlights: item.roles,
  }))
)

// Finished counters stamp the organisation pins of the milestones (in
// timeline order) onto the DELEGADO badge, spread across the three counters.
const COUNTER_COUNT = 3
const journey = useCredentialJourney()
const milestonePins = computed(() => representation.value.flatMap((item) => item.pin ?? []))
const finishedCounters = ref<number[]>([])

function onCounterFinished(counter: number) {
  if (!finishedCounters.value.includes(counter)) finishedCounters.value.push(counter)
}

watch(
  [milestonePins, finishedCounters],
  ([pins, finished]) => {
    pins.forEach((pin, index) => {
      const stamped = finished.includes(index % COUNTER_COUNT)
      if (stamped && !journey.pins.value.includes(pin)) journey.pins.value.push(pin)
    })
  },
  { deep: true }
)
</script>

<template>
  <section :id="id" class="py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <RevealHeading
          :title="t('representation.title')"
          :heading-id="`${id}-title`"
          :intro="t('representation.intro')"
          accent="blue"
        />

        <div class="reveal grid grid-cols-3 gap-4 border-y border-default py-6 sm:gap-6">
          <StatCounter
            :value="representationStats.yearsActive"
            :label="t('representation.stats.years')"
            @finished="onCounterFinished(0)"
          />
          <StatCounter
            :value="representationStats.milestones"
            :label="t('representation.stats.milestones')"
            @finished="onCounterFinished(1)"
          />
          <StatCounter
            :value="representationStats.roles"
            :label="t('representation.stats.roles')"
            @finished="onCounterFinished(2)"
          />
        </div>
      </div>

      <div>
        <CredentialAnchor section="representacion" class="mx-auto mb-8 lg:mx-0" />
        <TimelineSection
          :items="timelineItems"
          accent="blue"
          :aria-label="t('representation.timelineLabel')"
          thread
        />
      </div>
    </div>
  </section>
</template>
