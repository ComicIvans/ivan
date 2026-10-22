import { z } from 'zod'

import { siteLocales, type SiteLocaleCode } from '../constants/locales'
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_MAX_SUBMIT_DELAY_MS,
  type ContactFieldError,
} from './contactShared'
import { EMAIL_PATTERN } from './emailValidation'

// zod compiles object parsers with `new Function` unless it runs jitless, and
// even its capability probe is reported as a violation by a CSP without
// 'unsafe-eval'. It must be set before the first z.object() is created.
z.config({ jitless: true })

const fail = (error: ContactFieldError) => ({ error })
// zod 4 runs every later check after a failed one unless it aborts. The
// length limits abort, so an oversized value never reaches the next checks
// (the email pattern in particular).
const failFast = (error: ContactFieldError) => ({ error, abort: true })

// Single-line fields: line breaks, tabs and other control characters collapse
// into one space, so a name or subject cannot add lines to the email.
const toSingleLine = (value: string) => value.replace(/[\s\p{Cc}]+/gu, ' ').trim()

/**
 * Single source of truth for contact form validation, shared by the client
 * (UForm) and the server handler. Every issue message is a
 * `ContactFieldError` code: the form translates it, the server only answers
 * with a generic validation error.
 */
export const contactFormSchema = z.object({
  name: z
    .string(fail('nameRequired'))
    .overwrite(toSingleLine)
    .min(1, failFast('nameRequired'))
    .min(CONTACT_FIELD_LIMITS.name.min, fail('nameMin'))
    .max(CONTACT_FIELD_LIMITS.name.max, failFast('nameMax')),
  email: z
    .string(fail('emailRequired'))
    .trim()
    .min(1, failFast('emailRequired'))
    .max(CONTACT_FIELD_LIMITS.emailMax, failFast('emailInvalid'))
    .regex(EMAIL_PATTERN, fail('emailInvalid')),
  subject: z
    .string(fail('subjectRequired'))
    .overwrite(toSingleLine)
    .min(1, failFast('subjectRequired'))
    .min(CONTACT_FIELD_LIMITS.subject.min, fail('subjectMin'))
    .max(CONTACT_FIELD_LIMITS.subject.max, failFast('subjectMax')),
  message: z
    .string(fail('messageRequired'))
    .trim()
    .min(1, failFast('messageRequired'))
    .min(CONTACT_FIELD_LIMITS.message.min, fail('messageMin'))
    .max(CONTACT_FIELD_LIMITS.message.max, failFast('messageMax')),
  // Honeypot: must stay empty. Bots tend to fill every field.
  website: z.string().max(CONTACT_FIELD_LIMITS.honeypotMax).optional(),
})

const localeCodes = siteLocales.map(({ code }) => code) as [SiteLocaleCode, ...SiteLocaleCode[]]

/**
 * What the form actually posts: its fields plus request metadata the form
 * state does not hold (so UForm never validates them).
 */
export const contactRequestSchema = contactFormSchema.extend({
  // Site language the visitor wrote from, shown in the email.
  locale: z.enum(localeCodes).optional(),
  // Milliseconds between the form appearing and the submission, measured on
  // the visitor's device only (for the submit-timing check). The form always
  // sends it and a monotonic clock never goes negative, so a missing,
  // negative or absurdly large value is a forged request.
  elapsedMs: z.number().int().min(0).max(CONTACT_MAX_SUBMIT_DELAY_MS),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
