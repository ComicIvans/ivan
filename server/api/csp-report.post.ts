import { defineEventHandler, readBody, getRequestHeader, setResponseStatus, createError } from 'h3'
import { enforceRateLimit } from '../utils/rateLimit'

const MAX_CSP_REPORT_BYTES = 64 * 1024
const CSP_REPORT_FIELDS = [
  'blocked-uri',
  'document-uri',
  'effective-directive',
  'violated-directive',
  'original-policy',
  'source-file',
  'line-number',
] as const

function summarizeReport(report: Record<string, unknown>) {
  return Object.fromEntries(
    CSP_REPORT_FIELDS.flatMap((field) => {
      const value = report[field]
      return value === undefined || value === null ? [] : [[field, value]]
    })
  )
}

function normalizeReports(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object'
    )
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const report = payload as Record<string, unknown>

  if (report['csp-report'] && typeof report['csp-report'] === 'object') {
    return [report['csp-report'] as Record<string, unknown>]
  }

  if (report.body && typeof report.body === 'object') {
    return [report.body as Record<string, unknown>]
  }

  return [report]
}

export default defineEventHandler(async (event) => {
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_CSP_REPORT_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'CSP_REPORT_TOO_LARGE' })
  }

  await enforceRateLimit(event, {
    namespace: 'csp-report',
    maxRequests: 120,
    windowMs: 60 * 1000,
    errorMessage: 'CSP_REPORT_RATE_LIMITED',
  })

  const reports = normalizeReports(await readBody(event)).map(summarizeReport)

  if (reports.length > 0) {
    console.warn('[csp-violation]', JSON.stringify(reports))
  }

  setResponseStatus(event, 204)
  return null
})
