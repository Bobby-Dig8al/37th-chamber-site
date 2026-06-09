/**
 * nowplaying.js — 37th Chamber · Now Playing widget
 * ES module. Mount: <div id="now-playing" data-worker-url=""></div>
 *                   <script type="module" src="nowplaying.js"></script>
 *
 * MOCK MODE (used by nowplaying-demo.html):
 *   Add data-mock="true" to the mount element AND set window.__NOWPLAYING_MOCK__
 *   to an object matching the Worker response JSON schema. The widget will render
 *   that object exactly as if it came from the Worker — no fetch is made.
 *
 * IDLE/DEMO MODE:
 *   Leave data-worker-url="" (empty). The hex canvas pulses slowly; the card
 *   shows the resting state. No network calls are made.
 *
 * HONESTY NOTE:
 *   The electric-hex visualizer is a LIVE animation driven by playback progress
 *   and an estimated rhythmic cadence. It is NOT reacting to the actual audio
 *   signal — Spotify's API provides no raw audio. "Live" is accurate; "audio-
 *   reactive" would be dishonest. We do not claim audio-reactivity anywhere.
 *
 * SECURITY:
 *   - All Spotify-supplied text (title, artist, album) is written via
 *     textContent only. innerHTML is never used for external content.
 *   - No secrets are held client-side. The widget only knows the public Worker URL.
 */

import { initElectricHex } from './electric-hex.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS   = 10_000;   // 10 s between Worker fetches
const PROGRESS_TICK_MS   = 50;       // rAF target for progress bar interpolation

// ─── Mount ────────────────────────────────────────────────────────────────────
const mount = document.getElementById('now-playing');
if (!mount) throw new Error('[nowplaying] #now-playing element not found');

const workerUrl = mount.dataset.workerUrl || '';
const isMock    = mount.dataset.mock === 'true';

// ─── DOM construction ─────────────────────────────────────────────────────────
mount.innerHTML = '';   // clear any placeholder content

// Outer wrapper
const wrapper = document.createElement('div');
wrapper.className = 'np-wrapper';

// aria-live region so screen readers announce track changes
const live = document.createElement('div');
live.setAttribute('aria-live', 'polite');
live.setAttribute('aria-atomic', 'true');
live.className = 'np-live-region';

// Card row: [art | meta | status]
const card = document.createElement('div');
card.className = 'np-card';

// Album art
const artWrap = document.createElement('div');
artWrap.className = 'np-art-wrap';
const artImg = document.createElement('img');
artImg.className = 'np-art';
artImg.alt = '';
artImg.setAttribute('aria-hidden', 'true');
artWrap.appendChild(artImg);

// Meta: title + artist
const meta = document.createElement('div');
meta.className = 'np-meta';
const titleEl  = document.createElement('div');
titleEl.className = 'np-title';
const artistEl = document.createElement('div');
artistEl.className = 'np-artist';
const albumEl  = document.createElement('div');
albumEl.className = 'np-album';
meta.appendChild(titleEl);
meta.appendChild(artistEl);
meta.appendChild(albumEl);

// Status dot + link
const statusWrap = document.createElement('div');
statusWrap.className = 'np-status-wrap';
const statusDot = document.createElement('span');
statusDot.className = 'np-status-dot';
statusDot.setAttribute('aria-hidden', 'true');
const trackLink = document.createElement('a');
trackLink.className = 'np-track-link';
trackLink.textContent = '↗';
trackLink.title       = 'Open on Spotify';
trackLink.target      = '_blank';
trackLink.rel         = 'noopener noreferrer';
trackLink.setAttribute('aria-label', 'Open on Spotify');
statusWrap.appendChild(statusDot);
statusWrap.appendChild(trackLink);

// Progress bar
const progressBar = document.createElement('div');
progressBar.className = 'np-progress-bar';
const progressFill = document.createElement('div');
progressFill.className = 'np-progress-fill';
progressBar.appendChild(progressFill);

// Canvas (electric-hex) — decorative, aria-hidden
const canvas = document.createElement('canvas');
canvas.className = 'np-hex-canvas';
canvas.setAttribute('aria-hidden', 'true');
canvas.setAttribute('role', 'presentation');

// Assemble card
card.appendChild(artWrap);
card.appendChild(meta);
card.appendChild(statusWrap);

// Assemble wrapper
wrapper.appendChild(live);
wrapper.appendChild(card);
wrapper.appendChild(progressBar);
wrapper.appendChild(canvas);
mount.appendChild(wrapper);

// ─── Electric-Hex init ────────────────────────────────────────────────────────
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hexController = initElectricHex(canvas, { reducedMotion });

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  isPlaying:    false,
  title:        null,
  artist:       null,
  album:        null,
  albumArtUrl:  null,
  progressMs:   0,
  durationMs:   0,
  trackUrl:     null,
};

let lastPollTime     = 0;   // performance.now() when last poll landed
let rafId            = null;
let pollTimeoutId    = null;
let lastRenderedKey  = '';  // detect track changes for aria-live

// ─── Render ───────────────────────────────────────────────────────────────────
function renderIdle() {
  titleEl.textContent  = 'Nothing playing';
  artistEl.textContent = '';
  albumEl.textContent  = '';
  artImg.src           = '';
  artImg.style.display = 'none';
  trackLink.style.display = 'none';
  statusDot.classList.remove('np-status-dot--playing');
  statusDot.classList.add('np-status-dot--idle');
  progressFill.style.width = '0%';
  hexController.setPlaying(false);
  hexController.setIntensity(0);
}

