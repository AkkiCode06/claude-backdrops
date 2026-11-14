# Contributing to Gradient Flow

Thanks for wanting to make Claude Code prettier. Theming in Claude Code is brand new, and the goal is a shared library of community themes, so **themes are the most wanted contribution.**

## Share a theme

1. Try your colors live first: `/backdrop`, then **Make your own**, paste the hex codes and **Save**.
2. Copy an entry in [`hooks/palettes.ts`](hooks/palettes.ts) and fill in:
   - `base`: three dark tones for the background gradient
   - `glows`: five colors for the moving blobs (largest first)
   - `surfaces`: four dark panel colors, darkest first and close together
   - `text` and `roles`: keep `text.primary` near white, and keep `danger` red, `success` green and `warning` amber
   - `author`: your GitHub handle, so the picker shows "by @you"
3. Run the checks:
   ```bash
   claude plugin validate .
   claude plugin test .
   ```
   The palette test checks that Claude Code will paint every palette.
4. Open a pull request with the **theme** template (add `?template=theme.md` to the new-PR URL) and **a screenshot or short clip** of it running. A few pictures are plenty.
5. Optional: refresh the gallery image with `node --experimental-strip-types scripts/gallery.ts assets`.

## Labels

PRs are labeled automatically by the files they change:

| Label | When |
| --- | --- |
| `theme` | touches `hooks/palettes.ts` |
| `needs screenshot` | a theme PR with no image or clip yet (it comes off once you add one) |
| `core` | the mod's code (`hooks/*.ts`, `types/`, `plugin.json`) |
| `tests` | test files |
| `docs` | Markdown and the bundled skill |
| `assets` | banners, GIFs and `scripts/` |
| `github` | templates and workflows |

Issues use `bug`, `enhancement`, `palette` (theme ideas), `roadmap` and `good first issue`.

## Run it from your clone

```bash
claude --plugin-dir .
```

Or add the folder as a marketplace (`claude plugin marketplace add .`) and install from it. Edits then apply after `/reload-plugins`.

## Ground rules

- Keep it light on the GPU: no full-screen blur filters, and animate with SVG (SMIL) rather than CSS.
- Nothing leaves the user's machine except the "describe a look" request, which goes through Claude Code's own model connection. Keep it that way, and say so in the README if that ever changes.
- Be kind in issues and reviews.
