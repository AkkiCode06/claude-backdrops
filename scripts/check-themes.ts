// Validates every theme file in themes/: it parses, the file name matches its id,
// the id is unique, its style exists, and Claude Code can paint it.
// Run from the repo root: node --experimental-strip-types scripts/check-themes.ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadHooks } from './load-hooks.ts'

const { parseTheme, colorsFor, PALETTES, STYLES } = await loadHooks()

let failed = 0
const seen = new Set<string>(PALETTES.map((p: { id: string }) => p.id))
for (const file of readdirSync('themes').filter(f => f.endsWith('.json') && f !== 'schema.json').sort()) {
  const fail = (why: string) => { failed++; console.log(`✗ ${file}: ${why}`) }
  const parsed = parseTheme(readFileSync(join('themes', file), 'utf8'))
  if ('error' in parsed) { fail(parsed.error); continue }
  const p = parsed.palette
  let ok = true
  if (`${p.id}.json` !== file) { fail(`the file should be named ${p.id}.json`); ok = false }
  if (seen.has(p.id)) { fail(`the id "${p.id}" is already taken`); ok = false }
  seen.add(p.id)
  if (p.style && !STYLES.some((s: { id: string }) => s.id === p.style)) { fail(`unknown style "${p.style}"`); ok = false }
  const blocking = colorsFor(p).problems.filter((l: string) => l.startsWith("Desktop won't paint"))
  if (blocking.length) { fail(`Claude Code won't paint it: ${blocking[0]}`); ok = false }
  if (ok) console.log(`✓ ${file}: ${p.name}${p.author ? ` by @${p.author}` : ' (no author, so it won\'t be credited)'}`)
}
console.log(failed ? `\n${failed} problem(s).` : '\nAll themes look good.')
process.exit(failed ? 1 : 0)
