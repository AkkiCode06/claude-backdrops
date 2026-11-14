// The welcome tour: a 20-second looping animation of a mock Claude Code window,
// in four scenes with a caption each. Pure SVG + SMIL, no script.
//
//  0-5s   gradients drift behind the chat and cycle through palettes
//  5-10s  /backdrop is typed, the picker slides in, a palette is clicked
//  10-15s a look is described ("cozy forest at dusk") and previewed
//  15-20s unplugged: a battery appears and the glows ease to a stop

const DUR = '20s'
const LOOP = `dur="${DUR}" repeatCount="indefinite"`

// The palettes the tour moves through, at these points of the loop.
const E = { base: '#1a0500', g: ['#ff4e1a', '#ffa23a', '#8b1e0f'] } // Ember
const O = { base: '#020d1f', g: ['#00a6c8', '#7fffd4', '#0353a4'] } // Ocean
const S = { base: '#12002a', g: ['#ff2e97', '#ff8c42', '#6a1b9a'] } // Synthwave
const A = { base: '#04101e', g: ['#1fd1a5', '#3a7bd5', '#8e44ad'] } // Aurora (clicked)
const F = { base: '#07140c', g: ['#52b788', '#d4a373', '#2d6a4f'] } // Forest (described)
const COLOR_TIMES = '0;.08;.1;.18;.2;.4;.42;.68;.7;.97;1'
const SEQ = [E, E, O, O, S, S, A, A, F, F, E]
const colorAnim = (pick: (p: typeof E) => string, attr = 'stop-color') =>
  `<animate attributeName="${attr}" values="${SEQ.map(pick).join(';')}" keyTimes="${COLOR_TIMES}" ${LOOP}/>`

// Shown only between `from` and `to` (fractions of the loop), with short fades.
const during = (from: number, to: number) => {
  const f = (x: number) => Math.min(Math.max(x, 0), 1).toFixed(3)
  if (from <= 0) return `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;${f(to - 0.01)};${f(to)};1" ${LOOP}/>`
  return `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${f(from)};${f(from + 0.01)};${f(to - 0.01)};${f(to)};1" ${LOOP}/>`
}

// Text that types itself out between `from` and `from + 0.04` and stays until `to`.
let clipId = 0
const typed = (text: string, x: number, y: number, width: number, from: number, to: number, attrs: string) => {
  clipId += 1
  const f = (n: number) => n.toFixed(3)
  return `<clipPath id="type${clipId}"><rect x="${x}" y="${y - 14}" height="20" width="0">` +
    `<animate attributeName="width" values="0;0;${width};${width};0;0" keyTimes="0;${f(from)};${f(from + 0.04)};${f(to)};${f(to + 0.001)};1" ${LOOP}/></rect></clipPath>` +
    `<text x="${x}" y="${y}" clip-path="url(#type${clipId})" ${attrs}>${text}</text>`
}

const glow = (i: number, cx: number, cy: number, r: number, rx: number, ry: number) => {
  // Four laps of a small ellipse; it moves for 15s, eases to rest by 17s back
  // at its start point, and holds there through the battery scene.
  const lap = `a${rx},${ry} 0 1,1 ${2 * rx},0 a${rx},${ry} 0 1,1 ${-2 * rx},0`
  return `<radialGradient id="tg${i}"><stop offset="0" stop-opacity=".95">${colorAnim(p => p.g[i] ?? p.base)}</stop>` +
    `<stop offset="1" stop-opacity="0">${colorAnim(p => p.g[i] ?? p.base)}</stop></radialGradient>` +
    `<g><animateMotion path="M0,0 ${lap} ${lap} ${lap} ${lap}" keyPoints="0;.7;.75;.75" keyTimes="0;.75;.85;1" calcMode="spline" keySplines="0 0 1 1;.25 .5 .6 1;0 0 1 1" ${LOOP}/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tg${i})"/></g>`
}

const PALETTE_ROWS: [string, string, string][] = [
  ['Ember', '#ff4e1a', '#ffa23a'],
  ['Ocean', '#0353a4', '#7fffd4'],
  ['Synthwave', '#ff2e97', '#ff8c42'],
  ['Aurora', '#1fd1a5', '#8e44ad'],
  ['Forest', '#2d6a4f', '#d4a373'],
]

const panel = () => {
  const rows = PALETTE_ROWS.map(([name, a, b], i) => {
    const y = 86 + i * 30
    return `<linearGradient id="sw${i}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` +
      `<rect x="452" y="${y}" width="44" height="16" rx="5" fill="url(#sw${i})"/>` +
      `<rect x="504" y="${y - 2}" width="${name.length * 7 + 18}" height="20" rx="6" fill="#ffffff" fill-opacity="${name === 'Aurora' ? '.9' : '.12'}">` +
      (name === 'Aurora' ? `<animate attributeName="fill-opacity" values=".12;.12;.9;.9;.12" keyTimes="0;.4;.41;.97;1" ${LOOP}/>` : '') +
      `</rect><text x="513" y="${y + 12}" font-size="11" fill="${name === 'Aurora' ? '#0b1726' : '#e8e8ee'}">${name}` +
      (name === 'Aurora' ? `<animate attributeName="fill" values="#e8e8ee;#e8e8ee;#0b1726;#0b1726;#e8e8ee" keyTimes="0;.4;.41;.97;1" ${LOOP}/>` : '') +
      `</text>`
  }).join('')
  return `<g>
    <animateTransform attributeName="transform" type="translate" values="200,0;200,0;0,0;0,0;200,0;200,0" keyTimes="0;.3;.33;.72;.75;1" calcMode="spline" keySplines="0 0 1 1;.3 0 .2 1;0 0 1 1;.4 0 .8 1;0 0 1 1" ${LOOP}/>
    <rect x="440" y="44" width="180" height="336" fill="#0f1220" fill-opacity=".92"/>
    <text x="452" y="68" font-size="12" font-weight="600" fill="#ffffff">Background</text>
    ${rows}
    <text x="452" y="252" font-size="11" font-weight="600" fill="#ffffff">Make your own</text>
    <rect x="452" y="262" width="156" height="24" rx="6" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".25"/>
    ${typed('cozy forest at dusk', 460, 278, 130, 0.6, 0.72, 'font-size="11" fill="#ffffff"')}
    <rect x="452" y="294" width="56" height="22" rx="6" fill="#ffffff" fill-opacity=".14">
      <animate attributeName="fill-opacity" values=".14;.14;.6;.14;.14" keyTimes="0;.66;.67;.69;1" ${LOOP}/>
    </rect>
    <text x="461" y="309" font-size="11" fill="#ffffff">Preview</text>
  </g>`
}

