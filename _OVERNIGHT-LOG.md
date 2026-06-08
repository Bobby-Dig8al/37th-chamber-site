# Manhattan Park — Overnight Build Log (`feat/mp-overnight`)

Day-39 (2026-06-08), bd8 asleep. Autonomous loop: build MP's technical depth → commit local → **never push** → bd8 reviews on wake. Focus = technical (the look is ~done). One entry per cycle.

---

- **Cycle 1 — Blue-Law fix.** The word "free" (header creed + footer creed) and the reset-button hover used electric blue as a *font color* — a Blue-Law violation (blue is highlight/glow, never font color; the prior comment rationalized it as "one permitted word"). Fixed: "free" → white text + blue text-shadow glow (lines 114, 137); reset-btn hover → gold text + blue border (line 122); de-rationalized the comment. **Verified in-browser (port 8770): both render `rgb(255,255,255)` + the blue glow.** ✓
- **Cycle 2 — a11y to the Go-page standard.** Skip-link (`href=#main`) + CSS, `<main class="wrap" id="main">` wrapper, `prefers-reduced-motion` block, `:focus-visible` ring, `overflow-x:hidden` on body — mirrored from `chambers/go/`. Sonnet bee built; **verified independently** (git diff = all 5 additions present; runtime at :8770 = skip-link / `main#main` / `overflow-x:hidden` all live). Chess engine + visuals untouched. ✓
