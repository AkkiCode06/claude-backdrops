import { style } from '../kit'

export default style({
  id: 'synthwave',
  name: 'Synthwave',
  description: 'a striped retro sun over a scrolling neon grid',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[2]]),
    k.stars({ count: 50, size: [0.6, 1.4], drift: 0 }),
    k.glow({ at: [0.5, 0.55], size: 0.9, color: p.glows[1], opacity: 0.45 }),
    k.sun({ at: [0.5, 0.48], size: 0.26, colors: [p.glows[4], p.glows[1]] }),
    k.raw(`<rect y="620" width="1600" height="380" fill="${p.base[0]}" opacity=".85"/>`),
    k.grid({ color: p.roles.accent, horizon: 0.62 }),
  ],
})
