<script setup lang="ts">
withDefaults(
  defineProps<{
    items: { label: string; icon?: string }[]
    /** Seconds per full loop; slow by design so it reads as texture. */
    duration?: number
    ariaLabel?: string
  }>(),
  {
    duration: 45,
    ariaLabel: undefined,
  }
)
</script>

<template>
  <div
    class="marquee group relative overflow-hidden"
    :style="{ '--marquee-duration': `${duration}s` }"
  >
    <!-- No gap between the two runs: each carries its trailing space (pr-8),
         so the track is exactly two equal halves and the -50% loop is seamless -->
    <div class="marquee-track flex w-max items-center">
      <!-- The label names the list: a generic div cannot carry one -->
      <ul class="flex items-center gap-8 pr-8" :aria-label="ariaLabel">
        <li v-for="item in items" :key="item.label" class="text-muted flex items-center gap-2">
          <UIcon v-if="item.icon" :name="item.icon" class="size-5 shrink-0" aria-hidden="true" />
          <span class="text-sm font-medium whitespace-nowrap">{{ item.label }}</span>
        </li>
      </ul>
      <!-- Duplicate run makes the loop seamless; hidden from assistive tech -->
      <ul class="flex items-center gap-8 pr-8" aria-hidden="true">
        <li v-for="item in items" :key="item.label" class="text-muted flex items-center gap-2">
          <UIcon v-if="item.icon" :name="item.icon" class="size-5 shrink-0" aria-hidden="true" />
          <span class="text-sm font-medium whitespace-nowrap">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

@media (prefers-reduced-motion: no-preference) {
  .marquee-track {
    animation: marquee-scroll var(--marquee-duration, 45s) linear infinite;
  }

  .marquee:hover .marquee-track,
  .marquee:focus-within .marquee-track {
    animation-play-state: paused;
  }
}

/* Reduced motion: a static, wrapped, fully visible list — never clipped */
@media (prefers-reduced-motion: reduce) {
  .marquee {
    mask-image: none;
  }

  .marquee-track {
    width: 100%;
    animation: none;
  }

  .marquee-track > ul:first-child {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .marquee-track > ul[aria-hidden='true'] {
    display: none;
  }
}

@keyframes marquee-scroll {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
