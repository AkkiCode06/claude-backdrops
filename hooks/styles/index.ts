// Every background style. To add yours: make hooks/styles/<id>.ts (see any file
// here, or run `node --experimental-strip-types scripts/new-style.ts <id>`),
// then import it below and add it to STYLES.
import type { Style } from '../kit'
import aurora from './aurora'
import city from './city'
import codeRain from './code-rain'
import geometric from './geometric'
import gradient from './gradient'
import lavaLamp from './lava-lamp'
import rain from './rain'
import snow from './snow'
import starfield from './starfield'
import synthwave from './synthwave'
import waves from './waves'

export const STYLES: readonly Style[] = [
  gradient,
  starfield,
  waves,
  synthwave,
  aurora,
  rain,
  snow,
  codeRain,
  lavaLamp,
  geometric,
  city,
]

export const DEFAULT_STYLE = 'gradient'
export const styleById = (id: string | undefined): Style =>
  STYLES.find(s => s.id === id) ?? (STYLES[0] as Style)
