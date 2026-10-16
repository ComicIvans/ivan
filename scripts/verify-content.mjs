// Validates the editable content before a build: the profile YAML files and
// the gallery Markdown frontmatter. Nuxt Content stores a field that breaks
// its schema as NULL without failing, so this script is the safety net.
// It never reads gallery binaries (they are not in git); verify:gallery does.
//
// Usage: node scripts/verify-content.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { parseDocument } from 'yaml'
import { defaultLocale, siteLocales } from '../shared/constants/locales.ts'
import {
  galleryEventSourceSchema,
  galleryEventTranslationSchema,
  profileSchemas,
} from '../shared/content/schemas.ts'

const root = resolve(import.meta.dirname, '..')
const contentRoot = join(root, 'content')
const errors = []
const warnings = []

const where = (file) => relative(root, file).split(sep).join('/')
const fail = (file, message) => errors.push(`${where(file)}: ${message}`)
const warn = (file, message) => warnings.push(`${where(file)}: ${message}`)
const pathLabel = (path) =>
  path
    .reduce((label, key) => (typeof key === 'number' ? `${label}[${key}]` : `${label}.${key}`), '')
    .replace(/^\./, '') || '(root)'

function parseYaml(file, text) {
  const document = parseDocument(text, { prettyErrors: true })
  if (document.errors.length) {
    for (const error of document.errors) fail(file, `YAML ${error.message}`)
    return undefined
  }
  return document.toJS()
}

// A localized field is a union (plain text or one value per language): report
// the issues of the branch that matches the value's type instead of zod's
// generic "Invalid input".
function describe(issue, basePath = []) {
  const path = [...basePath, ...issue.path]
  if (issue.code === 'invalid_union' && Array.isArray(issue.errors)) {
    const branch = issue.errors.find(
      (issues) =>
        issues.length > 0 &&
        !issues.every((nested) => nested.code === 'invalid_type' && nested.path.length === 0)
    )
    if (branch) return branch.flatMap((nested) => describe(nested, path))
  }
  return [`${pathLabel(path)}: ${issue.message}`]
}

function validate(file, schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    for (const issue of result.error.issues) {
      for (const message of describe(issue)) fail(file, message)
    }
  }
  return result.success
}

/** True when every segment of the path exists with exactly this spelling. */
function existsWithExactCase(absolutePath) {
  let directory = root
  for (const part of relative(root, absolutePath).split(sep)) {
    if (!existsSync(directory) || !readdirSync(directory).includes(part)) return false
    directory = join(directory, part)
  }
  return true
}

// Icons ----------------------------------------------------------------------

const iconSets = new Map()
const iconSetRoot = join(root, 'node_modules', '@iconify-json')
for (const name of existsSync(iconSetRoot) ? readdirSync(iconSetRoot) : []) {
  const set = JSON.parse(readFileSync(join(iconSetRoot, name, 'icons.json'), 'utf8'))
  iconSets.set(set.prefix, new Set([...Object.keys(set.icons), ...Object.keys(set.aliases ?? {})]))
}

function checkIcon(file, path, icon) {
  let prefix
  let name
  if (icon.includes(':')) {
    ;[prefix, name] = icon.split(':')
  } else {
    const body = icon.slice(2) // drop "i-"
    prefix = [...iconSets.keys()]
      .sort((a, b) => b.length - a.length)
      .find((candidate) => body.startsWith(`${candidate}-`))
    name = prefix ? body.slice(prefix.length + 1) : undefined
  }
  if (!prefix || !iconSets.has(prefix)) {
    fail(file, `${path}: icon "${icon}" uses an icon set that is not installed (@iconify-json/*)`)
  } else if (!iconSets.get(prefix).has(name)) {
    fail(file, `${path}: icon "${icon}" does not exist in @iconify-json/${prefix}`)
  }
}

/**
 * Walks parsed data and calls visit(key, value, path) for every property and
 * every list item (key is then the index), so translations inside lists such
 * as tags[2] are checked too.
 */
function walk(value, visit, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      visit(index, item, [...path, index])
      walk(item, visit, [...path, index])
    })
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child, [...path, key])
      walk(child, visit, [...path, key])
    }
  }
}

const localeCodes = siteLocales.map(({ code }) => code)
const isTranslationMap = (value) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  typeof value[defaultLocale] === 'string' &&
  Object.keys(value).every((key) => localeCodes.includes(key))

// Profile --------------------------------------------------------------------

