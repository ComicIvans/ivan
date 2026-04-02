<script setup lang="ts">
import { localesConfig, getLocaleConfig, loadJokes, type LocaleCode } from '~/utils/locales'

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

const currentLocale = computed(() => getLocaleConfig(locale.value))
const homePath = computed(() => localePath('/'))

const localeItems = computed(() =>
  localesConfig.map((lang) => ({
    label: lang.name,
    value: lang.code,
    icon: lang.icon.replace(':', '-').replace('tabler', 'i-tabler'),
  }))
)

const localeMenuItems = computed(() =>
  localeItems.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    onSelect: () => {
      selectedLocale.value = item.value
    },
  }))
)

const selectedLocale = computed({
  get: () => locale.value,
  set: (code: string) => {
    if (code !== locale.value) {
      navigateTo(localePath(route.path, code as LocaleCode))
    }
  },
})

const isActiveRoute = (basePath: string) => {
  const localizedBasePath = localePath(basePath)

  if (basePath === '/') {
    return route.path === localizedBasePath
  }

  return route.path.startsWith(localizedBasePath)
}

const navigationItems = computed(() =>
  tabs.value.map((tab) => ({
    ...tab,
    active: isActiveRoute(tab.basePath),
  }))
)

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

watch(
  () => route.path,
  () => {
    closeMobileMenu()
  }
)

watch(locale, () => {
  jokes.value = []
  loadedJokesLocale.value = null
})

onMounted(() => {
  isClientReady.value = true
})
</script>

<template>
  <!-- Joke modal -->
  <UModal
    v-model:open="jokeModalOpen"
    :title="t('joke.title')"
    :description="currentJoke || undefined"
    :aria-label="t('joke.title')"
  >
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 id="joke-modal-title" class="text-lg font-semibold">{{ t('joke.title') }}</h3>
            <UButton
              icon="i-tabler-x"
              color="neutral"
              variant="ghost"
              :aria-label="t('joke.close')"
              @click="jokeModalOpen = false"
            />
          </div>
        </template>
        <p class="text-muted text-base">{{ currentJoke }}</p>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" @click="jokeModalOpen = false">
              {{ t('joke.close') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>

  <!-- Header -->
  <header class="mb-6">
    <!-- Desktop Layout -->
    <div class="hidden items-center justify-between gap-4 lg:flex">
      <!-- Profile photo -->
      <button
        class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <NuxtImg
          class="hero-portrait size-24 rounded-full object-cover shadow-lg"
          src="/profile-pic.webp"
          :alt="t('header.profileAlt')"
          width="192"
          height="192"
          sizes="96px"
          format="webp"
          quality="78"
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

      <!-- Controls (theme and locale) -->
      <div class="flex items-center gap-2">
        <UButton
          :icon="themeToggleIcon"
          color="neutral"
          variant="ghost"
          size="lg"
          :aria-label="t('theme.toggle')"
          @click="toggleTheme"
        />

        <UDropdownMenu :items="localeMenuItems" :content="{ align: 'end' }">
          <UButton
            :label="currentLocale.name"
            :icon="currentLocale.icon.replace(':', '-').replace('tabler', 'i-tabler')"
            trailing-icon="i-tabler-chevron-down"
            color="neutral"
            variant="ghost"
            size="lg"
            class="min-w-32 justify-between"
            :aria-label="t('language.toggle')"
          />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="lg:hidden">
      <!-- Top row: hamburger menu, centered photo, controls -->
      <div class="flex items-center justify-between">
        <!-- Left container with fixed width equal to right -->
        <div class="flex w-20 justify-start sm:w-24">
          <!-- Mobile menu button -->
          <UButton
            :icon="mobileMenuOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"
            color="neutral"
            variant="ghost"
            size="lg"
            :aria-label="t('nav.mainNav')"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          />
        </div>

        <!-- Centered profile photo -->
        <button
          class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('header.jokeButton')"
          @click="showRandomJoke"
        >
          <NuxtImg
            class="hero-portrait size-20 rounded-full object-cover shadow-lg sm:size-24"
            src="/profile-pic.webp"
            :alt="t('header.profileAlt')"
            width="192"
            height="192"
            sizes="(min-width: 640px) 96px, 80px"
            format="webp"
            quality="78"
          />
        </button>

        <!-- Controls (theme and locale) with fixed width equal to left -->
        <div class="flex w-20 items-center justify-end gap-1 sm:w-24 sm:gap-2">
          <UButton
            :icon="themeToggleIcon"
            color="neutral"
            variant="ghost"
            size="lg"
            :aria-label="t('theme.toggle')"
            @click="toggleTheme"
          />

          <UDropdownMenu :items="localeMenuItems" :content="{ align: 'end' }">
            <UButton
              :icon="currentLocale.icon.replace(':', '-').replace('tabler', 'i-tabler')"
              color="neutral"
              variant="ghost"
              size="lg"
              :aria-label="t('language.toggle')"
            />
          </UDropdownMenu>
        </div>
      </div>

      <div class="mt-4 text-center">
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
    </div>

    <!-- Desktop navigation (horizontal) -->
    <nav class="mt-4 hidden lg:block" :aria-label="t('nav.mainNav')">
      <UNavigationMenu
        :items="navigationItems"
        highlight
        highlight-color="primary"
        class="justify-center"
      />
    </nav>
  </header>

  <!-- Mobile slideover -->
  <USlideover
    id="mobile-menu"
    v-model:open="mobileMenuOpen"
    side="left"
    :title="t('nav.mainNav')"
    :description="t('header.subtitle')"
    class="lg:hidden"
  >
    <template #content>
      <nav class="flex h-full flex-col p-4" :aria-label="t('nav.mainNav')">
        <!-- Menu header -->
        <div class="border-default mb-4 flex items-center justify-between border-b pb-4">
          <span class="text-highlighted text-lg font-bold">{{ t('nav.mainNav') }}</span>
          <UButton
            icon="i-tabler-x"
            color="neutral"
            variant="ghost"
            :aria-label="t('joke.close')"
            @click="closeMobileMenu"
          />
        </div>

        <!-- Navigation links -->
        <div class="flex-1 space-y-1">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
            :class="{
              'bg-primary-500 text-white': isActiveRoute(tab.basePath),
              'hover:bg-elevated': !isActiveRoute(tab.basePath),
            }"
            :aria-current="isActiveRoute(tab.basePath) ? 'page' : undefined"
            @click="closeMobileMenu"
          >
            <UIcon :name="tab.icon" class="size-5" aria-hidden="true" />
            <span>{{ tab.label }}</span>
          </NuxtLink>
        </div>
      </nav>
    </template>
  </USlideover>

  <USeparator class="my-4" />
</template>
