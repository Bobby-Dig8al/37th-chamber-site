# 37th-chamber.com — Build Roadmap

*The site's task-system, by horizon. Built Day-39 (2026-06-08) from the **verified** sources — the 9-bee review swarm (`Stack/handoffs/2026/day38-review-swarm-findings.md`) + `day39-direction` — not from the drifted 792-line bobby-digital `TASKS.md` (which self-flags "everything older may be stale"; its live site-items are folded in here, the rest stays archived there).*

**Discipline:** technical fixes get built + staged on `feat/mp-overnight`, **never pushed** — bd8 reviews + ships. Content / voice / personal / sacred = bd8's call, never touched solo.

---

## 🫳 YOUR HANDS — only you can do these

**Unlocks (each frees a build):**
- [ ] **Enable Caffeine** — keeps STS-87 awake so an unattended loop doesn't die mid-run (last night it ran 1 cycle then slept).
- [ ] **Email alias** — `hello@37th-chamber.com` via Cloudflare Email Routing → then I swap the `work/index.html` href (kills the surname leak in the mailto).
- [ ] **Review + push `feat/mp-overnight`** — the staged technical fixes (Blue-Law, a11y, + today's batch) when you've eyeballed them.
- [ ] **Spotify Worker** — dev app + refresh token + Cloudflare Worker → unlocks now-playing + the electric-hex visualizer (the live "waveform" — progress-modulated, not audio-FFT; Spotify gives no raw audio).
- [ ] **Email-capture service** (Buttondown / EmailOctopus) → unlocks the owned-list (the patient mesa, no paywall).
- [ ] **Analytics** (Cloudflare, privacy-respecting) → the silent-watch dashboard.

**Your content / voice / sacred calls (I drafted nothing here — yours):**
- [ ] **daily.js + the "hey, marc." note** — the CRITICAL homepage bug (daily.js erases `#the-daily` at runtime). The fix doubles as the `/daily/` archive — but it touches your *personal* Daily content, so we architect it together.
- [ ] **Tesla wording** — "gave it away" is mythologized (he gave up Westinghouse *royalties* during a crisis, died broke). Your honesty-floor #1 exposure — your reword.
- [ ] **six-degrees "winnable" language** — ranks people by reachability; same family as the scrubbed "easy win." Egalitarian scrub — your copy.
- [ ] **Mission-doc opiate/hook language** — soften vs keep (the open decision).
- [ ] **STS-87 codename** on homepage:256 — keep or strip.
- [ ] **/gratitude/** — `noindex` keep-or-discoverable, + any a11y on that page (I left it untouched — sacred).

---

## ⚡ TODAY — technical wins that impress (BD82 builds, staged, never pushed)

- [x] **Blue-Law fix** — MP "free" creed + reset-btn hover → white text + blue *glow* / border, not font-color. *(c1, verified)*
- [x] **MP a11y to the Go-page standard** — skip-link, `<main id=main>`, prefers-reduced-motion, :focus-visible, overflow-x. *(c2, verified)*
- [ ] **`/work/` door-link from the chambers** (MP + Go) — the door is invisible from inside; add the link back. *(HIGH — the funnel)*
- [ ] **a11y-consistency sweep** — references/, about/, library/, homepage: the `<main>` / skip-link / reduced-motion gaps Go already has. *(gratitude/ a11y pending your ok)*
- [ ] **SEO canonical-URL fix** — Glass Box 3 chapters: canonicals declare trailing-slash, files serve `.html` → fix the tags. *(dup-signal dilution)*
- [ ] **Security hardening** — `html_url` https-only guard (six-degrees/progress), `esc()` the MP `s.rank` from localStorage, a `_headers` CSP once style-injection's moved.
- [ ] **LOW polish** — favicon `sizes`, og:image dims/alt, Trentemøller "single not album", Trey Parker "among the first", twitter→x intent URL, etc.

---

## 📅 WEEKS — bigger arcs

- [ ] **`/daily/` archive** — date-indexed; "don't let it disappear into nothing." *(rides with the daily.js restructure once you green-light the content side)*
- [ ] **2nd dojo chamber** — Poker **or** AI-for-Creatives (multi-cycle build; plan already drafted for AI-creatives).
- [ ] **CI/CD pipeline** — and I teach you as we build it (your words). Higher-leverage than Adobe.
- [ ] **Baseline tests** — the chess engine + the build, so changes can't silently break.
- [ ] **now-playing + electric-hex visualizer** (the live "waveform") — after the Spotify Worker lands.
- [ ] **six-degrees chip-fix + coherence** — the overlapping-name chip bug + the copy pass.
- [ ] **Email capture wired** — after you stand up the service.

---

## 🗓 MONTHS — the deeper build

- [ ] **Service worker** — offline-capable, instant repeat-visits.
- [ ] **The cosmos centerpiece** — the homepage centerpiece (day39 direction).
- [ ] **Corpus-automation** — grow the taste-model substrate (RZA's L2).
- [ ] **The chess boss-battle / adaptive ladder** — the dojo's real engine (beat-me-at-1000 → 1500).
- [ ] **More dojo chambers** — toward the 36.
- [ ] **The Glass Box** — more chapters of the book.
- [ ] **Dispatches cadence** — the Field Notes series, regular.

---

## 🔭 YEARS — the temple, fully built

- [ ] **The full dojo** — 36 chambers (San Te's 37th = teach the people / give it away).
- [ ] **The audience mesa** — patient, real-and-me, the daily-return habit. Multiply the humans, not the numbers.
- [ ] **The consulting engine** — the door (the JES / stepfather network → the work).
- [ ] **The Anthropic Fellowship** — the amplification-mechanism (publish the architecture, give it away at the highest leverage).
- [ ] **The book.**
- [ ] **The view, given away** — *the view is not ours alone.*

---

*Supersedes the **site scope** of `Projects/bobby-digital/TASKS.md` (which remains the general/stale tracker for non-site work). Update this file as the source of truth for 37th-chamber.com. ⛩*