function renderState(s) {
  if (!s.isPlaying) {
    renderIdle();
    return;
  }

  // textContent only — no innerHTML — for all external Spotify data
  titleEl.textContent  = s.title  ?? '';
  artistEl.textContent = s.artist ?? '';
  albumEl.textContent  = s.album  ?? '';

  // Validate origin before assigning to img.src — Spotify art is always i.scdn.co.
  // Defense-in-depth: a tampered/buggy response can't point the <img> elsewhere.
  if (s.albumArtUrl && /^https:\/\/i\.scdn\.co\//i.test(s.albumArtUrl)) {
    artImg.src           = s.albumArtUrl;
    artImg.style.display = '';
    artImg.alt           = s.album ? `Album art: ${s.album}` : 'Album art';
  } else {
    artImg.removeAttribute('src');
    artImg.style.display = 'none';
  }

  // Validate scheme before assigning to href — blocks javascript: URIs (XSS).
  if (s.trackUrl && /^https:\/\//i.test(s.trackUrl)) {
    trackLink.href          = s.trackUrl;
    trackLink.style.display = '';
  } else {
    trackLink.removeAttribute('href');
    trackLink.style.display = 'none';
  }

  statusDot.classList.remove('np-status-dot--idle');
  statusDot.classList.add('np-status-dot--playing');

  hexController.setPlaying(true);
  // Intensity: fraction through the track, boosted toward middle for energy
  const frac      = s.durationMs > 0 ? Math.min(s.progressMs / s.durationMs, 1) : 0;
  const intensity = 0.4 + 0.6 * Math.sin(frac * Math.PI);
  hexController.setIntensity(intensity);

  // Paint progress immediately; rAF interpolation refines it between polls. This
  // keeps the bar correct on first paint and in throttled/hidden tabs.
  progressFill.style.width = `${(frac * 100).toFixed(2)}%`;

  // aria-live: announce track change (not every progress tick)
  const key = `${s.title}|${s.artist}`;
  if (key !== lastRenderedKey) {
    live.textContent = s.title && s.artist
      ? `Now playing: ${s.title} by ${s.artist}`
      : 'Now playing';
    lastRenderedKey  = key;
  }
}

// ─── Progress interpolation (rAF) ─────────────────────────────────────────────
function tickProgress() {
  if (document.hidden) { rafId = null; return; }

  if (state.isPlaying && state.durationMs > 0) {
    const elapsed    = performance.now() - lastPollTime;
    const estimated  = Math.min(state.progressMs + elapsed, state.durationMs);
    const pct        = (estimated / state.durationMs) * 100;
    progressFill.style.width = `${pct.toFixed(2)}%`;
  }

  rafId = requestAnimationFrame(tickProgress);
}

function startRaf() {
  if (rafId === null) rafId = requestAnimationFrame(tickProgress);
}

function stopRaf() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

// ─── Fetch & poll ─────────────────────────────────────────────────────────────
async function fetchNowPlaying() {
  if (!workerUrl) return;
  try {
    const res  = await fetch(workerUrl, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      // 502/error body must not be applied as state, or a stopped song keeps
      // "playing" with a ticking bar while upstream is down. Keep last good state.
      console.warn('[nowplaying] worker error response:', data);
      return;
    }
    lastPollTime = performance.now();
    state        = { ...state, ...data };
    renderState(state);
  } catch (err) {
    console.warn('[nowplaying] fetch failed — keeping last state:', err);
    // keep last good state; don't throw
  }
}

function schedulePoll() {
  if (pollTimeoutId !== null) clearTimeout(pollTimeoutId);
  pollTimeoutId = setTimeout(async () => {
    await fetchNowPlaying();
    schedulePoll();
  }, POLL_INTERVAL_MS);
}

function stopPoll() {
  if (pollTimeoutId !== null) { clearTimeout(pollTimeoutId); pollTimeoutId = null; }
}

// ─── Visibility management ────────────────────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopRaf();
    stopPoll();
  } else {
    startRaf();
    // Immediately re-fetch when tab becomes visible again, then resume schedule
    (async () => { await fetchNowPlaying(); schedulePoll(); })();
  }
});

// ─── Canvas resize handling ───────────────────────────────────────────────────
const resizeObserver = new ResizeObserver(() => hexController.resize());
resizeObserver.observe(canvas);

// ─── Boot ─────────────────────────────────────────────────────────────────────
(async function boot() {
  if (isMock && window.__NOWPLAYING_MOCK__) {
    // MOCK MODE: render the mock object immediately; no network calls
    lastPollTime = performance.now();
    state        = { ...state, ...window.__NOWPLAYING_MOCK__ };
    renderState(state);
    startRaf();
    // Demo harness buttons mutate window.__NOWPLAYING_MOCK__ and dispatch this
    // event so the widget live-updates without a page reload.
    document.addEventListener('nowplaying-mock-update', (e) => {
      lastPollTime = performance.now();
      state = { ...state, ...(e.detail || window.__NOWPLAYING_MOCK__) };
      renderState(state);
    });
    return; // do not poll
  }

  if (!workerUrl) {
    // IDLE/DEMO MODE: no worker URL — render idle, let hex pulse
    renderIdle();
    startRaf();
    return;
  }

  // LIVE MODE: initial fetch + poll loop
  await fetchNowPlaying();
  schedulePoll();
  startRaf();
})();
