# Daily v2 — Design Document
*Working file — worktree only. Not for index.html until review.*

---

## 1. What v1 Does (the baseline)

`daily.js` renders one UI pattern every day: a header (num · theme · date), an intro paragraph, then
a 6-card `.grid` — one card per slot (music, film, science, book, artist, show). The whole section
lives in `#the-daily` and is overwritten on every load. Cards are thin `<a>` elements: chip + bold
name/work + why-sentence + "verb →" CTA.

All data lives in `DAILY[]` — one object per day, theme-grouped, date-keyed. The day resolves by
`DAILY_START` + elapsed days, rolling at 04:00 local. Preview params (`?date=` / `?day=`) let any
day be inspected before it rotates. Hold-at-last-entry prevents a blank state if the queue runs dry.

**What v1 gets right:**
- Zero dependencies, instant, no build step.
- Data-driven: add objects, ship file, done.
- Backward-compat by default (existing DAILY[] works untouched).
- Blueprint aesthetic is already baked into the scoped `<style>` block.

---

## 2. The v2 Problem Statement

Seven days of identical 6-box grids trains readers to stop looking. The grid is the right shape for
Monday (orientation / overview) but the wrong shape for Wednesday (depth) or Sunday (synthesis).
v2 gives each day of the week its own render mode — same data structure, different lens.

---

## 3. Weekday Render Modes

### Monday — THE MAP (current behavior, unchanged)
The 6-box grid. Sets the week's theme, orients new visitors, establishes the full cast.
No changes to render logic. Existing data objects work as-is.

### Tuesday – Saturday — THE DEEP DIVE
One focused card, full-width, hero scale. Spotlights the day's **standout figure or idea** —
the entry with the most explanatory weight, the one a reader should sit with.

Visual pattern:
```
[ CHIP: e.g. "The Screenwriter" ]
[ BIG NAME + WORK — 1.8–2.4rem gold, all-caps ]
[ Extended why — 2–4 sentences, full prose, up to ~120 words ]
[ All six slot labels rendered as a compact "also in today's six" row below ]
[ "explore →" CTA ]
```

The standout is **authored in the data object** via a `spotlight` key — not auto-detected. If absent,
the engine falls back to the first slot (music). This keeps editorial control explicit.

### Sunday — THE DISPATCH
Magazine-style synthesis of the week. Renders the week's arc as a vertical, editorial layout:

```
[ WEEK HEADER: "Week N — {Theme}" large gold masthead ]
[ Week intro / synthesis paragraph (authored in the week-arc object, see §4) ]
[ Horizontal divider (electric blue ruled line) ]
[ MONDAY anchor: compact 6-box grid at 70% scale (the map, revisited) ]
[ Tuesday–Saturday: each day as a "chapter" — dateline + standout card + condensed six-row ]
[ Footer: "The thread" — 1–3 sentences on what the week proved ]
```

Sunday pulls from `WEEK_ARCS[]` (see §4) keyed on the week's first Monday date.

---

## 4. Data Shape Changes

### 4a. Per-Day Object (DAILY[]) — additive, fully backward-compat

Existing fields: `num`, `theme`, `date`, `intro`, `music`, `film`, `science`, `book`, `artist`, `show`
— all unchanged. v2 reads them exactly as before on Monday and for the six-row on other days.

**New optional fields** (old objects that lack them still render correctly):

```js
{
  // ... all existing fields ...

  spotlight: "science",
  // The slot key whose entry is featured on Tue–Sat.
  // Valid values: "music" | "film" | "science" | "book" | "artist" | "show"
  // Absent → defaults to "music" (first slot)

  deepWhy: "Extended prose for the deep-dive card — up to ~120 words, full sentences. \
The brief card.why is the pull-quote; deepWhy is the full argument. \
If absent, the engine uses card.why verbatim (shorter, but still works)."
  // Optional extended explanation, only shown in the DEEP DIVE render
}
```

No other changes to DAILY[]. Old objects are safe — they render identically on Monday and degrade
gracefully (fallback spotlight: music, fallback deepWhy: card.why) every other day.

### 4b. Week-Arc Objects — WEEK_ARCS[] (new, Sunday only)

```js
const WEEK_ARCS = [
  {
    weekStart: "2026-06-08",   // Monday date of this week — the key
    weekNum: 1,
    theme: "Interstellar",
    synthesis: `Full synthesis paragraph — 3–5 sentences authored for Sunday. \
