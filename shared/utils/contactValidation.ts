import { z } from 'zod'

import { CONTACT_FIELD_LIMITS } from './contactShared'
import { EMAIL_PATTERN } from './emailValidation'

/**
 * Single source of truth for contact form validation, shared by the client
 * (UForm) and the server handler. Keeping one schema guarantees the two can
 * never drift apart.
 */
export const contactFormSchema = z.object({
  name: z.string().trim().min(CONTACT_FIELD_LIMITS.name.min).max(CONTACT_FIELD_LIMITS.name.max),
  email: z.string().trim().regex(EMAIL_PATTERN).max(CONTACT_FIELD_LIMITS.emailMax),
  subject: z
    .string()
    .trim()
    .min(CONTACT_FIELD_LIMITS.subject.min)
    .max(CONTACT_FIELD_LIMITS.subject.max),
  message: z
    .string()
    .trim()
    .min(CONTACT_FIELD_LIMITS.message.min)
    .max(CONTACT_FIELD_LIMITS.message.max),
  // Honeypot: must stay empty. Bots tend to fill every field.
  website: z.string().max(CONTACT_FIELD_LIMITS.honeypotMax).optional(),
  // Timestamp (ms) when the form was first rendered, for the submit-timing check.
  startedAt: z.coerce.number().int().positive().optional(),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
