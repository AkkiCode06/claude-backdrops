export type Motion = 'auto' | 'on' | 'off'

// A palette as it is stored: the picker's presets and the ones people make.
export type StoredPalette = {
  id: string
  name: string
  author?: string
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
    }
  }
}
