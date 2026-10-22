import { createHmac, randomBytes } from 'node:crypto'
import { isIPv6 } from 'node:net'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { deriveSecret } from 'nuxt/server'
import { getClientIp } from './getClientIp'

// `useStorage` is provided as a Nitro server auto-import.

interface RateLimitRecord {
  count: number
  // When the window that started with the first request ends (epoch ms).
  resetAt: number
}

interface RateLimitOptions {
  namespace: string
  maxRequests: number
  windowMs: number
  errorMessage: string
}

const STORAGE_NAME = 'ratelimit'
// `<namespace>:<128-bit hex digest>`: flat, fixed-length and safe as a file
// name for the fs driver (which maps ':' to '/').
const KEY_PATTERN = /^[a-z0-9-]+:[0-9a-f]{32}$/

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

let hashKey: Promise<string> | undefined

// Keyed hash, so the stored keys cannot be turned back into IP addresses
// without the app secret (a plain hash of an IPv4 address falls to brute
// force). The key is derived from NUXT_APP_SECRET, which production needs
// anyway for the /_og/* images. Without a usable one the limiter keeps the
// contact form working with a random per-process key, whose counters restart
// with the process; server/plugins/appSecretCheck.ts reports it at startup.
function getHashKey(): Promise<string> {
  hashKey ??= deriveSecret('ivan:rate-limit').catch(() => randomBytes(32).toString('hex'))
  return hashKey
}

// One IPv6 subscriber usually holds a whole /64, so the /64 counts as one
// client. IPv4 addresses (and 'unknown') are used as they are.
function clientBucket(ip: string): string {
  if (!isIPv6(ip)) return ip

  const [head = '', tail] = (ip.split('%')[0] ?? '').split('::')
  const headGroups = head ? head.split(':') : []
  const tailGroups = tail ? tail.split(':') : []
  // An embedded IPv4 tail (64:ff9b::192.0.2.1) fills two groups.
  const tailLength = tailGroups.reduce((total, group) => total + (group.includes('.') ? 2 : 1), 0)
  const groups =
    tail === undefined
      ? headGroups
      : [
          ...headGroups,
          ...Array<string>(8 - headGroups.length - tailLength).fill('0'),
          ...tailGroups,
        ]

  const prefix = groups.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16))
  return `${prefix.join(':')}::/64`
}

async function storageKey(namespace: string, ip: string): Promise<string> {
  const digest = createHmac('sha256', await getHashKey())
    .update(`${namespace}\0${clientBucket(ip)}`)
    .digest('hex')
    .slice(0, 32)
  return `${namespace.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:${digest}`
}

function isRecord(value: unknown): value is RateLimitRecord {
  const record = value as RateLimitRecord | null
  return (
    typeof record === 'object' &&
    record !== null &&
    Number.isFinite(record.count) &&
    Number.isFinite(record.resetAt)
  )
}

/**
 * File-based, proxy-aware rate limiter. State lives in the `ratelimit` Nitro
 * storage (an `fs` driver on the persistent data volume), so it survives
 * process restarts. Each record holds a request count and the end of its
 * window under a keyed hash of the client address, never the address itself.
 * It fails open if storage is unavailable: rate limiting is defense in depth,
 * not a hard gate.
 */
export async function enforceRateLimit(event: H3Event, options: RateLimitOptions): Promise<void> {
  const storage = useStorage<RateLimitRecord>(STORAGE_NAME)
  const key = await storageKey(options.namespace, getClientIp(event))

  await serializeByKey(key, async () => {
    const now = Date.now()
    let record: RateLimitRecord | null
    try {
      record = await storage.getItem(key)
    } catch {
      return
    }

    const nextRecord: RateLimitRecord =
      isRecord(record) && record.resetAt > now
        ? { count: record.count + 1, resetAt: record.resetAt }
        : { count: 1, resetAt: now + options.windowMs }

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

/**
 * Deletes every record whose window has ended. Records in an older layout
 * (keyed by the raw IP address, partly in nested directories) wipe the whole
 * store once, directories included; losing live counters is harmless.
 */
export async function pruneRateLimitStore(): Promise<void> {
  const storage = useStorage<RateLimitRecord>(STORAGE_NAME)
  const keys = await storage.getKeys()

  if (keys.some((key) => !KEY_PATTERN.test(key))) {
    await storage.clear()
    return
  }

  const now = Date.now()
  await Promise.all(
    keys.map(async (key) => {
      const record = await storage.getItem(key)
      if (!isRecord(record) || record.resetAt <= now) await storage.removeItem(key)
    })
  )
}