const cursor = () => `<g>
  <animateTransform attributeName="transform" type="translate" values="380,330;380,330;530,166;530,166;470,305;470,305;380,330" keyTimes="0;.33;.38;.6;.64;.97;1" calcMode="spline" keySplines="0 0 1 1;.3 0 .2 1;0 0 1 1;.3 0 .2 1;0 0 1 1;0 0 1 1" ${LOOP}/>
  ${during(0.3, 0.72)}
  <circle r="9" fill="#ffffff" fill-opacity="0">
    <animate attributeName="fill-opacity" values="0;0;.45;0;0;.45;0;0" keyTimes="0;.395;.4;.42;.655;.66;.68;1" ${LOOP}/>
  </circle>
  <path d="M0,0 L0,15 L4,11 L7,18 L9,17 L6,10 L11,10 Z" fill="#ffffff" stroke="#000000" stroke-width="1"/>
</g>`

const battery = () => `<g transform="translate(560,56)">
  ${during(0.75, 1)}
  <rect x="0" y="0" width="30" height="14" rx="3" fill="none" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="31" y="4" width="3" height="6" rx="1" fill="#ffffff"/>
  <rect x="2.5" y="2.5" width="16" height="9" rx="1.5" fill="#ffffff"/>
  <path d="M-12,1 L-16,8 L-12,8 L-14,14 L-8,5 L-12,5 Z" fill="#ffd23d">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.79;.8;1" ${LOOP}/>
  </path>
</g>`

const chat = () => `
  <rect x="120" y="76" width="200" height="12" rx="6" fill="#ffffff" fill-opacity=".55"/>
  <rect x="120" y="96" width="250" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="120" y="112" width="230" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="120" y="128" width="160" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="250" y="160" width="140" height="22" rx="11" fill="#ffffff" fill-opacity=".18"/>
  <rect x="120" y="200" width="240" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="120" y="216" width="260" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="120" y="232" width="190" height="10" rx="5" fill="#ffffff" fill-opacity=".3"/>
  <rect x="80" y="330" width="320" height="32" rx="10" fill="#0b0b12" fill-opacity=".85" stroke="#ffffff" stroke-opacity=".2"/>
  ${typed('/backdrop', 96, 351, 70, 0.26, 0.4, 'font-size="13" fill="#ffffff" font-family="ui-monospace, Menlo, monospace"')}`

const CAPTIONS: [number, number, string][] = [
  [0, 0.25, 'Animated gradients drift behind every Claude Code session'],
  [0.25, 0.5, 'Type /backdrop to open the picker, then click a palette'],
  [0.5, 0.75, 'Or describe a look and Claude picks the colors'],
  [0.75, 1, 'On battery, the glows ease to a stop to save power'],
]

const captions = () => CAPTIONS.map(([from, to, text], i) => `<g>${during(from, to)}
  <text x="320" y="420" text-anchor="middle" font-size="15" font-weight="600" fill="#ffffff"><tspan fill="#ffffff" fill-opacity=".5">${i + 1}/4  </tspan>${text}</text>
</g>`).join('')

export const TOUR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" font-family="system-ui, -apple-system, sans-serif">
<defs>
  <clipPath id="win"><rect x="20" y="20" width="600" height="360" rx="14"/></clipPath>
  <linearGradient id="tbase" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0">${colorAnim(p => p.base)}</stop>
    <stop offset="1">${colorAnim(p => p.g[2] ?? p.base)}</stop>
  </linearGradient>
</defs>
<rect width="640" height="440" rx="16" fill="#0b0b10"/>
<g clip-path="url(#win)">
  <rect x="20" y="20" width="600" height="360" fill="url(#tbase)"/>
  ${glow(0, 140, 300, 200, 40, 26)}
  ${glow(1, 520, 110, 180, 34, 30)}
  ${glow(2, 330, 200, 170, 46, 22)}
  <rect x="20" y="20" width="600" height="24" fill="#000000" fill-opacity=".35"/>
  <circle cx="36" cy="32" r="5" fill="#ff5f57"/><circle cx="52" cy="32" r="5" fill="#febc2e"/><circle cx="68" cy="32" r="5" fill="#28c840"/>
  ${chat()}
  ${panel()}
  ${battery()}
  ${cursor()}
</g>
<rect x="20" y="20" width="600" height="360" rx="14" fill="none" stroke="#ffffff" stroke-opacity=".12"/>
${captions()}
</svg>`

// The same tour as text, for surfaces that can't draw SVG (the terminal).
export const TOUR_STEPS: readonly string[] = [
  'Animated gradients drift behind every Claude Code session on desktop.',
  'Type /backdrop to open the picker, then click any of the 23 palettes.',
  'Or describe a look ("cozy forest at dusk") and Claude picks the colors; preview it, then Save.',
  'On battery, the glows ease to a stop to save power, and ease back up when you plug in.',
]
