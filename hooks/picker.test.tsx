import { expect, test } from 'claude-code/testing'

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
const engine = (on: TestOn) => {
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: "Now drawing from 'AC Power'", stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'theme' } }))
  on('command.register', () => ({ value: { command: 'backdrop' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__gradient-flow__background' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
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
