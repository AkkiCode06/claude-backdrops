import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import type { Motion, StoredPalette } from '../types'
import { colorsFor, harmony, paletteFromColors, parseColors, surprise, type Harmony } from './custom'
import { DEFAULT_PALETTE, PALETTES, type Palette } from './palettes'
import { buildScene, phasesAt, SETTLE_S, settledAt, swatch, ZERO, type Mode, type Run } from './scene'

// Gradient Flow: animated gradient backgrounds for Claude Code on desktop.
//
// - /backdrop opens the picker: presets, your own palettes, motion settings.
// - Claude can change it too (the `background` tool): "make my background ocean".
// - Motion "auto" follows the power source: moving when plugged in, easing to a
//   stop on battery (almost no GPU), easing back up when plugged in again.

const PANE = 'background-picker'
const PANE_TITLE = 'Background'
const TOOL = 'mcp__gradient-flow__background'
const MOTIONS: readonly Motion[] = ['auto', 'on', 'off']
const MOTION_LABEL: Record<Motion, string> = { auto: 'Auto (battery-aware)', on: 'Always move', off: 'Still' }
const MAX_CUSTOMS = 12
const MAX_DRAFT = 5

const paletteAtom = atom({ plugin: 'gradient-flow', key: 'palette' } as const, DEFAULT_PALETTE)
const motionAtom = atom({ plugin: 'gradient-flow', key: 'motion' } as const, 'auto' as Motion)
const customsAtom = atom({ plugin: 'gradient-flow', key: 'customs' } as const, [] as StoredPalette[], { shape: 'customs-1' })
const noticeAtom = atom({ plugin: 'gradient-flow', key: 'notice' } as const, '')
const draftAtom = atom({ plugin: 'gradient-flow', key: 'draft' } as const, [] as string[])
const busyAtom = atom({ plugin: 'gradient-flow', key: 'busy' } as const, false)

const find = (id: string, customs: readonly StoredPalette[]): Palette =>
  customs.find(p => p.id === id) ??
  PALETTES.find(p => p.id === id) ??
  PALETTES.find(p => p.id === DEFAULT_PALETTE) ??
  (PALETTES[0] as Palette)

