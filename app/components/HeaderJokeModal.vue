<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

defineProps<{
  title: string
  description?: string
  closeLabel: string
}>()

function close() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description" :aria-label="title">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 id="joke-modal-title" class="text-lg font-semibold">{{ title }}</h3>
            <UButton
              icon="i-tabler-x"
              color="neutral"
              variant="ghost"
              :aria-label="closeLabel"
              @click="close"
            />
          </div>
        </template>

        <p class="text-base text-muted">{{ description }}</p>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" @click="close">
              {{ closeLabel }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
