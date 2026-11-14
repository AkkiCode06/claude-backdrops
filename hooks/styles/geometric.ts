import { style } from '../kit'

export default style({
  id: 'geometric',
  name: 'Geometric',
  description: 'slowly turning outlines over a dot grid',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[1], p.base[2]], { angle: 'diagonal' }),
    k.glow({ at: [0.8, 0.2], size: 0.7, color: p.glows[2], opacity: 0.35 }),
    k.dots({ spacing: 38, color: p.text.muted, opacity: 0.18 }),
    k.shapes({ count: 9, color: p.roles.accent, opacity: 0.35 }),
  ],
})
