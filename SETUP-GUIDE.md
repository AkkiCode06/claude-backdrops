# Setup guide (for Claude)

This file is for an AI assistant, usually Claude, that someone has asked to help install **Backdrop** (the plugin is named `gradient-flow`), an open-source theming kit for Claude Code, from this repository. Walk them through it one step at a time: say what to do, wait for them to say it worked, then go on. Keep each message short and in plain words. Skip a step when they've already done it.

This guide only covers installing and using the mod. Don't run commands on their machine unless they ask you to, and don't change their settings for them.

## 1. Check they can use it

Ask, or work out from the conversation:

- **Are they on the Claude Code desktop app?** The background only draws there and in Claude Code on mobile. The terminal and the regular Claude chat don't show themes. If they only use the terminal, say so and stop. If they use the regular Claude chat, explain the difference: this is for the **Code** tab.
- **Is the app in dark mode?** All the palettes are dark themes, so ask them to switch if it's in light mode.

## 2. Install

Give them the steps for where they are:

**Desktop app (most people):**
1. Click **+** next to the prompt box.
2. Choose **Plugins**, then **Add marketplace**.
3. Enter `AkkiCode06/claude-backdrops` and confirm.
4. Click **Add plugin** on **Gradient Flow**.

**Terminal session** (they typed `claude`): have them run

```
/plugin install gradient-flow --marketplace AkkiCode06/claude-backdrops
```

then answer `y`, and press Enter for the user scope.

Then ask them to **start a new Claude Code session** in the desktop app. The background should appear (the Ember palette, gently moving if they're plugged in), and a **Welcome to Gradient Flow** pane opens with an animated tour of every feature.

If nothing shows, check that the app is in dark mode and that the plugin is listed and enabled under **+** → **Plugins**.

## 3. Show them around

Once it's working, point them to the animated tour in the welcome pane. If they closed it, `/backdrop tour` replays it. Then suggest they try each thing:

1. **The picker:** run `/backdrop`. A pane opens with all the palettes, a motion setting and a field for their own colors.
2. **Switching:** click any palette, or type `/backdrop ocean`.
3. **Their own colors:** in the picker's **Make your own** section they can describe a look ("cozy forest at dusk") and press **Preview**, or paste 1–5 hex colors from any color picker and let **Analogous**, **Complementary** or **Triad** build a matching set from the first (**Surprise me** picks at random). It previews live behind the pane; they name it and press **Save**, or **Discard**. They can also just ask Claude.
4. **Motion:** **Auto** (the default) moves while plugged in and eases to a stop on battery. **Always move** and **Still** are the other choices.

Tell them they can just ask Claude to change the background anytime. In sessions where the mod is installed, Claude has a `background` tool for this.

## 4. Mention the cost

In one or two sentences: a moving background uses a fair amount of GPU (roughly 25–30 points more on a MacBook), which is why it pauses on battery by default. If their fans spin up or the battery drains faster, choose **Still**.

## Answers to common questions

- **Does it work in the regular Claude app chat?** No, only in Claude Code (the Code tab) on desktop, and Claude Code on mobile.
- **Why is the prompt box a solid color?** The app draws it that way; the mod can only tint it to match.
- **Can panels be frosted glass?** The mod turns blur off on purpose: blurring panels over a moving background roughly doubles the GPU cost.
- **How do I remove it?** **+** → **Plugins**, then remove Gradient Flow, or `/plugin uninstall gradient-flow` in a terminal session.
- **How do I add a palette to the code?** Edit `hooks/palettes.ts` (copy an entry), then run `claude plugin validate .`.
