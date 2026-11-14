import { expect, test } from 'claude-code/testing'
import { colorsFor } from './custom'
import { PALETTES } from './palettes'
import { STYLES } from './styles'
import { parseTheme, toThemeFile } from './themes'

const PANE = {
  plugin: 'gradient-flow',
  component: 'Pane',
  requestId: 'background-picker',
  props: {
    title: 'Background',
    isFocused: true,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

// Stand in for the engine: nothing stored yet, plugged in, every theme drawn.
type TestOn = Parameters<Extract<Parameters<typeof test>[1], (...args: never[]) => unknown>>[1]
const engine = (
  on: TestOn,
  opts: { welcomed?: boolean; opened?: string[]; placed?: boolean; stored?: Record<string, unknown>; files?: Record<string, string>; written?: Record<string, string> } = {},
) => {
  on('env.get', () => ({ value: '/home/test' }))
  on('fs.list', (_, e) => {
    const dir = String(e.path ?? '')
    const local = (f: string) => (f.startsWith('PLUGIN/') && !dir.startsWith('/home/test') ? dir.replace(/\/themes$/, '') + f.slice('PLUGIN'.length) : f)
    const names = Object.keys(opts.files ?? {}).map(local).filter(f => f.startsWith(dir + '/')).map(f => f.slice(dir.length + 1))
    if (names.length === 0) throw new Error('ENOENT')
    return { value: names.map(name => ({ name, kind: 'file', size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('fs.read', (_, e) => {
    const path = String(e.path)
    const text = (opts.files ?? {})[path] ?? Object.entries(opts.files ?? {}).find(([k]) => k.startsWith('PLUGIN/') && path.endsWith(k.slice('PLUGIN'.length)))?.[1]
    if (text === undefined) throw new Error('ENOENT')
    return { value: text }
  })
  on('fs.write', (_, e) => {
    if (opts.written) opts.written[String(e.path)] = String(e.text)
    return { value: undefined }
  })
  on('store.get', (_, e) => ({ value: e.key === 'welcomed' ? opts.welcomed : undefined }))
  on('store.set', (_, e) => {
    if (opts.stored) opts.stored[e.key] = e.value
    return { value: undefined }
  })
  on('process.run', () => ({ value: { exitCode: 0, stdout: "Now drawing from 'AC Power'", stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'theme' } }))
  on('command.register', () => ({ value: { command: 'backdrop' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__gradient-flow__background' } }))
  on('ui.open', (_, e) => {
    opts.opened?.push(e.id)
    return { value: opts.placed === false ? { isPlaced: false, reason: 'no-surface: none attached' } : { isPlaced: true } }
  })
  on('clock.now', () => ({ value: 1_000 }))
  // Timers never fire in these tests.
  on('clock.every', () => new Promise(() => {}))
  on('clock.after', () => new Promise(() => {}))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
}

test('the picker draws its palettes on every surface', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /^Palettes$/ }))?.text).toBe('Palettes')
    expect((await ui.find({ type: 'Text', text: /Make your own/ }))?.text).toBe('Make your own')
    expect(JSON.stringify(await ui.find({ type: 'Box' })).match(/pick-[a-z-]+/g)?.length).toBe(23)
    await ui.unmount()
  }
})

test('a pasted hex builds a draft, Triad fills it, Save keeps it', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await ui.input({ key: 'hex-color', text: '#11d4d4' })
  expect((await ui.find({ type: 'Text', text: /Previewing/ }))?.text).toMatch(/Previewing/)

  await ui.press({ key: 'auto-triad' })
  const tree = JSON.stringify(await ui.find({ type: 'Box' }))
  expect(tree.match(/draft-\d/g)?.length).toBe(4)

  await ui.input({ key: 'save-name', text: 'Teal triad' })
  expect((await ui.find({ type: 'Text', text: /Made Teal triad/ }))?.text).toMatch(/Made Teal triad/)
  expect((await ui.find({ type: 'Text', text: /^Yours$/ }))?.text).toBe('Yours')
  await ui.unmount()
})

test('a described look is previewed from the colors the model picks', async ($, on) => {
  engine(on)
  on('model.complete', () => ({
    value: { isAnswered: true, text: '#1b4332 #2d6a4f #40916c #d4a373', usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } },
  }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await ui.input({ key: 'describe-look', text: 'cozy forest at dusk' })
  expect((await ui.find({ type: 'Text', text: /Previewing "cozy forest at dusk"/ }))?.text).toMatch(/cozy forest/)

  await ui.press({ key: 'discard' })
  expect(await ui.find({ type: 'Text', text: /Previewing/ })).toBeUndefined()
  await ui.unmount()
})

test('the tour opens once on first run and draws on every surface', async ($, on) => {
  const opened: string[] = []
  engine(on, { opened })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(opened).toContain('gradient-flow-tour')

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, requestId: 'gradient-flow-tour', props: { ...PANE.props, title: 'Welcome to Gradient Flow' }, surface })
    expect((await ui.find({ type: 'Text', text: /Replay this anytime/ }))?.text).toMatch(/backdrop tour/)
    await ui.unmount()
  }
})

test('once welcomed, the tour stays closed', async ($, on) => {
  const opened: string[] = []
  engine(on, { welcomed: true, opened })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(opened).not.toContain('gradient-flow-tour')
})

test('a tour that could not be drawn is not marked as seen', async ($, on) => {
  const stored: Record<string, unknown> = {}
  const opened: string[] = []
  engine(on, { opened, placed: false, stored })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(opened).toContain('gradient-flow-tour')
  expect(stored.welcomed).toBeUndefined()
})

test('a tour that was drawn is marked as seen', async ($, on) => {
  const stored: Record<string, unknown> = {}
  engine(on, { stored })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(stored.welcomed).toBe(true)
})

test('Open the picker swaps the tour for the picker', async ($, on) => {
  const opened: string[] = []
  const closed: string[] = []
  engine(on, { opened })
  on('ui.close', (_, e) => {
    closed.push(e.id)
    return { value: undefined }
  })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, requestId: 'gradient-flow-tour', surface: 'desktop' })
  await ui.press({ key: 'tour-open-picker' })
  expect(closed).toContain('gradient-flow-tour')
  expect(opened).toContain('background-picker')
  await ui.unmount()
})

test('Claude Code will paint every built-in palette', () => {
  for (const p of PALETTES) {
    const blocking = colorsFor(p).problems.filter(line => line.startsWith("Desktop won't paint"))
    expect({ palette: p.id, blocking }).toEqual({ palette: p.id, blocking: [] })
  }
})

const THEME = JSON.stringify({ id: 'rainy-tokyo', name: 'Rainy Tokyo', author: 'someone', style: 'starfield', colors: ['#05061a', '#ff2e88', '#00c2ff'] })

test('theme files in themes/ show up as Community, credited, and switch the style', async ($, on) => {
  engine(on, { files: { 'PLUGIN/themes/rainy-tokyo.json': THEME } })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^Community$/ }))?.text).toBe('Community')
  expect((await ui.find({ type: 'Text', text: /by @someone/ }))?.text).toMatch(/someone/)
  await ui.press({ key: 'pick-rainy-tokyo' })
  const tree = JSON.stringify(await ui.find({ type: 'Box' }))
  expect(tree).toMatch(/Starfield/)
  await ui.unmount()
})

