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
// Last.fm mode (client-side, no Worker): set data-lastfm-user + data-lastfm-key.
const lastfmUser = mount.dataset.lastfmUser || '';
const lastfmKey  = mount.dataset.lastfmKey  || '';
const useLastfm  = !!(lastfmUser && lastfmKey);

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
// Dev tuning-bench hook (only attaches when the page is opened with ?tune-bench)
if (location.search.indexOf('tune-bench') !== -1) { window.__hex = hexController; }

// ─── Visitor Hearth tuner ───────────────────────────────────────────────────
// A small settings panel that lets each visitor tune the hearth for THEIR session
// and remembers it (localStorage). It drives only the visitor-facing controls
// (colour/glow/motion/size); the playback-driven setters (setPlaying/setIntensity/
// setSeed) stay owned by renderState, so the two never fight. Defaults = the brand:
// blue, default glow, OS-aware motion, medium size. Blue Law: the panel chrome is
// gold/dim/near-black only — the one place colour lives is the canvas (the charge),
// and now the visitor may rotate even that for themselves.
const TUNER_KEY = 'np-tuner-v1';
const TUNER_DEFAULTS = { hue: 0, hueMode: 'auto', energy: 1, motion: reducedMotion ? 'still' : 'flow', size: 'm' };
const SIZE_PX = { s: 92, m: null, l: 210 };   // null = the CSS clamp default
const TUNE_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="8.5" x2="20" y2="8.5"/><circle cx="9" cy="8.5" r="2.4" fill="#0a0a0c"/><line x1="4" y1="15.5" x2="20" y2="15.5"/><circle cx="15" cy="15.5" r="2.4" fill="#0a0a0c"/></svg>';

function loadTunerPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(TUNER_KEY) || 'null');
    if (!p || typeof p !== 'object') return { ...TUNER_DEFAULTS };
    return {
      hue:    Number.isFinite(p.hue)    ? Math.max(0, Math.min(360, p.hue))    : TUNER_DEFAULTS.hue,
      hueMode:['auto', 'manual'].includes(p.hueMode) ? p.hueMode : TUNER_DEFAULTS.hueMode,
      energy: Number.isFinite(p.energy) ? Math.max(0.4, Math.min(1.8, p.energy)) : TUNER_DEFAULTS.energy,
      motion: ['flow', 'pulse', 'still'].includes(p.motion) ? p.motion : TUNER_DEFAULTS.motion,
      size:   ['s', 'm', 'l'].includes(p.size) ? p.size : TUNER_DEFAULTS.size,
    };
  } catch { return { ...TUNER_DEFAULTS }; }
}
function saveTunerPrefs(p) { try { localStorage.setItem(TUNER_KEY, JSON.stringify(p)); } catch { /* private mode */ } }

const prefs = loadTunerPrefs();

// flow = phrasing tune (live) · pulse = baseline tune (live) · still = reduced-motion.
// An explicit flow/pulse choice opts INTO motion (overrides the OS floor); still and
// the first-load default both honour prefers-reduced-motion.
function applyMotion(m) {
  if (m === 'still') { hexController.setReducedMotion(true); }
  else { hexController.setReducedMotion(false); hexController.setTune(m === 'pulse' ? 'baseline' : 'phrasing'); }
}
function applySize(sz) {
  const px = SIZE_PX[sz];
  canvas.style.height = px == null ? '' : px + 'px';
  hexController.resize();
}
function applyAllPrefs() {
  if (prefs.hueMode === 'manual') hexController.setHue(prefs.hue);
  else hexController.setHue(0);   // auto: blue until the cover's hue lands (see applyHueFromArt)
  hexController.setEnergy(prefs.energy);
  applyMotion(prefs.motion);
  applySize(prefs.size);
}

// ─── Cover-hue: the hearth borrows the album art's colour ───────────────────
// HONEST: the hue is derived from the REAL cover image, never from audio. In Auto
// mode the hex rotates to the cover's dominant *saturated* hue and re-derives on
// every track change; blue is the fallback for a greyscale cover, no art, or a
// CORS-blocked image. The cover art CDNs we use (i.scdn.co, last.fm/fastly) allow
// the cross-origin pixel read this needs.
const REF_BLUE_HUE = 226;        // hue of the reference #0E44FF; albumHue -> setHue(albumHue - 226)
let lastArtUrl = '';
let colourSlider = null;         // set by buildTuner so Auto mode can reflect on the slider

