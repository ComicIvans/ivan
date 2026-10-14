<script setup lang="ts">
import { roleIcons } from '~/constants/icons'
import type { TimelineSectionItem } from '~/components/TimelineSection.vue'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

const currentRoles = ['creup-digitalization']

interface Experience {
  id: string
  title: string
  org: string
  period: string
  description: string
  icon: string
  current: boolean
}

const experiences = useI18nList<Experience>('experience.roles', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    title: tr(raw.title),
    org: tr(raw.organization),
    period: tr(raw.period),
    description: tr(raw.description),
    icon: roleIcons[id] || 'i-tabler-briefcase',
    current: currentRoles.includes(id),
  }
})

const timelineItems = computed<TimelineSectionItem[]>(() =>
  experiences.value.map((exp) => ({
    title: exp.title,
    date: exp.period,
    organization: exp.org,
    description: exp.description,
    icon: exp.icon,
    current: exp.current,
  }))
)

function scrollToSection(targetId: string) {
  const el = document.getElementById(targetId)
  if (!el) return
  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: motionOk ? 'smooth' : 'auto' })
}

// The thread reports which milestone it lit; the badge reprints its role line.
const journey = useCredentialJourney()

function onMilestone(index: number) {
  const exp = experiences.value[index]
  if (exp) journey.roleLine.value = exp.title
}
</script>

<template>
  <section :id="id" class="scroll-mt-24 py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
      <!-- Sticky context panel: safe because its height never depends on scroll -->
      <div class="lg:sticky lg:top-28 lg:self-start">
        <RevealHeading
          :title="t('experience.title')"
          :heading-id="`${id}-title`"
          :intro="t('experience.intro')"
          accent="ember"
        />

        <div class="surface-glass reveal rounded-2xl p-6">
          <p class="text-muted">
            {{ t('experience.fullExperience') }}
          </p>
          <UButton
            color="primary"
            class="mt-4"
            icon="i-tabler-history"
            @click="scrollToSection('representacion')"
          >
            {{ t('experience.viewRepresentation') }}
          </UButton>
        </div>
      </div>

      <div>
        <CredentialAnchor section="experiencia" class="mx-auto mb-8 lg:mx-0" />
        <TimelineSection
          :items="timelineItems"
          accent="ember"
          :current-label="t('experience.current')"
          thread
          @milestone="onMilestone"
        />
      </div>
    </div>
  </section>
</template>
