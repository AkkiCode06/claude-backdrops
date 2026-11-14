import { style } from '../kit'

export default style({
  id: 'snow',
  name: 'Snow',
  description: 'gentle snowfall drifting past a winter glow',
  layers: (k, p) => [
    k.sky([p.base[1], p.base[0], p.base[0]]),
    k.glow({ at: [0.5, 0.95], size: 1, color: p.glows[2], opacity: 0.35 }),
    k.particles({ count: 90, color: '#ffffff', size: [1.2, 3.4], speed: 0.7, opacity: 0.7 }),
    k.particles({ count: 40, color: '#ffffff', size: [0.6, 1.4], speed: 0.45, opacity: 0.45 }),
  ],
})
