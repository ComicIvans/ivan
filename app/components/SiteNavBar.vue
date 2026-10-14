<script setup lang="ts">
const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const route = useRoute()
const colorMode = useColorMode()
const isClientReady = ref(false)

const { jokeModalOpen, currentJoke, showRandomJoke, resetJokes } = useJokes()

const mobileMenuOpen = ref(false)

interface NavTab {
  id: string
  icon: string
  label: string
}

const tabs = computed<NavTab[]>(() => [
  { id: 'inicio', icon: 'i-tabler-home', label: t('nav.home') },
  { id: 'experiencia', icon: 'i-tabler-briefcase', label: t('nav.experience') },
  { id: 'representacion', icon: 'i-tabler-building-bank', label: t('nav.representation') },
  { id: 'proyectos', icon: 'i-tabler-code', label: t('nav.projects') },
  { id: 'formacion', icon: 'i-tabler-school', label: t('nav.training') },
  { id: 'galeria', icon: 'i-tabler-photo', label: t('nav.gallery') },
  { id: 'contacto', icon: 'i-tabler-mail', label: t('nav.contact') },
])

const sectionIds = computed(() => tabs.value.map((tab) => tab.id))

const normalizePath = (path: string) =>
  path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path

const homePath = computed(() => normalizePath(localePath('/')))
const isHome = computed(() => normalizePath(route.path) === homePath.value)
const isGalleryRoute = computed(() =>
  normalizePath(route.path).startsWith(normalizePath(localePath('/galeria')))
)

const { activeId } = useScrollSpy(sectionIds.value)

// Which pill is highlighted: sections via scroll spy on the home, the gallery
// tab anywhere under the gallery routes, nothing on /legal.
const activeTabId = computed<string | null>(() => {
  if (isGalleryRoute.value) return 'galeria'
  if (isHome.value) return activeId.value
  return null
})

const mobileIndicatorActiveId = computed(() => (mobileMenuOpen.value ? activeTabId.value : null))

const {
  containerRef: desktopNavRef,
  setTabRef: setDesktopTabRef,
  indicatorStyle: desktopIndicatorStyle,
  update: updateDesktopIndicator,
} = useActiveTabIndicator(activeTabId)

const {
  containerRef: mobileNavRef,
  setTabRef: setMobileTabRef,
  indicatorStyle: mobileIndicatorStyle,
  update: updateMobileIndicator,
} = useActiveTabIndicator(mobileIndicatorActiveId)

const getTabClass = (id: string, style: object | null) => {
  if (activeTabId.value !== id) {
    return 'text-toned hover:bg-elevated hover:text-highlighted'
  }

  return style ? 'text-white' : 'text-primary-700 dark:text-primary-400'
}

const syncIndicators = async () => {
  await updateDesktopIndicator()
  await updateMobileIndicator()
}

const journey = useCredentialJourney()

function activateSection(id: string) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (!el) return
  // Send the credential badge straight to the target; safe no-op when the
  // traveling layer is not mounted (other tiers/routes).
  journey.jumpTo(id as Parameters<typeof journey.jumpTo>[0])
  window.setTimeout(() => {
    const heading = el.querySelector<HTMLElement>('h1, h2')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, 350)
}

const anchorLink = (id: string) => ({ path: localePath('/'), hash: `#${id}` })

const isDark = computed(() => colorMode.value === 'dark')
const themeToggleIcon = computed(() => {
  if (!isClientReady.value) return 'i-tabler-moon'
  return isDark.value ? 'i-tabler-sun' : 'i-tabler-moon'
})
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

watch(activeTabId, () => void syncIndicators())

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
    void syncIndicators()
  }
)

watch(locale, () => {
  resetJokes()
  void syncIndicators()
})

watch(mobileMenuOpen, () => void syncIndicators())

const handleResize = () => void syncIndicators()

