<script setup lang="ts">
import jokesEs from '~/assets/jokes-es.json'
import jokesEn from '~/assets/jokes-en.json'

const { t, locale } = useI18n()
const colorMode = useColorMode()
const localePath = useLocalePath()
const route = useRoute()

// Chistes según idioma
const jokes = computed(() => (locale.value === 'en' ? jokesEn : jokesEs))

// Modal de chistes
const jokeModalOpen = ref(false)
const currentJoke = ref('')

// Navegación
const tabs = computed(() => [
  { name: t('nav.about'), icon: 'tabler:user', path: '/' },
  { name: t('nav.skills'), icon: 'tabler:school', path: '/skills' },
  {
    name: t('nav.representation'),
    icon: 'tabler:building-bank',
    path: '/representation',
  },
])

// Tema
const isDark = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Idiomas disponibles
const availableLocales = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const

const currentLocale = computed(() => {
  return availableLocales.find((l) => l.code === locale.value) ?? availableLocales[0]
})

const switchLocale = (code: 'es' | 'en') => {
  if (code !== locale.value) {
    navigateTo(localePath(route.path, code))
  }
}

// Verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  return route.path === localePath(path)
}

// Función para mostrar chiste aleatorio
const showRandomJoke = () => {
  const jokeList = jokes.value
  currentJoke.value = jokeList[Math.floor(Math.random() * jokeList.length)] || t('joke.error')
  jokeModalOpen.value = true
}

const closeJokeModal = () => {
  jokeModalOpen.value = false
}
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
    <div class="modal-backdrop" @click="closeJokeModal"></div>
  </dialog>

  <!-- Header -->
  <header class="header">
    <!-- Controles (tema e idioma) -->
    <div class="header-controls">
      <button
        class="btn btn-circle btn-ghost btn-sm"
        :aria-label="t('theme.toggle')"
        @click="toggleTheme"
      >
        <Icon :name="isDark ? 'tabler:sun' : 'tabler:moon'" class="h-5 w-5" />
      </button>

      <div class="dropdown dropdown-end">
        <button
          tabindex="0"
          role="button"
          class="btn btn-square btn-ghost btn-sm"
          :aria-label="t('language.toggle')"
          aria-haspopup="listbox"
        >
          <span class="text-xl">{{ currentLocale.flag }}</span>
        </button>
        <ul
          tabindex="0"
          class="menu dropdown-content z-50 mt-2 w-40 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          role="listbox"
        >
          <li v-for="lang in availableLocales" :key="lang.code">
            <button
              role="option"
              :aria-selected="lang.code === locale"
              class="flex items-center gap-2"
              :class="{ 'bg-primary/10 text-primary': lang.code === locale }"
              @click="switchLocale(lang.code)"
            >
              <span class="text-lg">{{ lang.flag }}</span>
              <span class="flex-1">{{ lang.name }}</span>
              <Icon v-if="lang.code === locale" name="tabler:check" class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Foto de perfil -->
    <button class="profile-btn" :aria-label="t('header.jokeButton')" @click="showRandomJoke">
      <NuxtImg
        class="profile-img"
        src="/profile-pic.jpg"
        :alt="t('header.profileAlt')"
        width="128"
        height="128"
        format="webp"
        quality="80"
      />
    </button>

    <!-- Título -->
    <div class="header-title">
      <h1 class="title-text">
        {{ t('header.title') }}
      </h1>
      <p class="subtitle-text">
        {{ t('header.subtitle') }}
      </p>
    </div>

    <!-- Navegación desktop -->
    <nav class="header-nav" :aria-label="t('nav.mainNav')">
      <ul class="nav-menu">
        <li v-for="tab in tabs" :key="tab.path">
          <NuxtLink
            :to="localePath(tab.path)"
            class="nav-link"
            :class="{ 'nav-link-active': isActiveRoute(tab.path) }"
            :aria-current="isActiveRoute(tab.path) ? 'page' : undefined"
          >
            <Icon :name="tab.icon" class="h-4 w-4 min-w-4" />
            <span>{{ tab.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>

  <div class="divider my-4"></div>

  <!-- Dock de navegación móvil -->
  <nav class="mobile-dock" :aria-label="t('nav.mainNav')">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="localePath(tab.path)"
      class="dock-item"
      :class="{ 'dock-item-active': isActiveRoute(tab.path) }"
    >
      <Icon :name="tab.icon" class="h-6 w-6 min-w-6" />
      <span class="text-xs">{{ tab.name }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* Header - Layout base móvil (mobile-first) */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Controles siempre en la parte superior en móvil */
.header-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* Navegación desktop oculta en móvil */
.header-nav {
  display: none;
}

/* Estilos base del menú de navegación (necesarios para SSR) */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background: oklch(var(--b1));
  border-radius: 1rem;
  border: 1px solid oklch(var(--b3));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  list-style: none;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: oklch(var(--bc));
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background: oklch(var(--b2));
}

.nav-link-active {
  background: oklch(var(--p) / 0.1);
  color: oklch(var(--p));
}

/* Imagen de perfil */
.profile-img {
  width: 6rem;
  height: 6rem;
  min-width: 6rem;
  border-radius: 9999px;
  aspect-ratio: 1;
  object-fit: cover;
}

/* Textos */
.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: oklch(var(--p));
}

.subtitle-text {
  font-size: 1rem;
  color: oklch(var(--bc) / 0.7);
}

/* Dock móvil visible por defecto */
.mobile-dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: oklch(var(--b1));
  border-top: 1px solid oklch(var(--b3));
  padding: 0.5rem 0;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  z-index: 50;
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: oklch(var(--bc) / 0.6);
  transition: color 0.2s;
}

.dock-item:hover {
  color: oklch(var(--bc));
}

.dock-item-active {
  color: oklch(var(--p));
}

/* Botón de perfil */
.profile-btn {
  border-radius: 9999px;
  transition: transform 0.2s;
}

.profile-btn:hover {
  transform: scale(1.05);
}

.profile-btn:active {
  transform: scale(0.95);
}

.profile-btn:focus-visible {
  outline: 2px solid oklch(var(--p));
  outline-offset: 2px;
}

/* Desktop: detectar por hover capability (ratón) y ancho mínimo */
@media (hover: hover) and (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    gap: 2rem;
  }

  .header-controls {
    order: 3;
    width: auto;
    gap: 0.5rem;
  }

  .header-title {
    order: 2;
    flex: 1;
  }

  .profile-btn {
    order: 1;
    flex-shrink: 0;
  }

  .profile-img {
    width: 8rem;
    height: 8rem;
    min-width: 8rem;
  }

  .title-text {
    font-size: 2.25rem;
  }

  .subtitle-text {
    font-size: 1.125rem;
  }

  .header-nav {
    display: flex;
    order: 2;
    flex: 1;
    justify-content: center;
  }

  .mobile-dock {
    display: none;
  }
}

/* Pantallas grandes: título a la derecha */
@media (hover: hover) and (min-width: 1024px) {
  .header-title {
    order: 3;
    text-align: right;
    flex: none;
  }

  .header-controls {
    order: 4;
    flex-direction: column;
    align-items: flex-end;
  }
}

/* Pantallas muy anchas: menú horizontal */
@media (hover: hover) and (min-width: 1400px) {
  .nav-menu {
    flex-direction: row;
  }
  .nav-link {
    text-wrap: nowrap;
  }
}
</style>
