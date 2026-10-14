import type { H3Event } from 'h3'
import { createError } from 'h3'
import { getClientIp } from './getClientIp'

// `useStorage` is provided as a Nitro server auto-import.

interface RateLimitRecord {
  count: number
  firstRequest: number
}

interface RateLimitOptions {
  namespace: string
  maxRequests: number
  windowMs: number
  errorMessage: string
}

const sanitizeKeyPart = (value: string) => value.replace(/[^a-zA-Z0-9_.:-]/g, '_')
const pendingByKey = new Map<string, Promise<void>>()

async function serializeByKey(key: string, operation: () => Promise<void>): Promise<void> {
  const previous = pendingByKey.get(key) ?? Promise.resolve()
  const current = previous.catch(() => undefined).then(operation)
  pendingByKey.set(key, current)

  try {
    await current
  } finally {
    if (pendingByKey.get(key) === current) pendingByKey.delete(key)
  }
}

/**
 * File-based, proxy-aware rate limiter. State lives in the `ratelimit` Nitro
 * storage (an `fs` driver mounted on the persistent /data volume), so it
 * survives process restarts. It fails open if storage is unavailable —
 * rate limiting is defense-in-depth, not a hard gate.
 */
export async function enforceRateLimit(event: H3Event, options: RateLimitOptions): Promise<void> {
  const ip = getClientIp(event)
  const storage = useStorage('ratelimit')
  const key = `${sanitizeKeyPart(options.namespace)}:${sanitizeKeyPart(ip)}`
  await serializeByKey(key, async () => {
    const now = Date.now()
    let record: RateLimitRecord | null
    try {
      record = await storage.getItem<RateLimitRecord>(key)
    } catch {
      return
    }

    const currentRecord = record
    const isExpired = !currentRecord || now - currentRecord.firstRequest > options.windowMs
    const nextRecord: RateLimitRecord = isExpired
      ? { count: 1, firstRequest: now }
      : { count: currentRecord.count + 1, firstRequest: currentRecord.firstRequest }

    try {
      await storage.setItem(key, nextRecord)
    } catch {
      return
    }

    if (nextRecord.count > options.maxRequests) {
      throw createError({ statusCode: 429, statusMessage: options.errorMessage })
    }
  })
}
