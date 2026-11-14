import { style, type Style } from './kit'
import { buildScene } from './scene'

// Background styles. Each one turns any palette into an animated scene.
//
// Make your own with the Backdrop kit (hooks/kit.ts): copy one of the styles
// below, give it a new id, stack a few building blocks, and add it to STYLES.
// Full walkthrough: docs/making-themes.md, "Level 4".

// The original: soft glows on slow orbits. Hand-written (scene.ts) because it
// eases to a stop on battery instead of just going still.
const gradient: Style = {
  id: 'gradient',
  name: 'Gradient',
  description: 'soft glowing blobs drifting on slow orbits',
  build: buildScene,
}

// Made with the kit: a night sky.
const starfield = style({
  id: 'starfield',
  name: 'Starfield',
  description: 'twinkling stars over a faint nebula, with the odd shooting star',
  layers: (k, p) => [
    k.sky([p.base[1], p.base[0], p.base[0]]),
    k.glow({ at: [0.22, 0.78], size: 0.7, color: p.glows[1], opacity: 0.45 }),
    k.glow({ at: [0.85, 0.18], size: 0.6, color: p.glows[3], opacity: 0.35 }),
    k.stars({ count: 110, size: [0.6, 1.3], drift: 30, seconds: 90 }),
    k.stars({ count: 40, size: [1.3, 2.4], drift: 70, seconds: 60 }),
    k.shootingStar({ every: 11 }),
  ],
})

// Made with the kit: rolling waves under a soft glow.
const waves = style({
  id: 'waves',
  name: 'Waves',
  description: 'layered waves rolling along the bottom under a soft glow',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[2]]),
    k.glow({ at: [0.75, 0.25], size: 0.7, color: p.glows[4], opacity: 0.5, orbit: { rx: 60, ry: 30, seconds: 30 } }),
    k.glow({ at: [0.2, 0.3], size: 0.5, color: p.glows[2], opacity: 0.35 }),
    k.waves({ count: 4, colors: [p.glows[0], p.glows[1], p.glows[3], p.glows[2]], height: 0.4, amplitude: 30, opacity: 0.5 }),
  ],
})

// Made with the kit: a retro horizon.
const synthwave = style({
  id: 'synthwave',
  name: 'Synthwave',
  description: 'a striped retro sun over a scrolling neon grid',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[2]]),
    k.stars({ count: 50, size: [0.6, 1.4], drift: 0 }),
    k.glow({ at: [0.5, 0.55], size: 0.9, color: p.glows[1], opacity: 0.45 }),
    k.sun({ at: [0.5, 0.48], size: 0.26, colors: [p.glows[4], p.glows[1]] }),
    k.raw(`<rect y="${1000 * 0.62}" width="1600" height="${1000 * 0.38}" fill="${p.base[0]}" opacity=".85"/>`),
    k.grid({ color: p.roles.accent, horizon: 0.62 }),
  ],
})

export const STYLES: readonly Style[] = [gradient, starfield, waves, synthwave]
export const DEFAULT_STYLE = 'gradient'
export const styleById = (id: string | undefined): Style =>
  STYLES.find(s => s.id === id) ?? (STYLES[0] as Style)
