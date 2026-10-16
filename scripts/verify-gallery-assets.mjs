// Checks every gallery image the content references (covers and photos, in
// every language) against public/: the file must exist with exactly that
// name, and each photo of a Spanish entry must declare the real width and
// height of its file, which size the photo tiles before the image loads.
// The gallery binaries are not in git, so CI skips this check; verify:content
// covers the frontmatter itself.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import sharp from 'sharp'
import { parse } from 'yaml'
import { defaultLocale } from '../shared/constants/locales.ts'

const root = resolve(import.meta.dirname, '..')
const contentRoot = join(root, 'content')
const problems = []
let checked = 0

const where = (path) => relative(root, path).split(sep).join('/')

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

// Windows and macOS file systems ignore case, Linux (the production image)
// does not: compare every path segment against the real directory listing.
function existsWithExactCase(absolutePath) {
  let directory = root
  for (const part of relative(root, absolutePath).split(sep)) {
    if (!existsSync(directory) || !readdirSync(directory).includes(part)) return false
    directory = join(directory, part)
  }
  return true
}

function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const end = text.indexOf('\n---', 4)
  if (!text.startsWith('---\n') || end === -1) return undefined
  try {
    return parse(text.slice(4, end)) ?? {}
  } catch (error) {
    problems.push(`${where(file)}: invalid YAML frontmatter (${error.message.split('\n')[0]})`)
    return undefined
  }
}

/** Yields [label, value] for every `src` in the parsed frontmatter, at any depth. */
function* sources(value, label = '') {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) yield* sources(item, `${label}[${index}]`)
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const childLabel = label ? `${label}.${key}` : key
      if (key === 'src' && typeof child === 'string') yield [childLabel, child]
      else yield* sources(child, childLabel)
    }
  }
}

async function checkSize(file, label, photo, path) {
  const metadata = await sharp(path).metadata()
  // Size as displayed: an EXIF rotation swaps width and height.
  const { width, height } = metadata.autoOrient ?? metadata
  if (photo.width !== width || photo.height !== height) {
    const declared =
      photo.width === undefined || photo.height === undefined
        ? 'no width/height'
        : `${photo.width}x${photo.height}`
    problems.push(`${where(file)}: ${label} declares ${declared}, the file is ${width}x${height}`)
  }
}

const isSourceEntry = (file) => relative(contentRoot, file).split(sep)[0] === defaultLocale

for (const file of markdownFiles(contentRoot)) {
  const data = readFrontmatter(file)
  if (!data) continue

  for (const [label, publicPath] of sources(data)) {
    if (!publicPath.startsWith('/gallery/')) continue
    checked += 1
    const path = join(root, 'public', publicPath)
    if (!existsWithExactCase(path)) {
      problems.push(`${where(file)}: ${label} ${publicPath} not found (check the exact file name)`)
    }
  }

  if (!isSourceEntry(file) || !Array.isArray(data.photos)) continue
  for (const [index, photo] of data.photos.entries()) {
    const path = typeof photo?.src === 'string' ? join(root, 'public', photo.src) : undefined
    if (path && existsWithExactCase(path)) {
      await checkSize(file, `photos[${index}]`, photo, path)
    }
  }
}

if (problems.length > 0) {
  console.error(`Gallery check failed with ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  console.log(`Gallery assets verified (${checked} references).`)
}
