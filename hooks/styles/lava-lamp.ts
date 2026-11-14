import { style } from '../kit'

export default style({
  id: 'lava-lamp',
  name: 'Lava lamp',
  description: 'big soft blobs rising and sinking',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[2]]),
    k.blobs({ count: 7, colors: [p.glows[0], p.glows[2], p.glows[3], p.glows[4]], size: [0.14, 0.3] }),
  ],
})
