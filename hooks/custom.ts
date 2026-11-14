import { makeColors } from './make-colors.js'
import type { Palette } from './palettes'

// Turns 1-5 colors someone picked into a whole palette: the glows are their
// colors, and the base, surfaces and text are worked out from them so the app
// stays readable whatever they chose.

const HEX = /#?([0-9a-f]{6}|[0-9a-f]{3})\b/gi

// Every hex color in a piece of text: "#ff6b6b, 4ecdc4 and #123" -> 3 colors.
export const parseColors = (text: string): string[] =>
  [...text.matchAll(HEX)].map(m => {
    const h = (m[1] ?? '').toLowerCase()
    return '#' + (h.length === 3 ? h.split('').map(c => c + c).join('') : h)
  })

export type Hsl = { h: number; s: number; l: number }

export const toHsl = (hex: string): Hsl => {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h * 60, s, l }
}

export const toHex = ({ h, s, l }: Hsl): string => {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(Math.min(Math.max(x, 0), 1) * 255).toString(16).padStart(2, '0')).join('')
}

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi)

export type CustomResult = { palette: Palette } | { error: string }

export const paletteFromColors = (name: string, colors: readonly string[], id: string): CustomResult => {
  if (colors.length < 1) return { error: 'Give 1 to 5 hex colors, like #ff6b6b #4ecdc4.' }
  // One color: add two neighbours on the color wheel so the glows still vary.
  const first = colors[0] as string
  const picked = colors.length === 1
    ? [first, toHex({ ...toHsl(first), h: (toHsl(first).h + 35) % 360 }), toHex({ ...toHsl(first), h: (toHsl(first).h + 325) % 360, l: toHsl(first).l * 0.7 })]
    : colors.slice(0, 5)
  const glows = [0, 1, 2, 3, 4].map(i => picked[i % picked.length] as string) as unknown as Palette['glows']
  const hsl = picked.map(toHsl)
  // The darkest-feeling hue anchors the base and the surfaces.
  const anchor = [...hsl].sort((a, b) => a.l - b.l)[0] as Hsl
  // Grays stay neutral instead of picking up a stray hue.
  const isGray = anchor.s < 0.08
  const tint = (l: number, s = isGray ? 0.04 : clamp(anchor.s, 0.25, 0.55)) => toHex({ h: anchor.h, s, l })
  const base = [tint(0.05), tint(0.11), tint(0.15)] as const
  // The most vivid color the person picked becomes the accent.
  const vivid = [...hsl].sort((a, b) => b.s - a.s)[0] as Hsl
  const accent = vivid.s < 0.08 ? '#c9ccd6' : toHex({ h: vivid.h, s: clamp(vivid.s, 0.55, 0.9), l: 0.62 })

  // Surfaces start dark and get darker until Desktop agrees to paint the theme.
  for (const top of [0.15, 0.13, 0.11, 0.09]) {
    const palette: Palette = {
      id,
      name,
      base,
      glows,
      surfaces: [tint(top - 0.04), tint(top - 0.025), tint(top - 0.01), tint(top)],
      text: {
        primary: toHex({ h: anchor.h, s: isGray ? 0 : 0.5, l: 0.97 }),
        secondary: toHex({ h: anchor.h, s: isGray ? 0 : 0.3, l: 0.86 }),
        muted: toHex({ h: anchor.h, s: isGray ? 0 : 0.22, l: 0.76 }),
      },
      roles: { accent, danger: '#ff5d7a', success: '#5fe0b0', warning: '#ffc04d', pro: '#b07cff' },
    }
    if (paints(palette)) return { palette }
  }
  return { error: "Those colors don't leave enough contrast for text. Try a darker or more varied set." }
}

export const colorsFor = (p: Palette) => {
  const [s0, s1, s2, s3] = p.surfaces
  return makeColors({
    label: p.name,
    only: 'dark',
    roles: p.roles,
    dark: {
      gray: {
        anchors: {
          'surface-0': s0,
          'surface-1': s1,
          'surface-2': s2,
          'surface-3': s3,
          'text-primary': p.text.primary,
          'text-secondary': p.text.secondary,
          'text-muted': p.text.muted,
        },
      },
    },
  })
}

const paints = (p: Palette) => {
  try {
    return !colorsFor(p).problems.some(line => line.startsWith("Desktop won't paint"))
  } catch {
    return false
  }
}

export type Harmony = 'analogous' | 'complementary' | 'triad'

// Four colors that go with `base` by a classic color-wheel rule: a deep tone of
// the base first (it anchors the surfaces), then brighter glows.
export const harmony = (base: string, kind: Harmony): string[] => {
  const b = toHsl(base)
  const s = Math.max(b.s, 0.55)
  const at = (dh: number, l: number, ds = 0) => toHex({ h: (b.h + dh + 360) % 360, s: clamp(s + ds, 0.3, 0.95), l })
  if (kind === 'analogous') return [at(0, 0.3), at(-30, 0.5), at(30, 0.55), at(60, 0.68, -0.1)]
  if (kind === 'complementary') return [at(0, 0.3), at(0, 0.55), at(180, 0.5), at(165, 0.7, -0.1)]
  return [at(0, 0.3), at(0, 0.55), at(120, 0.55), at(240, 0.6)]
}

// A random base and rule, for "Surprise me".
export const surprise = (): string[] => {
  const kinds: Harmony[] = ['analogous', 'complementary', 'triad']
  const kind = kinds[Math.floor(Math.random() * kinds.length)] as Harmony
  const base = toHex({ h: Math.floor(Math.random() * 360), s: 0.7 + Math.random() * 0.2, l: 0.45 })
  return harmony(base, kind)
}