test('export writes a theme file to ~/.claude/backdrop/themes', async ($, on) => {
  const written: Record<string, string> = {}
  engine(on, { written })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'export' })
  const path = Object.keys(written)[0] ?? ''
  expect(path).toBe('/home/test/.claude/backdrop/themes/ember.json')
  expect(JSON.parse(written[path] ?? '{}').name).toBe('Ember')
  await ui.unmount()
})

test('every style draws every palette, moving and still, within the size limit', () => {
  for (const st of STYLES) for (const p of PALETTES) for (const mode of [{ kind: 'flow', run: { from: [0, 0, 0, 0, 0], ramp: true } }, { kind: 'still', at: [0, 0, 0, 0, 0] }] as const) {
    const svg = st.build(p, mode as never)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.length < 131072).toBe(true)
    if (mode.kind === 'still') expect(/<animate/.test(svg) && st.id !== 'gradient').toBe(false)
  }
})

test('theme files: the quick and full shapes parse, broken ones say why', () => {
  const quick = parseTheme(THEME)
  expect('palette' in quick && quick.palette.author).toBe('someone')
  const full = parseTheme(JSON.stringify(toThemeFile(PALETTES[0]!)))
  expect('palette' in full && full.palette.name).toBe('Ember')
  const bad = parseTheme('{"id":"Bad Id","name":"x","colors":["#fff"]}')
  expect('error' in bad && bad.error).toMatch(/id/)
})
