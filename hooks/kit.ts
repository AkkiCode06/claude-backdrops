import type { Palette } from './palettes'
import type { Mode } from './scene'

// ─────────────────────────────────────────────────────────────────────────────
//  The Backdrop kit: build a background style out of a few building blocks.
//
//    // hooks/styles/my-style.ts
//    import { style } from '../kit'
//    export default style({
//      id: 'my-style', name: 'My style', description: 'one line for the picker',
//      layers: (k, p) => [
//        k.sky(p.base),
//        k.glow({ at: [0.2, 0.8], color: p.glows[1] }),
//        k.stars({ count: 80 }),
//      ],
//    })
//
//  Then list it in hooks/styles/index.ts (or run `node --experimental-strip-types
//  scripts/new-style.ts my-style`, which does both). Preview it in a browser with
//  scripts/preview.ts. Reference for every block: docs/kit.md.
//
//  You never write SVG or animation code. The kit:
//    - draws on a 1600 x 1000 canvas that fills any window
//    - animates with SVG SMIL (what Claude Code's desktop app runs reliably)
//    - drops every animation when the scene should be still (on battery, motion off)
//    - scales element counts down in low-power mode (k.count)
//    - tells your style what Claude is doing (k.state), so it can react
//    - keeps ids unique, the result small, and the middle readable
//
//  Positions are fractions of the canvas: [0, 0] top-left, [1, 1] bottom-right.
//  Every block has sensible defaults; pass only what you want to change.
// ─────────────────────────────────────────────────────────────────────────────

export const W = 1600
export const H = 1000

export type Part = { defs?: string; body: string }
export type XY = readonly [number, number]

// What Claude is doing right now, for styles that react to it.
export type Activity = 'idle' | 'thinking' | 'working' | 'done' | 'error'

export type SceneState = {
  activity: Activity
  // How much of the 5-hour usage window is used, 0..1 (0 when unknown).
  usage: number
  // How full the context window is, 0..1 (0 when unknown).
  context: number
  // Low-power mode: draw fewer, simpler things.
  lowPower: boolean
}

export const CALM: SceneState = { activity: 'idle', usage: 0, context: 0, lowPower: false }

export type Kit = {
  // The palette being drawn (also passed to layers as `p`).
  readonly palette: Palette
  // False when the scene should be still: blocks then draw no animation.
  readonly moving: boolean
  // What Claude is doing, how much usage is left, and low-power mode.
  readonly state: SceneState
  // Low-power mode is on: k.count() already scales counts; use this for anything else.
  readonly lowPower: boolean
  // Seeded random numbers in 0..1: the same scene every time.
  readonly random: () => number
  // Pick one item from a list at random.
  pick: <T>(items: readonly T[]) => T
  // A count scaled for low-power mode: k.count(120) is 120 normally, about 50 in low power.
  count: (n: number) => number

  // A vertical or diagonal gradient filling the canvas. `colors` bottom to top.
  sky: (colors: readonly string[], options?: { angle?: 'vertical' | 'diagonal' }) => Part
  // A soft round glow. With `orbit`, it drifts around a small ellipse.
  glow: (options: { at?: XY; size?: number; color?: string; opacity?: number; orbit?: { rx?: number; ry?: number; seconds?: number } }) => Part
  // Several glows from the palette, spread out and drifting (the gradient look).
  glows: (options?: { count?: number; opacity?: number; seconds?: number }) => Part
  // A field of stars that twinkle and drift.
  stars: (options?: { count?: number; size?: readonly [number, number]; colors?: readonly string[]; twinkle?: number; drift?: number; seconds?: number }) => Part
  // A streak across the sky every `every` seconds.
  shootingStar: (options?: { every?: number; from?: XY; to?: XY; color?: string }) => Part
  // Layered waves rolling along the bottom.
  waves: (options?: { count?: number; colors?: readonly string[]; height?: number; amplitude?: number; seconds?: number; opacity?: number }) => Part
  // Falling (or rising) particles: rain, snow, embers, petals.
  particles: (options?: { count?: number; color?: string; size?: readonly [number, number]; speed?: number; direction?: 'down' | 'up'; streak?: boolean; opacity?: number }) => Part
  // A retro perspective grid on the floor, scrolling toward you.
  grid: (options?: { color?: string; horizon?: number; lines?: number; seconds?: number; opacity?: number }) => Part
  // A big sun or moon, optionally with retro stripes cut through it.
  sun: (options?: { at?: XY; size?: number; colors?: readonly [string, string]; stripes?: boolean }) => Part
  // Northern-lights curtains swaying across the top.
  aurora: (options?: { count?: number; colors?: readonly string[]; top?: number; height?: number; seconds?: number; opacity?: number }) => Part
  // Matrix-style columns of falling characters.
  codeRain: (options?: { columns?: number; color?: string; head?: string; size?: number; speed?: number; chars?: string; opacity?: number }) => Part
  // Lava-lamp blobs rising and sinking.
  blobs: (options?: { count?: number; colors?: readonly string[]; size?: readonly [number, number]; seconds?: number; opacity?: number }) => Part
  // Outlined polygons slowly turning.
  shapes: (options?: { count?: number; sides?: readonly number[]; size?: readonly [number, number]; color?: string; width?: number; seconds?: number; opacity?: number }) => Part
  // A regular dot grid (static, cheap).
  dots: (options?: { spacing?: number; size?: number; color?: string; opacity?: number }) => Part
  // A pixel-art city skyline with windows flickering on and off.
  skyline: (options?: { colors?: readonly string[]; window?: string; height?: number; pixel?: number; lit?: number }) => Part
  // Darkened (or tinted) edges.
  vignette: (options?: { color?: string; strength?: number }) => Part
  // Anything else: your own SVG, in canvas pixels. `defs` for gradients and the like.
  raw: (body: string, defs?: string) => Part
}

