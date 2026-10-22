import { createError, defineEventHandler, getRequestURL } from 'h3'

// /_ipx is public and unsigned, and IPX encodes any format it supports (AVIF
// and HEIF cost the most) for whoever asks. The site only requests WebP and,
// for the Open Graph cover of a gallery event, JPEG; without a format IPX
// keeps the source format.
const IPX_PREFIX = '/_ipx/'
const ALLOWED_FORMATS = new Set(['webp', 'jpeg', 'jpg'])
// IPX's own syntax: `w_640&f_webp` (or `,`), with `_`, `:` or `=` between a
// modifier and its value; `_` alone means no modifiers.
const MODIFIER_SEPARATOR = /[&,]/
const VALUE_SEPARATOR = /[:=_]/

function decodeValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith(IPX_PREFIX)) return

  const modifiers = pathname.slice(IPX_PREFIX.length).split('/', 1)[0] ?? ''
  if (modifiers === '_') return

  // Every occurrence: IPX keeps the last one of a repeated modifier.
  for (const modifier of modifiers.split(MODIFIER_SEPARATOR)) {
    const [name = '', ...values] = modifier.split(VALUE_SEPARATOR)
    if (name !== 'f' && name !== 'format') continue
    const format = values.map(decodeValue).join('_').toLowerCase()
    if (!ALLOWED_FORMATS.has(format)) {
      throw createError({ statusCode: 400, statusMessage: 'Unsupported image format' })
    }
  }
})
