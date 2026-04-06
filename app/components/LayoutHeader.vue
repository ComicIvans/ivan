<script setup lang="ts">
import { defineAsyncComponent, nextTick, type CSSProperties } from 'vue'
import {
  getLocaleConfig,
  getLocaleSwitchPath,
  localesConfig,
  loadJokes,
  type LocaleCode,
} from '~/utils/locales'

const { t, locale } = useI18n({ useScope: 'global' })
const colorMode = useColorMode()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const isClientReady = ref(false)

const jokes = ref<string[]>([])
const loadedJokesLocale = ref<string | null>(null)
const jokeModalOpen = ref(false)
const currentJoke = ref('')
const mobileMenuOpen = ref(false)
const desktopLocaleMenuOpen = ref(false)
const mobileLocaleMenuOpen = ref(false)
const desktopLocaleMenuRef = ref<HTMLElement | null>(null)
const mobileLocaleMenuRef = ref<HTMLElement | null>(null)
const desktopNavRef = ref<HTMLElement | null>(null)
const mobileNavRef = ref<HTMLElement | null>(null)
const HeaderJokeModal = defineAsyncComponent(() => import('~/components/HeaderJokeModal.vue'))
const desktopTabRefs = new Map<string, HTMLElement>()
const mobileTabRefs = new Map<string, HTMLElement>()
const desktopActiveIndicatorStyle = ref<Partial<CSSProperties> | null>(null)
const mobileActiveIndicatorStyle = ref<Partial<CSSProperties> | null>(null)

const tabs = computed(() => [
  { label: t('nav.home'), icon: 'i-tabler-home', to: localePath('/'), basePath: '/' },
  {
    label: t('nav.experience'),
    icon: 'i-tabler-briefcase',
    to: localePath('/experiencia'),
    basePath: '/experiencia',
  },
  {
    label: t('nav.projects'),
    icon: 'i-tabler-code',
    to: localePath('/proyectos'),
    basePath: '/proyectos',
  },
  {
    label: t('nav.gallery'),
    icon: 'i-tabler-photo',
    to: localePath('/galeria'),
    basePath: '/galeria',
  },
  {
    label: t('nav.training'),
    icon: 'i-tabler-school',
    to: localePath('/formacion'),
    basePath: '/formacion',
  },
  {
    label: t('nav.representation'),
    icon: 'i-tabler-building-bank',
    to: localePath('/representacion'),
    basePath: '/representacion',
  },
  {
    label: t('nav.contact'),
    icon: 'i-tabler-mail',
    to: localePath('/contacto'),
    basePath: '/contacto',
  },
])

const isDark = computed(() => colorMode.value === 'dark')
const currentLocale = computed(() => getLocaleConfig(locale.value))
const themeToggleIcon = computed(() => {
  if (!isClientReady.value) {
    return 'i-tabler-moon'
  }

  return isDark.value ? 'i-tabler-sun' : 'i-tabler-moon'
})

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const homePath = computed(() => localePath('/'))

const normalizeRoutePath = (path: string) => {
  if (path !== '/' && path.endsWith('/')) {
    return path.slice(0, -1)
  }

  return path
}

const switchLocale = (code: string) => {
  if (code !== locale.value) {
    const targetLocale = code as LocaleCode
    const localizedPath = switchLocalePath(targetLocale)
    const fallbackPath = getLocaleSwitchPath(route.fullPath, targetLocale)

    navigateTo(localizedPath && localizedPath !== route.fullPath ? localizedPath : fallbackPath)
  }
}

const selectedLocale = computed({
  get: () => locale.value,
  set: (code: string) => {
    switchLocale(code)
  },
})

const isActiveRoute = (basePath: string) => {
  const localizedBasePath = normalizeRoutePath(localePath(basePath))
  const currentPath = normalizeRoutePath(route.path)

  if (basePath === '/') {
    return currentPath === localizedBasePath
  }

  return currentPath === localizedBasePath || currentPath.startsWith(`${localizedBasePath}/`)
}

const activeTabBasePath = computed(() => {
  return tabs.value.find((tab) => isActiveRoute(tab.basePath))?.basePath ?? null
})

const setDesktopTabRef = (basePath: string, element: Element | null) => {
  if (element instanceof HTMLElement) {
    desktopTabRefs.set(basePath, element)
    return
  }

  desktopTabRefs.delete(basePath)
}

