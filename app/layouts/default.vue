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
const { width, height } = useWindowSize();
const isMobile = computed(
  () => width.value < height.value || width.value < 868
);
const isLargeScreen = computed(() => width.value >= 1300);

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
    // Usar la ruta actual, no la raíz
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
  <div class="min-w-screen min-h-screen flex flex-col bg-base-200">
    <!-- Skip link para accesibilidad -->
    <a
      href="#main-content"
      class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-content focus:px-4 focus:py-2 focus:rounded"
    >
      {{ t("nav.skipLink") }}
    </a>

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

    <main id="main-content" class="flex-grow" role="main">
      <div class="w-11/12 max-w-7xl mx-auto p-4 sm:p-6">
        <!-- Header -->
        <header class="mb-6 sm:mb-8">
          <!-- Móvil: diseño vertical -->
          <div v-if="isMobile" class="flex flex-col items-center gap-4">
            <!-- Foto de perfil -->
            <button
              @click="showRandomJoke"
              class="profile-btn focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
              :aria-label="t('header.jokeButton')"
            >
              <div class="avatar-animated p-1 rounded-full">
                <NuxtImg
                  class="rounded-full w-24 h-24 sm:w-32 sm:h-32"
                  src="/profile-pic.jpg"
                  :alt="t('header.profileAlt')"
                  width="128"
                  height="128"
                  format="webp"
                  quality="80"
                />
              </div>
            </button>

            <!-- Título -->
            <div class="text-center">
              <h1 class="text-2xl sm:text-3xl font-bold text-primary">
                {{ t("header.title") }}
              </h1>
              <p class="text-base sm:text-lg text-base-content/70">
                {{ t("header.subtitle") }}
              </p>
            </div>

            <!-- Controles de tema e idioma -->
            <div class="flex gap-2">
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
                  <Icon
                    name="tabler:chevron-down"
                    class="w-4 h-4"
                    aria-hidden="true"
                  />
                </button>
                <ul
                  tabindex="0"
                  class="dropdown-content menu bg-base-100 rounded-box z-50 w-36 p-2 shadow-lg border border-base-300"
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

            <!-- Navegación móvil: Dock fijo abajo -->
          </div>

          <!-- Desktop: diseño horizontal -->
          <div v-else class="flex items-center justify-between">
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
            <nav class="mx-auto" aria-label="Navegación principal">
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

        <!-- Contenido de la página -->
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="footer footer-center p-4 bg-base-300 text-base-content"
      :class="{ 'pb-20': isMobile }"
      role="contentinfo"
    >
      <aside class="flex flex-col sm:flex-row items-center gap-4">
        <div class="flex items-center gap-2">
          <Icon name="tabler:copyright" class="w-5 h-5" aria-hidden="true" />
          <p class="text-sm">
            <i18n-t keypath="footer.copyright" tag="span">
              <template #link>
                <a
                  class="link link-primary"
                  href="https://github.com/ComicIvans/cv"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ t("footer.github") }}</a
                >
              </template>
            </i18n-t>
          </p>
        </div>
        <NuxtLink
          :to="localePath('/legal')"
          class="link link-hover text-sm opacity-70 hover:opacity-100"
        >
          {{ t("legal.title") }}
        </NuxtLink>
        <nav class="flex gap-4" aria-label="Redes sociales">
          <a
            class="link link-hover social-icon"
            href="https://www.linkedin.com/in/ivansalidocobo/"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('footer.linkedinLabel')"
          >
            <Icon name="tabler:brand-linkedin" class="w-6 h-6" />
          </a>
          <a
            class="link link-hover social-icon"
            href="https://www.instagram.com/ivansalidocobo/"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('footer.instagramLabel')"
          >
            <Icon name="tabler:brand-instagram" class="w-6 h-6" />
          </a>
          <a
            class="link link-hover social-icon"
            href="https://github.com/ComicIvans/"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('footer.githubLabel')"
          >
            <Icon name="tabler:brand-github" class="w-6 h-6" />
          </a>
        </nav>
      </aside>
    </footer>

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
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
