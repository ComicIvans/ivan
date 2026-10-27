import type { IncomingMessage } from 'node:http'
import type { H3Event } from 'h3'
import { createError, getRequestHeader, readRawBody, setResponseHeader } from 'h3'

// Where h3's readRawBody/readBody cache the body on the Node request.
const H3_RAW_BODY = Symbol.for('h3RawBody')

/**
 * Buffers the request body while it stays within `maxBytes`; resolves null
 * as soon as it grows past the limit. The request stream is never destroyed:
 * that would close the socket under the 413 response still to be written (and
 * the server's per-request bookkeeping then throws on the finished response).
 * Once over the limit, the rest of the body keeps flowing and is discarded.
 */
function readBodyWithin(request: IncomingMessage, maxBytes: number): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    // Already consumed elsewhere: nothing left to read.
    if (request.readableEnded) {
      resolve(Buffer.alloc(0))
      return
    }

    const chunks: Buffer[] = []
    let receivedBytes = 0

    const stopListening = () => {
      request.off('data', onData)
      request.off('end', onEnd)
      request.off('error', onError)
    }
    const onData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      receivedBytes += buffer.byteLength
      if (receivedBytes <= maxBytes) {
        chunks.push(buffer)
        return
      }
      stopListening()
      chunks.length = 0
      request.resume()
      resolve(null)
    }
    const onEnd = () => {
      stopListening()
      resolve(Buffer.concat(chunks))
    }
    const onError = (error: Error) => {
      stopListening()
      reject(error)
    }

    request.on('data', onData)
    request.on('end', onEnd)
    request.on('error', onError)
  })
}

/**
 * Reads a JSON request body, refusing anything larger than `maxBytes` while
 * it streams in. Returns undefined for an empty body.
 */
export async function readLimitedJsonBody(
  event: H3Event,
  maxBytes: number,
  errorMessage: string
): Promise<unknown> {
  // An oversized body is not read to the end, so the connection closes after
  // the 413 instead of being reused for a next request.
  const tooLarge = () => {
    setResponseHeader(event, 'connection', 'close')
    return createError({ statusCode: 413, statusMessage: errorMessage })
  }

  const contentLength = Number(getRequestHeader(event, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw tooLarge()

  let body: Buffer

  if (H3_RAW_BODY in event.node.req) {
    // A middleware already read the stream through h3 (e.g. nuxt-security's
    // xssValidator, unless a route rule turns it off), so the stream would
    // look empty now; h3 keeps what it buffered.
    body = (await readRawBody(event, false)) ?? Buffer.alloc(0)
    if (body.byteLength > maxBytes) throw tooLarge()
  } else {
    const received = await readBodyWithin(event.node.req, maxBytes)
    if (!received) throw tooLarge()
    body = received
  }

  if (body.byteLength === 0) return undefined

  try {
    return JSON.parse(body.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }
}
