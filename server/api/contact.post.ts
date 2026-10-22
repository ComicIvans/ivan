import type { H3Event } from 'h3'
import { defineEventHandler, createError, getRequestHeader, getRequestHost } from 'h3'
import {
  getRequiredSiteUrl,
  getRequiredSmtpFromEmail,
  getRequiredSmtpToEmail,
} from '../utils/runtimeConfig'
import { countSharedBudget, enforceRateLimit, isSharedBudgetSpent } from '../utils/rateLimit'
import { getSmtpTransporter } from '../utils/smtp'
import { validatePublicBody } from '../utils/validatePublicBody'
import { contactRequestSchema } from '~~/shared/utils/contactValidation'
import { CONTACT_MIN_SUBMIT_DELAY_MS } from '~~/shared/utils/contactShared'
import { readLimitedJsonBody } from '../utils/readLimitedJsonBody'

const MAX_CONTACT_BODY_BYTES = 32 * 1024
// Site-wide cap on the emails actually sent, whatever address they come
// from: the per-client limit alone does not bound a flood spread over many
// addresses. Far above the real traffic of a personal site, low enough that
// a flood cannot get the SMTP account throttled or suspended.
const SITE_DAILY_EMAIL_LIMIT = 40
const SITE_EMAIL_BUDGET = {
  namespace: 'contact-all',
  bucket: 'site',
  maxRequests: SITE_DAILY_EMAIL_LIMIT,
  windowMs: 24 * 60 * 60 * 1000,
}

const CONTACT_ERROR_CODES = {
  validation: 'CONTACT_VALIDATION',
  prohibitedContent: 'CONTACT_PROHIBITED_CONTENT',
  rateLimited: 'CONTACT_RATE_LIMITED',
  dailyLimit: 'CONTACT_DAILY_LIMIT',
  sendFailed: 'CONTACT_SEND_FAILED',
  serviceUnavailable: 'CONTACT_SERVICE_UNAVAILABLE',
} as const

// Structural spam signals only. Ambiguous keyword matching (crypto, investment,
// winner, ...) was removed: it blocked legitimate messages from a cybersecurity
// professional. The honeypot, submit-timing check and rate limiter carry the load.
// Long runs of one letter or digit count as spam; separator lines such as
// "----------" or "..........." do not.
const SPAM_PATTERNS = [
  /\[url=/i,
  /\[link=/i,
  /<a\s+href/i,
  /https?:\/\/[^\s]{256,}/i,
  /([\p{L}\p{N}])\1{19,}/u,
]

// The email is Spanish by design; this names the visitor's site language.
const languageNames = new Intl.DisplayNames(['es'], { type: 'language' })

const EMAIL_RULE = '-'.repeat(40)

function hasSpamPatterns(text: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(text))
}

// Email header fields must never contain CR/LF/NUL (header injection). The
// schema already rejects them in the address and collapses them in the
// subject; this keeps the guarantee next to the headers.
function assertNoHeaderInjection(value: string) {
  if (/[\r\n\0]/.test(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.validation,
    })
  }
}

/**
 * The form posts JSON with $fetch from the site itself. A page on another
 * site can only send a "simple" cross-site request (text/plain, no
 * preflight), which would let every visitor of that page submit the form from
 * their own address. Such requests are refused before anything is read or
 * counted.
 */
function assertSameSiteJsonRequest(event: H3Event) {
  const mediaType = getRequestHeader(event, 'content-type')?.split(';')[0]?.trim().toLowerCase()
  if (mediaType !== 'application/json') {
    throw createError({ statusCode: 415, statusMessage: CONTACT_ERROR_CODES.validation })
  }

  // Current browsers send Sec-Fetch-Site to HTTPS sites (`none`: typed or
  // bookmarked); Origin covers older ones. Origin may name either the Host the
  // request was sent to (local previews, or a proxy that passes Host through)
  // or the canonical SITE_URL host, so a proxy that forwards its upstream
  // address as Host (nginx's proxy_pass default) does not reject the form.
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  const origin = getRequestHeader(event, 'origin')
  const crossSite =
    (fetchSite !== undefined && fetchSite !== 'same-origin' && fetchSite !== 'none') ||
    (origin !== undefined && !isOwnOrigin(event, origin))
  if (crossSite) {
    throw createError({ statusCode: 403, statusMessage: CONTACT_ERROR_CODES.validation })
  }
}

function isOwnOrigin(event: H3Event, origin: string): boolean {
  const host = originHost(origin)
  if (host === null) return false
  if (host === getRequestHost(event)) return true
  return host === originHost(getRequiredSiteUrl(event, CONTACT_ERROR_CODES.serviceUnavailable))
}

function originHost(origin: string): string | null {
  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  assertSameSiteJsonRequest(event)

  await enforceRateLimit(event, {
    namespace: 'contact',
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    errorMessage: CONTACT_ERROR_CODES.rateLimited,
  })

  const body = validatePublicBody(
    contactRequestSchema,
    await readLimitedJsonBody(event, MAX_CONTACT_BODY_BYTES, CONTACT_ERROR_CODES.validation),
    CONTACT_ERROR_CODES.validation
  )

  // Honeypot and submit timing: answer as if the message was sent (so bots
  // learn nothing), but log the drop so lost messages can be noticed.
  if (body.website && body.website.trim() !== '') {
    console.warn('[contact] Dropped a submission: the honeypot field was filled')
    return { success: true }
  }

  // elapsedMs is measured on the visitor's device alone; the schema already
  // rejects a missing or out-of-range value.
  if (body.elapsedMs < CONTACT_MIN_SUBMIT_DELAY_MS) {
    console.warn(`[contact] Dropped a submission sent ${body.elapsedMs} ms after the form appeared`)
    return { success: true }
  }

  const { name, email, subject, message, locale } = body

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

  // The site-wide cap is checked here and counted only once the email has
  // gone out, so rejected, dropped or failed submissions never use it up.
  // Sends already in flight when it fills up can pass it by that many. The
  // visitor did nothing wrong, so the answer is a 503 with its own message,
  // not the per-client "too many messages".
  if (await isSharedBudgetSpent(SITE_EMAIL_BUDGET)) {
    throw createError({
      statusCode: 503,
      statusMessage: CONTACT_ERROR_CODES.dailyLimit,
    })
  }

  const language = locale ? `${languageNames.of(locale) ?? locale} (${locale})` : 'desconocido'

  const emailContent = `
Nuevo mensaje de contacto desde el portfolio

${EMAIL_RULE}
De: ${name} <${email}>
Asunto: ${subject}
Idioma de la web: ${language}
${EMAIL_RULE}

${message}

${EMAIL_RULE}
Enviado desde: ${siteUrl}
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
  `.trim()

  try {
    await transporter.sendMail({
      from: `"Contacto del portfolio" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: emailContent,
    })
  } catch (error) {
    console.error('Error sending contact email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: CONTACT_ERROR_CODES.sendFailed,
    })
  }

  const sentToday = await countSharedBudget(SITE_EMAIL_BUDGET)
  if (sentToday === SITE_DAILY_EMAIL_LIMIT) {
    console.warn(
      `[contact] Site-wide limit of ${SITE_DAILY_EMAIL_LIMIT} emails a day reached: further messages are refused until the window ends`
    )
  }

  return { success: true }
})
