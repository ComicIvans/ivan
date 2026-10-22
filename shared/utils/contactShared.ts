import { EMAIL_MAX_LENGTH } from './emailValidation'

export const CONTACT_FIELD_LIMITS = {
  name: {
    min: 2,
    max: 100,
  },
  emailMax: EMAIL_MAX_LENGTH,
  subject: {
    min: 3,
    max: 200,
  },
  message: {
    min: 10,
    max: 5000,
  },
  honeypotMax: 256,
} as const

// Minimum delay (ms) between rendering the form and a genuine submission.
// Bots typically submit instantly; humans take longer.
export const CONTACT_MIN_SUBMIT_DELAY_MS = 2000

/**
 * Error codes the contact schema reports for each field. They double as the
 * keys of `contactPage.form.errors.*`, so the form shows them in the visitor's
 * language. Kept here, outside the zod module, so the form can map codes
 * without loading zod.
 */
export const CONTACT_FIELD_ERRORS = [
  'nameRequired',
  'nameMin',
  'nameMax',
  'emailRequired',
  'emailInvalid',
  'subjectRequired',
  'subjectMin',
  'subjectMax',
  'messageRequired',
  'messageMin',
  'messageMax',
] as const

export type ContactFieldError = (typeof CONTACT_FIELD_ERRORS)[number]

export function isContactFieldError(value: unknown): value is ContactFieldError {
  return (CONTACT_FIELD_ERRORS as readonly unknown[]).includes(value)
}
