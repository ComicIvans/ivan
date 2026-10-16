// Prepares the photos of a gallery event for the web.
//
// Usage: pnpm gallery:add <slug> [sourceDir] [--cover <file>] [--write] [--force]
//
//   <slug>         event slug: public/gallery/<slug>/ and content/es/gallery/<slug>.md
//   [sourceDir]    folder with the original photos (default: gallery-src/<slug>/)
//   --cover <file> also write cover.webp, a 1600x900 crop of <file> (a file in sourceDir)
//   --write        update the photos list of content/es/gallery/<slug>.md instead of
//                  printing it (the alt texts already written are kept)
//   --force        encode every photo again, even when its WebP is up to date
//
// Each original becomes public/gallery/<slug>/NN.webp: auto-rotated, at most
// 2560 px on its long side, WebP quality 82 and without EXIF/GPS metadata.
// Originals are numbered in file name order. gallery-add.json, written next
// to them, remembers which original became which NN.webp, so running the
// script again after adding photos keeps every existing number (and the alt
// text written for it). Originals are never modified, moved or deleted.
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { parseArgs } from 'node:util'
import sharp from 'sharp'
import { parseDocument, stringify } from 'yaml'
import { defaultLocale, siteLocales } from '../shared/constants/locales.ts'

const MAX_SIDE = 2560
const QUALITY = 82
const COVER_SIZE = { width: 1600, height: 900 }
const MANIFEST = 'gallery-add.json'
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'])

