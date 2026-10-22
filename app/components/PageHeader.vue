<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    intro?: string
    accent?: 'ember' | 'amber' | 'blue'
    align?: 'left' | 'center'
  }>(),
  {
    intro: undefined,
    accent: 'ember',
    align: 'left',
  }
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
  <header class="mb-10" :class="align === 'center' ? 'text-center' : 'text-left'">
    <h1
      class="type-display text-4xl text-highlighted sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]"
    >
      {{ title }}
    </h1>
    <div
      class="mt-4 h-[3px] w-10 rounded-full bg-gradient-to-r"
      :class="[ruleClass, align === 'center' ? 'mx-auto' : '']"
      aria-hidden="true"
    />
    <p
      v-if="intro"
      class="mt-4 max-w-2xl text-lg text-muted"
      :class="align === 'center' ? 'mx-auto' : ''"
    >
      {{ intro }}
    </p>
    <slot />
  </header>
</template>