const setMobileTabRef = (basePath: string, element: Element | null) => {
  if (element instanceof HTMLElement) {
    mobileTabRefs.set(basePath, element)
    return
  }

  mobileTabRefs.delete(basePath)
}

const createIndicatorStyle = (
  container: HTMLElement | null,
  activeItem: HTMLElement | null
): Partial<CSSProperties> | null => {
  if (!container || !activeItem) {
    return null
  }

  const containerRect = container.getBoundingClientRect()
  const activeItemRect = activeItem.getBoundingClientRect()

  return {
    width: `${activeItemRect.width}px`,
    height: `${activeItemRect.height}px`,
    transform: `translate3d(${activeItemRect.left - containerRect.left}px, ${activeItemRect.top - containerRect.top}px, 0)`,
  }
}

const updateDesktopActiveIndicator = () => {
  const activeBasePath = activeTabBasePath.value

  desktopActiveIndicatorStyle.value = activeBasePath
    ? createIndicatorStyle(desktopNavRef.value, desktopTabRefs.get(activeBasePath) ?? null)
    : null
}

const updateMobileActiveIndicator = () => {
  if (!mobileMenuOpen.value) {
    mobileActiveIndicatorStyle.value = null
    return
  }

  const activeBasePath = activeTabBasePath.value

  mobileActiveIndicatorStyle.value = activeBasePath
    ? createIndicatorStyle(mobileNavRef.value, mobileTabRefs.get(activeBasePath) ?? null)
    : null
}

const getDesktopTabClass = (basePath: string) => {
  if (!isActiveRoute(basePath)) {
    return 'text-toned hover:bg-elevated hover:text-highlighted'
  }

  return desktopActiveIndicatorStyle.value ? 'text-white' : 'text-primary-700 dark:text-primary-400'
}

const getMobileTabClass = (basePath: string) => {
  if (!isActiveRoute(basePath)) {
    return 'text-highlighted hover:bg-elevated'
  }

  return mobileActiveIndicatorStyle.value ? 'text-white' : 'text-primary-700 dark:text-primary-400'
}

const syncActiveIndicators = async () => {
  await nextTick()
  updateDesktopActiveIndicator()
  updateMobileActiveIndicator()
}

async function loadJokesForLocale(localeCode = locale.value) {
  if (loadedJokesLocale.value === localeCode && jokes.value.length > 0) {
    return
  }

  jokes.value = await loadJokes(localeCode)
  loadedJokesLocale.value = localeCode
}

const showRandomJoke = async () => {
  if (loadedJokesLocale.value !== locale.value || jokes.value.length === 0) {
    await loadJokesForLocale()
  }

  const jokeList = jokes.value
  currentJoke.value = jokeList[Math.floor(Math.random() * jokeList.length)] || t('joke.error')
  jokeModalOpen.value = true
}

const closeMobileOverlays = () => {
  mobileMenuOpen.value = false
  mobileLocaleMenuOpen.value = false
}

const closeLocaleMenus = () => {
  desktopLocaleMenuOpen.value = false
  mobileLocaleMenuOpen.value = false
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleDesktopLocaleMenu = () => {
  desktopLocaleMenuOpen.value = !desktopLocaleMenuOpen.value
}

const toggleMobileMenu = () => {
  const nextState = !mobileMenuOpen.value
  mobileMenuOpen.value = nextState

  if (nextState) {
    mobileLocaleMenuOpen.value = false
  }
}

const toggleMobileLocaleMenu = () => {
  const nextState = !mobileLocaleMenuOpen.value
  mobileLocaleMenuOpen.value = nextState

  if (nextState) {
    mobileMenuOpen.value = false
    desktopLocaleMenuOpen.value = false
  }
}

const selectDesktopLocale = (code: string) => {
  desktopLocaleMenuOpen.value = false
  switchLocale(code)
}

const selectMobileLocale = (code: string) => {
  mobileLocaleMenuOpen.value = false
  switchLocale(code)
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null

  if (
    desktopLocaleMenuOpen.value &&
    desktopLocaleMenuRef.value &&
    target &&
    !desktopLocaleMenuRef.value.contains(target)
  ) {
    desktopLocaleMenuOpen.value = false
  }

  if (
    mobileLocaleMenuOpen.value &&
    mobileLocaleMenuRef.value &&
    target &&
    !mobileLocaleMenuRef.value.contains(target)
  ) {
    mobileLocaleMenuOpen.value = false
  }
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeLocaleMenus()
  }
}

