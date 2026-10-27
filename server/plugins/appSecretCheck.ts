import { deriveSecret } from 'nuxt/server'

// NUXT_APP_SECRET signs the /_og/* preview image URLs and keys the rate-limit
// records. Production must set it; without a usable one the server says so
// once at startup, instead of leaving it to be guessed from failed preview
// images or rate-limit counters that restart with every process.
export default defineNitroPlugin(() => {
  if (import.meta.prerender) return

  deriveSecret('ivan:startup-check').catch((error: unknown) => {
    const reason = error instanceof Error ? error.message : String(error)
    console.error(
      `[config] NUXT_APP_SECRET is not usable: ${reason} Until it is set (at least 32 characters, see .env.example), /_og/* preview images answer 500 and the rate limiter uses a random per-process key, so its counters restart with every process.`
    )
  })
})
