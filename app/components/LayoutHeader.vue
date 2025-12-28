<script setup lang="ts">
import { localesConfig, getLocaleConfig, loadJokes, type LocaleCode } from '~/utils/locales'

const { t, locale } = useI18n()
const colorMode = useColorMode()
const localePath = useLocalePath()
const route = useRoute()

// Chistes - carga lazy
const jokes = ref<string[]>([])
const loadJokesForLocale = async () => {
  jokes.value = await loadJokes(locale.value)
}

// Cargar chistes inicialmente y cuando cambie el idioma
onMounted(loadJokesForLocale)
watch(locale, loadJokesForLocale)

// Modal de chistes
const jokeModalOpen = ref(false)
const currentJoke = ref('')

// Menú móvil
const mobileMenuOpen = ref(false)

// Ref para el dropdown de idioma
const languageDropdownOpen = ref(false)

// Navegación
const tabs = computed(() => [
  { name: t('nav.home'), icon: 'tabler:home', path: '/' },
  { name: t('nav.experience'), icon: 'tabler:briefcase', path: '/experiencia' },
  { name: t('nav.projects'), icon: 'tabler:code', path: '/proyectos' },
  { name: t('nav.gallery'), icon: 'tabler:photo', path: '/galeria' },
  { name: t('nav.training'), icon: 'tabler:school', path: '/formacion' },
  { name: t('nav.representation'), icon: 'tabler:building-bank', path: '/representacion' },
  { name: t('nav.contact'), icon: 'tabler:mail', path: '/contacto' },
])

// Tema
const isDark = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Usar configuración centralizada de idiomas
const currentLocale = computed(() => getLocaleConfig(locale.value))

const switchLocale = (code: string) => {
  if (code !== locale.value) {
    languageDropdownOpen.value = false
    navigateTo(localePath(route.path, code))
  }
}

// Verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  return route.path === localePath(path)
}

// Función para mostrar chiste aleatorio
const showRandomJoke = async () => {
  // Cargar chistes si no están cargados
  if (jokes.value.length === 0) {
    await loadJokesForLocale()
  }
  const jokeList = jokes.value
  currentJoke.value = jokeList[Math.floor(Math.random() * jokeList.length)] || t('joke.error')
  jokeModalOpen.value = true
}

