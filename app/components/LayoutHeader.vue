<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { loadJokes } from '~/utils/locales'

const { t, locale } = useI18n({ useScope: 'global' })
const colorMode = useColorMode()
const localePath = useLocalePath()
const route = useRoute()
const isClientReady = ref(false)

const jokes = ref<string[]>([])
const loadedJokesLocale = ref<string | null>(null)
const jokeModalOpen = ref(false)
const currentJoke = ref('')
const mobileMenuOpen = ref(false)
const HeaderJokeModal = defineAsyncComponent(() => import('~/components/HeaderJokeModal.vue'))

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

const mobileIndicatorActiveBasePath = computed(() =>
  mobileMenuOpen.value ? activeTabBasePath.value : null
)

const {
  containerRef: desktopNavRef,
  setTabRef: setDesktopTabRef,
  indicatorStyle: desktopActiveIndicatorStyle,
  update: updateDesktopIndicator,
} = useActiveTabIndicator(activeTabBasePath)

const {
  containerRef: mobileNavRef,
  setTabRef: setMobileTabRef,
  indicatorStyle: mobileActiveIndicatorStyle,
  update: updateMobileIndicator,
} = useActiveTabIndicator(mobileIndicatorActiveBasePath)

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
  await updateDesktopIndicator()
  await updateMobileIndicator()
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

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

watch(
  () => route.path,
  () => {
    closeMobileMenu()
    void syncActiveIndicators()
  }
)

watch(locale, () => {
  jokes.value = []
  loadedJokesLocale.value = null
  jokeModalOpen.value = false
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
  window.addEventListener('resize', handleWindowResize, { passive: true })
  void syncActiveIndicators()
})

onBeforeUnmount(() => {
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
          loading="eager"
          fetchpriority="high"
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

        <HeaderLocaleSwitcher variant="full" menu-id="desktop-locale-menu" />
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
            width="192"
            height="192"
            sizes="(min-width: 640px) 96px, 80px"
            format="webp"
            quality="76"
          />
        </button>

        <div class="flex items-center justify-end gap-2">
          <HeaderLocaleSwitcher variant="compact" menu-id="mobile-locale-menu" />

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
        <ul class="flex flex-wrap items-center justify-center gap-1">
          <li
            v-for="tab in tabs"
            :key="tab.to"
            :ref="(element: Element | null) => setDesktopTabRef(tab.basePath, element)"
            class="relative z-10"
          >
            <NuxtLink
              :to="tab.to"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
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
