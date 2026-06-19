# Mast Eye — review packet (overnight Day-49 → 50, 2026-06-18/19)

You were AFK; you gave the comms. Here's exactly what happened and what's waiting for you.

## ✅ SHIPPED LIVE — 37th-chamber.com (PR #120, merged + CDN-verified)
The homepage hero is now the **whole-eye kaleidoscope** — the one you saw and blessed ("yup / GO / LIVE ASAP"):
- white **almond sclera glow** (the negative space between the eyelids)
- a turning **12-fold crystalline kaleidoscope iris** (blue + white + teal)
- a dark **pupil (2×)** + catch-light glint + soft white eyelid rim glow
- **no gold cage, no grid** on the hero — the kaleidoscope makes the shapes
- transparent canvas (floats on the page, no black box), **immediate first paint** (never blank on a hidden/throttled tab — that was the bug we hit), `prefers-reduced-motion` honored, seeded `20260621`

The gold sigil is untouched everywhere else: **footer crest, favicon, OG card**. Dispatches, now-playing, nav — all intact. STS-87 stayed live the whole time.

Source of truth for the hero render: `assets/widgets/mast-eye-whole.html` (and the inline script in `index.html`).

## ⏳ STAGED FOR YOUR REVIEW — the 7-day week series (NOT live)
Seven sibling whole-eyes, one per day, **same eye frame** (so they're a family), each a **distinct, elevated iris**, climbing Mon→Sun to a Sunday **Summit** showpiece (for your mother). Built by a 14-agent workflow (7 generate + 7 adversarial judge), then I independently pixel-verified every one renders (iris lit, pupil dark — judges only read code, so I didn't trust their "I served it" claims).

| # | Day | Name | Fold | Feel |
|---|-----|------|------|------|
| 1 | Mon | Ice Seed | 6 | delicate frost needles, sparse, the quiet seed |
| 2 | Tue | First Facets | 8 | crisp clean angular shards |
| 3 | Wed | Crystal Bloom | 10 | denser voronoi-like crystal cells |
| 4 | Thu | Teal Nebula | 12 | flowing teal + sharp white glints |
| 5 | Fri | Shattered Glass | 12 | bold large facets, refraction edges |
| 6 | Sat | Sapphire Jewel | 12 | rich gemstone depth |
| 7 | **Sun** | **The Summit** | 12 | double counter-rotating, max brilliance — the showpiece |

### How to review
Restart the preview server if it's down, then open the gallery:
```
cd Repos/_wt-kaleido-live && python -m http.server 8791
# then open:  http://localhost:8791/assets/widgets/mast-eye-series-gallery.html
```
Individual files: `assets/widgets/series/<n>-<day>-<name>.html`. The gallery shows all seven at full + mast size.

## 📋 Decisions waiting on you
1. **Lineup + order** — keep/reorder/swap any of the 7; promote a different one to Summit.
2. **Hero direction** — it's live as the **whole-eye almond**. The **circular gold-ring** version is also fully built (`feat/sigil-kaleido-live` history) — nothing lost if you want to revisit.
3. **The grid** — your "maybe remove the blueprint grid sitewide." Not done (page-wide change); your call.
4. **Wiring** (after you pick): day-of-week rotation on the hero (the 7 irises rotate Mon→Sun), + the gold favicon-sigil masts (with hexes) onto the subpages that lack a unique mast — **not** Roots (tree-temple), **not** Dispatches (typewriter sigil).

## Notes
- Reference look = SignalRGB "Kaleidoscope" Pro tuned blue. It's proprietary, so everything here is our own original code — never their shader.
- Also in `assets/widgets/`: 4 raw kaleidoscope-*disc* explorations from the first generation pass (pre-whole-eye), kept as reference.
- Work done in isolated worktree `Repos/_wt-kaleido-live` (parallel-session-safe).
