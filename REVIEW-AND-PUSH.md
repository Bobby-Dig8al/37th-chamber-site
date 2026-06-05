# REVIEW & PUSH — 37th-chamber.com (Day-36 night build)

**Branch:** `feat/site-live-day36` (this repo, `37th-chamber-site` — the one wired to the domain via `CNAME`).
**Built by:** BD82 — the autonomous "first freestyle" loop, while you slept. **Committed, NOT pushed. The push is your hand.**
**Status:** ✅ **Review-ready.** QA-verified in a real browser (Forge + Claude_Preview + a Playwright arbiter). Screenshots: `Stack/drafts/site-qa-day36/` (7 shots: homepage + chamber, mobile + desktop, + the live chess move proof).

---

## What's on the site now
- **Homepage** (`index.html`) — the temple: the SIGIL, the "37th Chamber" masthead + charged baseline, *knowledge is free · forever*, the lede, **the 36-Chambers vision** (18 named + "+18 forthcoming" — **our 36, no crowdsource**), **Manhattan Park as the live flagship**, the Library / Dispatches / Work-With-Me / About rooms, the charged footer. Indexable, OG + canonical tags, mobile-first.
- **Manhattan Park** (`chambers/manhattan-park/`) — the live chess chamber, copied **intact** (chess.js engine untouched) + a "← 37th Chamber" back-link.

## QA results — all PASS
- **Aesthetic-of-record:** gold-on-near-black ✓ · **BLUE LAW** on the homepage: blue appears only as glow/charge (programmatic audit found **zero** blue-as-font-color / blue-as-fill) ✓ · SIGIL renders ✓
- **Mobile (390px):** **zero** horizontal overflow on both pages ✓ · everything readable + unclipped ✓
- **Chess engine:** live + correct — legal moves, capture rings, a full move executed via real chess.js ✓
- **Links:** `/` ✓ · `/chambers/manhattan-park/` ✓ · `CNAME` → 37th-chamber.com ✓ · **zero console errors** ✓
- **1 fix applied + committed** (`c49509d`): the chamber back-link was overlapping the SIGIL/title → added `padding-top:44px` to the MP header. Re-verified clean.

## ⚖︎ 2 small decisions for you (morning — neither blocks review)
1. **BLUE-LAW on the MP page — your call.** The Manhattan Park page renders the word **"free"** in *solid blue (font color)* twice; its source claims "one highlighted word permitted." The **homepage** does it the law-compliant way (white text + blue glow). Per your BLUE LAW (*"use it as highlight, not a font color"*), reconcile MP to match — **or** ratify the exception. I did **not** change it (there's a documented prior exception in the file — your law, your call). It's a 2-word cosmetic fix; say the word and I'll bring MP's "free" in line with the homepage.
2. **OG image — before a public/viral push.** The homepage declares `twitter:card=summary_large_image` + a TODO for `og:image` (1200×630 sigil card) but has no image yet, so social shares render without a preview card. Add one before you blast it. **Say the word and I'll generate a sigil OG card.**

*(Optional, non-blocking: the homepage SIGIL stroke uses `#FFD500` vs the `#FFD60A` text token — imperceptible, matches the favicon. Leave or harmonize.)*

---

## ▶ How to review, then push (the push is what makes it LIVE)

```powershell
# 1) REVIEW locally — see it before the world does
cd C:\Users\bobby-dig8al\Repos\37th-chamber-site
git checkout feat/site-live-day36
# open index.html and chambers/manhattan-park/index.html in Brave
#   (or preview-serve the folder). Also eyeball Stack/drafts/site-qa-day36/ screenshots.

# 2) When you're happy — merge to main + push (THIS makes 37th-chamber.com live)
git checkout main
git merge feat/site-live-day36
git push origin main
```

- GitHub Pages redeploys `37th-chamber.com` from **`main`** within ~1 min of the push. *(If the repo's Pages source isn't `main`/root, set it in repo Settings → Pages first — but it was already serving the placeholder from here, so it should be `main`.)*
- **Nothing is public until you run that `git push`.** Everything above is staged on the branch only.

*⛩ The first freestyle. Built while you slept; yours to ship. — bd8 + BD82 ⛩*
