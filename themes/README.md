# Community themes

Every `.json` file in this folder ships to everyone as a **Community** theme in the `/backdrop` picker, credited to its author.

**Add yours:** export it from the picker (**Share → Export current theme**, or `/backdrop export`), copy the file from `~/.claude/backdrop/themes/` into this folder, and open a PR with a screenshot. A check validates it automatically.

**The quick format** (Backdrop works out panels and text from your colors):

```json
{ "id": "rainy-tokyo", "name": "Rainy Tokyo", "author": "your-github-handle",
  "style": "starfield", "colors": ["#05061a", "#ff2e88", "#00c2ff"] }
```

**The full format** sets every color yourself: `base` (3), `glows` (5), `surfaces` (4), `text`, `roles`. Exported files use it. `style` is optional (see the list below).

Start one with `node --experimental-strip-types scripts/new-theme.ts <id>`, and check it with `node --experimental-strip-types scripts/check-themes.ts` (CI runs it on every PR). [`schema.json`](schema.json) gives editors autocomplete: add `"$schema": "./schema.json"` at the top.

Styles: `gradient`, `starfield`, `waves`, `synthwave`, `aurora`, `rain`, `snow`, `code-rain`, `lava-lamp`, `geometric`, `city`.

Prefer not to open a PR? `/backdrop share` gives a one-line code anyone can import. Full guide: [docs/making-themes.md](../docs/making-themes.md).
