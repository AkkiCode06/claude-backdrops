import { paletteFromColors, parseColors } from './custom'
import type { Palette } from './palettes'

// Theme files: one JSON file per theme. Two shapes are accepted.
//
// The quick one, colors only (Backdrop works out the rest):
//   { "id": "rainy-tokyo", "name": "Rainy Tokyo", "author": "you",
//     "style": "starfield", "colors": ["#05061a", "#ff2e88", "#00c2ff"] }
//
// The full one, every field set by hand (the same fields as hooks/palettes.ts):
//   { "id": ..., "name": ..., "author": ..., "style": ...,
//     "base": [3], "glows": [5], "surfaces": [4],
//     "text": { "primary", "secondary", "muted" },
//     "roles": { "accent", "danger", "success", "warning", "pro" } }
//
// Where they're loaded from:
//   themes/*.json in this repo            -> "Community" in the picker
//   ~/.claude/backdrop/themes/*.json      -> "Yours" (drop a file in, no PR needed)

export const THEME_FORMAT = 1

export type ThemeFile = {
  format?: number
  id: string
  name: string
  author?: string
  style?: string
  colors?: string[]
  base?: string[]
  glows?: string[]
  surfaces?: string[]
  text?: { primary?: string; secondary?: string; muted?: string }
  roles?: { accent?: string; danger?: string; success?: string; warning?: string; pro?: string }
}

const HEX = /^#[0-9a-f]{6}$/i
const ID = /^[a-z0-9][a-z0-9-]{0,47}$/

const hexList = (v: unknown, n: number, field: string): string[] => {
  if (!Array.isArray(v) || v.length !== n || !v.every(x => typeof x === 'string' && HEX.test(x))) {
    throw new Error(`"${field}" needs exactly ${n} colors like "#1a0b33"`)
  }
  return v as string[]
}

const hex = (v: unknown, field: string): string => {
  if (typeof v !== 'string' || !HEX.test(v)) throw new Error(`"${field}" needs a color like "#ff2e88"`)
  return v
}

export type ParsedTheme = { palette: Palette } | { error: string }

// Turns the text of a theme file into a palette, or says what's wrong with it.
export const parseTheme = (text: string): ParsedTheme => {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { error: 'not valid JSON' }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { error: 'expected a JSON object' }
  const t = raw as ThemeFile
  try {
    if (typeof t.id !== 'string' || !ID.test(t.id)) throw new Error('"id" must be lowercase letters, digits and hyphens, like "rainy-tokyo"')
    if (typeof t.name !== 'string' || t.name.trim() === '' || t.name.length > 40) throw new Error('"name" must be 1-40 characters')
    if (t.author !== undefined && (typeof t.author !== 'string' || t.author.length > 39)) throw new Error('"author" must be a GitHub handle')
    if (t.style !== undefined && typeof t.style !== 'string') throw new Error('"style" must be a style id, like "starfield"')
    const extra = { ...(t.author ? { author: t.author.replace(/^@/, '') } : {}), ...(t.style ? { style: t.style } : {}) }

    if (t.colors !== undefined) {
      const colors = Array.isArray(t.colors) ? t.colors.flatMap(c => (typeof c === 'string' ? parseColors(c) : [])) : []
      if (colors.length < 1 || colors.length > 5) throw new Error('"colors" needs 1 to 5 hex colors')
      const made = paletteFromColors(t.name.trim(), colors, t.id)
      if ('error' in made) throw new Error(made.error)
      return { palette: { ...made.palette, ...extra } }
    }

    const palette: Palette = {
      id: t.id,
      name: t.name.trim(),
      ...extra,
      base: hexList(t.base, 3, 'base') as unknown as Palette['base'],
      glows: hexList(t.glows, 5, 'glows') as unknown as Palette['glows'],
      surfaces: hexList(t.surfaces, 4, 'surfaces') as unknown as Palette['surfaces'],
      text: { primary: hex(t.text?.primary, 'text.primary'), secondary: hex(t.text?.secondary, 'text.secondary'), muted: hex(t.text?.muted, 'text.muted') },
      roles: {
        accent: hex(t.roles?.accent, 'roles.accent'),
        danger: hex(t.roles?.danger, 'roles.danger'),
        success: hex(t.roles?.success, 'roles.success'),
        warning: hex(t.roles?.warning, 'roles.warning'),
        pro: hex(t.roles?.pro, 'roles.pro'),
      },
    }
    return { palette }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

// A palette as a full theme file, ready to share.
export const toThemeFile = (p: Palette): ThemeFile => ({
  format: THEME_FORMAT,
  id: p.id.replace(/^custom-/, ''),
  name: p.name,
  ...(p.author ? { author: p.author } : {}),
  ...(p.style ? { style: p.style } : {}),
  base: [...p.base],
  glows: [...p.glows],
  surfaces: [...p.surfaces],
  text: { ...p.text },
  roles: { ...p.roles },
})

// Share codes: a whole theme as one short line of text, for pasting into a chat.
// "bd1." + base64url of the theme's JSON (colors only when it can be, to stay short).
const toB64Url = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64Url = (code: string) => {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
}

export const toShareCode = (p: Palette): string => {
  const file = toThemeFile(p)
  const { format: _f, ...rest } = file
  return 'bd1.' + toB64Url(JSON.stringify(rest))
}

// Returns the theme JSON inside a share code, or undefined when it isn't one.
export const fromShareCode = (code: string): string | undefined => {
  const m = code.trim().match(/^bd1\.([A-Za-z0-9_-]+)$/)
  if (!m) return undefined
  try {
    return fromB64Url(m[1] as string)
  } catch {
    return undefined
  }
}
