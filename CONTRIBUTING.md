# Contributing to Gradient Flow

Thanks for wanting to make Claude Code prettier. Palettes are the easiest way in.

## Add a palette

1. Try your colors live first: `/backdrop`, then **Make your own**, paste the hex codes and **Save**.
2. Copy an entry in [`hooks/palettes.ts`](hooks/palettes.ts) and fill in:
   - `base`: three dark tones for the background gradient
   - `glows`: five colors for the moving blobs (largest first)
   - `surfaces`: four dark panel colors, darkest first and close together
   - `text` and `roles`: keep `text.primary` near white, and keep `danger` red, `success` green and `warning` amber
3. Run the checks:
   ```bash
   claude plugin validate .
   claude plugin test .
   ```
   The palette test checks that Claude Code will paint every palette.
4. Open a pull request with a screenshot. It doesn't need to be fancy.

## Run it from your clone

```bash
claude --plugin-dir .
```

Or add the folder as a marketplace (`claude plugin marketplace add .`) and install from it. Edits then apply after `/reload-plugins`.

## Ground rules

- Keep it light on the GPU: no full-screen blur filters, and animate with SVG (SMIL) rather than CSS.
- Nothing leaves the user's machine except the "describe a look" request, which goes through Claude Code's own model connection. Keep it that way, and say so in the README if that ever changes.
- Be kind in issues and reviews.
