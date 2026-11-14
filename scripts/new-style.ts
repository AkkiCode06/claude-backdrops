// Scaffold a new background style and register it.
//   node --experimental-strip-types scripts/new-style.ts fireflies "Fireflies"
// Creates hooks/styles/fireflies.ts from a template and adds it to hooks/styles/index.ts.
// Then edit the layers, and preview with scripts/preview.ts fireflies.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const [id, nameArg] = process.argv.slice(2)
if (!id || !/^[a-z][a-z0-9-]{1,30}$/.test(id)) {
  console.log('Usage: scripts/new-style.ts <id> ["Display name"]   (id: lowercase letters, digits, hyphens)')
  process.exit(1)
}
const file = `hooks/styles/${id}.ts`
if (existsSync(file)) { console.log(`${file} already exists.`); process.exit(1) }
const name = nameArg ?? id.split('-').map(w => w[0]!.toUpperCase() + w.slice(1)).join(' ')
const ident = id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())

writeFileSync(file, `import { style } from '../kit'

// ${name}: describe it in one line below. Block reference: docs/kit.md
export default style({
  id: '${id}',
  name: '${name}',
  description: 'one line for the picker and for Claude',
  layers: (k, p) => [
    // The background: a gradient from the palette's base colors.
    k.sky([p.base[0], p.base[1], p.base[2]]),
    // A soft glow that drifts. Positions are fractions: [0, 0] top-left, [1, 1] bottom-right.
    k.glow({ at: [0.3, 0.7], size: 0.7, color: p.glows[1], opacity: 0.5, orbit: { rx: 120, ry: 60 } }),
    // Swap these for any blocks: stars, waves, particles, aurora, codeRain, blobs, shapes, grid, sun, skyline…
    k.particles({ count: 60, color: p.glows[4], direction: 'up', speed: 0.6, opacity: 0.6 }),
  ],
})
`)

const index = readFileSync('hooks/styles/index.ts', 'utf8')
  .replace(/(import type \{ Style \} from '\.\.\/kit'\n)/, `$1import ${ident} from './${id}'\n`)
  .replace(/(export const STYLES: readonly Style\[\] = \[\n(?:  .+,\n)+)/, `$1  ${ident},\n`)
writeFileSync('hooks/styles/index.ts', index)
console.log(`Created ${file} and registered it in hooks/styles/index.ts.
Next:
  1. Edit the layers in ${file}
  2. Preview: node --experimental-strip-types scripts/preview.ts ${id}
  3. Check:   node --experimental-strip-types scripts/check-styles.ts`)
