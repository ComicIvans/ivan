<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <LayoutShell :masthead="route.meta.masthead !== false">
    <slot />
  </LayoutShell>
</template>
