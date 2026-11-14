# Gradient Flow

Animated gradient backgrounds for **Claude Code on desktop**. Pick from 23 palettes, make your own from any colors, and let the motion pause by itself when you're on battery.

> **Asked Claude to set this up from the link?** Claude: read [`SETUP-GUIDE.md`](SETUP-GUIDE.md) and walk the person through it step by step.

## What you get

- **23 palettes:** Ember, Sunset, Violet, Cyberpunk, Ocean, Aurora, Mint lime, Rose gold, Midnight, Synthwave, Lagoon, Forest, Lavender, Citrus, Neon Tokyo, Galaxy, Cherry blossom, Arctic, Desert, Autumn, Matrix, Coffee and Graphite. Each one recolors the background and the app's panels, text and accent color to match.
- **Your own palettes:** in the picker, describe a look ("cozy forest at dusk") and Claude picks the colors, or paste 1–5 hex colors from any color picker and let **Analogous / Complementary / Triad** build a matching set from the first one, or hit **Surprise me**. Everything previews live; **Save** keeps it. The mod works out readable panels and text from your colors.
- **A picker:** run `/backdrop`, or just ask Claude to change your background.
- **Battery-aware motion:** on **Auto**, the glows drift while you're plugged in and ease to a stop on battery. Plugging back in eases them back up. You can also set **Always move** or **Still**.
- **Smooth motion:** the glows orbit continuously with no stalls. Starts and stops ease in and out, never snap.

## Install

You need the Claude Code desktop app. Themes draw in the desktop app and Claude Code on mobile; the terminal and the regular Claude chat don't show them. Battery-aware motion reads the Mac's power source; elsewhere **Auto** simply keeps moving, so pick **Still** if you want it off.

**In the desktop app:** click **+** next to the prompt box → **Plugins** → **Add marketplace** → enter `AkkiCode06/claude-backdrops` → then **Add plugin** on Gradient Flow.

**From a terminal session** (`claude`):

```
/plugin install gradient-flow --marketplace AkkiCode06/claude-backdrops
```

Answer `y` to add the marketplace and press Enter for the user scope.

**From a shell:**

```
claude plugin install gradient-flow --marketplace AkkiCode06/claude-backdrops
```

The background appears in your next Claude Code session on desktop.

## Use

| You want to | Do this |
| --- | --- |
| Open the picker | `/backdrop`, or ask Claude "change my background" |
| Switch palette | `/backdrop ocean`, or click it in the picker |
| Make your own | In `/backdrop`: describe a look and press **Preview**, or paste hex colors, try **Analogous**, **Complementary**, **Triad** or **Surprise me**, then name it and **Save**. Also: `/backdrop #1b4332 #2d6a4f #d4a373`, or ask Claude "make me a cozy forest background" |
| Change motion | `/backdrop auto`, `/backdrop move` or `/backdrop still` |
| Remove one you made | **Remove** next to it in the picker, or ask Claude |

Your choice is remembered across sessions.

## Performance

An animated background makes the app redraw the whole window every frame. On an Apple Silicon MacBook, measured with the GPU's utilisation counter:

| Setup | GPU |
| --- | --- |
| Still background | baseline (about the same as no theme) |
| Moving background | roughly +25–30 points |

That's why **Auto** is the default: full motion when plugged in, still on battery. Choose **Still** if you want it off entirely. Panels use a see-through tint with no blur on purpose, since blurring panels over a moving background costs a lot more.

## Troubleshooting

- **No background:** the theme draws in dark mode only, so switch the app to dark mode. Also check that the plugin is enabled under **+** → **Plugins**.
- **The prompt box looks solid:** that's expected. The app draws it as a solid color, and the mod tints it to match the palette.
- **"Those colors don't leave enough contrast":** pick darker or more varied colors.

## Make it yours

Palettes live in [`hooks/palettes.ts`](hooks/palettes.ts). Copy an entry, change the colors, and run `claude plugin validate .` to check it.

## License

MIT, see [LICENSE](LICENSE).
