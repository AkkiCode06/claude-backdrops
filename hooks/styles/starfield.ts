import { style } from '../kit'

export default style({
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