export type StyleDef = {
  id: string
  name: string
  description: string
  layers: (k: Kit, p: Palette) => readonly Part[]
  // Whether the reading column (a darker band behind the chat) is added. Default true.
  readingColumn?: boolean
}

export type Style = {
  id: string
  name: string
  description: string
  build: (palette: Palette, mode: Mode, state?: SceneState) => string
}

const n = (x: number, d = 1) => Number(x.toFixed(d)).toString()
const px = (at: XY) => [at[0] * W, at[1] * H] as const
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const seeded = (seed: number) => {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const hashOf = (text: string) => text.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)

export const makeKit = (palette: Palette, moving: boolean, seed: number, state: SceneState = CALM): Kit => {
  const random = seeded(seed)
  let ids = 0
  const id = (name: string) => `${name}${(ids += 1)}`
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T
  const count = (k: number) => (state.lowPower ? Math.max(1, Math.ceil(k * 0.42)) : k)
  const loop = (attr: string, values: string, seconds: number, extra = '') =>
    moving ? `<animate attributeName="${attr}" values="${values}" dur="${n(seconds)}s" repeatCount="indefinite"${extra}/>` : ''
  const move = (values: string, seconds: number, extra = '') =>
    moving ? `<animateTransform attributeName="transform" type="translate" values="${values}" dur="${n(seconds)}s" repeatCount="indefinite"${extra}/>` : ''
  const smooth = (segments: number) => ` calcMode="spline" keySplines="${Array(segments).fill('.45 0 .55 1').join(';')}"`

  const kit: Kit = {
    palette,
    moving,
    state,
    lowPower: state.lowPower,
    random,
    pick,
    count,

    sky: (colors, options = {}) => {
      const g = id('sky')
      const diagonal = options.angle === 'diagonal'
      const stops = colors.map((c, i) => `<stop offset="${n(i / Math.max(colors.length - 1, 1), 3)}" stop-color="${c}"/>`).join('')
      return {
        defs: `<linearGradient id="${g}" x1="0" y1="1" x2="${diagonal ? 1 : 0}" y2="0">${stops}</linearGradient>`,
        body: `<rect width="${W}" height="${H}" fill="url(#${g})"/>`,
      }
    },

    glow: ({ at = [0.5, 0.5] as XY, size = 0.45, color = palette.glows[0], opacity = 0.85, orbit } = {}) => {
      const g = id('glow')
      const [cx, cy] = px(at)
      const r = size * W * 0.5
      const o = orbit ?? {}
      const rx = o.rx ?? 160, ry = o.ry ?? 110, secs = o.seconds ?? 20
      const path = `M0,0 a${rx},${ry} 0 1,1 ${2 * rx},0 a${rx},${ry} 0 1,1 ${-2 * rx},0`
      const motion = orbit && moving ? `<animateMotion path="${path}" dur="${n(secs)}s" repeatCount="indefinite"/>` : ''
      return {
        defs: `<radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".45" stop-color="${color}" stop-opacity="${n(opacity * 0.55, 2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
        body: `<g>${motion}<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${g})"/></g>`,
      }
    },

    glows: ({ count: c = 5, opacity = 0.9, seconds = 22 } = {}) => {
      const spots: XY[] = [[0.5, 0.6], [0.24, 0.38], [0.08, 0.85], [0.44, 0.46], [0.88, 0.22], [0.7, 0.85], [0.15, 0.1]]
      const parts = Array.from({ length: Math.min(count(c), c) }, (_, i) =>
        kit.glow({
          at: spots[i % spots.length],
          size: 0.62 - i * 0.04,
          color: palette.glows[i % palette.glows.length],
          opacity,
          orbit: { rx: 140 + random() * 120, ry: 90 + random() * 90, seconds: seconds * (0.7 + random() * 0.6) },
        }),
      )
      return { defs: parts.map(p => p.defs).join(''), body: parts.map(p => p.body).join('') }
    },

    stars: ({ count: c = 100, size = [0.6, 1.8], colors = ['#ffffff', '#ffffff', palette.text.primary, palette.glows[2], palette.glows[4]], twinkle = 0.45, drift = 40, seconds = 80 } = {}) => {
      const dots = Array.from({ length: count(c) }, () => {
        const r = size[0] + random() * (size[1] - size[0])
        const o = 0.35 + random() * 0.6
        const tw = !state.lowPower && random() < twinkle ? loop('opacity', `${n(o, 2)};${n(o * 0.25, 2)};${n(o, 2)}`, 2 + random() * 5, ` begin="-${n(random() * 6)}s"`) : ''
        return `<circle cx="${n(random() * (W + 100) - 50, 0)}" cy="${n(random() * H, 0)}" r="${n(r, 2)}" fill="${pick(colors)}" opacity="${n(o, 2)}">${tw}</circle>`
      }).join('')
      return { body: `<g>${drift ? move(`0,0;${-drift},${n(drift / 4)};0,0`, seconds, smooth(2)) : ''}${dots}</g>` }
    },

    shootingStar: ({ every = 11, from = [0.78, 0.12] as XY, to = [0.5, 0.33] as XY, color = '#ffffff' } = {}) => {
      if (!moving || state.lowPower) return { body: '' }
      const g = id('trail')
      const [x1, y1] = px(from), [x2, y2] = px(to)
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      return {
        defs: `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}"/></linearGradient>`,
        body: `<g opacity="0"><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.86;.88;.94;1" dur="${n(every)}s" repeatCount="indefinite"/>` +
          `<animateTransform attributeName="transform" type="translate" values="${n(x1)},${n(y1)};${n(x1)},${n(y1)};${n(x1)},${n(y1)};${n(x2)},${n(y2)};${n(x2)},${n(y2)}" keyTimes="0;.86;.88;.94;1" dur="${n(every)}s" repeatCount="indefinite"/>` +
          `<line x1="-160" y1="0" x2="0" y2="0" stroke="url(#${g})" stroke-width="2" stroke-linecap="round" transform="rotate(${n(angle)})"/></g>`,
      }
    },

    waves: ({ count: c = 4, colors = [palette.glows[0], palette.glows[1], palette.glows[2], palette.glows[3], palette.glows[4]], height = 0.35, amplitude = 28, seconds = 14, opacity = 0.55 } = {}) => {
      const layers = Math.max(2, count(c))
      const body = Array.from({ length: layers }, (_, i) => {
        const top = H * (1 - height) + (i * H * height) / (layers + 0.5)
        const wl = 520 + i * 90
        let d = `M${-wl} ${n(top)}`
        for (let x = -wl; x < W + wl * 2; x += wl) d += ` q${n(wl / 4)} ${-amplitude} ${n(wl / 2)} 0 t${n(wl / 2)} 0`
        d += ` V${H} H${-wl} Z`
        const secs = seconds * (0.8 + i * 0.25)
        return `<path d="${d}" fill="${colors[i % colors.length]}" opacity="${n(opacity, 2)}">${move(`0,0;${-wl},0`, secs)}</path>`
      }).join('')
      return { body: `<g>${body}</g>` }
    },

    particles: ({ count: c = 70, color = palette.text.primary, size = [1, 2.6], speed = 1, direction = 'down', streak = false, opacity = 0.6 } = {}) => {
      const sign = direction === 'down' ? 1 : -1
      const body = Array.from({ length: count(c) }, () => {
        const x = random() * W, r = size[0] + random() * (size[1] - size[0])
        const secs = (6 + random() * 8) / speed
        const start = random() * H
        const shape = streak
          ? `<line x1="0" y1="0" x2="${n(-r * 2)}" y2="${n(-r * 10 * sign)}" stroke="${color}" stroke-width="${n(r * 0.6, 2)}" stroke-linecap="round"/>`
          : `<circle r="${n(r, 2)}" fill="${color}"/>`
        const sway = 10 + random() * 30
        // Each particle travels a full screen height and wraps, so the field never empties.
        const from = start - sign * H * 0.1, to = from + sign * H * 1.2
        const anim = moving
          ? `<animateTransform attributeName="transform" type="translate" values="${n(x)},${n(from)};${n(x + sway)},${n((from + to) / 2)};${n(x)},${n(to)}" dur="${n(secs)}s" repeatCount="indefinite" begin="-${n(random() * secs)}s"/>`
          : ''
        return `<g transform="translate(${n(x)},${n(start)})" opacity="${n(opacity * (0.5 + random() * 0.5), 2)}">${anim}${shape}</g>`
      }).join('')
      return { body: `<g>${body}</g>` }
    },

    grid: ({ color = palette.roles.accent, horizon = 0.62, lines = 14, seconds = 3, opacity = 0.55 } = {}) => {
      const g = id('fade')
      const hy = H * horizon
      const vanishing = W / 2
      const verticals = Array.from({ length: lines * 2 + 1 }, (_, i) => {
        const x = vanishing + (i - lines) * (W / lines) * 1.6
        return `<line x1="${n(vanishing)}" y1="${n(hy)}" x2="${n(x)}" y2="${H}"/>`
      }).join('')
      // Horizontal lines bunch up toward the horizon; the set scrolls by one step and loops.
      const rows = 9
      const horizontals = Array.from({ length: rows + 1 }, (_, i) => {
        const t = i / rows
        const y = hy + (H - hy) * t * t
        return `<line x1="0" y1="${n(y)}" x2="${W}" y2="${n(y)}"/>`
      }).join('')
      const step = (H - hy) / (rows * rows)
      return {
        defs: `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(hy)}" x2="0" y2="${H}"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${opacity}"/></linearGradient>`,
        body: `<g stroke="url(#${g})" stroke-width="2">${verticals}<g>${move(`0,0;0,${n(step * 3)}`, seconds)}${horizontals}</g></g>`,
      }
    },

    sun: ({ at = [0.5, 0.5] as XY, size = 0.22, colors = [palette.glows[4], palette.glows[1]], stripes = true } = {}) => {
      const g = id('sun'), m = id('cut')
      const [cx, cy] = px(at)
      const r = size * W * 0.5
      const bands = stripes
        ? `<mask id="${m}"><rect x="${n(cx - r)}" y="${n(cy - r)}" width="${n(2 * r)}" height="${n(2 * r)}" fill="#fff"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${n(cx - r)}" y="${n(cy + r * 0.1 + i * r * 0.16)}" width="${n(2 * r)}" height="${n(3 + i * 2.2)}" fill="#000"/>`).join('')}</mask>`
        : ''
      return {
        defs: `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient>${bands}`,
        body: `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${g})"${stripes ? ` mask="url(#${m})"` : ''}/>`,
      }
    },

    aurora: ({ count: c = 3, colors = [palette.glows[2], palette.glows[4], palette.glows[3]], top = 0.08, height = 0.3, seconds = 18, opacity = 0.5 } = {}) => {
      const ribbons = Math.max(1, Math.min(count(c), c))
      let defs = ''
      const body = Array.from({ length: ribbons }, (_, i) => {
        const g = id('aurora')
        const color = colors[i % colors.length] ?? palette.glows[0]
        defs += `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".12" stop-color="${color}" stop-opacity="${n(opacity, 2)}"/><stop offset=".35" stop-color="${color}" stop-opacity="${n(opacity * 0.45, 2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
        const y = H * (top + i * 0.06)
        const h = H * height * (0.8 + random() * 0.4)
        const amp = 35 + random() * 45
        const wl = 700 + random() * 400
        let d = `M${-wl} ${n(y + amp)}`
        for (let x = -wl; x < W + wl; x += wl) d += ` q${n(wl / 4)} ${n(-amp * 2)} ${n(wl / 2)} 0 t${n(wl / 2)} 0`
        d += ` v${n(h)}`
        for (let x = W + wl; x > -wl; x -= wl) d += ` q${n(-wl / 4)} ${n(amp)} ${n(-wl / 2)} 0 t${n(-wl / 2)} 0`
        d += ' Z'
        const secs = seconds * (0.8 + random() * 0.6)
        const shift = 120 + random() * 160
        return `<path d="${d}" fill="url(#${g})">${move(`0,0;${n(-shift)},10;0,0`, secs, smooth(2))}${loop('opacity', '1;.55;1', secs * 0.7)}</path>`
      }).join('')
      return { defs, body: `<g>${body}</g>` }
    },

    codeRain: ({ columns = 34, color = palette.roles.success, head = '#ffffff', size = 18, speed = 1, chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789<>/{}=+*', opacity = 0.55 } = {}) => {
      const g = id('rainfade')
      const cols = count(columns)
      const list = [...chars]
      const body = Array.from({ length: cols }, (_, i) => {
        const x = ((i + 0.5) / cols) * W + (random() - 0.5) * 20
        const len = 10 + Math.floor(random() * 16)
        const tspans = Array.from({ length: len }, (_, j) =>
          `<tspan x="${n(x)}" dy="${size}"${j === len - 1 ? ` fill="${head}"` : ''}>${esc(pick(list))}</tspan>`).join('')
        const secs = (5 + random() * 7) / speed
        const tall = len * size
        const anim = moving
          ? `<animateTransform attributeName="transform" type="translate" values="0,${n(-tall)};0,${H + 20}" dur="${n(secs)}s" repeatCount="indefinite" begin="-${n(random() * secs)}s"/>`
          : ''
        const y0 = moving ? 0 : random() * H - tall / 2
        return `<g transform="translate(0,${n(y0)})" opacity="${n(opacity * (0.5 + random() * 0.5), 2)}">${anim}<text font-family="ui-monospace, Menlo, monospace" font-size="${size}" fill="url(#${g})">${tspans}</text></g>`
      }).join('')
      return {
        defs: `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}"/></linearGradient>`,
        body: `<g>${body}</g>`,
      }
    },

    blobs: ({ count: c = 6, colors = palette.glows, size = [0.12, 0.26], seconds = 26, opacity = 0.75 } = {}) => {
      let defs = ''
      const body = Array.from({ length: count(c) }, (_, i) => {
        const g = id('blob')
        const color = colors[i % colors.length] ?? palette.glows[0]
        defs += `<radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${n(opacity, 2)}"/><stop offset=".6" stop-color="${color}" stop-opacity="${n(opacity * 0.7, 2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`
        const r = (size[0] + random() * (size[1] - size[0])) * W * 0.5
        const x = (0.1 + random() * 0.8) * W
        const low = H * 0.85, high = H * 0.15
        const secs = seconds * (0.7 + random() * 0.6)
        const wobble = 40 + random() * 60
        const anim = moving
          ? `<animateTransform attributeName="transform" type="translate" values="0,0;${n(wobble)},${n(high - low)};0,0" dur="${n(secs)}s" begin="-${n(random() * secs)}s" repeatCount="indefinite"${smooth(2)}/>`
          : ''
        const y = moving ? low : high + random() * (low - high)
        return `<g>${anim}<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r)}" ry="${n(r * (0.85 + random() * 0.3))}" fill="url(#${g})"/></g>`
      }).join('')
      return { defs, body: `<g>${body}</g>` }
    },

    shapes: ({ count: c = 9, sides = [3, 4, 6], size = [60, 180], color = palette.roles.accent, width = 2, seconds = 60, opacity = 0.35 } = {}) => {
      const body = Array.from({ length: count(c) }, () => {
        const s = pick(sides)
        const r = size[0] + random() * (size[1] - size[0])
        const cx = random() * W, cy = random() * H
        const pts = Array.from({ length: s }, (_, j) => {
          const a = (j / s) * Math.PI * 2 - Math.PI / 2
          return `${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`
        }).join(' ')
        const dir = random() < 0.5 ? 1 : -1
        const secs = seconds * (0.6 + random() * 0.8)
        const spin = moving
          ? `<animateTransform attributeName="transform" type="rotate" values="0 ${n(cx)} ${n(cy)};${dir * 360} ${n(cx)} ${n(cy)}" dur="${n(secs)}s" repeatCount="indefinite"/>`
          : ''
        return `<polygon points="${pts}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${n(opacity * (0.5 + random() * 0.5), 2)}">${spin}</polygon>`
      }).join('')
      return { body: `<g>${body}</g>` }
    },

    dots: ({ spacing = 36, size = 1.6, color = palette.text.muted, opacity = 0.22 } = {}) => {
      const p = id('dots')
      return {
        defs: `<pattern id="${p}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><circle cx="${n(spacing / 2)}" cy="${n(spacing / 2)}" r="${size}" fill="${color}"/></pattern>`,
        body: `<rect width="${W}" height="${H}" fill="url(#${p})" opacity="${n(opacity, 2)}"/>`,
      }
    },

    skyline: ({ colors = [palette.base[0], palette.surfaces[1]], window = palette.glows[4], height = 0.42, pixel = 8, lit = 0.35 } = {}) => {
      const out: string[] = []
      let x = -pixel * 2
      while (x < W) {
        const bw = pixel * (6 + Math.floor(random() * 10))
        const bh = Math.round((H * height * (0.35 + random() * 0.65)) / pixel) * pixel
        const top = H - bh
        const fill = pick(colors)
        out.push(`<rect x="${x}" y="${top}" width="${bw}" height="${bh}" fill="${fill}"/>`)
        // Windows: a pixel grid, some lit, a few of those flickering.
        for (let wy = top + pixel * 2; wy < H - pixel * 2; wy += pixel * 3) {
          for (let wx = x + pixel; wx < x + bw - pixel; wx += pixel * 2) {
            if (random() > lit * (state.lowPower ? 0.6 : 1)) continue
            const flicker = !state.lowPower && random() < 0.08 ? loop('opacity', '1;1;.15;1', 4 + random() * 8, ` begin="-${n(random() * 8)}s"`) : ''
            out.push(`<rect x="${wx}" y="${wy}" width="${pixel}" height="${pixel}" fill="${window}" opacity="${n(0.55 + random() * 0.45, 2)}">${flicker}</rect>`)
          }
        }
        x += bw + pixel * Math.floor(random() * 2)
      }
      return { body: `<g shape-rendering="crispEdges">${out.join('')}</g>` }
    },

    vignette: ({ color = '#000000', strength = 0.55 } = {}) => {
      const g = id('vignette')
      return {
        defs: `<radialGradient id="${g}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${n(strength, 2)}"/></radialGradient>`,
        body: `<rect width="${W}" height="${H}" fill="url(#${g})"/>`,
      }
    },

    raw: (body, defs) => ({ body, ...(defs ? { defs } : {}) }),
  }
  return kit
}

