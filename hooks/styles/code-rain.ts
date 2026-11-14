import { style } from '../kit'

export default style({
  id: 'code-rain',
  name: 'Code rain',
  description: 'columns of falling characters, Matrix-style',
  layers: (k, p) => [
    k.sky([p.base[0], p.base[0], p.base[1]]),
    k.codeRain({ columns: 34, color: p.roles.success, size: 18, opacity: 0.5 }),
    k.vignette({ strength: 0.6 }),
  ],
})
