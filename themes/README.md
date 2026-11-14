# Community themes

Every `.json` file in this folder ships to everyone as a **Community** theme in the `/backdrop` picker, credited to its author.

**Add yours:** export it from the picker (**Share → Export current theme**, or `/backdrop export`), copy the file from `~/.claude/backdrop/themes/` into this folder, and open a PR with a screenshot. A check validates it automatically.

**The quick format** (Backdrop works out panels and text from your colors):

```json
{ "id": "rainy-tokyo", "name": "Rainy Tokyo", "author": "your-github-handle",
  "style": "starfield", "colors": ["#05061a", "#ff2e88", "#00c2ff"] }
```

**The full format** sets every color yourself: `base` (3), `glows` (5), `surfaces` (4), `text`, `roles`. Exported files use it. `style` is optional: `gradient`, `starfield`, `waves` or `synthwave`.

Check locally: `node --experimental-strip-types scripts/check-themes.ts`. Full guide: [docs/making-themes.md](../docs/making-themes.md).