export const readingColumn = (color: string, strength = 0.58) =>
  `<linearGradient id="readingColumn" x1="0" y1="0" x2="1" y2="0">` +
  `<stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".2" stop-color="${color}" stop-opacity="0"/>` +
  `<stop offset=".3" stop-color="${color}" stop-opacity="${strength}"/><stop offset=".7" stop-color="${color}" stop-opacity="${strength}"/>` +
  `<stop offset=".8" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`

// Turns a style definition into a style the mod can draw.
export const style = (def: StyleDef): Style => ({
  id: def.id,
  name: def.name,
  description: def.description,
  build: (palette, mode, state = CALM) => {
    const kit = makeKit(palette, mode.kind === 'flow', hashOf(`${def.id}:${palette.id}`), state)
    const parts = def.layers(kit, palette)
    const defs = parts.map(p => p.defs ?? '').join('') + (def.readingColumn === false ? '' : readingColumn(palette.surfaces[0]))
    const body = parts.map(p => p.body).join('\n')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}` +
      (def.readingColumn === false ? '' : `<rect width="${W}" height="${H}" fill="url(#readingColumn)"/>`) + `</svg>`
    if (svg.length > 131072) throw new Error(`Style "${def.id}" draws ${svg.length} characters; the limit is 131072. Use fewer stars or particles.`)
    return svg
  },
})
