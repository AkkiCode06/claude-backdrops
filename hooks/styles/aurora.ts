import { style } from '../kit'

export default style({
  id: 'aurora',
  name: 'Aurora',
  description: 'northern-lights curtains swaying over a starry night',
  layers: (k, p) => [
    k.sky([p.base[1], p.base[0], p.base[0]]),
    k.stars({ count: 90, size: [0.5, 1.4], drift: 15 }),
    k.aurora({ count: 3, colors: [p.glows[2], p.glows[4], p.glows[3]], top: 0.06, height: 0.32, opacity: 0.55 }),
    k.vignette({ strength: 0.45 }),
  ],
})
