import { defineEventHandler, setResponseStatus } from 'h3'
import { enforceRateLimit } from '../utils/rateLimit'
import { readLimitedJsonBody } from '../utils/readLimitedJsonBody'

const MAX_CSP_REPORT_BYTES = 64 * 1024
const MAX_REPORTS_PER_REQUEST = 10
const MAX_LOGGED_VALUE_LENGTH = 300

// Logged fields, by their legacy `report-uri` name and their Reporting API
// (`report-to`) name. The policy itself is left out: it is long and already
// known.
const CSP_REPORT_FIELDS = [
  ['blocked-uri', 'blockedURL'],
  ['document-uri', 'documentURL'],
  ['effective-directive', 'effectiveDirective'],
  ['violated-directive', 'violatedDirective'],
  ['source-file', 'sourceFile'],
  ['line-number', 'lineNumber'],
  ['script-sample', 'sample'],
] as const

function summarizeReport(report: Record<string, unknown>) {
  return Object.fromEntries(
    CSP_REPORT_FIELDS.flatMap(([field, reportingApiField]) => {
      const value = report[field] ?? report[reportingApiField]
      if (value === undefined || value === null) return []
      const text = typeof value === 'string' ? value : JSON.stringify(value)
      return [[field, text.slice(0, MAX_LOGGED_VALUE_LENGTH)]]
    })
  )
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function normalizeReports(payload: unknown): Record<string, unknown>[] {
  // Reporting API: an array of { type, body } entries.
  if (Array.isArray(payload)) {
    return payload.flatMap((entry) => {
      const record = asRecord(entry)
      const body = asRecord(record?.body) ?? record
      return body ? [body] : []
    })
  }

  const report = asRecord(payload)
  if (!report) return []

  // Legacy report-uri: { "csp-report": { ... } }.
  return [asRecord(report['csp-report']) ?? asRecord(report.body) ?? report]
}

export default defineEventHandler(async (event) => {
  // One page load can report several violations; this caps how much a single
  // client can write to the logs.
  await enforceRateLimit(event, {
    namespace: 'csp-report',
    maxRequests: 30,
    windowMs: 60 * 1000,
    errorMessage: 'CSP_REPORT_RATE_LIMITED',
  })

  const payload = await readLimitedJsonBody(event, MAX_CSP_REPORT_BYTES, 'CSP_REPORT_TOO_LARGE')
  const reports = normalizeReports(payload)
    .slice(0, MAX_REPORTS_PER_REQUEST)
    .map(summarizeReport)
    .filter((summary) => Object.keys(summary).length > 0)

  if (reports.length > 0) {
    console.warn('[csp-violation]', JSON.stringify(reports))
  }

  setResponseStatus(event, 204)
  return null
})
