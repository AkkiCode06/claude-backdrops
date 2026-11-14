import type { Palette } from './palettes'
import type { Mode } from './scene'

// ─────────────────────────────────────────────────────────────────────────────
//  The Backdrop kit: build a background style out of a few building blocks.
//
//    export const myStyle = style({
//      id: 'my-style', name: 'My style', description: 'one line for the picker',
//      layers: (k, p) => [
//        k.sky(p.base),
//        k.glow({ at: [0.2, 0.8], color: p.glows[1] }),
//        k.stars({ count: 80 }),
//      ],
//    })
//
//  Then add it to STYLES in hooks/styles.ts. That's it.
//
//  You never write SVG or animation code. The kit:
//    - draws on a 1600 x 1000 canvas that fills any window
//    - animates with SVG SMIL (what Claude Code's desktop app runs reliably)
//    - drops every animation when the scene should be still (on battery, motion off)
//    - keeps ids unique, the result small, and the middle readable
//
//  Positions are fractions of the canvas: [0, 0] top-left, [1, 1] bottom-right.
//  Every block has sensible defaults; pass only what you want to change.
// ─────────────────────────────────────────────────────────────────────────────

export const W = 1600
export const H = 1000

type Part = { defs?: string; body: string }
type XY = readonly [number, number]

export type Kit = {
  // The palette being drawn (also passed to layers as `p`).
  readonly palette: Palette
  // False when the scene should be still: blocks then draw no animation.
  readonly moving: boolean
  // Seeded random numbers in 0..1: the same scene every time.
  readonly random: () => number
  // Pick one item from a list at random.
  pick: <T>(items: readonly T[]) => T

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
  // Falling particles: rain, snow, embers, petals.
  particles: (options?: { count?: number; color?: string; size?: readonly [number, number]; speed?: number; direction?: 'down' | 'up'; streak?: boolean; opacity?: number }) => Part
  // A retro perspective grid on the floor, scrolling toward you.
  grid: (options?: { color?: string; horizon?: number; lines?: number; seconds?: number; opacity?: number }) => Part
  // A big sun or moon, optionally with retro stripes cut through it.
  sun: (options?: { at?: XY; size?: number; colors?: readonly [string, string]; stripes?: boolean }) => Part
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
  build: (palette: Palette, mode: Mode) => string
}

const n = (x: number, d = 1) => Number(x.toFixed(d)).toString()
const px = (at: XY) => [at[0] * W, at[1] * H] as const

export const seeded = (seed: number) => {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const hashOf = (text: string) => text.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)

