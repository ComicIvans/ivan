<script setup lang="ts">
import { profileName } from '~~/shared/constants/profile'

// Branded OG image template (Satori-rendered, 1200x630). Use only Satori-safe
// CSS: every element with more than one child sets display:flex, layout is
// flexbox-only (no grid), and styles are bound as objects so formatting can't
// inject newlines into CSS values (which breaks Satori's gradient parser).
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  }
)

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  padding: '80px',
  justifyContent: 'space-between',
  backgroundColor: '#0f172a',
  backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(248,113,113,0.22), transparent 55%)',
  color: '#f8fafc',
} as const
</script>

<template>
  <div :style="rootStyle">
    <!-- Brand row -->
    <div style="display: flex; align-items: center">
      <div
        style="
          display: flex;
          width: 56px;
          height: 56px;
          margin-right: 20px;
          border-radius: 9999px;
          background-color: #f87171;
        "
      />
      <div style="display: flex; font-size: 34px; font-weight: 700; color: #f8fafc">
        {{ profileName }}
      </div>
    </div>

    <!-- Title + description -->
    <div style="display: flex; flex-direction: column">
      <div
        style="display: flex; font-size: 72px; font-weight: 800; line-height: 1.1; color: #f87171"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        style="display: flex; margin-top: 28px; font-size: 32px; line-height: 1.4; color: #cbd5e1"
      >
        {{ description }}
      </div>
    </div>

    <!-- Accent bar -->
    <div
      style="
        display: flex;
        width: 160px;
        height: 10px;
        border-radius: 9999px;
        background-color: #f87171;
      "
    />
  </div>
</template>
