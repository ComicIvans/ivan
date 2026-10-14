import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

// Registers v-auto-animate for list reflows (e.g. gallery filtering). The
// library disables itself under prefers-reduced-motion natively.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(autoAnimatePlugin)
})