export const makeKit = (palette: Palette, moving: boolean, seed: number): Kit => {
  const random = seeded(seed)
  let ids = 0
  const id = (name: string) => `${name}${(ids += 1)}`
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T
  const loop = (attr: string, values: string, seconds: number, extra = '') =>
    moving ? `<animate attributeName="${attr}" values="${values}" dur="${n(seconds)}s" repeatCount="indefinite"${extra}/>` : ''
  const move = (values: string, seconds: number, extra = '') =>
    moving ? `<animateTransform attributeName="transform" type="translate" values="${values}" dur="${n(seconds)}s" repeatCount="indefinite"${extra}/>` : ''
  const smooth = (segments: number) => ` calcMode="spline" keySplines="${Array(segments).fill('.45 0 .55 1').join(';')}"`

  const kit: Kit = {
    palette,
    moving,
    random,
    pick,

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

    glows: ({ count = 5, opacity = 0.9, seconds = 22 } = {}) => {
      const spots: XY[] = [[0.5, 0.6], [0.24, 0.38], [0.08, 0.85], [0.44, 0.46], [0.88, 0.22], [0.7, 0.85], [0.15, 0.1]]
      const parts = Array.from({ length: count }, (_, i) =>
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

    stars: ({ count = 100, size = [0.6, 1.8], colors = ['#ffffff', '#ffffff', palette.text.primary, palette.glows[2], palette.glows[4]], twinkle = 0.45, drift = 40, seconds = 80 } = {}) => {
      const dots = Array.from({ length: count }, () => {
        const r = size[0] + random() * (size[1] - size[0])
        const o = 0.35 + random() * 0.6
        const tw = random() < twinkle ? loop('opacity', `${n(o, 2)};${n(o * 0.25, 2)};${n(o, 2)}`, 2 + random() * 5, ` begin="-${n(random() * 6)}s"`) : ''
        return `<circle cx="${n(random() * (W + 100) - 50, 0)}" cy="${n(random() * H, 0)}" r="${n(r, 2)}" fill="${pick(colors)}" opacity="${n(o, 2)}">${tw}</circle>`
      }).join('')
      return { body: `<g>${move(`0,0;${-drift},${n(drift / 4)};0,0`, seconds, smooth(2))}${dots}</g>` }
    },

    shootingStar: ({ every = 11, from = [0.78, 0.12] as XY, to = [0.5, 0.33] as XY, color = '#ffffff' } = {}) => {
      if (!moving) return { body: '' }
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

    waves: ({ count = 4, colors = [palette.glows[0], palette.glows[1], palette.glows[2], palette.glows[3], palette.glows[4]], height = 0.35, amplitude = 28, seconds = 14, opacity = 0.55 } = {}) => {
      const body = Array.from({ length: count }, (_, i) => {
        const top = H * (1 - height) + (i * H * height) / (count + 0.5)
        const wl = 520 + i * 90
        let d = `M${-wl} ${n(top)}`
        for (let x = -wl; x < W + wl * 2; x += wl) d += ` q${n(wl / 4)} ${-amplitude} ${n(wl / 2)} 0 t${n(wl / 2)} 0`
        d += ` V${H} H${-wl} Z`
        const secs = seconds * (0.8 + i * 0.25)
        return `<path d="${d}" fill="${colors[i % colors.length]}" opacity="${n(opacity, 2)}">${move(`0,0;${-wl},0`, secs)}</path>`
      }).join('')
      return { body: `<g>${body}</g>` }
    },

    particles: ({ count = 70, color = palette.text.primary, size = [1, 2.6], speed = 1, direction = 'down', streak = false, opacity = 0.6 } = {}) => {
      const sign = direction === 'down' ? 1 : -1
      const body = Array.from({ length: count }, () => {
        const x = random() * W, r = size[0] + random() * (size[1] - size[0])
        const secs = (6 + random() * 8) / speed
        const start = random() * H
        const shape = streak
          ? `<line x1="0" y1="0" x2="${n(-r * 2)}" y2="${n(-r * 10 * sign)}" stroke="${color}" stroke-width="${n(r * 0.6, 2)}" stroke-linecap="round"/>`
          : `<circle r="${n(r, 2)}" fill="${color}"/>`
        const sway = n(10 + random() * 30)
        const y0 = n(start), y1 = n(start + sign * H), y2 = n(start + sign * H - sign * H)
        const anim = moving
          ? `<animateTransform attributeName="transform" type="translate" values="${n(x)},${y0};${n(Number(x) + Number(sway))},${n((Number(y0) + Number(y1)) / 2)};${n(x)},${y1}" dur="${n(secs)}s" repeatCount="indefinite" begin="-${n(random() * secs)}s"/>`
          : ''
        void y2
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

    raw: (body, defs) => ({ body, ...(defs ? { defs } : {}) }),
  }
  return kit
}

const column = (color: string) =>
  `<linearGradient id="readingColumn" x1="0" y1="0" x2="1" y2="0">` +
  `<stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".2" stop-color="${color}" stop-opacity="0"/>` +
  `<stop offset=".3" stop-color="${color}" stop-opacity=".58"/><stop offset=".7" stop-color="${color}" stop-opacity=".58"/>` +
  `<stop offset=".8" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`

// Turns a style definition into a style the mod can draw.
export const style = (def: StyleDef): Style => ({
  id: def.id,
  name: def.name,
  description: def.description,
  build: (palette, mode) => {
    const kit = makeKit(palette, mode.kind === 'flow', hashOf(`${def.id}:${palette.id}`))
    const parts = def.layers(kit, palette)
    const defs = parts.map(p => p.defs ?? '').join('') + (def.readingColumn === false ? '' : column(palette.surfaces[0]))
    const body = parts.map(p => p.body).join('\n')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}` +
      (def.readingColumn === false ? '' : `<rect width="${W}" height="${H}" fill="url(#readingColumn)"/>`) + `</svg>`
    if (svg.length > 131072) throw new Error(`Style "${def.id}" draws ${svg.length} characters; the limit is 131072. Use fewer stars or particles.`)
    return svg
  },
})
