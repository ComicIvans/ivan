import type { H3Event } from 'h3'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { getRequiredSmtpTransportConfig } from './runtimeConfig'

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
