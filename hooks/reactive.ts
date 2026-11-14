import { H, W, type SceneState } from './kit'
import type { Palette } from './palettes'

// The reactive layer: drawn on top of any style, so every background can show
// what Claude is doing and how much usage is left. Settings decide which parts show.

export type Settings = {
  // 'dark' or 'light' versions of every palette.
  appearance: 'dark' | 'light'
  // Stronger text contrast and a darker band behind the chat.
  contrast: boolean
  // Fewer, simpler animated elements.
  lowPower: boolean
  // 'time': the palette follows the time of day.
  autoPalette: 'off' | 'time'
  // Remember a palette per project folder.
  perProject: boolean
  // A glow that breathes while Claude thinks, shimmers while it works, flashes when done.
  activity: boolean
  // A thin usage bar along the bottom edge, and edges that warm near the limit.
  usageMeter: boolean
  // A desktop notification when a long turn finishes.
  notify: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  appearance: 'dark',
  contrast: false,
  lowPower: false,
  autoPalette: 'off',
  perProject: false,
  activity: true,
  usageMeter: true,
  notify: true,
}

export const SETTING_LABELS: Record<keyof Settings, string> = {
  appearance: 'Light mode',
  contrast: 'High contrast',
  lowPower: 'Low power',
  autoPalette: 'Time of day',
  perProject: 'Per project',
  activity: 'Activity glow',
  usageMeter: 'Usage meter',
  notify: 'Done alerts',
}

// Which palette the time-of-day mode uses, by hour.
export const TIME_OF_DAY: readonly { from: number; palette: string; label: string }[] = [
  { from: 0, palette: 'midnight', label: 'night' },
  { from: 5, palette: 'rose', label: 'dawn' },
  { from: 8, palette: 'ocean', label: 'morning' },
  { from: 12, palette: 'lagoon', label: 'afternoon' },
  { from: 16, palette: 'sunset', label: 'golden hour' },
  { from: 19, palette: 'ember', label: 'dusk' },
  { from: 21, palette: 'galaxy', label: 'evening' },
]

export const paletteForHour = (hour: number) =>
  [...TIME_OF_DAY].reverse().find(slot => hour >= slot.from) ?? TIME_OF_DAY[0]!

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16)
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t)
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('')
}

// Green → amber → red as usage climbs.
export const usageColor = (p: Palette, usage: number) =>
  usage < 0.6 ? p.roles.success : usage < 0.85 ? mix(p.roles.success, p.roles.warning, (usage - 0.6) / 0.25) : mix(p.roles.warning, p.roles.danger, Math.min((usage - 0.85) / 0.12, 1))

const f = (x: number) => Number(x.toFixed(2)).toString()

export const overlay = (p: Palette, state: SceneState, moving: boolean, settings: Settings): string => {
  const out: string[] = []
  const defs: string[] = []
  const anim = (attr: string, values: string, seconds: number, extra = ' repeatCount="indefinite"') =>
    moving ? `<animate attributeName="${attr}" values="${values}" dur="${seconds}s"${extra}/>` : ''

  // Extra reading contrast.
  if (settings.contrast) {
    defs.push(`<linearGradient id="rxContrast" x1="0" y1="0" x2="1" y2="0"><stop offset=".15" stop-color="${p.surfaces[0]}" stop-opacity="0"/><stop offset=".28" stop-color="${p.surfaces[0]}" stop-opacity=".45"/><stop offset=".72" stop-color="${p.surfaces[0]}" stop-opacity=".45"/><stop offset=".85" stop-color="${p.surfaces[0]}" stop-opacity="0"/></linearGradient>`)
    out.push(`<rect width="${W}" height="${H}" fill="url(#rxContrast)"/>`)
  }

  // Activity: a glow rising from the bottom edge.
  if (settings.activity && state.activity !== 'idle') {
    const color = state.activity === 'error' ? p.roles.danger : state.activity === 'done' ? p.roles.success : p.roles.accent
    defs.push(`<radialGradient id="rxGlow" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="${color}" stop-opacity=".75"/><stop offset=".5" stop-color="${color}" stop-opacity=".25"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`)
    const glow = `<rect y="${H * 0.45}" width="${W}" height="${H * 0.55}" fill="url(#rxGlow)"`
    if (state.activity === 'thinking') {
      out.push(`${glow} opacity=".35">${anim('opacity', '.2;.5;.2', 3.2)}</rect>`)
    } else if (state.activity === 'working') {
      out.push(`${glow} opacity=".5">${anim('opacity', '.35;.65;.35', 1.6)}</rect>`)
      if (moving) {
        defs.push(`<linearGradient id="rxShimmer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`)
        out.push(`<rect y="${H - 4}" width="${W * 0.3}" height="4" fill="url(#rxShimmer)"><animateTransform attributeName="transform" type="translate" values="${-W * 0.3},0;${W},0" dur="2.2s" repeatCount="indefinite"/></rect>`)
      }
    } else if (state.activity === 'done') {
      out.push(`${glow} opacity="${moving ? 0 : 0.4}">${anim('opacity', '0;.85;0', 1.8, ' fill="freeze"')}</rect>`)
    } else if (state.activity === 'error') {
      out.push(`${glow} opacity=".3">${anim('opacity', '.15;.7;.15', 0.9, ' repeatCount="3" fill="freeze"')}</rect>`)
    }
  }

  // Usage meter: a bar along the bottom edge, and warm edges near the limit.
  if (settings.usageMeter && state.usage > 0) {
    const color = usageColor(p, state.usage)
    out.push(`<rect y="${H - 3}" width="${f(W * Math.min(state.usage, 1))}" height="3" fill="${color}" opacity=".85"/>`)
    if (state.context > 0) out.push(`<rect y="${H - 5}" width="${f(W * Math.min(state.context, 1))}" height="1.5" fill="${state.context > 0.8 ? p.roles.warning : p.text.muted}" opacity=".7"/>`)
    if (state.usage >= 0.8) {
      const strength = state.usage >= 0.95 ? 0.45 : 0.28
      defs.push(`<radialGradient id="rxEdge" cx=".5" cy=".5" r=".78"><stop offset=".6" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${strength}"/></radialGradient>`)
      out.push(`<rect width="${W}" height="${H}" fill="url(#rxEdge)">${state.usage >= 0.95 ? anim('opacity', '1;.55;1', 2.4) : ''}</rect>`)
    }
  } else if (settings.usageMeter && state.context > 0) {
    out.push(`<rect y="${H - 2}" width="${f(W * Math.min(state.context, 1))}" height="2" fill="${state.context > 0.8 ? p.roles.warning : p.text.muted}" opacity=".7"/>`)
  }

  if (out.length === 0) return ''
  return `<g id="reactive">${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${out.join('')}</g>`
}

// Adds the reactive layer on top of a style's scene.
export const withOverlay = (svg: string, layer: string) =>
  layer ? svg.replace(/<\/svg>\s*$/, `${layer}</svg>`) : svg
