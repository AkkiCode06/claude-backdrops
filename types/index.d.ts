export type Motion = 'auto' | 'on' | 'off'

export type BackdropSettings = {
  appearance: 'dark' | 'light'
  contrast: boolean
  lowPower: boolean
  autoPalette: 'off' | 'time'
  perProject: boolean
  activity: boolean
  usageMeter: boolean
  notify: boolean
}

export type BackdropScene = {
  activity: 'idle' | 'thinking' | 'working' | 'done' | 'error'
  usage: number
  context: number
  lowPower: boolean
}

// A palette as it is stored: the picker's presets and the ones people make.
export type StoredPalette = {
  id: string
  name: string
  author?: string
  style?: string
  base: readonly [string, string, string]
  glows: readonly [string, string, string, string, string]
  surfaces: readonly [string, string, string, string]
  text: { primary: string; secondary: string; muted: string }
  roles: { accent: string; danger: string; success: string; warning: string; pro: string }
}

declare module 'claude-code' {
  interface PluginState {
    'gradient-flow': {
      // The chosen palette's id.
      palette: string
      // Auto follows the power source: moving when plugged in, still on battery.
      motion: Motion
      // Palettes people made, newest last.
      customs: Shaped<StoredPalette[]>
      // A line the picker shows under the color field (an error, or what was made).
      notice: string
      // The colors being picked in "Make your own", previewed live until saved.
      draft: string[]
      // True while a described look is being turned into colors.
      busy: boolean
      // The background style in use (see hooks/styles.ts).
      style: string
      // Themes loaded from theme files: themes/*.json (community) and
      // ~/.claude/backdrop/themes/*.json (the user's own).
      community: Shaped<StoredPalette[]>
      files: Shaped<StoredPalette[]>
      // Modes and reactive-layer switches.
      settings: Shaped<BackdropSettings>
      // What Claude is doing and how much usage is left, for the picker to show.
      scene: BackdropScene
    }
  }
}
