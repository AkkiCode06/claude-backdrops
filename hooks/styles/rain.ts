import { style } from '../kit'

export default style({
  id: 'rain',
  name: 'Rain',
  description: 'a rainy night: streaks of rain over soft city glow',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[0]]),
    k.glow({ at: [0.3, 0.85], size: 0.8, color: p.glows[1], opacity: 0.4 }),
    k.glow({ at: [0.8, 0.9], size: 0.6, color: p.glows[3], opacity: 0.35 }),
    k.particles({ count: 140, color: p.text.primary, size: [1.2, 2.2], speed: 4, streak: true, opacity: 0.55 }),
    k.vignette({ strength: 0.5 }),
  ],
})
