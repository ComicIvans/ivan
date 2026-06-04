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
  const now = Date.now()

  let record: RateLimitRecord | null = null
  try {
    record = await storage.getItem<RateLimitRecord>(key)
  } catch {
    // Storage read failed: allow the request.
    return
  }

  const isExpired = !record || now - record.firstRequest > options.windowMs
  const nextRecord: RateLimitRecord = isExpired
    ? { count: 1, firstRequest: now }
    : { count: record!.count + 1, firstRequest: record!.firstRequest }

  try {
    await storage.setItem(key, nextRecord)
  } catch {
    // Storage write failed: allow the request.
    return
  }

  if (nextRecord.count > options.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: options.errorMessage,
    })
  }
}
