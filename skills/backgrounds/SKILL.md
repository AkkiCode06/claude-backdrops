---
name: backgrounds
description: Use when the person asks about their Claude Code background, theme or app colors with the Gradient Flow mod installed - changing it, making their own from colors or a mood, pausing the animation, battery use, or how the picker works.
---

# Gradient Flow backgrounds

The Gradient Flow mod draws an animated gradient behind Claude Code on desktop and recolors the app to match. You change it with the `mcp__gradient-flow__background` tool.

## Picking the action

- **"Change my background"** with nothing more specific: `open_picker`. They choose in the pane.
- **They name a palette** ("make it ocean"): `set` with its id. Presets: `ember`, `sunset`, `violet`, `cyberpunk`, `ocean`, `aurora`, `mint`, `rose`, `midnight`, `synthwave`, `lagoon`, `forest`, `lavender`, `citrus`, `neon-tokyo`, `galaxy`, `cherry-blossom`, `arctic`, `desert`, `autumn`, `matrix`, `coffee`, `graphite`. If one fits what they describe, prefer it over making a new palette.
- **They describe a mood or give colors** ("cozy forest", "my brand colors #0a2540 #635bff"): `create` with a short `name` and 3–5 hex `colors`. For a mood, choose colors that carry it: one or two deep tones plus one or two brighter glows. For example, "cozy forest" could be `#1b4332 #2d6a4f #40916c #d4a373`. The mod works out readable panels and text by itself.
- **"Stop the animation" / "it's draining my battery"**: `motion` `off`. **"Make it move again"**: `on`. **Only when plugged in**: `auto` (the default).
- **"How does this work?" / they just installed it**: `tour` opens the animated walkthrough.
- **"What backgrounds are there?"**: `list`, then answer in a sentence or two.
- **A different kind of background** ("make it a starry night", "rain", "matrix", "synthwave", "lava lamp"): `style` with one of: `gradient`, `starfield`, `waves`, `synthwave`, `aurora`, `rain`, `snow`, `code-rain`, `lava-lamp`, `geometric`, `city`. You can combine it with `set` or `create` for the colors.
- **Modes**: `setting` with `appearance` (`light`/`dark`), `contrast`, `lowPower`, `autoPalette` (`time` follows the clock), `perProject` (`on`/`off`).
- **The reactive layer** (it glows while you think and work, flashes when done, and shows a usage bar that warns near the limit): `setting` with `activity`, `usageMeter` or `notify`, `on`/`off`. Suggest `usageMeter` when they worry about hitting limits, and `notify` when they step away during long tasks.
- **"Share my theme"**: `share` gives a one-line code; `export` writes a file. Someone else's code or JSON: `import`.
- **"Delete the one I made"**: `remove` with its id (from `list`). Presets can't be removed.

After the tool answers, tell them in one short line what changed. Don't repeat the tool's whole output.

## Things to know

- Themes draw only in the Claude Code desktop app and Claude Code on mobile, in dark mode.
- The `/backdrop` picker has its own **Make your own** section: a describe-a-look field (a small model picks the colors), a hex field, Analogous / Complementary / Triad / Surprise me, live preview, and Save / Discard. Point people there when they want to experiment themselves.
- `/backdrop` also works from the prompt: `/backdrop`, `/backdrop ocean`, `/backdrop #hex #hex`, `/backdrop still|move|auto`.
- Motion costs GPU, roughly 25–30 points on a MacBook, so **Auto** pauses it on battery. Starts and stops ease in and out over a few seconds, and the power source is checked every 30 seconds.
- The prompt box is drawn solid by the app; the mod can only tint it.
