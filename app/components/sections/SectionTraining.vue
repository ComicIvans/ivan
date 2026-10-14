<script setup lang="ts">
import { academicIcons, competencyIcons, languageFlags } from '~/constants/icons'

defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

const currentAcademic = ['mugeps']

const academicItems = useI18nList('training.academic.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    title: tr(raw.title),
    org: tr(raw.organization),
    period: tr(raw.period),
    description: tr(raw.description),
    icon: academicIcons[id] || 'i-tabler-certificate',
    current: currentAcademic.includes(id),
  }
})

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native'

const languageLevels: Record<string, CefrLevel> = {
  english: 'C1',
  german: 'A1',
  spanish: 'native',
}

// Percentages feed the sr-only proficiency value of the CEFR meter.
const languageProgress: Record<string, number> = {
  english: 85,
  german: 15,
  spanish: 100,
}

const languages = useI18nList('training.languages.items', ({ raw, value, tr }) => {
  const id = value(raw.id)
  return {
    id,
    name: tr(raw.name),
    level: tr(raw.level),
    description: tr(raw.description),
    flag: languageFlags[id] || 'i-tabler-flag',
    cefr: languageLevels[id] || 'A1',
    progress: languageProgress[id] || 50,
  }
})

const competencies = useI18nList('training.competencies.items', ({ raw, value, tr }) => ({
  name: tr(raw.name),
  icon: competencyIcons[value(raw.id)] || 'i-tabler-star',
}))
</script>

<template>
  <section :id="id" class="scroll-mt-24 py-20 sm:py-28" :aria-labelledby="`${id}-title`">
    <RevealHeading :title="t('training.title')" :heading-id="`${id}-title`" accent="amber" />

    <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <!-- Academic Training -->
      <div>
        <SectionHeader
          as="h3"
          index="01"
          :title="t('training.academic.title')"
          icon="i-tabler-school"
          accent="amber"
        />

        <div class="space-y-6">
          <UCard
            v-for="item in academicItems"
            :key="item.id"
            v-spotlight
            class="motion-card reveal"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                class="flex size-14 shrink-0 items-center justify-center self-start rounded-xl"
                :class="
                  item.current
                    ? 'bg-amber-500/10 shadow-[0_0_24px_-6px_rgb(245_158_11_/_0.35)]'
                    : 'bg-elevated'
                "
              >
                <UIcon
                  :name="item.icon"
                  class="size-8"
                  :class="item.current ? 'text-amber-600 dark:text-amber-400' : 'text-muted'"
                  aria-hidden="true"
                />
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-lg font-bold">{{ item.title }}</h3>
                  <UBadge :color="item.current ? 'warning' : 'neutral'" size="sm">
                    {{ item.period }}
                  </UBadge>
                </div>
                <p class="text-toned mt-1 font-medium">{{ item.org }}</p>
                <p class="text-muted mt-2">{{ item.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div class="space-y-12">
        <CredentialAnchor section="formacion" class="mx-auto lg:mx-0" />

        <!-- Languages -->
        <div>
          <SectionHeader
            as="h3"
            index="02"
            :title="t('training.languages.title')"
            icon="i-tabler-language"
            accent="amber"
          />

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <UCard v-for="lang in languages" :key="lang.id" class="motion-card reveal">
              <div class="flex items-center gap-3">
                <UIcon :name="lang.flag" class="size-10" aria-hidden="true" />
                <div>
                  <h3 class="font-bold">{{ lang.name }}</h3>
                  <p class="text-toned text-sm">{{ lang.level }}</p>
                </div>
              </div>
              <p class="text-muted mt-2 text-sm">{{ lang.description }}</p>
              <div class="mt-4">
                <p class="text-muted mb-2 text-xs">{{ t('training.languages.proficiency') }}</p>
                <LanguageLevel
                  :level="lang.cefr"
                  :level-label="lang.level"
                  :percent="lang.progress"
                  accent="amber"
                />
              </div>
            </UCard>
          </div>
        </div>

        <!-- Other Certifications -->
        <div>
          <SectionHeader
            as="h3"
            index="03"
            :title="t('training.other.title')"
            icon="i-tabler-certificate"
            accent="amber"
          />

          <UCard class="motion-card reveal">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10"
              >
                <UIcon
                  name="i-tabler-car"
                  class="size-6 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              </div>
              <h3 class="font-bold">{{ t('training.other.drivingLicense.title') }}</h3>
              <p class="text-muted text-sm">
                {{ t('training.other.drivingLicense.description') }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Transversal Competencies -->
        <div>
          <SectionHeader
            as="h3"
            index="04"
            :title="t('training.competencies.title')"
            icon="i-tabler-bulb"
            accent="amber"
          />

          <div class="reveal flex flex-wrap gap-3">
            <div
              v-for="comp in competencies"
              :key="comp.name"
              class="border-default bg-elevated/50 flex items-center gap-2 rounded-full border px-4 py-2"
            >
              <UIcon
                :name="comp.icon"
                class="size-5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <span class="font-medium">{{ comp.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