const profileRoot = join(contentRoot, 'profile')
const profileFiles = existsSync(profileRoot) ? readdirSync(profileRoot) : []

for (const file of profileFiles) {
  const section = file.replace(/\.ya?ml$/, '')
  if (!(section in profileSchemas) || !file.endsWith('.yml')) {
    fail(join(profileRoot, file), 'no collection reads this file (see content.config.ts)')
  }
}

for (const [section, schema] of Object.entries(profileSchemas)) {
  const file = join(profileRoot, `${section}.yml`)
  if (!existsSync(file)) {
    fail(file, 'missing profile file')
    continue
  }
  const data = parseYaml(file, readFileSync(file, 'utf8'))
  if (data === undefined || !validate(file, schema, data)) continue

  walk(data, (key, value, path) => {
    if ((key === 'icon' || key === 'flag') && typeof value === 'string') {
      checkIcon(file, pathLabel(path), value)
    }
    if (
      key === 'screenshot' &&
      value?.src &&
      !existsWithExactCase(join(root, 'public', value.src))
    ) {
      fail(file, `${pathLabel(path)}.src: public${value.src} not found (check the exact file name)`)
    }
    if (isTranslationMap(value)) {
      const missing = localeCodes.filter((code) => value[code] === undefined)
      if (missing.length) {
        warn(file, `${pathLabel(path)}: no ${missing.join('/')} text, Spanish is shown instead`)
      }
    }
  })
}

// Gallery --------------------------------------------------------------------

// The gallery collections read content/<locale>/gallery/*.md only: the file
// name is the event's URL slug, so an event inside a subfolder is never shown.
function markdownFiles(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      fail(path, 'subfolders are not read; move its events into the gallery folder itself')
      return []
    }
    return extname(entry.name) === '.md' ? [path] : []
  })
}

function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const end = text.indexOf('\n---', 4)
  if (!text.startsWith('---\n') || end === -1) {
    fail(file, 'missing YAML frontmatter (--- ... ---)')
    return undefined
  }
  const data = parseYaml(file, text.slice(4, end))
  // An empty frontmatter parses to null; validate it as an empty entry.
  return data === null ? {} : data
}

const galleryDir = (code) => join(contentRoot, code, 'gallery')
const sourceEvents = new Map()
const slugs = new Map()

for (const file of markdownFiles(galleryDir(defaultLocale))) {
  const data = readFrontmatter(file)
  if (data === undefined) continue
  const key = relative(galleryDir(defaultLocale), file)
  const slug = key.replace(/\.md$/, '').split(sep).pop()
  if (slugs.has(slug)) fail(file, `slug "${slug}" is also used by ${where(slugs.get(slug))}`)
  slugs.set(slug, file)
  if (!validate(file, galleryEventSourceSchema, data)) continue
  if (data.icon) checkIcon(file, 'icon', data.icon)
  sourceEvents.set(key, data)
}

for (const { code } of siteLocales) {
  if (code === defaultLocale) continue
  for (const file of markdownFiles(galleryDir(code))) {
    const data = readFrontmatter(file)
    if (data === undefined || !validate(file, galleryEventTranslationSchema, data)) continue
    const key = relative(galleryDir(code), file)
    const source = sourceEvents.get(key)
    if (!source) {
      if (!existsSync(join(galleryDir(defaultLocale), key))) {
        fail(file, `no Spanish entry content/${defaultLocale}/gallery/${key.split(sep).join('/')}`)
      }
      continue
    }
    const sourceImages = new Set([source.cover?.src, ...(source.photos ?? []).map((p) => p.src)])
    if (data.cover?.src && !sourceImages.has(data.cover.src)) {
      fail(file, `cover.src: "${data.cover.src}" is not an image of the Spanish entry`)
    }
    data.photos?.forEach((photo, index) => {
      if (!sourceImages.has(photo.src)) {
        fail(file, `photos[${index}].src: "${photo.src}" is not a photo of the Spanish entry`)
      }
    })
  }
}

// Report ---------------------------------------------------------------------

for (const message of warnings) console.warn(`warning: ${message}`)

if (errors.length) {
  console.error(`Content check failed with ${errors.length} error(s):`)
  for (const message of errors) console.error(`- ${message}`)
  process.exitCode = 1
} else {
  console.log(
    `Content verified: ${Object.keys(profileSchemas).length} profile files, ${sourceEvents.size} gallery events.`
  )
}