function dominantHue(img) {
  try {
    const N = 36;
    const c = document.createElement('canvas'); c.width = N; c.height = N;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, N, N);
    const d = ctx.getImageData(0, 0, N, N).data;
    const bins = new Float64Array(24);
    let total = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      const v = mx, s = mx === 0 ? 0 : dl / mx;
      if (s < 0.22 || v < 0.15 || v > 0.98 || dl === 0) continue;   // skip grey/black/white
      let h;
      if (mx === r) h = (g - b) / dl;
      else if (mx === g) h = (b - r) / dl + 2;
      else h = (r - g) / dl + 4;
      h = (h * 60 + 360) % 360;
      const w = s * v;                          // vivid pixels weigh more
      bins[Math.floor(h / 15) % 24] += w;
      total += w;
    }
    if (total < 1) return null;                 // essentially greyscale — no colour to borrow
    let best = 0;
    for (let k = 1; k < 24; k++) if (bins[k] > bins[best]) best = k;
    return best * 15 + 7.5;                      // centre of the dominant 15-degree bin
  } catch { return null; }                       // tainted canvas (CORS) etc.
}

function applyHueFromArt(url) {
  if (prefs.hueMode !== 'auto') return;          // manual hue is the visitor's — don't override
  if (!url) { hexController.setHue(0); if (colourSlider) colourSlider.value = '0'; return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (url !== lastArtUrl) return;              // a newer track already won the race
    const hue = dominantHue(img);
    const shift = hue == null ? 0 : (((hue - REF_BLUE_HUE) % 360) + 360) % 360;
    hexController.setHue(shift);
    if (colourSlider) colourSlider.value = String(Math.round(shift));
  };
  img.onerror = () => { if (url === lastArtUrl) { hexController.setHue(0); if (colourSlider) colourSlider.value = '0'; } };
  img.src = url;
}

