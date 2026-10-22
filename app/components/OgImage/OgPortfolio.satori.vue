<script setup lang="ts">
import { profileName } from '~~/shared/constants/profile'
import { themeColors } from '~~/shared/constants/theme'

// Branded OG image template (Satori-rendered, 1200x630). Use only Satori-safe
// CSS: every element with more than one child sets display:flex, layout is
// flexbox-only (no grid), and styles are bound as objects so formatting can't
// inject newlines into CSS values (which breaks Satori's gradient parser).
// Satori defaults to content-box, so the padded full-size root opts into
// border-box to stay inside the 1200x630 canvas.
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  }
)

// Satori cannot read the site's CSS tokens, so the accent comes from the
// shared brand hex values (the ember ramp); the slate neutrals match the
// site's dark background and text.
const accent = themeColors.emberLight
const background = '#0f172a'
const text = '#f8fafc'
const mutedText = '#cbd5e1'

/** `#rrggbb` → `rgba(r,g,b,alpha)` (Satori has no color-mix). */
function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
  return `rgba(${r},${g},${b},${alpha})`
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: '80px',
  justifyContent: 'space-between',
  backgroundColor: background,
  backgroundImage: `radial-gradient(ellipse at 100% 0%, ${withAlpha(accent, 0.22)}, transparent 55%)`,
  color: text,
} as const

const markStyle = {
  display: 'flex',
  width: '56px',
  height: '56px',
  marginRight: '20px',
  borderRadius: '9999px',
  backgroundColor: accent,
} as const

const nameStyle = { display: 'flex', fontSize: '34px', fontWeight: 700, color: text } as const

// Page titles ("Galería") take the full 72px. The home title carries the name
// and the fields, so it steps down to keep the description inside the card.
const titleStyle = computed(() => ({
  display: 'flex',
  fontSize: props.title.length > 40 ? '56px' : '72px',
  fontWeight: 800,
  lineHeight: 1.1,
  color: accent,
}))

const descriptionStyle = {
  display: 'flex',
  marginTop: '28px',
  fontSize: '32px',
  lineHeight: 1.4,
  color: mutedText,
} as const

const barStyle = {
  display: 'flex',
  width: '160px',
  height: '10px',
  borderRadius: '9999px',
  backgroundColor: accent,
} as const
</script>

<template>
  <div :style="rootStyle">
    <!-- Brand row -->
    <div style="display: flex; align-items: center">
      <div :style="markStyle" />
      <div :style="nameStyle">
        {{ profileName }}
      </div>
    </div>

    <!-- Title + description -->
    <div style="display: flex; flex-direction: column">
      <div :style="titleStyle">
        {{ title }}
      </div>
      <div v-if="description" :style="descriptionStyle">
        {{ description }}
      </div>
    </div>

    <!-- Accent bar -->
    <div :style="barStyle" />
  </div>
</template>
