import { style } from '../kit'

export default style({
  id: 'city',
  name: 'Pixel city',
  description: 'a pixel-art skyline at night, windows flickering',
  layers: (k, p) => [
    k.sky([p.glows[1], p.base[1], p.base[0]]),
    k.stars({ count: 60, size: [0.8, 1.6], drift: 0 }),
    k.sun({ at: [0.8, 0.2], size: 0.08, colors: [p.text.primary, p.glows[4]], stripes: false }),
    k.skyline({ colors: [p.base[0], p.surfaces[1], p.surfaces[0]], window: p.glows[4], height: 0.45, pixel: 8 }),
  ],
})
