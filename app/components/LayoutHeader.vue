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

onMounted(loadJokesForLocale)
watch(locale, loadJokesForLocale)

// Modal de chistes
const jokeModalOpen = ref(false)
const currentJoke = ref('')

// Menú móvil
const mobileMenuOpen = ref(false)

// Navegación
const tabs = computed(() => [
  { label: t('nav.home'), icon: 'i-tabler-home', to: localePath('/') },
  { label: t('nav.experience'), icon: 'i-tabler-briefcase', to: localePath('/experiencia') },
  { label: t('nav.projects'), icon: 'i-tabler-code', to: localePath('/proyectos') },
  { label: t('nav.gallery'), icon: 'i-tabler-photo', to: localePath('/galeria') },
  { label: t('nav.training'), icon: 'i-tabler-school', to: localePath('/formacion') },
  {
    label: t('nav.representation'),
    icon: 'i-tabler-building-bank',
    to: localePath('/representacion'),
  },
  { label: t('nav.contact'), icon: 'i-tabler-mail', to: localePath('/contacto') },
])

// Tema
const isDark = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Configuración de idiomas para el select
const currentLocale = computed(() => getLocaleConfig(locale.value))

const localeItems = computed(() =>
  localesConfig.map((lang) => ({
    label: lang.name,
    value: lang.code,
    icon: lang.icon.replace(':', '-').replace('tabler', 'i-tabler'),
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

// Verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  return route.path === path
}

// Función para mostrar chiste aleatorio
const showRandomJoke = async () => {
  if (jokes.value.length === 0) {
    await loadJokesForLocale()
  }
  const jokeList = jokes.value
  currentJoke.value = jokeList[Math.floor(Math.random() * jokeList.length)] || t('joke.error')
  jokeModalOpen.value = true
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
  <UModal v-model:open="jokeModalOpen" :aria-label="t('joke.title')">
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
    <!-- Layout Desktop -->
    <div class="hidden items-center justify-between gap-4 lg:flex">
      <!-- Foto de perfil -->
      <button
        class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        :aria-label="t('header.jokeButton')"
        @click="showRandomJoke"
      >
        <NuxtImg
          class="size-24 rounded-full object-cover"
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
        <h1 class="text-primary-500 text-3xl font-bold">
          {{ t('header.title') }}
        </h1>
        <p class="text-muted text-base">
          {{ t('header.subtitle') }}
        </p>
      </div>

      <!-- Controles (tema e idioma) -->
      <div class="flex items-center gap-2">
        <UButton
          :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
          color="neutral"
          variant="ghost"
          size="lg"
          :aria-label="t('theme.toggle')"
          @click="toggleTheme"
        />

        <USelect
          v-model="selectedLocale"
          :items="localeItems"
          value-key="value"
          class="w-36"
          :aria-label="t('language.toggle')"
        >
          <template #leading="{ modelValue }">
            <UIcon
              v-if="modelValue"
              :name="localeItems.find((l) => l.value === modelValue)?.icon || ''"
              class="size-5"
            />
          </template>
        </USelect>
      </div>
    </div>

    <!-- Layout Móvil -->
    <div class="lg:hidden">
      <!-- Fila superior: menú hamburguesa, foto centrada, controles -->
      <div class="flex items-center justify-between">
        <!-- Contenedor izquierdo con ancho fijo igual al derecho -->
        <div class="flex w-20 justify-start sm:w-24">
          <!-- Botón menú móvil -->
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

        <!-- Foto de perfil centrada -->
        <button
          class="focus-visible:ring-primary-500 shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('header.jokeButton')"
          @click="showRandomJoke"
        >
          <NuxtImg
            class="size-20 rounded-full object-cover sm:size-24"
            src="/profile-pic.jpg"
            :alt="t('header.profileAlt')"
            width="128"
            height="128"
            format="webp"
            quality="85"
          />
        </button>

        <!-- Controles (tema e idioma) con ancho fijo igual al izquierdo -->
        <div class="flex w-20 items-center justify-end gap-1 sm:w-24 sm:gap-2">
          <UButton
            :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
            color="neutral"
            variant="ghost"
            size="lg"
            :aria-label="t('theme.toggle')"
            @click="toggleTheme"
          />

          <UDropdownMenu
            :items="
              localeItems.map((item) => ({
                label: item.label,
                icon: item.icon,
                onSelect: () => (selectedLocale = item.value),
              }))
            "
          >
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

      <!-- Título móvil -->
      <div class="mt-4 text-center">
        <h1 class="text-primary-500 text-xl font-bold">
          {{ t('header.title') }}
        </h1>
        <p class="text-muted text-sm">
          {{ t('header.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Navegación desktop (horizontal) -->
    <nav class="mt-4 hidden lg:block" :aria-label="t('nav.mainNav')">
      <UNavigationMenu :items="tabs" highlight highlight-color="primary" class="justify-center" />
    </nav>
  </header>

  <!-- Slideover móvil -->
  <USlideover id="mobile-menu" v-model:open="mobileMenuOpen" side="left" class="lg:hidden">
    <template #content>
      <nav class="flex h-full flex-col p-4" :aria-label="t('nav.mainNav')">
        <!-- Cabecera del menú -->
        <div class="border-default mb-4 flex items-center justify-between border-b pb-4">
          <span class="text-primary-500 text-lg font-bold">{{ t('nav.mainNav') }}</span>
          <UButton
            icon="i-tabler-x"
            color="neutral"
            variant="ghost"
            :aria-label="t('joke.close')"
            @click="closeMobileMenu"
          />
        </div>

        <!-- Enlaces de navegación -->
        <div class="flex-1 space-y-1">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
            :class="{
              'bg-primary-500 text-white': isActiveRoute(tab.to as string),
              'hover:bg-elevated': !isActiveRoute(tab.to as string),
            }"
            :aria-current="isActiveRoute(tab.to as string) ? 'page' : undefined"
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
