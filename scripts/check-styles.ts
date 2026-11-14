// Checks every background style against every palette: dark and light, moving,
// still and low-power. Each scene must be one <svg> under 131,072 characters, use
// SMIL rather than CSS animation, and draw no animation when still.
//   node --experimental-strip-types scripts/check-styles.ts
import { loadHooks } from './load-hooks.ts'

const { STYLES, PALETTES, ZERO, lightVariant } = await loadHooks()
let failed = 0, scenes = 0
for (const st of STYLES) {
  let biggest = 0
  for (const base of PALETTES) for (const p of [base, lightVariant(base)]) for (const lowPower of [false, true]) {
    const state = { activity: 'idle', usage: 0, context: 0, lowPower }
    for (const mode of [{ kind: 'flow', run: { from: ZERO, ramp: true } }, { kind: 'still', at: ZERO }]) {
      scenes++
      let svg = ''
      try { svg = st.build(p, mode, state) } catch (err) { failed++; console.log(`✗ ${st.id} / ${p.id}: ${String(err)}`); continue }
      const where = `${st.id} / ${p.id}${p.light ? ' (light)' : ''}${lowPower ? ' (low power)' : ''} / ${mode.kind}`
      biggest = Math.max(biggest, svg.length)
      if (!svg.startsWith('<svg') || !svg.trimEnd().endsWith('</svg>')) { failed++; console.log(`✗ ${where}: not one <svg> element`) }
      if (svg.length > 131072) { failed++; console.log(`✗ ${where}: ${svg.length} characters (limit 131072)`) }
      if (/@keyframes|animation\s*:|<style/.test(svg)) { failed++; console.log(`✗ ${where}: uses CSS animation; use the kit's blocks (SMIL) instead`) }
      if (/feGaussianBlur/.test(svg)) { failed++; console.log(`✗ ${where}: a blur filter (too heavy on the GPU); use glows instead`) }
      if (mode.kind === 'still' && st.id !== 'gradient' && /<animate/.test(svg)) { failed++; console.log(`✗ ${where}: animates while it should be still`) }
    }
  }
  console.log(`${failed ? '·' : '✓'} ${st.id.padEnd(12)} biggest scene ${(biggest / 1024).toFixed(1)} KB`)
}
console.log(failed ? `\n${failed} problem(s) in ${scenes} scenes.` : `\nAll ${STYLES.length} styles look good (${scenes} scenes checked).`)
process.exit(failed ? 1 : 0)