const root = resolve(import.meta.dirname, '..')
const where = (path) => relative(root, path).split(sep).join('/') || '.'
const formatBytes = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} kB`

function fail(message) {
  console.error(`gallery:add: ${message}`)
  process.exit(1)
}

const { values: options, positionals } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        cover: { type: 'string' },
        write: { type: 'boolean', default: false },
        force: { type: 'boolean', default: false },
      },
    })
  } catch (error) {
    return fail(error.message)
  }
})()

const [slug, sourceArgument] = positionals
if (!slug || positionals.length > 2) {
  fail('usage: pnpm gallery:add <slug> [sourceDir] [--cover <file>] [--write] [--force]')
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  fail(`"${slug}" is not a valid slug (use lowercase-kebab-case, e.g. enem-2025)`)
}

const sourceDir = resolve(root, sourceArgument ?? join('gallery-src', slug))
const outputDir = join(root, 'public', 'gallery', slug)
const contentFile = join(root, 'content', defaultLocale, 'gallery', `${slug}.md`)

if (!existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
  fail(`no folder ${where(sourceDir)} with the original photos`)
}
const fromPublic = relative(join(root, 'public'), sourceDir)
if (!fromPublic.startsWith('..') && !isAbsolute(fromPublic)) {
  fail('keep the originals outside public/: everything in public/ is published')
}

// Originals -----------------------------------------------------------------

const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
const sources = readdirSync(sourceDir)
  .filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
  .filter((name) => basename(name, extname(name)).toLowerCase() !== 'cover')
  .sort(naturalOrder.compare)

if (options.cover && !existsSync(resolve(sourceDir, options.cover))) {
  fail(`cover ${options.cover} not found in ${where(sourceDir)}`)
}
if (sources.length === 0 && !options.cover) {
  fail(`no photos (${[...IMAGE_EXTENSIONS].join(', ')}) in ${where(sourceDir)}`)
}

const manifestPath = join(sourceDir, MANIFEST)
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { photos: {} }
manifest.photos ??= {}

// Known originals keep their number; new ones continue after the highest
// number already used, so adding photos never changes a published file. An
// original edited after its conversion is encoded again under its number.
const numberOf = (name) => Number.parseInt(basename(name, extname(name)), 10) || 0
const usedNumbers = [
  ...Object.values(manifest.photos),
  ...(existsSync(outputDir) ? readdirSync(outputDir) : []),
]
  .filter((name) => /^\d+\.webp$/.test(name))
  .map(numberOf)
let nextNumber = Math.max(0, ...usedNumbers) + 1

for (const source of sources) {
  manifest.photos[source] ??= `${String(nextNumber++).padStart(2, '0')}.webp`
}

// Conversion ----------------------------------------------------------------

await mkdir(outputDir, { recursive: true })

const isUpToDate = (output, source) =>
  !options.force && existsSync(output) && statSync(output).mtimeMs >= statSync(source).mtimeMs

async function encode(source, output, pipeline) {
  // Write next to the target and rename, so an interrupted run never leaves
  // a truncated image behind under the published name.
  const temporary = `${output}.tmp`
  const info = await pipeline(sharp(source).autoOrient())
    .webp({ quality: QUALITY })
    .toFile(temporary)
  renameSync(temporary, output)
  return info
}

const photos = []
let sizeBefore = 0
let sizeAfter = 0
let encoded = 0

console.log(`${where(sourceDir)} -> ${where(outputDir)}`)

for (const source of sources) {
  const sourcePath = join(sourceDir, source)
  const name = manifest.photos[source]
  const output = join(outputDir, name)
  let width
  let height

  if (isUpToDate(output, sourcePath)) {
    ;({ width, height } = await sharp(output).metadata())
    console.log(`  ${source} -> ${name}  up to date (${width}x${height})`)
  } else {
    const replacing = existsSync(output)
    const original = await sharp(sourcePath).metadata()
    ;({ width, height } = await encode(sourcePath, output, (image) =>
      image.resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
    ))
    const before = statSync(sourcePath).size
    const after = statSync(output).size
    sizeBefore += before
    sizeAfter += after
    encoded += 1
    const originalSize = original.autoOrient ?? original
    console.log(
      `  ${source} -> ${name}  ${originalSize.width}x${originalSize.height} -> ${width}x${height}` +
        `  ${formatBytes(before)} -> ${formatBytes(after)}` +
        (replacing ? '  (replaces the previous WebP)' : '')
    )
  }

  photos.push({ src: `/gallery/${slug}/${name}`, width, height })
}

if (options.cover) {
  const sourcePath = resolve(sourceDir, options.cover)
  const output = join(outputDir, 'cover.webp')
  if (manifest.cover === options.cover && isUpToDate(output, sourcePath)) {
    console.log(`  ${options.cover} -> cover.webp  up to date`)
  } else {
    const { width, height } = await encode(sourcePath, output, (image) =>
      image.resize({ ...COVER_SIZE, fit: 'cover' })
    )
    manifest.cover = options.cover
    console.log(`  ${options.cover} -> cover.webp  ${width}x${height}`)
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

if (encoded > 0) {
  console.log(
    `Encoded ${encoded} photo(s): ${formatBytes(sizeBefore)} -> ${formatBytes(sizeAfter)}` +
      ` (${Math.round((1 - sizeAfter / sizeBefore) * 100)}% smaller).`
  )
} else {
  console.log('Every photo was already up to date.')
}

// Content -------------------------------------------------------------------

const stemOf = (src) => src.slice(0, src.length - extname(src).length)

function splitFrontmatter(file) {
  const original = readFileSync(file, 'utf8')
  // Editors on Windows may save CRLF: parse with LF and write the same line
  // endings back.
  const eol = original.includes('\r\n') ? '\r\n' : '\n'
  const text = original.replace(/\r\n/g, '\n')
  const end = text.indexOf('\n---', 4)
  if (!text.startsWith('---\n') || end === -1) fail(`${where(file)} has no YAML frontmatter`)
  const document = parseDocument(text.slice(4, end + 1))
  if (document.errors.length) fail(`${where(file)}: ${document.errors[0].message}`)
  return { original, eol, document, rest: text.slice(end + 1) }
}

function saveFrontmatter(file, { original, eol, document, rest }) {
  const updated = `---\n${document.toString({ lineWidth: 0 })}${rest}`.replace(/\n/g, eol)
  if (updated === original) return false
  writeFileSync(file, updated)
  return true
}

/**
 * The new photo list: entries already in the file keep their position, alt
 * text and description and get the new src and size (a src that differs only
 * in its extension, like 01.JPG -> 01.webp, counts as the same photo). Photos
 * that are not listed yet are appended with an empty alt to fill in.
 */
function mergePhotoList(existing) {
  const byStem = new Map(photos.map((photo) => [stemOf(photo.src), photo]))
  const listed = new Set()
  const merged = existing.map((entry) => {
    const photo = byStem.get(stemOf(String(entry?.src ?? '')))
    if (!photo) {
      console.warn(`  warning: ${entry?.src} was not produced by this run; left as it is`)
      return entry
    }
    listed.add(photo)
    const texts = Object.entries(entry).filter(([key]) => !['src', 'width', 'height'].includes(key))
    return {
      src: photo.src,
      ...Object.fromEntries(texts),
      width: photo.width,
      height: photo.height,
    }
  })
  for (const photo of photos) {
    if (!listed.has(photo)) merged.push({ src: photo.src, alt: '', ...photo })
  }
  return merged
}

if (!options.write) {
  const existing = existsSync(contentFile)
    ? (splitFrontmatter(contentFile).document.toJS()?.photos ?? [])
    : []
  console.log(`\nPhotos for ${where(contentFile)} (or run again with --write):\n`)
  console.log(stringify({ photos: mergePhotoList(existing) }, { lineWidth: 0 }))
  if (!existsSync(contentFile)) {
    console.log(`Create ${where(contentFile)} first; public/gallery/README.md shows a template.`)
  }
} else {
  if (!existsSync(contentFile)) {
    fail(`${where(contentFile)} does not exist yet; create it first (see public/gallery/README.md)`)
  }
  const source = splitFrontmatter(contentFile)
  const list = mergePhotoList(source.document.toJS()?.photos ?? [])
  source.document.set('photos', source.document.createNode(list))
  console.log(
    saveFrontmatter(contentFile, source)
      ? `Updated the photos of ${where(contentFile)}.`
      : `${where(contentFile)} was already up to date.`
  )

  // Translations list photos only to localize their texts: follow renames.
  const newSrcByStem = new Map(photos.map((photo) => [stemOf(photo.src), photo.src]))
  for (const { code } of siteLocales) {
    const file = join(root, 'content', code, 'gallery', `${slug}.md`)
    if (code === defaultLocale || !existsSync(file)) continue
    const translation = splitFrontmatter(file)
    const items = translation.document.get('photos')?.items ?? []
    for (const item of items) {
      const src = String(item.get?.('src') ?? '')
      const renamed = newSrcByStem.get(stemOf(src))
      if (renamed && renamed !== src) item.set('src', renamed)
    }
    if (saveFrontmatter(file, translation))
      console.log(`Updated the photo paths of ${where(file)}.`)
  }

  const missingAlt = list.filter((photo) => !photo.alt).length
  if (missingAlt > 0) {
    console.log(
      `${missingAlt} photo(s) have an empty alt: describe them before building (pnpm verify fails until then).`
    )
  }
}
