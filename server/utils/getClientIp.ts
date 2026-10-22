import { isIP } from 'node:net'
import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

/**
 * Resolves the client IP for abuse controls. In production a single nginx
 * proxy sits in front of the app and appends the address it saw to
 * `x-forwarded-for`, so only the right-most entry is trustworthy: everything
 * to its left was sent by the client and may be forged. Without the header
 * (direct access) the socket address is used.
 *
 * The result is a normalized IP (IPv4-mapped IPv6 unwrapped, lowercase), or
 * 'unknown' when no valid address is available, so malformed headers all
 * share one bucket.
 */
export function getClientIp(event: H3Event): string {
  const forwardedFor = getRequestHeader(event, 'x-forwarded-for')
  const proxyEntry = forwardedFor
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .at(-1)

  return normalizeIp(proxyEntry ?? event.node.req.socket.remoteAddress)
}

function normalizeIp(value: string | undefined): string {
  const ip = value?.toLowerCase().replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/, '')
  return ip && isIP(ip) ? ip : 'unknown'
}
