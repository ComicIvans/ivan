import { createError } from 'h3'
import type { z } from 'zod'

/**
 * Validates an untrusted request body against a zod schema. On failure it
 * throws a 400 with the given status message (a stable, client-mappable code)
 * instead of leaking field-level details to the public.
 */
export function validatePublicBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
  statusMessage: string
): T {
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage,
    })
  }

  return result.data
}
