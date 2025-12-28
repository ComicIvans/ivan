import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import nodemailer from 'nodemailer'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  // Honeypot field - should be empty
  website?: string
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms
const MAX_REQUESTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now })
    return false
  }

  // Reset if window has passed
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now })
    return false
  }

  // Increment and check
  record.count++
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  return false
}

// Sanitize input to prevent injection attacks
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 5000) // Limit length
}

// Validate email more strictly
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// Check for spam patterns
function hasSpamPatterns(text: string): boolean {
  const spamPatterns = [
    /\[url=/i,
    /\[link=/i,
    /<a\s+href/i,
    /http[s]?:\/\/[^\s]{50,}/i, // Very long URLs
    /(.)\1{10,}/i, // Repeated characters
    /viagra|cialis|casino|lottery|winner|bitcoin|crypto|investment|earn money/i,
  ]

  return spamPatterns.some((pattern) => pattern.test(text))
}

export default defineEventHandler(async (event) => {
  // Get client IP for rate limiting
  const clientIp =
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  // Check rate limit
  if (isRateLimited(clientIp)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }

  const body = await readBody<ContactFormData>(event)

  // Honeypot check - if filled, it's a bot
  if (body.website && body.website.trim() !== '') {
    // Silently accept but don't send (fool the bot)
    return {
      success: true,
      message: 'Message received',
    }
  }

  // Validate required fields
  if (!body.name || !body.email || !body.subject || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  // Sanitize inputs
  const name = sanitizeInput(body.name)
  const email = sanitizeInput(body.email)
  const subject = sanitizeInput(body.subject)
  const message = sanitizeInput(body.message)

  // Validate field lengths
  if (name.length < 2 || name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name must be between 2 and 100 characters',
    })
  }

  if (subject.length < 3 || subject.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Subject must be between 3 and 200 characters',
    })
  }

  if (message.length < 10 || message.length > 5000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message must be between 10 and 5000 characters',
    })
  }

  // Validate email format
  if (!isValidEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    })
  }

  // Check for spam patterns
  const fullText = `${name} ${subject} ${message}`
  if (hasSpamPatterns(fullText)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message contains prohibited content',
    })
  }

  // Get runtime config for SMTP settings
  const config = useRuntimeConfig()

  // Validate SMTP configuration
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.smtpToEmail) {
    console.error('SMTP configuration missing:', {
      hasHost: !!config.smtpHost,
      hasUser: !!config.smtpUser,
      hasPass: !!config.smtpPass,
      hasToEmail: !!config.smtpToEmail,
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Email service not configured',
    })
  }

  // Create nodemailer transporter with timeouts to prevent NGINX connection issues
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: config.smtpSecure === 'true',
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000, // 30 seconds
  })

  // Build email content
  const emailContent = `
Nuevo mensaje de contacto desde el portfolio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 De: ${name} <${email}>
📋 Asunto: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enviado desde: ${config.public.siteUrl}
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
  `.trim()

  try {
    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${config.smtpUser}>`,
      to: config.smtpToEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: emailContent,
    })

    console.log('Email sent successfully:', info.messageId)

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email. Please try again later.',
    })
  }
})
