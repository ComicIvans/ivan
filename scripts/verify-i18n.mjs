// Checks the i18n message files: every locale has the same key tree as the
// Spanish source (same lists, same ids, same placeholders), no message is
// empty, and no message uses vue-i18n syntax by accident. In a message, `|`
// separates plural forms, `{x}` is a placeholder and `@` starts a linked
// message, so "a | b" silently renders only "a". Write a literal character
// as {'|'}, {'@'}, {'{'} or {'}'}.
//
// Usage: node scripts/verify-i18n.mjs
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defaultLocale, siteLocales } from '../shared/constants/locales.ts'

const root = resolve(import.meta.dirname, '..')
const errors = []

const load = (file) => JSON.parse(readFileSync(join(root, 'i18n', 'locales', file), 'utf8'))
const kind = (value) => (Array.isArray(value) ? 'list' : value === null ? 'null' : typeof value)
const keyPath = (path) =>
  path
    .reduce((label, key) => (typeof key === 'number' ? `${label}[${key}]` : `${label}.${key}`), '')
    .replace(/^\./, '')

/**
 * Splits a message into its syntax parts. Returns the placeholder names, the
 * plural segments and any problem found; `{'…'}` literals are skipped.
 */
function analyse(message) {
  const problems = []
  const placeholders = new Set()
  const segments = [[]]
  let index = 0

  while (index < message.length) {
    const char = message[index]
    if (char === '{') {
      const close = message.indexOf('}', index)
      const inner = close === -1 ? '' : message.slice(index + 1, close).trim()
      if (close === -1) {
        problems.push(`unclosed "{" (write {'{'} for a literal brace)`)
        break
      }
      if (/^'[^']*'$/.test(inner)) {
        // literal such as {'@'}
      } else if (/^[A-Za-z_][\w]*$|^\d+$/.test(inner)) {
        placeholders.add(inner)
        segments.at(-1).push(inner)
      } else {
        problems.push(`"{${inner}}" is not a valid placeholder (write {'{'} for a literal brace)`)
      }
      index = close + 1
      continue
    }
    if (char === '}') problems.push(`stray "}" (write {'}'} for a literal brace)`)
    if (char === '@') problems.push(`"@" starts a linked message (write {'@'})`)
    if (char === '|') segments.push([])
    index += 1
  }

  // A real plural message repeats its count placeholder in every form.
  if (segments.length > 1 && segments.some((segment) => segment.length === 0)) {
    problems.push(`"|" splits the message into plural forms (write {'|'} or use "·")`)
  }
  return { problems, placeholders: [...placeholders].sort().join(','), forms: segments.length }
}

/** Compares a locale value with the Spanish value at the same path. */
function compare(source, target, path, code) {
  const label = keyPath(path)
  if (target === undefined) {
    errors.push(`${code}: missing "${label}"`)
    return
  }
  if (kind(source) !== kind(target)) {
    errors.push(`${code}: "${label}" is a ${kind(target)}, the Spanish file has a ${kind(source)}`)
    return
  }
  if (Array.isArray(source)) {
    if (source.length !== target.length) {
      errors.push(
        `${code}: "${label}" has ${target.length} items, the Spanish file has ${source.length}`
      )
    }
    source.forEach((item, index) => {
      if (index >= target.length) return
      if (item?.id !== undefined && item.id !== target[index]?.id) {
        errors.push(
          `${code}: "${label}[${index}]" has id "${target[index]?.id}", expected "${item.id}"`
        )
      }
      compare(item, target[index], [...path, index], code)
    })
    return
  }
  if (source && typeof source === 'object') {
    for (const key of Object.keys(source)) compare(source[key], target[key], [...path, key], code)
    for (const key of Object.keys(target)) {
      if (!(key in source))
        errors.push(`${code}: "${keyPath([...path, key])}" does not exist in Spanish`)
    }
    return
  }
  if (typeof source === 'string') {
    const a = analyse(source)
    const b = analyse(target)
    if (a.placeholders !== b.placeholders) {
      errors.push(
        `${code}: "${label}" uses {${b.placeholders}}, the Spanish text uses {${a.placeholders}}`
      )
    }
    if (a.forms !== b.forms) {
      errors.push(
        `${code}: "${label}" has ${b.forms} plural form(s), the Spanish text has ${a.forms}`
      )
    }
  }
}

/** Reports empty and syntactically risky messages in one locale. */
function lint(value, path, code) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => lint(item, [...path, index], code))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) lint(child, [...path, key], code)
  } else if (typeof value === 'string') {
    if (!value.trim()) errors.push(`${code}: "${keyPath(path)}" is empty`)
    for (const problem of analyse(value).problems) {
      errors.push(`${code}: "${keyPath(path)}": ${problem}`)
    }
  } else {
    errors.push(`${code}: "${keyPath(path)}" must be text, found ${kind(value)}`)
  }
}

const source = siteLocales.find(({ code }) => code === defaultLocale)
const messages = new Map(siteLocales.map(({ code, file }) => [code, load(file)]))

for (const [code, data] of messages) {
  lint(data, [], code)
  if (code !== source.code) compare(messages.get(source.code), data, [], code)
}

if (errors.length) {
  console.error(`i18n check failed with ${errors.length} error(s):`)
  for (const message of errors) console.error(`- ${message}`)
  process.exitCode = 1
} else {
  console.log(`i18n verified: ${messages.size} locales in parity.`)
}