The week's arc as a single argument: what these six days proved, \
what thread ran through them, why it mattered. \
Not a recap — an argument. Theme-indexed, not date-locked.`,
    thread: "One-sentence 'what this week was really about' — \
renders as the footer line of the Sunday dispatch."
  }
  // add one per week
];
```

`WEEK_ARCS` is keyed by `weekStart`. The Sunday renderer: (1) finds the most-recent Monday on or
before today, (2) looks up that date in `WEEK_ARCS`, (3) pulls all 7 days from `DAILY[]` whose
`date` falls Mon–Sun of that week, (4) renders the dispatch layout.

If no `WEEK_ARCS` entry exists for the current week (queue not yet authored), the Sunday renderer
falls back to the Monday map render — safe, no blank state.

---

## 5. Weekday Detection

```js
function renderMode(date) {
  // date is a JS Date object already adjusted for ROLLOVER_HOUR
  const dow = date.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  if (dow === 1) return "map";        // Monday
  if (dow === 0) return "dispatch";   // Sunday
  return "deepdive";                  // Tue–Sat
}
```

Preview params (`?date=` / `?day=`) continue to work — the mode is derived from the resolved date's
day-of-week, so previewing a Sunday shows dispatch, a Wednesday shows deep-dive, etc.

---

## 6. Backward Compatibility Matrix

| Scenario | Result |
|---|---|
| Old DAILY[] object (no `spotlight`, no `deepWhy`) on a Monday | Renders exactly as v1 |
| Old DAILY[] object on Tue–Sat | Spotlight defaults to `music`; deepWhy falls back to `music.why` |
| Old DAILY[] object on Sunday | Falls back to map render if no WEEK_ARCS entry exists |
| New object with `spotlight`+`deepWhy` on Monday | spotlight/deepWhy ignored; clean 6-box grid |
| No WEEK_ARCS entry for current week | Sunday falls back to map render, no error |
| DAILY[] queue runs dry (idx >= DAILY.length) | Hold-at-last-entry behavior preserved from v1 |

---

## 7. CSS Additions (scoped inside #the-daily)

v2 adds three new scoped rule-blocks injected alongside the existing `<style>`:

**Deep-dive card** (`.dly-deepdive`):
- Full-width, gold border left 3px electric-blue glow (matches flagship pattern)
- `.dly-dd-name`: 1.8–2.4rem, gold, all-caps, letter-spacing .04em
- `.dly-dd-chip`: same as existing `.chip` — reused
- `.dly-dd-why`: .98rem, `--text`, line-height 1.62, max-width 48rem
- `.dly-dd-also`: compact row of slot labels below — `.chip` style, dim color, no border, inline
- `.dly-dd-cta`: same as `.go` pattern

**Sunday dispatch** (`.dly-dispatch`):
- `.dly-wk-header`: 1.4rem gold, letter-spacing .24em, uppercase — week masthead
- `.dly-wk-synth`: prose block, `--text`, font-size 1rem, line-height 1.65, max-width 46rem
- `.dly-rule`: electric-blue ruled line (2px, full width, glow: matches `.title::after` treatment)
- `.dly-chapter`: each day's block — `margin-bottom: 1.8rem`, subtle separator
- `.dly-dateline`: `.7rem`, dim, letter-spacing .2em, uppercase — "Daily 002 · Mon Jun 09"
- `.dly-thread`: italic, `--gold-soft`, `.88rem` — the week's closing argument

All new classes are prefixed `dly-` and scoped inside `#the-daily {}` injection to avoid collision.

---

## 8. Wire-Up (how it connects to index.html)

**Nothing changes in index.html for v2 review.** The worktree file `daily-v2.js` is the candidate;
`daily.js` in the worktree remains v1 (also unchanged from live).

To swap v2 live, the only change is:
```html
<!-- change this line in index.html -->
<script src="/daily.js?v=9" defer></script>
<!-- to -->
<script src="/daily-v2.js?v=1" defer></script>
```

The mount point (`id="the-daily"`), the section wrapper, and the `.grid` / `.card` CSS already
defined in index.html's `<style>` block are all reused. v2 adds only its own scoped styles inline.

---

## 9. Honesty Floor

- All content in DAILY[] must be verified/cited (existing standard, unchanged).
- `deepWhy` is editorial prose — it must not assert facts not already in the source links.
- `synthesis` and `thread` in WEEK_ARCS are interpretive argument, not additional factual claims.
- Dates in data objects are **theme-indexed scheduling dates**, not date-locked facts — the content
  is independent of when it appears. If the queue shifts, only the date field changes.
- `deepWhy` absent = engine uses `card.why` — no fabrication, ever.

---

## 10. What's Left for bd8 to Do Before Swap

1. Author `spotlight` + `deepWhy` on DAILY[1]–[6] (the Tue–Sat Interstellar days already in queue).
2. Author the first `WEEK_ARCS` entry (week starting 2026-06-08, theme "Interstellar").
3. Review `daily-v2.js` in this worktree — confirm render on a Tuesday preview (`?date=2026-06-10`),
   a Sunday preview (`?date=2026-06-14`), and a Monday (`?date=2026-06-08`).
4. Bump the `?v=` param and swap the script tag.

*No build step. No new dependencies. Same deploy path as v1.*
