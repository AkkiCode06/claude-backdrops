import type { Style } from '../kit'
import { buildScene } from '../scene'

// The original: soft glows on slow orbits. Hand-written in scene.ts (not with the
// kit) because it eases to a stop on battery instead of just going still.
const gradient: Style = {
  id: 'gradient',
  name: 'Gradient',
  description: 'soft glowing blobs drifting on slow orbits',
  build: (palette, mode) => buildScene(palette, mode),
}
export default gradient
