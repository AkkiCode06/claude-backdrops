// Regenerates assets/styles.svg: a still frame of every background style.
//   node --experimental-strip-types scripts/style-gallery.ts
import { writeFileSync } from 'node:fs'
import { loadHooks } from './load-hooks.ts'

const { STYLES, PALETTES, ZERO } = await loadHooks()
// A palette that suits each style, for the gallery.
const suits: Record<string, string> = {
  gradient: 'ember', starfield: 'galaxy', waves: 'ocean', synthwave: 'synthwave', aurora: 'aurora',
  rain: 'neon-tokyo', snow: 'arctic', 'code-rain': 'matrix', 'lava-lamp': 'sunset', geometric: 'violet', city: 'midnight',
}
const cols = 3, tw = 360, th = 225, gap = 16, pad = 28, top = 70, label = 34
const rows = Math.ceil(STYLES.length / cols)
const W = pad * 2 + cols * tw + (cols - 1) * gap
const H = top + rows * (th + label + gap) + pad - gap
const FONT = `font-family="-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif"`
const tiles = STYLES.map((st: { id: string; name: string; build: Function }, i: number) => {
  const p = PALETTES.find((x: { id: string }) => x.id === (suits[st.id] ?? 'ember')) ?? PALETTES[0]
  const svg = (st.build(p, { kind: 'still', at: ZERO }) as string)
    .replace(/id="([^"]+)"/g, `id="s${i}$1"`).replace(/url\(#([^)]+)\)/g, `url(#s${i}$1)`).replace(/href="#([^"]+)"/g, `href="#s${i}$1"`)
  const x = pad + (i % cols) * (tw + gap), y = top + Math.floor(i / cols) * (th + label + gap)
  const inner = svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${tw}" height="${th}" `)
  return `<clipPath id="c${i}"><rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12"/></clipPath><g clip-path="url(#c${i})">${inner}</g>` +
    `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" fill="none" stroke="#ffffff" stroke-opacity=".1"/>` +
    `<text x="${x + 2}" y="${y + th + 23}" ${FONT} font-size="15" font-weight="600" fill="#e9e9f0">${st.name}</text>` +
    `<text x="${x + tw - 2}" y="${y + th + 23}" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="12" fill="#8b8b9a">/backdrop style ${st.id}</text>`
}).join('\n')
writeFileSync('assets/styles.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" rx="20" fill="#0d0d14"/>
<text x="${pad}" y="44" ${FONT} font-size="22" font-weight="700" fill="#ffffff">${STYLES.length} background styles</text>
<text x="${W - pad}" y="44" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="#8b8b9a">built with the Backdrop kit</text>
${tiles}
</svg>`)
console.log(`Wrote assets/styles.svg (${STYLES.length} styles).`)