const closeJokeModal = () => {
  jokeModalOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Cerrar menú al cambiar de ruta
watch(
  () => route.path,
  () => {
    closeMobileMenu()
  }
)
</script>

<template>
  <!-- Modal de chistes -->
  <dialog
    :open="jokeModalOpen"
    class="modal"
    :class="{ 'modal-open': jokeModalOpen }"
    aria-labelledby="joke-title"
    aria-modal="true"
    @click.self="closeJokeModal"
    @keydown.escape="closeJokeModal"
  >
    <div class="modal-box">
      <h3 id="joke-title" class="text-lg font-bold">{{ t('joke.title') }}</h3>
      <p class="py-4">{{ currentJoke }}</p>
      <div class="modal-action">
        <button class="btn btn-primary" @click="closeJokeModal">
          {{ t('joke.close') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeJokeModal">close</button>
    </form>
  </dialog>

  <!-- Header -->
  <header class="mb-6">
    <!-- Layout Desktop -->
    <div class="hidden items-center justify-between gap-4 lg:flex">
      <!-- Foto de perfil -->
      <button
        class="shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <NuxtImg
          class="h-24 w-24 rounded-full object-cover"
          src="/profile-pic.jpg"
          :alt="t('header.profileAlt')"
          width="128"
          height="128"
          format="webp"
          quality="85"
        />
      </button>

      <!-- Título -->
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-primary">
          {{ t('header.title') }}
        </h1>
        <p class="text-base text-base-content/70">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <!-- Controles (tema e idioma) -->
      <div class="flex items-center gap-1">
        <ClientOnly>
          <button
            class="btn btn-circle btn-ghost btn-sm"
            :aria-label="t('theme.toggle')"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'tabler:sun' : 'tabler:moon'" class="h-5 w-5" />
          </button>
        </ClientOnly>

        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            role="button"
            class="btn btn-circle btn-ghost btn-sm"
            :aria-label="t('language.toggle')"
            aria-haspopup="listbox"
            @click="languageDropdownOpen = !languageDropdownOpen"
          >
            <Icon :name="currentLocale.icon" class="h-5 w-5" />
          </button>
          <ul
            v-if="languageDropdownOpen"
            tabindex="0"
            class="menu dropdown-content z-50 mt-2 w-40 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            role="listbox"
          >
            <li v-for="lang in localesConfig" :key="lang.code">
              <button
                role="option"
                :aria-selected="lang.code === locale"
                class="flex items-center gap-2 !outline-none"
                :class="{ 'bg-primary/10 text-primary': lang.code === locale }"
                @click="switchLocale(lang.code)"
              >
                <Icon :name="lang.icon" class="h-5 w-5" />
                <span class="flex-1">{{ lang.name }}</span>
                <Icon v-if="lang.code === locale" name="tabler:check" class="h-4 w-4" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Layout Móvil -->
    <div class="lg:hidden">
      <!-- Fila superior: menú hamburguesa, foto centrada, controles -->
      <div class="grid grid-cols-[auto_1fr_auto] items-center">
        <!-- Botón menú móvil -->
        <button
          class="btn btn-circle btn-ghost"
          :aria-label="t('nav.mainNav')"
          :aria-expanded="mobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <Icon :name="mobileMenuOpen ? 'tabler:x' : 'tabler:menu-2'" class="h-6 w-6" />
        </button>

        <!-- Foto de perfil centrada -->
        <div class="flex justify-center">
          <button
            class="shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary"
            :aria-label="t('header.jokeButton')"
            @click="showRandomJoke"
          >
            <NuxtImg
              class="h-24 w-24 rounded-full object-cover"
              src="/profile-pic.jpg"
              :alt="t('header.profileAlt')"
              width="128"
              height="128"
              format="webp"
              quality="85"
            />
          </button>
        </div>

        <!-- Controles (tema e idioma) -->
        <div class="flex items-center gap-1">
          <ClientOnly>
            <button
              class="btn btn-circle btn-ghost btn-sm"
              :aria-label="t('theme.toggle')"
              @click="toggleTheme"
            >
              <Icon :name="isDark ? 'tabler:sun' : 'tabler:moon'" class="h-5 w-5" />
            </button>
          </ClientOnly>

          <div class="dropdown dropdown-end">
            <button
              tabindex="0"
              role="button"
              class="btn btn-circle btn-ghost btn-sm"
              :aria-label="t('language.toggle')"
              aria-haspopup="listbox"
              @click="languageDropdownOpen = !languageDropdownOpen"
            >
              <Icon :name="currentLocale.icon" class="h-5 w-5" />
            </button>
            <ul
              v-if="languageDropdownOpen"
              tabindex="0"
              class="menu dropdown-content z-50 mt-2 w-40 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
              role="listbox"
            >
              <li v-for="lang in localesConfig" :key="lang.code">
                <button
                  role="option"
                  :aria-selected="lang.code === locale"
                  class="flex items-center gap-2 !outline-none"
                  :class="{ 'bg-primary/10 text-primary': lang.code === locale }"
                  @click="switchLocale(lang.code)"
                >
                  <Icon :name="lang.icon" class="h-5 w-5" />
                  <span class="flex-1">{{ lang.name }}</span>
                  <Icon v-if="lang.code === locale" name="tabler:check" class="h-4 w-4" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Título móvil -->
      <div class="mt-4 text-center">
        <h1 class="text-xl font-bold text-primary">
          {{ t('header.title') }}
        </h1>
        <p class="text-sm text-base-content/70">
          {{ t('header.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Navegación desktop (horizontal compacta) -->
    <nav class="mt-4 hidden lg:block" :aria-label="t('nav.mainNav')">
      <ul class="menu menu-horizontal flex-nowrap justify-center gap-1 rounded-box bg-base-200 p-1">
        <li v-for="tab in tabs" :key="tab.path">
          <NuxtLink
            :to="localePath(tab.path)"
            class="gap-1 px-3 py-2 text-sm !outline-none transition-colors duration-300 hover:!bg-base-300 focus:!bg-inherit focus:!text-inherit"
            :class="{
              'bg-primary text-primary-content hover:!bg-primary focus:!bg-primary focus:!text-primary-content':
                isActiveRoute(tab.path),
              'text-base-content': !isActiveRoute(tab.path),
            }"
            :aria-current="isActiveRoute(tab.path) ? 'page' : undefined"
          >
            <Icon :name="tab.icon" class="h-4 w-4" />
            <span>{{ tab.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>

  <!-- Drawer móvil -->
  <div class="drawer-start drawer lg:hidden">
    <input
      id="mobile-drawer"
      type="checkbox"
      class="drawer-toggle"
      :checked="mobileMenuOpen"
      @change="toggleMobileMenu"
    />
    <div class="drawer-side z-50">
      <label
        for="mobile-drawer"
        aria-label="close sidebar"
        class="drawer-overlay"
        @click="closeMobileMenu"
      ></label>
      <nav class="menu min-h-full w-72 bg-base-100 p-4" :aria-label="t('nav.mainNav')">
        <!-- Cabecera del menú -->
        <div class="mb-4 flex items-center justify-between border-b border-base-300 pb-4">
          <span class="text-lg font-bold text-primary">{{ t('nav.mainNav') }}</span>
          <button
            class="btn btn-circle btn-ghost btn-sm"
            :aria-label="t('joke.close')"
            @click="closeMobileMenu"
          >
            <Icon name="tabler:x" class="h-5 w-5" />
          </button>
        </div>

        <!-- Enlaces de navegación -->
        <ul class="space-y-1">
          <li v-for="tab in tabs" :key="tab.path">
            <NuxtLink
              :to="localePath(tab.path)"
              class="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
              :class="{
                'bg-primary text-primary-content': isActiveRoute(tab.path),
                'hover:bg-base-200': !isActiveRoute(tab.path),
              }"
              :aria-current="isActiveRoute(tab.path) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              <Icon :name="tab.icon" class="h-5 w-5" />
              <span>{{ tab.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="divider my-4"></div>
</template>
