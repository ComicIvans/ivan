// SSR stub for v-auto-animate: the real plugin is client-only, and Vue's
// server renderer throws on directives that are not registered at all.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auto-animate', {
    getSSRProps: () => ({}),
  })
})
