import { defineNuxtModule } from '@nuxt/kit'

const sanitizeOptimizeDeps = (config: { optimizeDeps?: { include?: string[] } }) => {
  config.optimizeDeps ??= {}

  const include = Array.isArray(config.optimizeDeps.include) ? config.optimizeDeps.include : []

  config.optimizeDeps.include = include.filter(
    (entry: string) => !String(entry).startsWith('@nuxtjs/mdc > ')
  )
}

export default defineNuxtModule({
  meta: {
    name: 'fix-mdc-optimize-deps',
  },
  setup(_options, nuxt) {
    nuxt.hook('vite:extendConfig', (config) => {
      sanitizeOptimizeDeps(config as { optimizeDeps?: { include?: string[] } })
    })
  },
})
