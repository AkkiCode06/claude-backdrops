// Scaffold a theme file in themes/.
//   node --experimental-strip-types scripts/new-theme.ts rainy-tokyo "Rainy Tokyo" your-github-handle
import { existsSync, writeFileSync } from 'node:fs'

const [id, nameArg, author] = process.argv.slice(2)
if (!id || !/^[a-z0-9][a-z0-9-]{0,47}$/.test(id)) {
  console.log('Usage: scripts/new-theme.ts <id> ["Name"] [github-handle]')
  process.exit(1)
}
const file = `themes/${id}.json`
if (existsSync(file)) { console.log(`${file} already exists.`); process.exit(1) }
const name = nameArg ?? id.split('-').map(w => w[0]!.toUpperCase() + w.slice(1)).join(' ')
writeFileSync(file, JSON.stringify({
  $schema: './schema.json',
  id,
  name,
  author: author ?? 'your-github-handle',
  style: 'gradient',
  colors: ['#0b1026', '#3a0ca3', '#f72585', '#4cc9f0'],
}, null, 2) + '\n')
console.log(`Created ${file}. Edit the colors (deepest first) and style, then:
  node --experimental-strip-types scripts/check-themes.ts`)
