<script setup lang="ts">
defineProps<{ id: string }>()

const { t } = useI18n({ useScope: 'global' })

const { academic, languages, certifications, competencies } = useProfile()
</script>

<template>
  <section :id="id" class="py-20 sm:py-28" :aria-labelledby="`${id}-title`">
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
          <UCard v-for="item in academic" :key="item.id" v-spotlight class="motion-card reveal">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                class="flex size-14 shrink-0 items-center justify-center self-start rounded-xl"
                :class="
                  item.current
                    ? 'bg-amber-500/10 shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--color-amber-500)_35%,transparent)]'
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
                  <h4 class="text-lg font-bold">{{ item.title }}</h4>
                  <UBadge :color="item.current ? 'warning' : 'neutral'" size="sm">
                    {{ item.period }}
                  </UBadge>
                </div>
                <p class="mt-1 font-medium text-toned">{{ item.organization }}</p>
                <p class="mt-2 text-muted">{{ item.description }}</p>
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
                  <h4 :id="`${id}-lang-${lang.id}`" class="font-bold">{{ lang.name }}</h4>
                  <p class="text-sm text-toned">{{ lang.level }}</p>
                </div>
              </div>
              <p class="mt-2 text-sm text-muted">{{ lang.description }}</p>
              <div class="mt-4">
                <p :id="`${id}-lang-${lang.id}-meter`" class="mb-2 text-xs text-muted">
                  {{ t('training.languages.proficiency') }}
                </p>
                <!-- Meter name: the label above plus the language name -->
                <LanguageLevel
                  :level="lang.cefr"
                  :level-label="lang.level"
                  :labelledby="`${id}-lang-${lang.id}-meter ${id}-lang-${lang.id}`"
                  accent="amber"
                />
              </div>
            </UCard>
          </div>
        </div>

        <!-- Other Certifications -->
        <div v-if="certifications.length">
          <SectionHeader
            as="h3"
            index="03"
            :title="t('training.other.title')"
            icon="i-tabler-certificate"
            accent="amber"
          />

          <div class="space-y-4">
            <UCard v-for="item in certifications" :key="item.id" class="motion-card reveal">
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div
                  class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10"
                >
                  <UIcon
                    :name="item.icon"
                    class="size-6 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                </div>
                <h4 class="font-bold">{{ item.title }}</h4>
                <p class="text-sm text-muted">
                  {{ item.description }}
                </p>
              </div>
            </UCard>
          </div>
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
              :key="comp.id"
              class="flex items-center gap-2 rounded-full border border-default bg-elevated/50 px-4 py-2"
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
