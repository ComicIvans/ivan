import type { H3Event } from 'h3'
import { getHeader } from 'h3'

/**
 * Resolves the client IP. The app is assumed to sit behind a reverse proxy that
 * sets `x-forwarded-for` (and usually `x-real-ip`). We read the left-most entry
 * of `x-forwarded-for` (the original client), then fall back to `x-real-ip`,
 * then the socket address.
 */
export function getClientIp(event: H3Event): string {
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = getHeader(event, 'x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  return event.node.req.socket.remoteAddress || 'unknown'
}
