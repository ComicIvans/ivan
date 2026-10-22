<script setup lang="ts">
import { SECTIONS, SECTION_IDS, type SectionId } from '~/utils/sections'

const { t, locale } = useI18n({ useScope: 'global' })
const localePath = useLocalePath()
const route = useRoute()
const colorMode = useColorMode()
const isClientReady = ref(false)

const { jokeModalOpen, currentJoke, showRandomJoke, resetJokes } = useJokes()

const mobileMenuOpen = ref(false)

const tabs = computed(() =>
  SECTIONS.map((section) => ({ id: section.id, icon: section.icon, label: t(section.navKey) }))
)

const normalizePath = (path: string) =>
  path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path

const homePath = computed(() => normalizePath(localePath('/')))
const isHome = computed(() => normalizePath(route.path) === homePath.value)
const isGalleryRoute = computed(() =>
  normalizePath(route.path).startsWith(normalizePath(localePath('/galeria')))
)

const { activeId } = useScrollSpy(SECTION_IDS)

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

const { arrive } = useSectionNav()

// The router scrolls to the hash. Off the home the links simply navigate
// there; on it they also send the badge and the focus to the section.
function onTabClick(id: SectionId) {
  mobileMenuOpen.value = false
  if (isHome.value) arrive(id)
}

const anchorLink = (id: string) => ({ path: localePath('/'), hash: `#${id}` })

// The desktop pills show their labels from xl up; below that they are icons
// with a tooltip.
const showPillLabels = useMediaQuery('(min-width: 1280px)')

const menuToggle = useTemplateRef<HTMLButtonElement>('menuToggle')

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !mobileMenuOpen.value) return
  mobileMenuOpen.value = false
  menuToggle.value?.focus()
}

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
  document.addEventListener('keydown', onKeydown)
  void syncIndicators()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', onKeydown)
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
          ref="menuToggle"
          type="button"
          class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-transparent text-muted hover:text-highlighted focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none lg:hidden"
          :aria-label="t('nav.menu')"
          :aria-expanded="mobileMenuOpen"
          :aria-controls="mobileMenuOpen ? 'navbar-menu' : undefined"
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
          class="hidden shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none lg:inline-flex"
          :aria-label="t('header.jokeButton')"
          @click="showRandomJoke"
        >
          <NuxtImg
            class="size-9 rounded-full object-cover shadow"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            loading="lazy"
            width="192"
            height="192"
            sizes="36px"
            format="webp"
            quality="76"
          />
        </button>

        <!-- On the home a plain link to it would be a no-op: scroll back up -->
        <NuxtLink
          :to="isHome ? anchorLink(SECTIONS[0].id) : { path: localePath('/') }"
          class="type-display min-w-0 flex-1 truncate text-base text-highlighted transition-colors hover:text-primary-700 lg:flex-none lg:text-lg dark:hover:text-primary-400"
          @click="onTabClick(SECTIONS[0].id)"
        >
          {{ t('header.title') }}
        </NuxtLink>

        <!-- Desktop: anchor pills with sliding indicator -->
        <div ref="desktopNavRef" class="relative mx-auto hidden min-w-0 rounded-full p-1 lg:block">
          <div
            v-if="desktopIndicatorStyle"
            aria-hidden="true"
            class="pointer-events-none absolute top-0 left-0 z-0 rounded-full bg-primary-600 shadow-sm transition-[transform,width,height] duration-300 ease-(--ease-spring) motion-reduce:transition-none"
            :style="desktopIndicatorStyle"
          />
          <ul class="flex items-center gap-0.5">
            <li
              v-for="tab in tabs"
              :key="tab.id"
              :ref="(element: Element | null) => setDesktopTabRef(tab.id, element)"
              class="relative z-10"
            >
              <!-- Icon-only below xl: the label stays in the accessible name
                   and shows as a tooltip. -->
              <UTooltip :text="tab.label" :disabled="showPillLabels">
                <NuxtLink
                  :to="anchorLink(tab.id)"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                  :class="getTabClass(tab.id, desktopIndicatorStyle)"
                  :aria-current="activeTabId === tab.id ? 'true' : undefined"
                  @click="onTabClick(tab.id)"
                >
                  <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
                  <span class="sr-only xl:not-sr-only">{{ tab.label }}</span>
                </NuxtLink>
              </UTooltip>
            </li>
          </ul>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full border border-transparent text-muted hover:text-highlighted focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none"
            :aria-label="t('theme.toggle')"
            :aria-pressed="isClientReady ? isDark : undefined"
            @click="toggleTheme"
          >
            <UIcon :name="themeToggleIcon" class="size-5" aria-hidden="true" />
          </button>

          <HeaderLocaleSwitcher menu-id="navbar-locale-menu" />
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
                class="pointer-events-none absolute top-0 left-0 z-0 rounded-xl bg-primary-600 shadow-sm transition-[transform,width,height] duration-300 ease-(--ease-spring) motion-reduce:transition-none"
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
                    :to="anchorLink(tab.id)"
                    class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
                    :class="getTabClass(tab.id, mobileIndicatorStyle)"
                    :aria-current="activeTabId === tab.id ? 'true' : undefined"
                    @click="onTabClick(tab.id)"
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
