// Regenerates the section banners in assets/banners/.
// Run from the repo root: node --experimental-strip-types scripts/banners.ts assets/banners
import { writeFileSync } from 'node:fs'
import { PALETTES } from '../hooks/palettes.ts'
const out = process.argv[2]
const FONT = `font-family="-apple-system, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"`
const I: Record<string, string> = {
  install: `<path d="M24 6v24M14 21l10 10 10-10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 34v4a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-4" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  use: `<rect x="5" y="9" width="38" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M13 19l6 5-6 5M23 30h11" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  create: `<path d="M24 5l3.6 11.4L39 20l-11.4 3.6L24 35l-3.6-11.4L9 20l11.4-3.6Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M37 32l1.4 4.6L43 38l-4.6 1.4L37 44l-1.4-4.6L31 38l4.6-1.4Z" fill="currentColor"/>`,
  palettes: `<path d="M24 6a18 18 0 1 0 0 36c2.2 0 3.6-1.8 3.6-3.6 0-1-.4-1.8-1-2.4-.6-.6-1-1.4-1-2.4 0-2 1.6-3.6 3.6-3.6H33A9 9 0 0 0 42 21C42 12.7 34 6 24 6Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><circle cx="15" cy="21" r="2.8" fill="currentColor"/><circle cx="21" cy="14" r="2.8" fill="currentColor"/><circle cx="29.5" cy="14.5" r="2.8" fill="currentColor"/>`,
  battery: `<rect x="5" y="14" width="34" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="3.5"/><rect x="40" y="20" width="4" height="8" rx="1.5" fill="currentColor"/><path d="M23 17l-6 8h6l-2 6 7-9h-6Z" fill="currentColor"/>`,
  shield: `<path d="M24 5l15 6v11c0 10-6.5 17-15 21-8.5-4-15-11-15-21V11Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M17 24l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  wrench: `<path d="M30 6a10 10 0 0 0-9.4 13.4L7 33a3.5 3.5 0 0 0 5 5l13.6-13.6A10 10 0 0 0 42 16l-6 6-6-6 6-6a10 10 0 0 0-6-4Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>`,
  map: `<path d="M17 8L6 12v28l11-4 14 4 11-4V8l-11 4Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M17 8v28M31 12v28" fill="none" stroke="currentColor" stroke-width="3.5"/>`,
  people: `<circle cx="17" cy="17" r="6.5" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="33" cy="19" r="5" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M5 40c1-7 6-11 12-11s11 4 12 11" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M29 30c5 0 9 3 10 10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  heart: `<path d="M24 41s-16-9.5-16-21a9 9 0 0 1 16-5.6A9 9 0 0 1 40 20c0 11.5-16 21-16 21Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>`,
}
const banners: [string, string, string, string, string][] = [
  ['install', 'install', 'Install', 'One click in the desktop app, or let Claude set it up.', 'ember'],
  ['use', 'use', 'How to use', '/backdrop, a picker, or just ask Claude.', 'ocean'],
  ['create', 'create', 'Make your own', 'Describe a look or paste hex colors. Preview, then save.', 'synthwave'],
  ['palettes', 'palettes', 'Palettes', '23 built in, each recoloring the whole app.', 'aurora'],
  ['performance', 'battery', 'Performance & battery', 'Moves when plugged in, eases to a stop on battery.', 'mint'],
  ['privacy', 'shield', 'Privacy & permissions', 'What it runs, sends and stores. Short list.', 'midnight'],
  ['troubleshooting', 'wrench', 'Troubleshooting', 'Quick fixes for the usual hiccups.', 'desert'],
  ['community', 'people', 'Community themes wanted', 'Made a theme you love? Open a PR and share it.', 'neon-tokyo'],
  ['roadmap', 'map', 'Roadmap', 'Where backdrop is headed, and how to help.', 'galaxy'],
  ['contributing', 'heart', 'Contributing', 'Add a palette, report a bug, share a theme.', 'cherry-blossom'],
]
const W = 1200, H = 180
for (const [file, ic, title, sub, pid] of banners) {
  const p = PALETTES.find(x => x.id === pid)!
  const [a, b, c] = [p.glows[2] ?? p.glows[0], p.glows[1] ?? p.glows[0], p.glows[4] ?? p.glows[0]]
  writeFileSync(`${out}/${file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="r"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <linearGradient id="base" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${p.base[0]}"/><stop offset=".6" stop-color="${p.base[1]}"/><stop offset="1" stop-color="${p.base[2]}"/></linearGradient>
  <radialGradient id="g1" gradientUnits="userSpaceOnUse" cx="150" cy="190" r="460"><stop offset="0" stop-color="${a}" stop-opacity=".9"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" gradientUnits="userSpaceOnUse" cx="1150" cy="0" r="420"><stop offset="0" stop-color="${b}" stop-opacity=".85"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g3" gradientUnits="userSpaceOnUse" cx="820" cy="200" r="320"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".6" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
</defs>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="url(#base)"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/><rect width="${W}" height="${H}" fill="url(#g2)"/><rect width="${W}" height="${H}" fill="url(#g3)"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
</g>
<rect x="48" y="46" width="88" height="88" rx="24" fill="#ffffff" fill-opacity=".16" stroke="#ffffff" stroke-opacity=".35"/>
<g transform="translate(68,66)" color="#ffffff">${I[ic]}</g>
<text x="166" y="98" ${FONT} font-size="46" font-weight="800" letter-spacing="-1" fill="#ffffff">${title.replace('&', '&amp;')}</text>
<text x="168" y="133" ${FONT} font-size="20" font-weight="500" fill="#ffffff" fill-opacity=".82">${sub}</text>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="#ffffff" stroke-opacity=".12"/>
</svg>`)
}
console.log('ok')
