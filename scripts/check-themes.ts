// Validates every theme file in themes/: it parses, the file name matches its id,
// the id is unique, its style exists, and Claude Code can paint it.
// Run from the repo root: node --experimental-strip-types scripts/check-themes.ts
import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The mod's imports leave off file extensions (its bundler adds them); Node needs
// them, so check against a copy with the extensions written in.
const tmp = mkdtempSync(join(tmpdir(), 'backdrop-check-'))
for (const f of readdirSync('hooks')) {
  if (f.endsWith('.js') || f.endsWith('.d.ts')) { cpSync(join('hooks', f), join(tmp, f)); continue }
  if (!f.endsWith('.ts')) continue
  const src = readFileSync(join('hooks', f), 'utf8').replace(/from '\.\/([a-z-]+)'/g, "from './$1.ts'")
  writeFileSync(join(tmp, f), src)
}
const { parseTheme } = await import(join(tmp, 'themes.ts'))
const { colorsFor } = await import(join(tmp, 'custom.ts'))
const { PALETTES } = await import(join(tmp, 'palettes.ts'))
const { STYLES } = await import(join(tmp, 'styles.ts'))

let failed = 0
const seen = new Set<string>(PALETTES.map((p: { id: string }) => p.id))
for (const file of readdirSync('themes').filter(f => f.endsWith('.json')).sort()) {
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
