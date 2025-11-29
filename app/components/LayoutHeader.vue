<script setup lang="ts">
import jokesEs from "~/assets/jokes-es.json";
import jokesEn from "~/assets/jokes-en.json";

const { t, locale } = useI18n();
const colorMode = useColorMode();
const localePath = useLocalePath();
const route = useRoute();

// Chistes según idioma
const jokes = computed(() => (locale.value === "en" ? jokesEn : jokesEs));

// Modal de chistes
const jokeModalOpen = ref(false);
const currentJoke = ref("");

// Navegación
const tabs = computed(() => [
  { name: t("nav.about"), icon: "tabler:user", path: "/" },
  { name: t("nav.skills"), icon: "tabler:school", path: "/skills" },
  {
    name: t("nav.representation"),
    icon: "tabler:building-bank",
    path: "/representation",
  },
]);

// Responsividad
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 868);
const isLargeScreen = computed(() => width.value >= 1300);
const isVeryNarrow = computed(() => width.value < 400);

// Tema
const isDark = computed(() => colorMode.value === "dark");
const toggleTheme = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

// Idiomas disponibles con banderas
const availableLocales = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;

// Obtener locale actual
const currentLocale = computed(() => {
  const found = availableLocales.find((l) => l.code === locale.value);
  return found ?? availableLocales[0];
});

// Cambiar idioma manteniendo la ruta actual
const switchLocale = (code: "es" | "en") => {
  if (code !== locale.value) {
    navigateTo(localePath(route.path, code));
  }
};

// Verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  const currentPath = route.path;
  const localizedPath = localePath(path);
  return currentPath === localizedPath;
};

// Función para mostrar chiste aleatorio
const showRandomJoke = () => {
  const jokeList = jokes.value;
  currentJoke.value =
    jokeList[Math.floor(Math.random() * jokeList.length)] || t("joke.error");
  jokeModalOpen.value = true;
};

// Cerrar modal
const closeJokeModal = () => {
  jokeModalOpen.value = false;
};
</script>

