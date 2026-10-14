<script setup lang="ts">
import { representationIcons } from '~/constants/icons'
import type { TimelineSectionItem } from '~/components/TimelineSection.vue'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

interface RepresentationItem {
  id: string
  date: string
  title: string
  description: string
  highlights: string[]
  icon: string
}

const representationData = useI18nList<RepresentationItem>(
  'representation.timeline',
  ({ raw, value, tr }) => {
    const id = value(raw.id)
    const highlights = (raw.highlights as unknown[]) || []

    return {
      id,
      date: tr(raw.date),
      title: tr(raw.title),
      description: tr(raw.description),
      highlights: highlights.map((highlight) => tr(highlight)),
      icon: representationIcons[id] || 'i-tabler-point',
    }
  }
)

// Derived from a fixed start year so server and client agree within a render
const START_YEAR = 2020
const yearsActive = new Date().getFullYear() - START_YEAR

const milestonesCount = computed(() => representationData.value.length)
const rolesCount = computed(() =>
  representationData.value.reduce((total, item) => total + item.highlights.length, 0)
)

const timelineItems = computed<TimelineSectionItem[]>(() =>
  representationData.value.map((item) => ({
    title: item.title,
    date: item.date,
    description: item.description,
    icon: item.icon,
    highlights: item.highlights,
  }))
)

// Finished counters stamp org pins onto the DELEGADO badge (placeholder
// initials until the official SVG logos land — material list A3).
const journey = useCredentialJourney()

function addPin(pin: string) {
  if (!journey.pins.value.includes(pin)) journey.pins.value.push(pin)
}
</script>

<template>
  <section :id="id" class="scroll-mt-24 py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <RevealHeading
          :title="t('representation.title')"
          :heading-id="`${id}-title`"
          :intro="t('representation.intro')"
          accent="blue"
        />

        <div class="border-default reveal grid grid-cols-3 gap-4 border-y py-6 sm:gap-6">
          <StatCounter
            :value="yearsActive"
            :label="t('representation.stats.years')"
            @finished="addPin('CR')"
          />
          <StatCounter
            :value="milestonesCount"
            :label="t('representation.stats.milestones')"
            @finished="addPin('UPV')"
          />
          <StatCounter
            :value="rolesCount"
            :label="t('representation.stats.roles')"
            @finished="addPin('UGR')"
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
