import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const contentRoot = join(root, 'content')
const sourcePattern = /^\s+(?:src):\s*['"]?([^'"\s]+)['"]?\s*$/gm
const missing = new Set()

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

for (const contentFile of markdownFiles(contentRoot)) {
  const source = readFileSync(contentFile, 'utf8')
  for (const match of source.matchAll(sourcePattern)) {
    const publicPath = match[1]
    if (!publicPath?.startsWith('/gallery/')) continue
    if (!existsSync(join(root, 'public', publicPath))) {
      missing.add(`${relative(root, contentFile)} -> ${publicPath}`)
    }
  }
}

if (missing.size > 0) {
  console.error(`Missing ${missing.size} gallery asset(s):`)
  for (const asset of missing) console.error(`- ${asset}`)
  process.exitCode = 1
} else {
  console.log('Gallery assets verified.')
}
