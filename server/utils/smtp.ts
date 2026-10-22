import { isIPv4 } from 'node:net'
import type { H3Event } from 'h3'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { getRequiredSmtpTransportConfig } from './runtimeConfig'

function isLoopbackHost(host: string): boolean {
  const name = host.toLowerCase().replace(/^\[(.*)\]$/, '$1')
  if (name === 'localhost' || name === '::1') return true
  return isIPv4(name) && name.startsWith('127.')
}

let cachedTransporter: Transporter | null = null
let cachedConfigKey: string | null = null

/**
 * Returns a singleton, connection-pooled SMTP transporter. Reused across
 * requests to avoid a fresh TCP/TLS handshake every time. Recreated only if
 * the SMTP configuration changes.
 */
export function getSmtpTransporter(event?: H3Event, publicMessage?: string): Transporter {
  const config = getRequiredSmtpTransportConfig(event, publicMessage)
  const configKey = JSON.stringify(config)

  if (cachedTransporter && cachedConfigKey === configKey) {
    return cachedTransporter
  }

  cachedTransporter?.close()
  cachedTransporter = nodemailer.createTransport({
    ...config,
    // Without implicit TLS (NUXT_SMTP_SECURE=false, e.g. port 587), insist on
    // STARTTLS: otherwise someone on the network path who strips the server's
    // STARTTLS offer would read the credentials and the messages. A relay on
    // this machine's loopback interface never crosses a network.
    requireTLS: !config.secure && !isLoopbackHost(config.host),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  })
  cachedConfigKey = configKey

  return cachedTransporter
}
