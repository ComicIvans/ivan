import type { H3Event } from 'h3'
import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import nodemailer from 'nodemailer'
import {
  getRequiredSiteUrl,
  getRequiredSmtpFromEmail,
  getRequiredSmtpToEmail,
  getRequiredSmtpTransportConfig,
} from '../utils/runtimeConfig'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  website?: string
}

const rateLimitMap = new Map<string, { count: number; firstRequest: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const CONTACT_ERROR_CODES = {
  invalidEmail: 'CONTACT_INVALID_EMAIL',
  messageLength: 'CONTACT_MESSAGE_LENGTH',
  missingFields: 'CONTACT_MISSING_FIELDS',
  nameLength: 'CONTACT_NAME_LENGTH',
  prohibitedContent: 'CONTACT_PROHIBITED_CONTENT',
  rateLimited: 'CONTACT_RATE_LIMITED',
  sendFailed: 'CONTACT_SEND_FAILED',
  serviceUnavailable: 'CONTACT_SERVICE_UNAVAILABLE',
  subjectLength: 'CONTACT_SUBJECT_LENGTH',
} as const

function cleanupRateLimitMap(now: number) {
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip)
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  cleanupRateLimitMap(now)
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now })
    return false
  }

  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now })
    return false
  }

  record.count++
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  return false
}

function getClientIp(event: H3Event): string {
  return getHeader(event, 'x-real-ip')?.trim() || event.node.req.socket.remoteAddress || 'unknown'
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '').trim().slice(0, 5000)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

function hasSpamPatterns(text: string): boolean {
  const spamPatterns = [
    /\[url=/i,
    /\[link=/i,
    /<a\s+href/i,
    /http[s]?:\/\/[^\s]{50,}/i,
    /(.)\1{10,}/i,
    /viagra|cialis|casino|lottery|winner|bitcoin|crypto|investment|earn money/i,
  ]

  return spamPatterns.some((pattern) => pattern.test(text))
}

export default defineEventHandler(async (event) => {
  const clientIp = getClientIp(event)

  if (isRateLimited(clientIp)) {
    throw createError({
      statusCode: 429,
      statusMessage: CONTACT_ERROR_CODES.rateLimited,
    })
  }

  const body = await readBody<ContactFormData>(event)

  if (body.website && body.website.trim() !== '') {
    return {
      success: true,
    }
  }

  if (!body.name || !body.email || !body.subject || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.missingFields,
    })
  }

  const name = sanitizeInput(body.name)
  const email = sanitizeInput(body.email)
  const subject = sanitizeInput(body.subject)
  const message = sanitizeInput(body.message)

  if (name.length < 2 || name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.nameLength,
    })
  }

  if (subject.length < 3 || subject.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.subjectLength,
    })
  }

  if (message.length < 10 || message.length > 5000) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.messageLength,
    })
  }

  if (!isValidEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.invalidEmail,
    })
  }

  const fullText = `${name} ${subject} ${message}`
  if (hasSpamPatterns(fullText)) {
    throw createError({
      statusCode: 400,
      statusMessage: CONTACT_ERROR_CODES.prohibitedContent,
    })
  }

  const siteUrl = getRequiredSiteUrl(event, CONTACT_ERROR_CODES.serviceUnavailable)
  const fromEmail = getRequiredSmtpFromEmail(event, CONTACT_ERROR_CODES.serviceUnavailable)
  const toEmail = getRequiredSmtpToEmail(event, CONTACT_ERROR_CODES.serviceUnavailable)

  const transporter = nodemailer.createTransport({
    ...getRequiredSmtpTransportConfig(event, CONTACT_ERROR_CODES.serviceUnavailable),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  })

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
    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: emailContent,
    })

    console.log('Email sent successfully:', info.messageId)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: CONTACT_ERROR_CODES.sendFailed,
    })
  }
})
