import type { H3Event } from 'h3'
import { createError, getRequestHeader, readRawBody } from 'h3'

// Where h3's readRawBody/readBody cache the body on the Node request.
const H3_RAW_BODY = Symbol.for('h3RawBody')

/**
 * Reads a JSON request body, refusing anything larger than `maxBytes` while
 * it streams in. Returns undefined for an empty body.
 */
export async function readLimitedJsonBody(
  event: H3Event,
  maxBytes: number,
  errorMessage: string
): Promise<unknown> {
  const contentLength = Number(getRequestHeader(event, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: errorMessage })
  }

  const tooLarge = () => createError({ statusCode: 413, statusMessage: errorMessage })
  let body: Buffer

  if (H3_RAW_BODY in event.node.req) {
    // A middleware already read the stream through h3 (e.g. nuxt-security's
    // xssValidator, unless a route rule turns it off), so the loop below
    // would see an empty body; h3 keeps what it buffered.
    body = (await readRawBody(event, false)) ?? Buffer.alloc(0)
    if (body.byteLength > maxBytes) throw tooLarge()
  } else {
    const chunks: Buffer[] = []
    let receivedBytes = 0

    for await (const chunk of event.node.req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      receivedBytes += buffer.byteLength
      if (receivedBytes > maxBytes) throw tooLarge()
      chunks.push(buffer)
    }

    body = Buffer.concat(chunks)
  }

  if (body.byteLength === 0) return undefined

  try {
    return JSON.parse(body.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }
}