// The picked colors as a row of rounded squares, for the preview card.
const draftStrip = (colors: readonly string[]) => {
  const w = 40 * colors.length + 8 * (colors.length - 1)
  const squares = colors.map((c, i) => `<rect x="${i * 48}" y="0" width="40" height="40" rx="10" fill="${c}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 40">${squares}</svg>`
}

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'custom'

// What the mod can do; set up at session start, used by the picker, the slash
// command and the tool.
type Controller = {
  choose: (id: string) => Promise<string>
  setMotion: (m: Motion) => Promise<string>
  create: (name: string, colors: string | readonly string[]) => Promise<string>
  remove: (id: string) => Promise<string>
  describe: () => Promise<string>
  isKnown: (id: string) => boolean
  // "Make your own": a draft of up to 5 colors, previewed live until saved.
  addColor: (hex: string) => Promise<void>
  removeColor: (index: number) => Promise<void>
  autoMatch: (kind: Harmony | 'surprise') => Promise<void>
  describeLook: (text: string) => Promise<string>
  save: (name: string) => Promise<string>
  discard: () => Promise<void>
}
let ctl: Controller | undefined

// The scene the backdrop draws. Every change gets a fresh name so the surface
// draws the new picture.
let sceneSource = ''

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // Restore what the person chose last time.
    const storedPalette = await $.store.get('palette')
    const storedMotion = await $.store.get('motion')
    const storedCustoms = await $.store.get('customs')
    let customs: StoredPalette[] = Array.isArray(storedCustoms) ? (storedCustoms as StoredPalette[]) : []
    let paletteId = typeof storedPalette === 'string' ? storedPalette : DEFAULT_PALETTE
    let motion: Motion = MOTIONS.includes(storedMotion as Motion) ? (storedMotion as Motion) : 'auto'
    await update($, customsAtom, () => customs)
    await update($, paletteAtom, () => paletteId)
    await update($, motionAtom, () => motion)

    // `pmset -g batt` says "Now drawing from 'Battery Power'" on battery. Anything
    // else (a desktop Mac, another OS, an error) counts as plugged in.
    const onBatteryNow = async () => {
      try {
        const { exitCode, stdout } = await $.process.run(['/usr/bin/pmset', '-g', 'batt'], { timeoutMs: 5000 })
        return exitCode === 0 && stdout.includes("'Battery Power'")
      } catch {
        return false
      }
    }
    let onBattery = await onBatteryNow()

    // Where the glows are: moving on `run` since `runStartedAt`, easing to a
    // stop from `settleFrom` since `settleStartedAt`, or resting at `restAt`.
    let run: Run | undefined
    let runStartedAt = 0
    let settleFrom: number[] | undefined
    let settleStartedAt = 0
    let restAt: number[] = [...ZERO]
    let pendingStill: { cancel: () => void } | undefined
    let counter = 0

    const shouldMove = () => motion === 'on' || (motion === 'auto' && !onBattery)

    // While someone is picking colors, the backdrop previews their draft.
    let draft: string[] = []
    let preview: Palette | undefined

    const draw = async (mode: Mode) => {
      const palette = preview ?? find(paletteId, customs)
      counter += 1
      sceneSource = buildScene(palette, mode)
      const look: ThemeSetArgs = {
        colors: colorsFor(palette).theme,
        backdrop: { scene: `gf-${counter}`, glass: { blur: 0, tint: palette.surfaces[0], opacity: 0.45 } },
      }
      const set = await $.theme.set(look)
      if (!set.isDrawn) $.ui.status(set.reason)
    }

    // Where every glow is at this moment.
    const whereNow = async (): Promise<number[]> => {
      const now = await $.clock.now()
      if (run !== undefined) return phasesAt(run, now - runStartedAt)
      if (settleFrom !== undefined) return settledAt(settleFrom, Math.min((now - settleStartedAt) / 1000 / SETTLE_S, 1))
      return restAt
    }

    const startMoving = async (ramp: boolean) => {
      const from = await whereNow()
      pendingStill?.cancel()
      pendingStill = undefined
      settleFrom = undefined
      run = { from, ramp }
      runStartedAt = await $.clock.now()
      await draw({ kind: 'flow', run })
    }

    const stopMoving = async () => {
      const from = await whereNow()
      run = undefined
      settleFrom = from
      settleStartedAt = await $.clock.now()
      restAt = settledAt(from)
      await draw({ kind: 'settle', from })
      // Once every glow has come to rest, swap to the identical still frame,
      // which stops the redraws.
      pendingStill?.cancel()
      pendingStill = $.clock.after(SETTLE_S * 1000 + 1000, () => {
        pendingStill = undefined
        settleFrom = undefined
        void draw({ kind: 'still', at: restAt })
      })
    }

    // Redraw for the current settings: start or stop when that changed, and for
    // a new palette carry on exactly where the glows are.
    const refresh = async (reason: 'palette' | 'motion' | 'power') => {
      const moving = run !== undefined
      if (shouldMove()) {
        if (!moving) await startMoving(true)
        else if (reason === 'palette') await startMoving(false)
      } else if (moving) {
        await stopMoving()
      } else if (reason === 'palette') {
        if (settleFrom !== undefined) await stopMoving()
        else await draw({ kind: 'still', at: restAt })
      }
    }

    // Change the draft and preview it live behind the picker.
    const setDraft = async (colors: string[], note?: string) => {
      draft = colors
      await update($, draftAtom, () => colors)
      if (colors.length === 0) {
        preview = undefined
        await update($, noticeAtom, () => note ?? '')
        await refresh('palette')
        return
      }
      const made = paletteFromColors('Preview', colors, 'preview')
      if ('error' in made) {
        await update($, noticeAtom, () => made.error)
        return
      }
      preview = made.palette
      await update($, noticeAtom, () => note ?? 'Previewing. Save it to keep it, or Discard.')
      await refresh('palette')
    }

    const controller: Controller = {
      isKnown: id => customs.some(p => p.id === id) || PALETTES.some(p => p.id === id),
      choose: async id => {
        preview = undefined
        if (draft.length > 0) {
          draft = []
          await update($, draftAtom, () => [])
        }
        const palette = find(id, customs)
        paletteId = palette.id
        await update($, paletteAtom, () => paletteId)
        await $.store.set('palette', paletteId)
        await refresh('palette')
        return `Background set to ${palette.name}.`
      },
      setMotion: async m => {
        motion = m
        await update($, motionAtom, () => m)
        await $.store.set('motion', m)
        await refresh('motion')
        return `Motion set to ${MOTION_LABEL[m]}.`
      },
      create: async (name, colorInput) => {
        const colors = typeof colorInput === 'string' ? parseColors(colorInput) : colorInput.flatMap(c => parseColors(c))
        const label = name.trim() || `Custom ${customs.length + 1}`
        const id = `custom-${slug(label)}`
        const made = paletteFromColors(label, colors, id)
        if ('error' in made) {
          await update($, noticeAtom, () => made.error)
          return made.error
        }
        customs = [...customs.filter(p => p.id !== id), made.palette].slice(-MAX_CUSTOMS)
        await update($, customsAtom, () => customs)
        await $.store.set('customs', customs)
        await update($, noticeAtom, () => `Made ${label}.`)
        return `Made "${label}" (${id}). ${await controller.choose(id)}`
      },
      remove: async id => {
        const gone = customs.find(p => p.id === id)
        if (gone === undefined) return `There is no palette of yours with the id ${id}; only ones you made can be removed.`
        customs = customs.filter(p => p.id !== id)
        await update($, customsAtom, () => customs)
        await $.store.set('customs', customs)
        await update($, noticeAtom, () => `Removed ${gone.name}.`)
        if (paletteId === id) await controller.choose(DEFAULT_PALETTE)
        return `Removed ${gone.name}.`
      },
      describe: async () => {
        const current = find(paletteId, customs)
        const presets = PALETTES.map(p => `${p.id} (${p.name})`).join(', ')
        const mine = customs.length ? customs.map(p => `${p.id} (${p.name})`).join(', ') : 'none yet'
        return `Current: ${current.name}; motion: ${MOTION_LABEL[motion]}${onBattery ? ' (on battery now)' : ''}.\nPresets: ${presets}.\nMade by the user: ${mine}.`
      },
      addColor: async hex => {
        const [color] = parseColors(hex)
        if (color === undefined) {
          await update($, noticeAtom, () => `"${hex}" isn't a hex color; try #ff6b6b.`)
          return
        }
        await setDraft([...draft, color].slice(-MAX_DRAFT))
      },
      removeColor: async index => {
        await setDraft(draft.filter((_, i) => i !== index))
      },
      autoMatch: async kind => {
        if (kind === 'surprise') return setDraft(surprise())
        const base = draft[0]
        if (base === undefined) {
          await update($, noticeAtom, () => 'Pick a first color, then choose how to match it.')
          return
        }
        await setDraft([base, ...harmony(base, kind).slice(1)])
      },
      describeLook: async text => {
        const look = text.trim()
        if (look === '') return 'Describe a look first, like "cozy forest at dusk".'
        await update($, busyAtom, () => true)
        await update($, noticeAtom, () => `Picking colors for "${look}"…`)
        try {
          const reply = await $.model.complete({
            model: 'haiku',
            maxTokens: 80,
            system:
              'You choose colors for an animated, dark app background made of soft glowing blobs. ' +
              'Reply with 4 or 5 hex colors and nothing else, separated by spaces. ' +
              'First a deep, dark tone of the mood (it tints the panels), then brighter glow colors that carry it.',
            prompt: look,
          })
          const colors = reply.isAnswered ? parseColors(reply.text).slice(0, MAX_DRAFT) : []
          if (colors.length === 0) {
            const why = reply.isAnswered ? 'the reply had no colors' : reply.reason
            await update($, noticeAtom, () => `Couldn't pick colors (${why}). Try again or pick them yourself.`)
            return `Couldn't pick colors (${why}).`
          }
          await setDraft(colors, `Previewing "${look}". Save it to keep it, or Discard.`)
          return `Previewing ${colors.join(' ')}.`
        } finally {
          await update($, busyAtom, () => false)
        }
      },
      save: async name => {
        if (draft.length === 0) return 'Pick some colors first.'
        const result = await controller.create(name, draft)
        draft = []
        preview = undefined
        await update($, draftAtom, () => [])
        return result
      },
      discard: async () => {
        draft = []
        preview = undefined
        await update($, draftAtom, () => [])
        await update($, noticeAtom, () => '')
        await refresh('palette')
      },
    }
    ctl = controller

    // Registering is best-effort: if a name is refused (say a built-in command
    // takes it), the background still draws.
    try {
      await $.command.register({
        name: 'backdrop',
        description: 'Pick an animated background, or make your own from colors',
        argumentHint: '[palette | #hex #hex … | still | move | auto]',
      })
    } catch (err) {
      $.ui.toast(`Gradient Flow: /backdrop is unavailable (${String(err)}); ask Claude to change the background instead.`)
    }
    try {
      await $.tool.register({
      name: 'background',
      isDeferred: false,
      description:
        "Changes the user's Claude Code background (the animated gradient theme from the Gradient Flow mod). " +
        'Use it whenever the user asks to change, pick, see, make or remove a background, theme or app colors. ' +
        "'open_picker' opens the picker pane so they choose themselves (use it when they just say 'change my background'); " +
        "'set' switches to a palette by id; 'create' makes a palette from 1-5 hex colors you pick to match what they describe " +
        "(for 'cozy forest': deep greens and a warm amber) and switches to it; 'motion' sets auto (moves only when plugged in), on or off; " +
        "'remove' deletes one they made; 'list' says what exists. Presets: " + PALETTES.map(p => p.id).join(', ') + '.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['open_picker', 'set', 'create', 'motion', 'remove', 'list'] },
          palette: { type: 'string', description: "A palette id, for 'set' and 'remove'." },
          name: { type: 'string', description: "A short name for a new palette, for 'create'." },
          colors: { type: 'array', items: { type: 'string' }, description: "1-5 hex colors like '#1b4332', for 'create'." },
          motion: { type: 'string', enum: ['auto', 'on', 'off'], description: "For 'motion'." },
        },
        required: ['action'],
      },
    })
    } catch (err) {
      $.ui.toast(`Gradient Flow: Claude's background tool is unavailable (${String(err)}); use /backdrop instead.`)
    }

    // Draw what was chosen: moving (easing in) or still.
    if (shouldMove()) await startMoving(true)
    else await draw({ kind: 'still', at: restAt })

    // Follow the power source.
    $.clock.every(30_000, () => {
      void (async () => {
        const now = await onBatteryNow()
        if (now === onBattery) return
        onBattery = now
        if (motion !== 'auto') return
        await refresh('power')
        $.ui.toast(now ? 'On battery: background easing to a stop' : 'Plugged in: background easing back into motion')
      })()
    })

    return next(e)
  })

  // /backdrop            -> open the picker
  // /backdrop ocean      -> switch palette
  // /backdrop #a #b #c   -> make a palette from those colors
  // /backdrop still | move | auto
  on('command.run', { command: 'backdrop' }, async ($, e) => {
    const args = e.args.trim()
    if (ctl === undefined) return { text: 'Gradient Flow is still starting; try again in a moment.' }
    if (args === '') {
      await $.ui.open({ id: PANE, title: PANE_TITLE })
      return { text: 'Opened the background picker.' }
    }
    const word = args.toLowerCase()
    if (word === 'still' || word === 'off') return { text: await ctl.setMotion('off') }
    if (word === 'move' || word === 'on') return { text: await ctl.setMotion('on') }
    if (word === 'auto') return { text: await ctl.setMotion('auto') }
    if (parseColors(args).length >= 2) return { text: await ctl.create('', args) }
    const id = PALETTES.find(p => p.id === word || p.name.toLowerCase() === word)?.id ?? word
    if (!ctl.isKnown(id)) return { text: `No palette called "${args}". ${await ctl.describe()}` }
    return { text: await ctl.choose(id) }
  })

  // Claude's `background` tool (matched by name here: a matcher on an mcp tool
  // name makes the type checker walk every tool's input).
  on('tool.call', async ($, e, next) => {
    if (String(e.tool) !== TOOL) return next(e)
    const answer = async (): Promise<string> => {
      if (ctl === undefined) return 'Gradient Flow is still starting; try again in a moment.'
      const input = e as unknown as { action?: string; palette?: string; name?: string; colors?: string[]; motion?: Motion }
      switch (input.action) {
        case 'open_picker':
          await $.ui.open({ id: PANE, title: PANE_TITLE })
          return 'Opened the background picker pane; the user can choose there.'
        case 'set':
          if (input.palette === undefined || !ctl.isKnown(input.palette)) return `Unknown palette. ${await ctl.describe()}`
          return ctl.choose(input.palette)
        case 'create':
          return ctl.create(input.name ?? '', input.colors ?? [])
        case 'motion':
          if (input.motion === undefined || !MOTIONS.includes(input.motion)) return 'Give motion: auto, on or off.'
          return ctl.setMotion(input.motion)
        case 'remove':
          return ctl.remove(input.palette ?? '')
        default:
          return ctl.describe()
      }
    }
    const text: string = await answer()
    return { result: text as never }
  })

  // The picker pane.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button, Input } = ui
    const hasSvg = e.surface === 'desktop' || e.surface === 'mobile'
    const current = await read($, paletteAtom)
    const motion = await read($, motionAtom)
    const customs = await read($, customsAtom)
    const notice = await read($, noticeAtom)
    const draft = await read($, draftAtom)
    const busy = await read($, busyAtom)

    const row = (p: Palette, removable: boolean) => (
      <Box key={`row-${p.id}`} flexDirection="row" alignItems="center" gap={1}>
        {hasSvg && 'Svg' in ui ? <ui.Svg source={swatch(p)} alt={`${p.name} colors`} width={96} height={20} /> : null}
        <Button
          key={`pick-${p.id}`}
          label={p.id === current ? `${p.name} ✓` : p.name}
          variant={p.id === current ? 'primary' : 'secondary'}
          onPress={() => void ctl?.choose(p.id)}
        />
        {removable ? <Button key={`del-${p.id}`} label="Remove" plain onPress={() => void ctl?.remove(p.id)} /> : null}
      </Box>
    )

    // Two columns side by side, filled top to bottom.
    const columns = (list: readonly Palette[], removable: boolean, id: string) => {
      const half = Math.ceil(list.length / 2)
      return (
        <Box key={`cols-${id}`} flexDirection="row" gap={2}>
          {[list.slice(0, half), list.slice(half)].map((col, i) => (
            <Box key={`col-${id}-${i}`} flexDirection="column" gap={1} flexGrow={1}>
              {col.map(p => row(p, removable))}
            </Box>
          ))}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Palettes</Text>
        {columns(PALETTES, false, 'presets')}
        {customs.length > 0 ? <Text bold>Yours</Text> : null}
        {customs.length > 0 ? columns(customs, true, 'yours') : null}
        <Text bold>Motion</Text>
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {MOTIONS.map(m => (
            <Button
              key={`motion-${m}`}
              label={MOTION_LABEL[m]}
              variant={m === motion ? 'primary' : 'secondary'}
              onPress={() => void ctl?.setMotion(m)}
            />
          ))}
        </Box>
        <Text bold>Make your own</Text>
        <Box flexDirection="column" gap={1}>
          <Text dimColor>Describe a look, and Claude picks the colors</Text>
          <Input
            key="describe-look"
            placeholder={busy ? 'Picking colors…' : 'e.g. cozy forest at dusk'}
            submitLabel="Preview"
            onSubmit={value => void ctl?.describeLook(value)}
          />
        </Box>
        <Box flexDirection="column" gap={1}>
          <Text dimColor>Or paste 1 to 5 hex colors</Text>
          <Input key="hex-color" placeholder="#ff6b6b #4ecdc4" submitLabel="Add" onSubmit={value => {
            for (const hex of parseColors(value).length ? parseColors(value) : [value]) void ctl?.addColor(hex)
          }} />
        </Box>
        {draft.length > 0 ? (
          <Box key="draft-card" flexDirection="column" gap={1} borderStyle="round" borderDimColor padding={1}>
            <Text bold>Preview</Text>
            {hasSvg && 'Svg' in ui ? (
              <ui.Svg source={draftStrip(draft)} alt={`Picked colors: ${draft.join(', ')}`} width={40 * draft.length + 8 * (draft.length - 1)} height={40} />
            ) : null}
            <Box flexDirection="row" flexWrap="wrap" gap={1}>
              {draft.map((hex, i) => (
                <Button key={`draft-${i}`} plain onPress={() => void ctl?.removeColor(i)}>
                  {hex} <Text dimColor>✕</Text>
                </Button>
              ))}
            </Box>
            <Text dimColor>Build a matching set from the first color</Text>
            <Box flexDirection="row" flexWrap="wrap" gap={1}>
              <Button key="auto-analogous" label="Analogous" onPress={() => void ctl?.autoMatch('analogous')} />
              <Button key="auto-complementary" label="Complementary" onPress={() => void ctl?.autoMatch('complementary')} />
              <Button key="auto-triad" label="Triad" onPress={() => void ctl?.autoMatch('triad')} />
            </Box>
            <Input key="save-name" placeholder="Name it, e.g. Dubai nights" submitLabel="Save" onSubmit={value => void ctl?.save(value)} />
            <Box flexDirection="row" gap={1}>
              <Button key="auto-surprise" label="Surprise me" onPress={() => void ctl?.autoMatch('surprise')} />
              <Button key="discard" label="Discard" onPress={() => void ctl?.discard()} />
            </Box>
          </Box>
        ) : (
          <Box flexDirection="row" gap={1}>
            <Button key="auto-surprise" label="Surprise me" onPress={() => void ctl?.autoMatch('surprise')} />
          </Box>
        )}
        {notice ? <Text dimColor>{notice}</Text> : <Text dimColor>Picks preview live behind this pane until you save or discard.</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={sceneSource} alt="An animated gradient background" isInteractive />
  })
}
