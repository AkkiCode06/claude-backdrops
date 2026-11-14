// Regenerates assets/palettes.svg (the palette gallery) and assets/features.svg from hooks/palettes.ts.
// Run from the repo root: node --experimental-strip-types scripts/gallery.ts assets
import { writeFileSync } from 'node:fs'
import { PALETTES } from '../hooks/palettes.ts'
const out = process.argv[2]
const FONT = `font-family="-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif"`

// ---- Palette gallery: every preset as a mini backdrop tile.
{
  const cols = 6, tw = 176, th = 104, gap = 14, pad = 28, top = 70
  const rows = Math.ceil(PALETTES.length / cols)
  const W = pad * 2 + cols * tw + (cols - 1) * gap
  const H = top + rows * (th + 30 + gap) + pad - gap
  const tiles = PALETTES.map((p, i) => {
    const x = pad + (i % cols) * (tw + gap), y = top + Math.floor(i / cols) * (th + 30 + gap)
    const id = `t${i}`
    const glows = [[0.25, 0.8, 0.75], [0.85, 0.15, 0.7], [0.55, 0.55, 0.55]].map(([gx, gy, r], k) => {
      const c = p.glows[k + 2] ?? p.glows[k] ?? p.glows[0]
      return `<radialGradient id="${id}g${k}" cx="${gx}" cy="${gy}" r="${r}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>` +
        `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" fill="url(#${id}g${k})"/>`
    }).join('')
    return `<linearGradient id="${id}b" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${p.base[0]}"/><stop offset=".55" stop-color="${p.base[1]}"/><stop offset="1" stop-color="${p.base[2]}"/></linearGradient>
<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" fill="url(#${id}b)"/>${glows}
<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="12" fill="none" stroke="#ffffff" stroke-opacity=".1"/>
<text x="${x + 2}" y="${y + th + 21}" ${FONT} font-size="14" font-weight="600" fill="#e9e9f0">${p.name}</text>
<text x="${x + tw - 2}" y="${y + th + 21}" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="#8b8b9a">${p.id}</text>`
  }).join('\n')
  writeFileSync(`${out}/palettes.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" rx="20" fill="#0d0d14"/>
<text x="${pad}" y="44" ${FONT} font-size="22" font-weight="700" fill="#ffffff">23 palettes</text>
<text x="${W - pad}" y="44" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="#8b8b9a">/backdrop &lt;id&gt;</text>
${tiles}
</svg>`)
}

// ---- Feature cards: icon, title, one line each.
{
  const icon: Record<string, string> = {
    palette: `<path d="M24 6a18 18 0 1 0 0 36c2.2 0 3.6-1.8 3.6-3.6 0-1-.4-1.8-1-2.4-.6-.6-1-1.4-1-2.4 0-2 1.6-3.6 3.6-3.6H33A9 9 0 0 0 42 21C42 12.7 34 6 24 6Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="15" cy="21" r="2.6" fill="currentColor"/><circle cx="21" cy="14" r="2.6" fill="currentColor"/><circle cx="29.5" cy="14.5" r="2.6" fill="currentColor"/>`,
    sparkle: `<path d="M24 5l3.6 11.4L39 20l-11.4 3.6L24 35l-3.6-11.4L9 20l11.4-3.6Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M37 32l1.4 4.6L43 38l-4.6 1.4L37 44l-1.4-4.6L31 38l4.6-1.4Z" fill="currentColor"/>`,
    battery: `<rect x="5" y="14" width="34" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><rect x="40" y="20" width="4" height="8" rx="1.5" fill="currentColor"/><path d="M23 17l-6 8h6l-2 6 7-9h-6Z" fill="currentColor"/>`,
    play: `<circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 16.5v15l12-7.5Z" fill="currentColor"/>`,
  }
  const cards: [string, string, string, [string, string]][] = [
    ['palette', '23 animated palettes', 'Ember, Synthwave, Aurora, Matrix… switch from /backdrop or just ask Claude.', ['#ff4e1a', '#ffa23a']],
    ['sparkle', 'Make your own', 'Describe a look (“sunset in LA”) or paste hex colors. Live preview, then save.', ['#ff2e97', '#8e44ad']],
    ['battery', 'Battery-aware motion', 'Glows ease to a stop on battery and ease back when you plug in.', ['#1fd1a5', '#3a7bd5']],
    ['play', 'Built-in tour', 'An animated walkthrough opens on first run. Replay with /backdrop tour.', ['#f9c80e', '#ff8c42']],
  ]
  const cw = 540, ch = 132, gap = 20, pad = 0
  const W = cw * 2 + gap, H = ch * 2 + gap
  const body = cards.map(([ic, title, text, [a, b]], i) => {
    const x = (i % 2) * (cw + gap), y = Math.floor(i / 2) * (ch + gap)
    const words = text.split(' '); const lines: string[] = ['']
    for (const w of words) { const l = lines[lines.length - 1]!; if ((l + ' ' + w).length > 48) lines.push(w); else lines[lines.length - 1] = (l ? l + ' ' : '') + w }
    return `<linearGradient id="c${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="18" fill="#12121b" stroke="#ffffff" stroke-opacity=".08"/>
<rect x="${x + 24}" y="${y + 30}" width="72" height="72" rx="18" fill="url(#c${i})"/>
<g transform="translate(${x + 36},${y + 42})" color="#ffffff">${icon[ic]}</g>
<text x="${x + 120}" y="${y + 58}" ${FONT} font-size="21" font-weight="700" fill="#ffffff">${title}</text>
${lines.map((l, k) => `<text x="${x + 120}" y="${y + 86 + k * 22}" ${FONT} font-size="15" fill="#a9a9b8">${l}</text>`).join('')}`
  }).join('\n')
  writeFileSync(`${out}/features.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`)
}
console.log('ok')
