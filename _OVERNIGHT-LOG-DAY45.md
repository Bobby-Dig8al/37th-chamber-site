# Day-45 Overnight Autonomous Block — `batch/overnight-day45`

**Operator asleep ~14:55 EST 2026-06-14 → return 20:00 EST.** Autonomous build under ultracode.
One entry per cycle. **Only ONE thing goes live tonight (the waveform, already shipped); everything else is STAGED in this batch PR for operator taste-review at 20:00.**

---

## THE MISSION (operator-set this session, supersedes the first plan)

1. **2× waveform height** → LIVE + CDN-verified (PR #79, `eecd31e`). Operator: *"its perfect."* The only live change.
2. **Spotify Worker upgrade → SAVED, NOT BUILT.** Operator: *"save the spotify upgrade and not fuck with something that's working."* Plug-in plan at `docs/SPOTIFY-WORKER-UPGRADE-READY.md`. The Last.fm widget works; we don't touch it.
3. **NEW PRIMARY — a jaw-dropping visual upgrade across the site + real images.** Operator: *"an upgrade that will drop people's jaws all over the site and we need more images."*
4. **Content length ladder** for the Week-3 "Chip War" Daily: **pamphlet** length weekdays · **magazine** Saturday (the EUV makers) · **book** Sunday (the reckoning). Branch-Education depth, climbing Mon-lite → Fri-grad. EUV-makers = Saturday (operator-flagged). Recently-public-domain pieces woven in.
5. **Go bigger than the original plan.** Operator: *"do we need to limit ourselves to the original plan or have i been holding you back a little?"* → Floor, not ceiling. Build up.
6. **Design for Fable plug-in.** Operator: *"hopefully we get fable back we just plug they in."* Keep authoring/feature surfaces modular so Fable drops in when it returns (currently unavailable).

### Guardrails (non-negotiable)
- **Only the waveform is live.** Everything jaw-dropping = staged in this PR. Taste is the operator's; nothing visual ships without his eyes (the waveform was pre-blessed by exact spec).
- **Facts verified** — no confabulation. My knowledge cutoff is Jan 2026; every 2026-specific claim (current nodes, fab status, military events) is flagged for fresh sourcing, never asserted as fact.
- **Images** = original SVG/diagrams (ours) + curated public-domain *proposed* for bless. No paid stock, no AI-gen of real people, no auto-downloading a pile of files.
- **Security + accuracy passes by Opus personally** over all swarm output (operator-required).

---

## STATUS BOARD
- ✅ Waveform 2× LIVE + CDN-verified.
- 🔄 WF-CONTENT (`wr9rivrl0`) — Week-3 cited research + verified substrate (the factual foundation the long-form builds on). Running.
- ⏭ WF-TECH — relaunch (parse-error on first try); tests + hardening, for Opus review.
- ⏭ WF-VISUALS — original SVG mechanism diagrams + long-form reading system (pamphlet/magazine/book) + exemplar pages.
- ⏭ Opus personal passes: security-hardening meta ×N + accuracy review of swarm work.
- ⏭ Handoff/review packet for 20:00.

## CYCLE LOG
- **C0 (setup, ~14:55 EST):** Mission pivot captured. Worktrees `_wt-hearth-taller` (merged→deletable) + `_wt-overnight45` (this batch) off origin/main `b1ed9d9`. WF-CONTENT running. Main repo dir left untouched (on `feat/support-monero`, operator's workspace).
