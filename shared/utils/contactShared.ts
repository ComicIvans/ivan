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
