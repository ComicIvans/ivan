<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    index?: string
    icon?: string
    accent?: 'ember' | 'amber' | 'blue'
    as?: 'h2' | 'h3'
  }>(),
  {
    index: undefined,
    icon: undefined,
    accent: 'ember',
    as: 'h2',
  }
)

// 700 in light mode: the index number is small text and needs 4.5:1.
const accentText = computed(
  () =>
    ({
      ember: 'text-primary-700 dark:text-primary-400',
      amber: 'text-amber-700 dark:text-amber-400',
      blue: 'text-blue-700 dark:text-blue-400',
    })[props.accent]
)

const ruleClass = computed(
  () =>
    ({
      ember: 'from-primary-500 to-amber-400',
      amber: 'from-amber-500 to-primary-400',
      blue: 'from-blue-500 to-primary-400',
    })[props.accent]
)
</script>

<template>
  <div class="mb-6">
    <div class="flex items-baseline gap-3">
      <span
        v-if="index"
        class="font-mono text-sm font-medium"
        :class="accentText"
        aria-hidden="true"
      >
        {{ index }}
      </span>
      <component :is="as" class="flex items-center gap-2 text-2xl font-bold text-highlighted">
        <UIcon
          v-if="icon"
          :name="icon"
          class="size-7 shrink-0"
          :class="accentText"
          aria-hidden="true"
        />
        {{ title }}
      </component>
    </div>
    <div
      class="mt-2 h-[3px] w-10 rounded-full bg-gradient-to-r"
      :class="ruleClass"
      aria-hidden="true"
    />
  </div>
</template>
