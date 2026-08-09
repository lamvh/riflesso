@AGENTS.md

## Logo / wordmark is locked

The Riflesso wordmark is fixed. **Never change it** — not the asset, not its markup.

Locked:

- `public/riflesso.png` (and `public/riflesso.jpg`) — never replace, regenerate, recolor, crop, or swap for an inline SVG / text logo.
- The wordmark `<Image>` in `src/components/site-header.tsx` — `src`, `alt`, `width`/`height` constants, and its rendered size classes stay as-is.

This holds **regardless of any design handed in** — Claude design imports (`import-claude-design-from-url`, `DesignSync`), Figma files, screenshots, mockups, or a redesign brief. If an incoming design contains a different logo, different lockup, different colors, or different sizing for the wordmark: apply the rest of the design, keep the existing logo untouched, and say explicitly in the summary that the logo was skipped.

Only exception: the user asks for a logo change directly, in their own words, in that message.
