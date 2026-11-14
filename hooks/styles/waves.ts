import { style } from '../kit'

export default style({
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
