// Loads the mod's own modules (hooks/) in plain Node, for the scripts in this folder.
// The mod's imports leave off file extensions (Claude Code's bundler adds them);
// Node needs them, so this copies hooks/ to a temp folder with the extensions in.
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const copy = (from: string, to: string) => {
  mkdirSync(to, { recursive: true })
  for (const f of readdirSync(from)) {
    const src = join(from, f), dst = join(to, f)
    if (statSync(src).isDirectory()) { copy(src, dst); continue }
    if (!f.endsWith('.ts') || f.endsWith('.d.ts')) { cpSync(src, dst); continue }
    writeFileSync(dst, readFileSync(src, 'utf8').replace(/from '(\.{1,2}\/[a-z0-9/-]+)'/g, "from '$1.ts'"))
  }
}

export const loadHooks = async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'backdrop-'))
  copy('hooks', tmp)
  const at = (m: string) => import(join(tmp, m))
  const [themes, custom, palettes, styles, scene] = await Promise.all([
    at('themes.ts'), at('custom.ts'), at('palettes.ts'), at('styles/index.ts'), at('scene.ts'),
  ])
  return { ...themes, ...custom, ...palettes, ...styles, ...scene }
}
