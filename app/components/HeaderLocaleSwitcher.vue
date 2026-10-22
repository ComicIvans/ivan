<script setup lang="ts">
import { onClickOutside, useEventListener } from '@vueuse/core'
import {
  getLocaleConfig,
  getLocaleSwitchPath,
  localesConfig,
  type LocaleCode,
} from '~/utils/locales'
import { SECTIONS } from '~/utils/sections'
import { localeCookieName, localeCookieOptions } from '~~/shared/constants/storage'

defineProps<{
  menuId: string
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
// The only place that stores the language: @nuxtjs/i18n runs with useCookie
// off (see nuxt.config), so page views and the browser-language redirect on /
// write nothing. The legal page describes exactly this.
const localeCookie = useCookie<string | null>(localeCookieName, localeCookieOptions)

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
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
    const wasOpen = open.value
    close()
    if (wasOpen) triggerRef.value?.focus()
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
  localeCookie.value = target
  const localizedPath = switchLocalePath(target)
  const fallbackPath = getLocaleSwitchPath(route.fullPath, target)

  navigateTo(
    withActiveSection(
      localizedPath && localizedPath !== route.fullPath ? localizedPath : fallbackPath
    )
  )
}

// On the home the URL hash only changes on anchor clicks, never while
// scrolling, so the switch carries the section being read instead of a stale
// hash (the first section maps to the top of the page).
const activeSectionId = useActiveSectionId()

function withActiveSection(path: string) {
  const id = activeSectionId.value
  // Only while that section is on the page, i.e. on the home.
  if (!id || !document.getElementById(id)) return path
  const [base = path] = path.split('#')
  return id === SECTIONS[0].id ? base : `${base}#${id}`
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="inline-flex size-10 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
      :aria-label="t('language.toggle')"
      :aria-expanded="open"
      :aria-controls="open ? menuId : undefined"
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
        class="absolute top-full right-0 z-20 mt-2 min-w-40 origin-top-right rounded-2xl border border-default bg-default p-2 shadow-lg"
      >
        <ul class="space-y-1">
          <li v-for="lang in localesConfig" :key="lang.code">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-highlighted hover:bg-elevated focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              :class="{ 'bg-elevated': lang.code === locale }"
              :aria-current="lang.code === locale ? 'true' : undefined"
              @click="selectLocale(lang.code)"
            >
              <UIcon :name="lang.icon" class="size-4" aria-hidden="true" />
              <span :lang="lang.code">{{ lang.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