onMounted(() => {
  isClientReady.value = true
  window.addEventListener('resize', handleResize, { passive: true })
  void syncIndicators()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <HeaderJokeModal
      v-if="jokeModalOpen"
      v-model:open="jokeModalOpen"
      :title="t('joke.title')"
      :description="currentJoke || undefined"
      :close-label="t('joke.close')"
    />

    <nav :aria-label="t('nav.mainNav')" class="surface-glass fixed inset-x-0 top-0 z-40 shadow-sm">
      <div
        class="mx-auto flex h-[var(--navbar-h)] w-11/12 max-w-7xl items-center gap-2 px-2 sm:gap-3 sm:px-4"
      >
        <!-- Mobile: menu toggle -->
        <button
          type="button"
          class="text-muted hover:text-highlighted focus-visible:ring-primary-600 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-transparent focus-visible:ring-2 focus-visible:outline-none lg:hidden"
          :aria-label="t('nav.mainNav')"
          :aria-expanded="mobileMenuOpen"
          aria-controls="navbar-menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <UIcon
            :name="mobileMenuOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"
            class="size-5"
            aria-hidden="true"
          />
        </button>

        <!-- Joke portrait (desktop) -->
        <button
          type="button"
          class="focus-visible:ring-primary-600 hidden shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none lg:inline-flex"
          :aria-label="t('header.jokeButton')"
          @click="showRandomJoke"
        >
          <NuxtImg
            class="size-9 rounded-full object-cover shadow"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            width="192"
            height="192"
            sizes="36px"
            format="webp"
            quality="76"
          />
        </button>

        <NuxtLink
          :to="{ path: localePath('/') }"
          class="type-display text-highlighted hover:text-primary-700 dark:hover:text-primary-400 min-w-0 flex-1 truncate text-base transition-colors lg:flex-none lg:text-lg"
        >
          {{ t('header.title') }}
        </NuxtLink>

        <!-- Desktop: anchor pills with sliding indicator -->
        <div ref="desktopNavRef" class="relative mx-auto hidden min-w-0 rounded-full p-1 lg:block">
          <div
            v-if="desktopIndicatorStyle"
            aria-hidden="true"
            class="bg-primary-600 pointer-events-none absolute top-0 left-0 z-0 rounded-full shadow-sm transition-[transform,width,height] duration-300 ease-(--ease-spring) motion-reduce:transition-none"
            :style="desktopIndicatorStyle"
          />
          <ul class="flex items-center gap-0.5">
            <li
              v-for="tab in tabs"
              :key="tab.id"
              :ref="(element: Element | null) => setDesktopTabRef(tab.id, element)"
              class="relative z-10"
            >
              <NuxtLink
                v-if="isHome"
                :to="anchorLink(tab.id)"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                :class="getTabClass(tab.id, desktopIndicatorStyle)"
                :aria-current="activeTabId === tab.id ? 'true' : undefined"
                @click="activateSection(tab.id)"
              >
                <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
                <span class="hidden xl:inline">{{ tab.label }}</span>
              </NuxtLink>
              <NuxtLink
                v-else
                :to="anchorLink(tab.id)"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                :class="getTabClass(tab.id, desktopIndicatorStyle)"
                :aria-current="activeTabId === tab.id ? 'page' : undefined"
              >
                <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
                <span class="hidden xl:inline">{{ tab.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            class="text-muted hover:text-highlighted focus-visible:ring-primary-600 inline-flex size-10 items-center justify-center rounded-full border border-transparent focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('theme.toggle')"
            :aria-pressed="isDark"
            @click="toggleTheme"
          >
            <UIcon :name="themeToggleIcon" class="size-5" aria-hidden="true" />
          </button>

          <HeaderLocaleSwitcher variant="compact" menu-id="navbar-locale-menu" />
        </div>
      </div>

      <!-- Mobile: dropdown anchor menu (same nav landmark as the bar) -->
      <Transition name="navbar-menu" @after-enter="syncIndicators">
        <div
          v-if="mobileMenuOpen"
          class="navbar-menu-reveal max-h-[calc(100dvh-var(--navbar-h))] overflow-y-auto overscroll-contain lg:hidden"
        >
          <div id="navbar-menu" class="mx-auto w-11/12 max-w-7xl px-2 pb-3 sm:px-4">
            <div ref="mobileNavRef" class="relative">
              <div
                v-if="mobileIndicatorStyle"
                aria-hidden="true"
                class="bg-primary-600 pointer-events-none absolute top-0 left-0 z-0 rounded-xl shadow-sm transition-[transform,width,height] duration-300 ease-(--ease-spring) motion-reduce:transition-none"
                :style="mobileIndicatorStyle"
              />
              <ul class="space-y-1">
                <li
                  v-for="(tab, index) in tabs"
                  :key="tab.id"
                  :ref="(element: Element | null) => setMobileTabRef(tab.id, element)"
                  class="navbar-menu-item relative z-10"
                  :style="{ '--stagger-index': index }"
                >
                  <NuxtLink
                    v-if="isHome"
                    :to="anchorLink(tab.id)"
                    class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
                    :class="getTabClass(tab.id, mobileIndicatorStyle)"
                    :aria-current="activeTabId === tab.id ? 'true' : undefined"
                    @click="activateSection(tab.id)"
                  >
                    <UIcon :name="tab.icon" class="size-5" aria-hidden="true" />
                    <span>{{ tab.label }}</span>
                  </NuxtLink>
                  <NuxtLink
                    v-else
                    :to="anchorLink(tab.id)"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                    :class="getTabClass(tab.id, mobileIndicatorStyle)"
                    :aria-current="activeTabId === tab.id ? 'page' : undefined"
                    @click="mobileMenuOpen = false"
                  >
                    <UIcon :name="tab.icon" class="size-5" aria-hidden="true" />
                    <span>{{ tab.label }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </div>
</template>

<style scoped>
/* Animated dropdown: grows from 0 height via grid-template-rows while fading */
.navbar-menu-reveal {
  display: grid;
  grid-template-rows: 1fr;
}

.navbar-menu-reveal > div {
  min-height: 0;
  overflow: hidden;
}

.navbar-menu-enter-active,
.navbar-menu-leave-active {
  transition:
    grid-template-rows 280ms var(--ease-spring),
    opacity 220ms ease;
}

.navbar-menu-enter-from,
.navbar-menu-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.navbar-menu-enter-active .navbar-menu-item {
  animation: fadeSlideUp 260ms var(--motion-emphasized) both;
  animation-delay: calc(var(--stagger-index, 0) * 30ms);
}

@media (prefers-reduced-motion: reduce) {
  .navbar-menu-enter-active,
  .navbar-menu-leave-active {
    transition: none;
  }

  .navbar-menu-enter-active .navbar-menu-item {
    animation: none;
  }
}
</style>
