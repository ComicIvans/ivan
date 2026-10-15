// Checks that every gallery image referenced from the content (covers and
// photos) exists in public/ with exactly the same file name. The gallery
// binaries are not in git, so CI skips this check; verify:content covers the
// frontmatter itself.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const contentRoot = join(root, 'content')
// Matches "src: ..." both as a mapping key and as the first key of a list item.
const sourcePattern = /^\s*(?:-\s+)?src:\s*['"]?([^'"\s]+)['"]?\s*$/gm
const missing = new Set()
let checked = 0

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

for (const contentFile of markdownFiles(contentRoot)) {
  const source = readFileSync(contentFile, 'utf8')
  for (const match of source.matchAll(sourcePattern)) {
    const publicPath = match[1]
    if (!publicPath?.startsWith('/gallery/')) continue
    checked += 1
    if (!existsWithExactCase(join(root, 'public', publicPath))) {
      missing.add(`${relative(root, contentFile)} -> ${publicPath}`)
    }
  }
}

if (missing.size > 0) {
  console.error(`Missing ${missing.size} gallery asset(s) (check the exact file name):`)
  for (const asset of missing) console.error(`- ${asset}`)
  process.exitCode = 1
} else {
  console.log(`Gallery assets verified (${checked} references).`)
}
