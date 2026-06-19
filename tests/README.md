# 37th Chamber — browser + a11y tests

Regression guard for the live site. First suite: the **Washington Square** chess board
(layout + accessibility). The coordinate-label tests here would have caught the 2026-06-09
bug where the `a–h` file labels stacked vertically in column 1 (the `role="presentation"`
label row missed `[role="row"]{display:contents}` after the keyboard-a11y change).

## Run it

```bash
cd tests
npm install              # one-time: pulls Playwright + axe-core
npm run install:browser  # one-time: downloads Chromium
npm test                 # runs desktop + mobile projects
```

`playwright.config.mjs` auto-starts a `python -m http.server` on the repo root (port 8799),
runs the specs, and tears it down. No manual server needed.

## What each error CLASS maps to

| Class | Tool | Covered here |
|-------|------|--------------|
| Layout / render (the file-label bug) | Playwright DOM/geometry assertions | ✅ `board.spec.mjs` |
| Accessibility / ARIA (what *caused* that bug) | `@axe-core/playwright` | ✅ critical+serious gate |
| Responsive (`<400px` breakpoint) | Playwright `mobile` project (Pixel 7) | ✅ |
| Engine logic (legality, mate, the belt ladder) | Node + the vendored `chess.js` API | ▶ next suite |

## Add a test
Drop another `*.spec.mjs` in this dir. Keep assertions geometric/observable (positions,
counts, computed styles, axe) — the lesson of the file-label bug is that *source review
passes while the render is broken*; only a real browser catches that class.
