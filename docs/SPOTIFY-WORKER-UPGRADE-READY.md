# Spotify Worker — Upgrade, Saved & Ready to Plug In

**Status:** DESIGN SAVED, not built (operator call Day-45: *"save the spotify upgrade and not fuck with something that's working"*).
The now-playing widget works today on **Last.fm mode** — do not touch it. This doc is what to plug in **after** you stand up the Cloudflare Worker (the 30-min Wrangler setup in [`NOWPLAYING-SETUP.md`](../NOWPLAYING-SETUP.md)). First thing on wake, per your plan.

---

## What the Worker unlocks (already coded, just dormant on Last.fm)

Last.fm gives no playback position (`durationMs = 0`), so two things sit dormant in `nowplaying.js`:

1. **The progress bar** — hidden in Last.fm mode ([`nowplaying.js` ~L227](../nowplaying.js)). With the Worker's real `progressMs/durationMs` it renders + rAF-interpolates between polls.
2. **The progress-driven intensity arc** — the "swell toward the end of a track" effect. With the Worker, intensity arcs `0.4 + 0.6·sin(frac·π)` across the song ([`nowplaying.js` ~L218](../nowplaying.js)); on Last.fm it rests flat at `0.55`.

**Both already exist and are gated on `durationMs > 0`. Plugging in the Worker activates them with zero code change** — just set `data-worker-url` on the `#now-playing` mount in `index.html`.

## The plug-in step (when the Worker is live)
1. Deploy the Worker (Wrangler) + set the 3 secrets (see NOWPLAYING-SETUP.md).
2. In `index.html`, set `data-worker-url="https://spotify-worker.<subdomain>.workers.dev"` on `#now-playing`. (Leave the Last.fm attrs as a fallback or remove them — Worker mode takes precedence when a URL is present.)
3. CDN-verify: a playing track shows the **progress bar** + the waveform **swelling toward the end of the song**.

## Optional jaw-droppers to layer ON TOP once real progress exists (staged ideas, your bless)
- **Now-taller waveform reacts to song position** — with the 2× band live, a real progress signal makes the climax arc far more visible. Consider a subtle vertical "tide line" that rises with `frac`.
- **Per-section phrasing** — use `progressMs` to shift the lattice's weather direction at song quarters (intro/build/peak/outro), still honest (position-driven, not audio-FFT).
- **Album-art color echo** — sample the album art's dominant hue to tint the gold accents per track (stays Blue-Law: canvas stays blue; only the gold warms). Needs a tiny color-extract; design only.

All optional, all staged — none touches the working Last.fm path until you choose.