function buildTuner() {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'np-tuner-toggle';
  toggle.setAttribute('aria-label', 'Tune the hearth');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'np-tuner-panel');
  toggle.innerHTML = TUNE_ICON;   // static, trusted markup (no external content)

  const panel = document.createElement('div');
  panel.className = 'np-tuner-panel';
  panel.id = 'np-tuner-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Hearth settings');
  panel.hidden = true;

  const heading = document.createElement('div');
  heading.className = 'np-tuner-heading';
  heading.textContent = 'Tune the hearth';
  panel.appendChild(heading);

  function sliderRow(labelText, ariaLabel, min, max, step, value, oninput) {
    const row = document.createElement('label');
    row.className = 'np-tuner-row';
    const lab = document.createElement('span');
    lab.className = 'np-tuner-label';
    lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'np-tuner-slider';
    input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value);
    input.setAttribute('aria-label', ariaLabel);
    input.addEventListener('input', () => oninput(parseFloat(input.value)));
    row.appendChild(lab); row.appendChild(input);
    return { row, input };
  }

  function segRow(labelText, options, current, onpick) {
    const row = document.createElement('div');
    row.className = 'np-tuner-row';
    const lab = document.createElement('span');
    lab.className = 'np-tuner-label';
    lab.textContent = labelText;
    const seg = document.createElement('div');
    seg.className = 'np-tuner-seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', labelText);
    const btns = {};
    options.forEach(([val, txt]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'np-seg-btn';
      b.textContent = txt;
      b.setAttribute('aria-pressed', String(val === current));
      b.addEventListener('click', () => {
        for (const v in btns) btns[v].setAttribute('aria-pressed', String(v === val));
        onpick(val);
      });
      btns[val] = b;
      seg.appendChild(b);
    });
    row.appendChild(lab); row.appendChild(seg);
    return { row, btns };
  }

  // Colour row: an Auto pill (follow the cover art) + the hue slider. Dragging the
  // slider — or switching Auto off — locks a fixed manual hue.
  const colourRow = document.createElement('div');
  colourRow.className = 'np-tuner-row';
  const colourLab = document.createElement('span');
  colourLab.className = 'np-tuner-label';
  colourLab.textContent = 'Colour';
  const autoBtn = document.createElement('button');
  autoBtn.type = 'button';
  autoBtn.className = 'np-seg-btn np-auto-btn';
  autoBtn.textContent = 'Auto';
  autoBtn.title = 'Follow the album art';
  autoBtn.setAttribute('aria-pressed', String(prefs.hueMode === 'auto'));
  const hueInput = document.createElement('input');
  hueInput.type = 'range';
  hueInput.className = 'np-tuner-slider np-tuner-slider--hue';
  hueInput.min = '0'; hueInput.max = '360'; hueInput.step = '1';
  hueInput.value = String(prefs.hue);
  hueInput.setAttribute('aria-label', 'Colour (hue)');
  colourSlider = hueInput;   // module ref so Auto-mode cover-hue reflects on the slider
  const setManualHue = (v) => {
    prefs.hueMode = 'manual'; prefs.hue = v;
    autoBtn.setAttribute('aria-pressed', 'false');
    hexController.setHue(v); saveTunerPrefs(prefs);
  };
  hueInput.addEventListener('input', () => setManualHue(parseFloat(hueInput.value)));
  autoBtn.addEventListener('click', () => {
    if (prefs.hueMode === 'auto') { setManualHue(parseFloat(hueInput.value)); }   // freeze the current colour
    else {                                                                         // hand it back to the cover
      prefs.hueMode = 'auto';
      autoBtn.setAttribute('aria-pressed', 'true');
      saveTunerPrefs(prefs);
      applyHueFromArt(lastArtUrl);
    }
  });
  colourRow.appendChild(colourLab); colourRow.appendChild(autoBtn); colourRow.appendChild(hueInput);

  const glow = sliderRow('Glow', 'Glow intensity', 0.4, 1.8, 0.05, prefs.energy, (v) => {
    prefs.energy = v; hexController.setEnergy(v); saveTunerPrefs(prefs);
  });

  const motion = segRow('Motion', [['flow', 'Flow'], ['pulse', 'Pulse'], ['still', 'Still']], prefs.motion, (v) => {
    prefs.motion = v; applyMotion(v); saveTunerPrefs(prefs);
  });

  const size = segRow('Size', [['s', 'S'], ['m', 'M'], ['l', 'L']], prefs.size, (v) => {
    prefs.size = v; applySize(v); saveTunerPrefs(prefs);
  });

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'np-tuner-reset';
  reset.textContent = 'Reset to default';
  reset.addEventListener('click', () => {
    Object.assign(prefs, { ...TUNER_DEFAULTS });
    hueInput.value = String(prefs.hue);
    autoBtn.setAttribute('aria-pressed', String(prefs.hueMode === 'auto'));
    glow.input.value = String(prefs.energy);
    for (const v in motion.btns) motion.btns[v].setAttribute('aria-pressed', String(v === prefs.motion));
    for (const v in size.btns)   size.btns[v].setAttribute('aria-pressed', String(v === prefs.size));
    applyAllPrefs();
    applyHueFromArt(lastArtUrl);   // auto default -> borrow the current cover again
    saveTunerPrefs(prefs);
  });

  panel.appendChild(colourRow);
  panel.appendChild(glow.row);
  panel.appendChild(motion.row);
  panel.appendChild(size.row);
  panel.appendChild(reset);

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('np-tuner-toggle--open');
  }
  toggle.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('np-tuner-toggle--open', open);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { closePanel(); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) closePanel();
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(panel);
}

applyAllPrefs();   // apply saved/default prefs to the hex before the first render
buildTuner();

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
// Album-art origin validation, shared by playing + at-rest renders.
function setArt(s) {
  const valid = s.albumArtUrl && /^https:\/\/(i\.scdn\.co|lastfm\.freetls\.fastly\.net|[a-z0-9-]+\.last\.fm)\//i.test(s.albumArtUrl);
  if (valid) {
    artImg.src           = s.albumArtUrl;
    artImg.style.display = '';
    artImg.alt           = s.album ? `Album art: ${s.album}` : 'Album art';
  } else {
    artImg.removeAttribute('src');
    artImg.style.display = 'none';
  }
  // Re-derive the cover-hue only when the art actually changes (Auto mode borrows it).
  const url = valid ? s.albumArtUrl : '';
  if (url !== lastArtUrl) { lastArtUrl = url; applyHueFromArt(url); }
}

// At rest the room REMEMBERS: if we know the last track (Last.fm keeps it),
// the card holds it with the idle dot — "last played," not amnesia. The lattice
// drops to a resting heartbeat, never to flatline (0 read as "broken").
function renderIdle(s) {
  const remembers = !!(s && s.title && s.artist);
  if (remembers) {
    titleEl.textContent  = s.title;
    artistEl.textContent = s.artist;
    albumEl.textContent  = s.album ?? '';
    setArt(s);
  } else {
    titleEl.textContent  = 'The room is quiet';
    artistEl.textContent = '';
    albumEl.textContent  = '';
    setArt({});
  }
  trackLink.style.display = 'none';
  statusDot.classList.remove('np-status-dot--playing');
  statusDot.classList.add('np-status-dot--idle');
  progressBar.style.display = 'none';
  progressFill.style.width = '0%';
  hexController.setPlaying(false);
  hexController.setIntensity(remembers ? 0.18 : 0.12);   // resting heart
}

