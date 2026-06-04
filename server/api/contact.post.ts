import { defineEventHandler, readBody, createError } from 'h3'
import {
  getRequiredSiteUrl,
  getRequiredSmtpFromEmail,
  getRequiredSmtpToEmail,
} from '../utils/runtimeConfig'
import { enforceRateLimit } from '../utils/rateLimit'
import { getSmtpTransporter } from '../utils/smtp'
import { validatePublicBody } from '../utils/validatePublicBody'
import { contactFormSchema } from '~~/shared/utils/contactValidation'
import { CONTACT_MIN_SUBMIT_DELAY_MS } from '~~/shared/utils/contactShared'

const CONTACT_ERROR_CODES = {
  validation: 'CONTACT_VALIDATION',
  prohibitedContent: 'CONTACT_PROHIBITED_CONTENT',
  rateLimited: 'CONTACT_RATE_LIMITED',
  sendFailed: 'CONTACT_SEND_FAILED',
  serviceUnavailable: 'CONTACT_SERVICE_UNAVAILABLE',
} as const

// Structural spam signals only. Ambiguous keyword matching (crypto, investment,
// winner, ...) was removed: it blocked legitimate messages from a cybersecurity
// professional. The honeypot, submit-timing check and rate limiter carry the load.
const SPAM_PATTERNS = [/\[url=/i, /\[link=/i, /<a\s+href/i, /https?:\/\/[^\s]{256,}/i, /(.)\1{10,}/]

function hasSpamPatterns(text: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(text))
}

// Email header fields must never contain CR/LF/NUL (header injection).
function assertNoHeaderInjection(value: string) {
  if (/[\r\n\0]/.test(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.validation,
    })
  }
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    namespace: 'contact',
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    errorMessage: CONTACT_ERROR_CODES.rateLimited,
  })

  const body = validatePublicBody(
    contactFormSchema,
    await readBody(event),
    CONTACT_ERROR_CODES.validation
  )

  // Honeypot: silently accept (don't reveal the trap to bots).
  if (body.website && body.website.trim() !== '') {
    return { success: true }
  }

  // Submit-timing check: genuine humans take longer than a couple of seconds.
  if (
    typeof body.startedAt === 'number' &&
    Date.now() - body.startedAt < CONTACT_MIN_SUBMIT_DELAY_MS
  ) {
    return { success: true }
  }

  const { name, email, subject, message } = body

  assertNoHeaderInjection(email)
  assertNoHeaderInjection(subject)

  if (hasSpamPatterns(`${name} ${subject} ${message}`)) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.prohibitedContent,
    })
  }

  const siteUrl = getRequiredSiteUrl(event, CONTACT_ERROR_CODES.serviceUnavailable)
  const fromEmail = getRequiredSmtpFromEmail(event, CONTACT_ERROR_CODES.serviceUnavailable)
  const toEmail = getRequiredSmtpToEmail(event, CONTACT_ERROR_CODES.serviceUnavailable)

  const transporter = getSmtpTransporter(event, CONTACT_ERROR_CODES.serviceUnavailable)

  const emailContent = `
Nuevo mensaje de contacto desde el portfolio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 De: ${name} <${email}>
📋 Asunto: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enviado desde: ${siteUrl}
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
  `.trim()

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: emailContent,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending contact email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: CONTACT_ERROR_CODES.sendFailed,
    })
  }
})
