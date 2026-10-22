import { pruneRateLimitStore } from '../utils/rateLimit'

// Expired rate-limit records are deleted on this schedule (and at startup)
// rather than kept until the same client returns, so a record outlives its
// window by ten minutes at most.
const PRUNE_INTERVAL_MS = 10 * 60 * 1000

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return

  const prune = () =>
    pruneRateLimitStore().catch((error: unknown) => {
      // An error, not a warning: records then outlive the deletion period
      // the legal page states.
      console.error('[rate-limit] Could not prune expired records:', error)
    })

  void prune()
  const timer = setInterval(prune, PRUNE_INTERVAL_MS)
  timer.unref()
  nitroApp.hooks.hook('close', () => clearInterval(timer))
})
