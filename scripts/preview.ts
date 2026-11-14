// Preview background styles in your browser, no Claude Code needed.
//
//   node --experimental-strip-types scripts/preview.ts                 every style, palette "ember"
//   node --experimental-strip-types scripts/preview.ts starfield       one style, a few palettes
//   node --experimental-strip-types scripts/preview.ts starfield ocean one style, one palette
//
// Writes preview/index.html (git-ignored) with each style moving and still, side by side,
// plus how big each scene is. Open it in any browser.
import { mkdirSync, writeFileSync } from 'node:fs'
import { loadHooks } from './load-hooks.ts'

const { STYLES, PALETTES, ZERO } = await loadHooks()
const [styleArg, paletteArg] = process.argv.slice(2)
const styles = styleArg ? STYLES.filter((s: { id: string }) => s.id === styleArg) : STYLES
if (styles.length === 0) { console.log(`No style "${styleArg}". Styles: ${STYLES.map((s: { id: string }) => s.id).join(', ')}`); process.exit(1) }
const paletteIds = paletteArg ? [paletteArg] : styleArg ? ['ember', 'ocean', 'synthwave', 'forest'] : ['ember']
const palettes = paletteIds.map(id => PALETTES.find((p: { id: string }) => p.id === id)).filter(Boolean)
if (palettes.length === 0) { console.log(`No palette "${paletteArg}".`); process.exit(1) }

const cards: string[] = []
for (const st of styles) for (const p of palettes) {
  const moving = st.build(p, { kind: 'flow', run: { from: ZERO, ramp: false } })
  const still = st.build(p, { kind: 'still', at: ZERO })
  const box = (svg: string, label: string) => `<figure><div class="frame">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div><figcaption>${label}</figcaption></figure>`
  cards.push(`<section><h2>${st.name} <small>${st.id} · ${p.name} · ${(moving.length / 1024).toFixed(1)} KB of 128 KB</small></h2><p>${st.description}</p><div class="row">${box(moving, 'moving')}${box(still, 'still (battery / motion off)')}</div></section>`)
}
mkdirSync('preview', { recursive: true })
writeFileSync('preview/index.html', `<!doctype html><meta charset="utf-8"><title>Backdrop style preview</title>
<style>body{margin:0;padding:24px;background:#0b0b10;color:#eee;font:15px -apple-system,system-ui,sans-serif}h2{margin:28px 0 4px;font-size:20px}small{color:#888;font-weight:400;font-size:13px}p{margin:0 0 10px;color:#aaa}.row{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0;flex:1;min-width:320px}.frame{aspect-ratio:16/10;border-radius:12px;overflow:hidden;border:1px solid #ffffff22}figcaption{color:#888;font-size:12px;margin-top:6px}</style>
<h1>Backdrop style preview</h1>${cards.join('')}`)
console.log(`Wrote preview/index.html (${cards.length} preview${cards.length === 1 ? '' : 's'}). Open it in a browser.`)