function renderState(s) {
  if (!s.isPlaying) {
    renderIdle(s);
    return;
  }

  // textContent only — no innerHTML — for all external Spotify data
  titleEl.textContent  = s.title  ?? '';
  artistEl.textContent = s.artist ?? '';
  albumEl.textContent  = s.album  ?? '';

  // Album art via the shared origin-validating setter (same one the at-rest
  // render uses) — Spotify art is i.scdn.co; Last.fm art is last.fm/fastly.
  setArt(s);

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
  // Intensity: arc over the track when progress is known (Worker mode).
  // Last.fm provides no position (durationMs=0) — previously this froze the
  // lattice at 0.4 forever; now it rests at a living mid-energy and lets the
  // phrasing swells + per-track signature carry the motion honestly.
  const frac      = s.durationMs > 0 ? Math.min(s.progressMs / s.durationMs, 1) : 0;
  const intensity = s.durationMs > 0 ? (0.4 + 0.6 * Math.sin(frac * Math.PI)) : 0.55;
  hexController.setIntensity(intensity);

  // Paint progress immediately; rAF interpolation refines it between polls. This
  // keeps the bar correct on first paint and in throttled/hidden tabs.
  if (s.durationMs > 0) {
    progressBar.style.display = '';
    progressFill.style.width = `${(frac * 100).toFixed(2)}%`;
  } else {
    progressBar.style.display = 'none';   // Last.fm: no playback position available
  }

  // aria-live: announce track change (not every progress tick)
  const key = `${s.title}|${s.artist}`;
  if (key !== lastRenderedKey) {
    // Per-track visual signature — honest: derived from identity, not audio.
    hexController.setSeed(key);
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

// Last.fm mode — client-side, no Worker. Reads the most-recent track; the
// @attr.nowplaying flag marks the live one. No playback position is available,
// so the progress bar hides and the hex animates on the playing state alone.
async function fetchLastfm() {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks`
      + `&user=${encodeURIComponent(lastfmUser)}&api_key=${encodeURIComponent(lastfmKey)}`
      + `&format=json&limit=1`;
    const res  = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || data.error) { console.warn('[nowplaying] last.fm error:', data); return; }
    const t = data.recenttracks && data.recenttracks.track && data.recenttracks.track[0];
    if (!t) { lastPollTime = performance.now(); state = { ...state, isPlaying: false }; renderState(state); return; }
    const nowPlaying = !!(t['@attr'] && t['@attr'].nowplaying === 'true');
    const imgArr = Array.isArray(t.image) ? t.image : [];
    const img = (imgArr[imgArr.length - 1] || {})['#text'] || '';
    lastPollTime = performance.now();
    state = {
      ...state,
      isPlaying:   nowPlaying,
      title:       t.name || null,
      artist:      (t.artist && (t.artist['#text'] || t.artist.name)) || null,
      album:       (t.album && t.album['#text']) || null,
      albumArtUrl: img || null,
      trackUrl:    null,        // Last.fm links aren't Spotify; keep the link hidden
      progressMs:  0,
      durationMs:  0,           // Last.fm gives no playback position
    };
    renderState(state);
  } catch (err) {
    console.warn('[nowplaying] last.fm fetch failed — keeping last state:', err);
  }
}

// One poller, source-aware (Last.fm or Worker).
function poll() { return useLastfm ? fetchLastfm() : fetchNowPlaying(); }

function schedulePoll() {
  if (pollTimeoutId !== null) clearTimeout(pollTimeoutId);
  pollTimeoutId = setTimeout(async () => {
    await poll();
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
    (async () => { await poll(); schedulePoll(); })();
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

  if (useLastfm) {
    // LIVE (Last.fm): client-side poll, no Worker needed
    await fetchLastfm();
    schedulePoll();
    startRaf();
    return;
  }

  if (!workerUrl) {
    // IDLE/DEMO MODE: no worker URL — render idle, let hex pulse
    renderIdle();
    startRaf();
    return;
  }

  // LIVE (Worker): initial fetch + poll loop
  await fetchNowPlaying();
  schedulePoll();
  startRaf();
})();
