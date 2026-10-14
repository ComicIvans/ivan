import type { H3Event } from 'h3'
import { createError, getRequestHeader } from 'h3'

export async function readLimitedJsonBody(
  event: H3Event,
  maxBytes: number,
  errorMessage: string
): Promise<unknown> {
  const contentLength = Number(getRequestHeader(event, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: errorMessage })
  }

  const chunks: Buffer[] = []
  let receivedBytes = 0

  for await (const chunk of event.node.req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    receivedBytes += buffer.byteLength
    if (receivedBytes > maxBytes) {
      throw createError({ statusCode: 413, statusMessage: errorMessage })
    }
    chunks.push(buffer)
  }

  if (receivedBytes === 0) return undefined

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }
}