<template>
  <!-- Modal de chistes -->
  <dialog
    :open="jokeModalOpen"
    class="modal modal-animated"
    :class="{ 'modal-open': jokeModalOpen }"
    @click.self="closeJokeModal"
    @keydown.escape="closeJokeModal"
    aria-labelledby="joke-title"
    aria-modal="true"
  >
    <div class="modal-box" role="document">
      <h3 id="joke-title" class="font-bold text-lg">
        {{ t("joke.title") }}
      </h3>
      <p class="py-4">{{ currentJoke }}</p>
      <div class="modal-action">
        <button class="btn btn-primary" @click="closeJokeModal">
          {{ t("joke.close") }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="closeJokeModal"></div>
  </dialog>

  <!-- Header -->
  <header class="mb-6 sm:mb-8">
    <!-- Móvil: diseño compacto -->
    <div v-if="isMobile" class="flex items-center gap-3">
      <!-- Foto de perfil -->
      <button
        @click="showRandomJoke"
        class="profile-btn focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full shrink-0"
        :aria-label="t('header.jokeButton')"
      >
        <div class="avatar-animated p-0.5 rounded-full">
          <NuxtImg
            class="rounded-full w-16 h-16"
            src="/profile-pic.jpg"
            :alt="t('header.profileAlt')"
            width="64"
            height="64"
            format="webp"
            quality="80"
          />
        </div>
      </button>

      <!-- Título completo -->
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-primary leading-tight">
          {{ t("header.title") }}
        </h1>
        <p class="text-sm text-base-content/70 leading-tight">
          {{ t("header.subtitle") }}
        </p>
      </div>

      <!-- Controles de tema e idioma (fila por defecto, columna en pantallas muy pequeñas) -->
      <div
        class="flex items-center shrink-0"
        :class="isVeryNarrow ? 'flex-col gap-0.5' : 'flex-row gap-1'"
      >
        <button
          @click="toggleTheme"
          class="btn btn-ghost btn-xs btn-circle"
          :aria-label="t('theme.toggle')"
        >
          <Icon :name="isDark ? 'tabler:sun' : 'tabler:moon'" class="w-5 h-5" />
        </button>

        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-sm btn-square"
            :aria-label="t('language.toggle')"
            aria-haspopup="listbox"
          >
            <span class="text-xl" aria-hidden="true">{{
              currentLocale.flag
            }}</span>
          </button>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-[100] w-40 p-2 shadow-xl border border-base-300 mt-2"
            role="listbox"
            :aria-label="t('language.toggle')"
          >
            <li v-for="lang in availableLocales" :key="lang.code">
              <button
                role="option"
                :aria-selected="lang.code === locale"
                class="flex items-center gap-2 w-full"
                :class="{
                  'bg-primary/10 text-primary': lang.code === locale,
                }"
                @click="switchLocale(lang.code)"
              >
                <span class="text-lg" aria-hidden="true">{{ lang.flag }}</span>
                <span class="flex-1">{{ lang.name }}</span>
                <Icon
                  v-if="lang.code === locale"
                  name="tabler:check"
                  class="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Desktop: diseño horizontal -->
    <div v-else class="flex items-center justify-between gap-8">
      <!-- Foto de perfil -->
      <button
        @click="showRandomJoke"
        class="profile-btn focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full shrink-0"
        :aria-label="t('header.jokeButton')"
      >
        <div class="avatar-animated p-1 rounded-full">
          <NuxtImg
            class="rounded-full w-32 h-32"
            src="/profile-pic.jpg"
            :alt="t('header.profileAlt')"
            width="128"
            height="128"
            format="webp"
            quality="80"
          />
        </div>
      </button>

      <!-- Navegación desktop -->
      <nav class="flex-1 flex justify-center" aria-label="Navegación principal">
        <ul
          :class="isLargeScreen ? 'menu-horizontal' : 'menu-vertical'"
          class="menu gap-2 bg-base-100 rounded-box border border-base-300 shadow-sm"
          role="menubar"
        >
          <li v-for="tab in tabs" :key="tab.path" role="none">
            <NuxtLink
              :to="localePath(tab.path)"
              role="menuitem"
              class="transition-all duration-200"
              :class="{ active: isActiveRoute(tab.path) }"
              :aria-current="isActiveRoute(tab.path) ? 'page' : undefined"
            >
              <Icon :name="tab.icon" class="w-4 h-4" />
              {{ tab.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Título y controles -->
      <div class="text-right shrink-0">
        <h1 class="text-3xl lg:text-4xl font-bold text-primary">
          {{ t("header.title") }}
        </h1>
        <p class="text-lg text-base-content/70">
          {{ t("header.subtitle") }}
        </p>

        <div class="flex gap-2 mt-2 justify-end">
          <button
            @click="toggleTheme"
            class="btn btn-ghost btn-sm btn-circle"
            :aria-label="t('theme.toggle')"
          >
            <Icon
              :name="isDark ? 'tabler:sun' : 'tabler:moon'"
              class="w-5 h-5"
            />
          </button>

          <div class="dropdown dropdown-end">
            <button
              tabindex="0"
              role="button"
              class="btn btn-ghost btn-sm gap-1"
              :aria-label="t('language.toggle')"
              aria-haspopup="listbox"
            >
              <span class="text-lg" aria-hidden="true">{{
                currentLocale.flag
              }}</span>
              <span>{{ currentLocale.name }}</span>
              <Icon
                name="tabler:chevron-down"
                class="w-4 h-4"
                aria-hidden="true"
              />
            </button>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-300"
              role="listbox"
              :aria-label="t('language.toggle')"
            >
              <li v-for="lang in availableLocales" :key="lang.code">
                <button
                  role="option"
                  :aria-selected="lang.code === locale"
                  class="flex items-center gap-2"
                  :class="{
                    'bg-primary/10 text-primary': lang.code === locale,
                  }"
                  @click="switchLocale(lang.code)"
                >
                  <span class="text-lg" aria-hidden="true">{{
                    lang.flag
                  }}</span>
                  {{ lang.name }}
                  <Icon
                    v-if="lang.code === locale"
                    name="tabler:check"
                    class="w-4 h-4 ml-auto"
                    aria-hidden="true"
                  />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="divider my-4" role="separator"></div>

  <!-- Dock de navegación móvil (fijo abajo) -->
  <div
    v-if="isMobile"
    class="dock dock-bottom bg-base-100 border-t border-base-300 z-40"
  >
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="localePath(tab.path)"
      class="flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-colors"
      :class="
        isActiveRoute(tab.path)
          ? 'text-primary'
          : 'text-base-content/60 hover:text-base-content'
      "
    >
      <Icon
        :name="tab.icon"
        class="w-6 h-6"
        :class="{ 'scale-110': isActiveRoute(tab.path) }"
      />
      <span class="dock-label text-xs text-center">{{ tab.name }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.dock-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom, 4px);
  padding-top: 4px;
}

.dock-label {
  line-height: 1.2;
}
</style>