watch(
  () => route.path,
  () => {
    closeMobileOverlays()
    closeLocaleMenus()
    void syncActiveIndicators()
  }
)

watch(locale, () => {
  jokes.value = []
  loadedJokesLocale.value = null
  jokeModalOpen.value = false
  closeLocaleMenus()
  void syncActiveIndicators()
})

watch(
  () => mobileMenuOpen.value,
  () => {
    void syncActiveIndicators()
  }
)

const handleWindowResize = () => {
  void syncActiveIndicators()
}

onMounted(() => {
  isClientReady.value = true
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  window.addEventListener('resize', handleWindowResize, { passive: true })
  void syncActiveIndicators()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <HeaderJokeModal
    v-if="jokeModalOpen"
    v-model:open="jokeModalOpen"
    :title="t('joke.title')"
    :description="currentJoke || undefined"
    :close-label="t('joke.close')"
  />

  <header class="mb-6">
    <div class="hidden items-center justify-between gap-4 lg:flex">
      <button
        type="button"
        class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <NuxtImg
          class="header-portrait header-portrait-float size-24 rounded-full object-cover shadow-lg"
          src="/profile-pic.webp"
          :alt="t('header.profileAlt')"
          loading="lazy"
          fetchpriority="low"
          width="192"
          height="192"
          sizes="96px"
          format="webp"
          quality="76"
        />
      </button>

      <div class="flex-1">
        <NuxtLink
          :to="homePath"
          class="text-highlighted hover:text-primary-700 dark:hover:text-primary-400 text-3xl font-bold transition-colors"
        >
          {{ t('header.title') }}
        </NuxtLink>
        <p class="text-muted text-base">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-muted hover:text-highlighted focus-visible:ring-primary-500 inline-flex size-11 items-center justify-center rounded-full border border-transparent focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('theme.toggle')"
          @click="toggleTheme"
        >
          <UIcon :name="themeToggleIcon" class="size-5" aria-hidden="true" />
        </button>

        <div ref="desktopLocaleMenuRef" class="relative">
          <button
            type="button"
            class="border-default bg-default text-highlighted focus-visible:ring-primary-500 flex min-w-36 cursor-pointer list-none items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('language.toggle')"
            :aria-expanded="desktopLocaleMenuOpen"
            aria-controls="desktop-locale-menu"
            @click="toggleDesktopLocaleMenu"
          >
            <span class="flex items-center gap-2">
              <UIcon :name="currentLocale.icon" class="size-4" aria-hidden="true" />
              <span>{{ currentLocale.name }}</span>
            </span>
            <UIcon
              name="i-tabler-chevron-down"
              class="size-4 transition-transform duration-200"
              :class="{ 'rotate-180': desktopLocaleMenuOpen }"
              aria-hidden="true"
            />
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
              v-if="desktopLocaleMenuOpen"
              id="desktop-locale-menu"
              class="border-default bg-default absolute top-full right-0 z-20 mt-2 min-w-40 origin-top-right rounded-2xl border p-2 shadow-lg"
            >
              <ul class="space-y-1">
                <li v-for="lang in localesConfig" :key="lang.code">
                  <button
                    type="button"
                    class="text-highlighted hover:bg-elevated focus-visible:ring-primary-500 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
                    :class="{ 'bg-elevated': lang.code === selectedLocale }"
                    @click="selectDesktopLocale(lang.code)"
                  >
                    <UIcon :name="lang.icon" class="size-4" aria-hidden="true" />
                    <span>{{ lang.name }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="lg:hidden">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div class="flex justify-start">
          <button
            type="button"
            class="text-muted hover:text-highlighted focus-visible:ring-primary-500 inline-flex size-11 items-center justify-center rounded-full border border-transparent focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('nav.mainNav')"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            @click="toggleMobileMenu"
          >
            <UIcon
              :name="mobileMenuOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"
              class="size-6"
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          type="button"
          class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('header.jokeButton')"
          @click="showRandomJoke"
        >
          <NuxtImg
            class="header-portrait size-20 rounded-full object-cover shadow-lg sm:size-24"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            loading="eager"
            fetchpriority="high"
            preload
            width="192"
            height="192"
            sizes="(min-width: 640px) 96px, 80px"
            format="webp"
            quality="76"
          />
        </button>

        <div class="flex items-center justify-end gap-2">
          <div ref="mobileLocaleMenuRef" class="relative">
            <button
              type="button"
              class="focus-visible:ring-primary-500 inline-flex size-10 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
              :aria-label="t('language.toggle')"
              :aria-expanded="mobileLocaleMenuOpen"
              aria-controls="mobile-locale-menu"
              @click="toggleMobileLocaleMenu"
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
                v-if="mobileLocaleMenuOpen"
                id="mobile-locale-menu"
                class="border-default bg-default absolute top-full right-0 z-20 mt-2 min-w-40 origin-top-right rounded-2xl border p-2 shadow-lg"
              >
                <ul class="space-y-1">
                  <li v-for="lang in localesConfig" :key="lang.code">
                    <button
                      type="button"
                      class="text-highlighted hover:bg-elevated focus-visible:ring-primary-500 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
                      :class="{ 'bg-elevated': lang.code === selectedLocale }"
                      @click="selectMobileLocale(lang.code)"
                    >
                      <UIcon :name="lang.icon" class="size-4" aria-hidden="true" />
                      <span>{{ lang.name }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </Transition>
          </div>

          <button
            type="button"
            class="text-muted hover:text-highlighted focus-visible:ring-primary-500 inline-flex size-10 items-center justify-center rounded-full border border-transparent focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('theme.toggle')"
            @click="toggleTheme"
          >
            <UIcon :name="themeToggleIcon" class="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="mt-4 space-y-2 text-center">
        <NuxtLink
          :to="homePath"
          class="text-highlighted hover:text-primary-700 dark:hover:text-primary-400 text-xl font-bold transition-colors"
        >
          {{ t('header.title') }}
        </NuxtLink>
        <p class="text-muted text-sm">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <nav
        v-if="mobileMenuOpen"
        id="mobile-menu"
        class="border-default bg-default/95 mt-4 rounded-2xl border p-3 shadow-sm backdrop-blur-sm"
        :aria-label="t('nav.mainNav')"
      >
        <div ref="mobileNavRef" class="relative">
          <div
            v-if="mobileActiveIndicatorStyle"
            aria-hidden="true"
            class="bg-primary-500 pointer-events-none absolute top-0 left-0 z-0 rounded-xl shadow-sm transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            :style="mobileActiveIndicatorStyle"
          />
          <ul class="space-y-1">
            <li
              v-for="tab in tabs"
              :key="tab.to"
              :ref="(element: Element | null) => setMobileTabRef(tab.basePath, element)"
              class="relative z-10"
            >
              <NuxtLink
                :to="tab.to"
                class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                :class="getMobileTabClass(tab.basePath)"
                :aria-current="isActiveRoute(tab.basePath) ? 'page' : undefined"
                @click="closeMobileMenu"
              >
                <UIcon :name="tab.icon" class="size-5" aria-hidden="true" />
                <span>{{ tab.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <nav class="mt-4 hidden lg:block" :aria-label="t('nav.mainNav')">
      <div
        ref="desktopNavRef"
        class="border-default bg-default/80 relative mx-auto w-fit rounded-full border p-1.5 shadow-sm backdrop-blur-sm"
      >
        <div
          v-if="desktopActiveIndicatorStyle"
          aria-hidden="true"
          class="bg-primary-500 pointer-events-none absolute top-0 left-0 z-0 rounded-full shadow-sm transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :style="desktopActiveIndicatorStyle"
        />
        <ul class="flex flex-wrap items-center justify-center gap-2">
          <li
            v-for="tab in tabs"
            :key="tab.to"
            :ref="(element: Element | null) => setDesktopTabRef(tab.basePath, element)"
            class="relative z-10"
          >
            <NuxtLink
              :to="tab.to"
              class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              :class="getDesktopTabClass(tab.basePath)"
              :aria-current="isActiveRoute(tab.basePath) ? 'page' : undefined"
            >
              <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
              <span>{{ tab.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <div class="border-default my-4 border-t" aria-hidden="true" />
</template>

<style scoped>
.header-portrait {
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.header-portrait:hover {
  transform: translate3d(0, -0.25rem, 0) scale(1.01);
}

@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  .header-portrait-float {
    animation: headerFloatPortrait 6s ease-in-out infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-portrait,
  .header-portrait:hover {
    transform: none !important;
    transition: none !important;
  }

  .header-portrait-float {
    animation: none !important;
  }
}

@keyframes headerFloatPortrait {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -0.35rem, 0);
  }
}
</style>
