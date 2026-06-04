<script setup lang="ts">
import { onClickOutside, useEventListener } from '@vueuse/core'
import {
  getLocaleConfig,
  getLocaleSwitchPath,
  localesConfig,
  type LocaleCode,
} from '~/utils/locales'

defineProps<{
  /** 'full' = labelled pill (desktop), 'compact' = icon-only button (mobile). */
  variant: 'full' | 'compact'
  menuId: string
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const currentLocale = computed(() => getLocaleConfig(locale.value))

const close = () => {
  open.value = false
}

const toggle = () => {
  open.value = !open.value
}

onClickOutside(rootRef, close)
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
})

watch(() => route.path, close)
watch(locale, close)

const selectLocale = (code: string) => {
  close()

  if (code === locale.value) {
    return
  }

  const target = code as LocaleCode
  const localizedPath = switchLocalePath(target)
  const fallbackPath = getLocaleSwitchPath(route.fullPath, target)

  navigateTo(localizedPath && localizedPath !== route.fullPath ? localizedPath : fallbackPath)
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      v-if="variant === 'full'"
      type="button"
      class="border-default bg-default text-highlighted focus-visible:ring-primary-500 flex min-w-36 cursor-pointer list-none items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
      :aria-label="t('language.toggle')"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="toggle"
    >
      <span class="flex items-center gap-2">
        <UIcon :name="currentLocale.icon" class="size-4" aria-hidden="true" />
        <span>{{ currentLocale.name }}</span>
      </span>
      <UIcon
        name="i-tabler-chevron-down"
        class="size-4 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </button>

    <button
      v-else
      type="button"
      class="focus-visible:ring-primary-500 inline-flex size-10 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
      :aria-label="t('language.toggle')"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="toggle"
    >
      <UIcon :name="currentLocale.icon" class="size-5" aria-hidden="true" />
    </button>

    <Transition
      enter-active-class="transition duration-180 ease-out"
      enter-from-class="translate-y-2 scale-95 opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-140 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      leave-to-class="translate-y-2 scale-95 opacity-0"
    >
      <div
        v-if="open"
        :id="menuId"
        class="border-default bg-default absolute top-full right-0 z-20 mt-2 min-w-40 origin-top-right rounded-2xl border p-2 shadow-lg"
      >
        <ul class="space-y-1">
          <li v-for="lang in localesConfig" :key="lang.code">
            <button
              type="button"
              class="text-highlighted hover:bg-elevated focus-visible:ring-primary-500 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
              :class="{ 'bg-elevated': lang.code === locale }"
              @click="selectLocale(lang.code)"
            >
              <UIcon :name="lang.icon" class="size-4" aria-hidden="true" />
              <span>{{ lang.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
