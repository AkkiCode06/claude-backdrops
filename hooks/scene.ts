import type { Palette } from './palettes'

// The backdrop: a base gradient, five soft glows and a darker reading column
// down the middle. Each glow is a circle filled with its own radial gradient
// (cheap to draw, unlike a full-screen blur filter) that orbits a closed
// ellipse at constant speed, so the loop never pauses or snaps.

type Orbit = { cx: number; cy: number; r: number; rx: number; ry: number; dir: 1 | -1; dur: number }

export const ORBITS: readonly Orbit[] = [
  { cx: 820, cy: 600, r: 620, rx: 200, ry: 120, dir: 1, dur: 26 },
  { cx: 380, cy: 380, r: 540, rx: 160, ry: 200, dir: -1, dur: 22 },
  { cx: 120, cy: 820, r: 560, rx: 220, ry: 150, dir: 1, dur: 19 },
  { cx: 700, cy: 460, r: 460, rx: 240, ry: 160, dir: -1, dur: 17 },
  { cx: 1420, cy: 220, r: 540, rx: 210, ry: 170, dir: -1, dur: 21 },
]

export const ZERO: readonly number[] = ORBITS.map(() => 0)

// Positions are measured in laps (0..1). The motion path runs the ellipse
// twice, so a start or a stop can cross the lap's end without a seam: a point
// `laps` along is keyPoint laps / 2.
const ellipse = (o: Orbit) =>
  `a${o.rx},${o.ry} 0 1,1 ${o.dir * 2 * o.rx},0 a${o.rx},${o.ry} 0 1,1 ${-o.dir * 2 * o.rx},0`
const path = (o: Orbit) => `M0,0 ${ellipse(o)} ${ellipse(o)}`
const kp = (laps: number) => Math.min(Math.max(laps / 2, 0), 1).toFixed(4)

// A start from rest gathers speed on an ease-in curve whose end speed is the
// lap speed (end slope 1.5: it takes 1.5x as long as the same distance at speed).
const WAKE_SPLINE = [0.5, 0, 0.6, 0.4] as const
// A stop eases out from lap speed (start slope 2) to rest over SETTLE_S,
// covering half the distance it would at full speed.
export const SETTLE_SPLINE = [0.25, 0.5, 0.6, 1] as const
export const SETTLE_S = 8

// Cubic bezier easing (0,0)-(x1,y1)-(x2,y2)-(1,1): progress at time fraction x.
export const ease = (sp: readonly [number, number, number, number], x: number) => {
  const [x1, y1, x2, y2] = sp
  const at = (t: number, a: number, c: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * c + t * t * t
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (at(mid, x1, x2) < x) lo = mid
    else hi = mid
  }
  return at((lo + hi) / 2, y1, y2)
}

// A run starts from `from` laps, either from rest (`ramp`, easing up to speed)
// or already at speed (a palette change mid-motion). Its first stretch runs to
// the end of a lap (two laps when a ramp would be too short to be gentle), then
// it loops at constant speed.
export type Run = { from: readonly number[]; ramp: boolean }

const target = (from: number, ramp: boolean) => (ramp && 1 - from < 0.25 ? 2 : 1)
const firstSeconds = (o: Orbit, from: number, ramp: boolean) =>
  (ramp ? 1.5 : 1) * (target(from, ramp) - from) * o.dur

// Where along its lap (0..1) each glow is, `ms` after a run started.
export const phasesAt = (run: Run, ms: number): number[] =>
  ORBITS.map((o, i) => {
    const from = run.from[i] ?? 0
    const s = ms / 1000
    const w = firstSeconds(o, from, run.ramp)
    if (s < w) {
      const x = s / w
      const progress = run.ramp ? ease(WAKE_SPLINE, x) : x
      return (from + (target(from, run.ramp) - from) * progress) % 1
    }
    return ((s - w) % o.dur) / o.dur
  })

// How far a glow travels while it eases to rest from lap speed.
const settleLaps = (o: Orbit) => SETTLE_S / (2 * o.dur)

// Where each glow comes to rest after easing out from `from`, or, `t` (0..1)
// of the way through that stop, where it is now.
export const settledAt = (from: readonly number[], t = 1): number[] =>
  ORBITS.map((o, i) => ((from[i] ?? 0) + settleLaps(o) * ease(SETTLE_SPLINE, t)) % 1)

export type Mode =
  | { kind: 'still'; at: readonly number[] }
  | { kind: 'flow'; run: Run }
  | { kind: 'settle'; from: readonly number[] }

const motionFor = (mode: Mode, o: Orbit, i: number) => {
  const p = path(o)
  if (mode.kind === 'flow') {
    const from = mode.run.from[i] ?? 0
    const ramp = mode.run.ramp
    const first = ramp
      ? `calcMode="spline" keySplines="${WAKE_SPLINE.join(' ')}"`
      : 'calcMode="linear"'
    return `<animateMotion id="w${i}" path="${p}" dur="${Math.max(firstSeconds(o, from, ramp), 0.01).toFixed(2)}s" ${first} keyPoints="${kp(from)};${kp(target(from, ramp))}" keyTimes="0;1" fill="freeze"/>` +
      `<animateMotion path="${p}" dur="${2 * o.dur}s" begin="w${i}.end" calcMode="linear" repeatCount="indefinite"/>`
  }
  if (mode.kind === 'settle') {
    const from = mode.from[i] ?? 0
    return `<animateMotion path="${p}" dur="${SETTLE_S}s" calcMode="spline" keyPoints="${kp(from)};${kp(from + settleLaps(o))}" keyTimes="0;1" keySplines="${SETTLE_SPLINE.join(' ')}" fill="freeze"/>`
  }
  // Still: one instant step to the resting point, then nothing moves.
  const at = mode.at[i] ?? 0
  return at === 0 ? '' : `<animateMotion path="${p}" dur="0.01s" keyPoints="${kp(at)};${kp(at)}" keyTimes="0;1" calcMode="linear" fill="freeze"/>`
}

export const buildScene = (palette: Palette, mode: Mode): string => {
  const [b0, b1, b2] = palette.base
  const col = palette.surfaces[0]
  const glows = ORBITS.map((_, i) => {
    const c = palette.glows[i] ?? palette.glows[0]
    return `<radialGradient id="g${i}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".45" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`
  }).join('')
  const blobs = ORBITS.map(
    (o, i) => `<g>${motionFor(mode, o, i)}<circle cx="${o.cx}" cy="${o.cy}" r="${o.r}" fill="url(#g${i})"/></g>`,
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="base" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="${b0}"/><stop offset=".55" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/>
  </linearGradient>
  <linearGradient id="column" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset=".2" stop-color="${col}" stop-opacity="0"/>
    <stop offset=".3" stop-color="${col}" stop-opacity=".58"/><stop offset=".7" stop-color="${col}" stop-opacity=".58"/>
    <stop offset=".8" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="0"/>
  </linearGradient>
  ${glows}
</defs>
<rect width="1600" height="1000" fill="url(#base)"/>
${blobs}
<rect width="1600" height="1000" fill="url(#column)"/>
</svg>`
}

// A small still strip of the palette, for the picker.
export const swatch = (palette: Palette): string => {
  const stops = [palette.base[0], ...palette.glows.slice(0, 4), palette.base[2]]
  const s = stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 24"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="0">${s}</linearGradient></defs><rect width="120" height="24" rx="6" fill="url(#s)"/></svg>`
}
