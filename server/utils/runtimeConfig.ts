import type { H3Event } from 'h3'
import { createError } from 'h3'
import {
  ConfigError,
  requireConfigBoolean,
  requireConfigPositiveInt,
  requireConfigString,
  requireConfigUrl,
} from '~~/shared/utils/config'

export interface SmtpTransportConfig {
  auth: {
    pass: string
    user: string
  }
  host: string
  port: number
  secure: boolean
}

const getRuntimeConfig = (event?: H3Event) => (event ? useRuntimeConfig(event) : useRuntimeConfig())

const rethrowConfigError = (error: unknown, publicMessage: string): never => {
  if (error instanceof ConfigError) {
    console.error(error.message)
    throw createError({
      statusCode: 500,
      statusMessage: publicMessage,
    })
  }

  throw error
}

const getRequiredRuntimeConfigString = (
  value: unknown,
  key: string,
  publicMessage = 'Server configuration error.'
) => {
  try {
    return requireConfigString(value, key)
  } catch (error) {
    return rethrowConfigError(error, publicMessage)
  }
}

const getRequiredRuntimeConfigUrl = (
  value: unknown,
  key: string,
  publicMessage = 'Server configuration error.'
) => {
  try {
    return requireConfigUrl(value, key)
  } catch (error) {
    return rethrowConfigError(error, publicMessage)
  }
}

const getRequiredRuntimeConfigPositiveInt = (
  value: unknown,
  key: string,
  publicMessage = 'Server configuration error.'
) => {
  try {
    return requireConfigPositiveInt(value, key)
  } catch (error) {
    return rethrowConfigError(error, publicMessage)
  }
}

const getRequiredRuntimeConfigBoolean = (
  value: unknown,
  key: string,
  publicMessage = 'Server configuration error.'
) => {
  try {
    return requireConfigBoolean(value, key)
  } catch (error) {
    return rethrowConfigError(error, publicMessage)
  }
}

export const getRequiredSiteUrl = (
  event?: H3Event,
  publicMessage = 'Site URL is not configured.'
) => {
  const runtimeConfig = getRuntimeConfig(event)
  return getRequiredRuntimeConfigUrl(runtimeConfig.siteUrl, 'SITE_URL', publicMessage)
}

export const getRequiredSmtpTransportConfig = (
  event?: H3Event,
  publicMessage = 'Email service not configured.'
): SmtpTransportConfig => {
  const runtimeConfig = getRuntimeConfig(event)

  return {
    auth: {
      pass: getRequiredRuntimeConfigString(runtimeConfig.smtpPass, 'NUXT_SMTP_PASS', publicMessage),
      user: getRequiredRuntimeConfigString(runtimeConfig.smtpUser, 'NUXT_SMTP_USER', publicMessage),
    },
    host: getRequiredRuntimeConfigString(runtimeConfig.smtpHost, 'NUXT_SMTP_HOST', publicMessage),
    port: getRequiredRuntimeConfigPositiveInt(
      runtimeConfig.smtpPort,
      'NUXT_SMTP_PORT',
      publicMessage
    ),
    secure: getRequiredRuntimeConfigBoolean(
      runtimeConfig.smtpSecure,
      'NUXT_SMTP_SECURE',
      publicMessage
    ),
  }
}

export const getRequiredSmtpFromEmail = (
  event?: H3Event,
  publicMessage = 'Email service not configured.'
) => {
  const runtimeConfig = getRuntimeConfig(event)
  return getRequiredRuntimeConfigString(
    runtimeConfig.smtpFromEmail,
    'NUXT_SMTP_FROM_EMAIL',
    publicMessage
  )
}

export const getRequiredSmtpToEmail = (
  event?: H3Event,
  publicMessage = 'Email service not configured.'
) => {
  const runtimeConfig = getRuntimeConfig(event)
  return getRequiredRuntimeConfigString(
    runtimeConfig.smtpToEmail,
    'NUXT_SMTP_TO_EMAIL',
    publicMessage
  )
}
