/**
 * electric-hex.js — Electric Hex canvas visualizer for 37th Chamber
 *
 * HONESTY NOTICE: This is a live canvas animation modulated by playback state
 * and track identity. It is NOT audio-reactive in any signal-processing sense —
 * no audio data is available or analyzed. What actually drives it:
 *   - playing/paused state (real, from the playback source)
 *   - playback progress when the source provides it (Worker mode; Last.fm does not)
 *   - the track's IDENTITY (title+artist), which deterministically seeds a
 *     per-song visual signature — same song, same face, every time
 *   - slow time-based "phrasing" swells (decorative, ~9s and ~37s periods)
 * It is honest to call it "live" and "track-aware"; it is dishonest to call it
 * "audio-reactive," and we never do.
 *
 * BLUE LAW: The only blue in the widget lives here. All text in the card
 * (title, artist, status) must be gold (#FFD60A) on near-black (#08080a).
 * This canvas IS the charge — #0E44FF family, additive glow on near-black.
 *
 * API:
 *   import { initElectricHex } from './electric-hex.js';
 *   const ctrl = initElectricHex(canvasEl, { reducedMotion: bool });
 *   ctrl.setPlaying(bool)      — playing: faster, brighter streams; idle: slow ambient pulse
 *   ctrl.setIntensity(0..1)    — scales speed + brightness (widget drives this from progress)
 *   ctrl.resize()              — re-fit canvas to clientWidth/clientHeight (capped DPR ≤ 2)
 *   ctrl.destroy()             — cancel rAF, remove listeners
 *
 * Palette (Blue Law compliant):
 *   Near-black bg: #08080a (matches --bg)
 *   Hex stroke base: #0E44FF (--electric)
 *   Pulse core: #4d82ff / #a0c0ff
 *   Glow: additive canvas compositing (lighter)
 *
 * Technique: precomputed flat-top hexagonal grid stored as vertex arrays.
 * Each hex carries its own phase offset and a "charge" scalar [0..1].
 * Energy pulses travel along directed paths (wave-front rows/columns).
 * rAF loop updates charge values, then draws filled + stroked hexes
 * with globalCompositeOperation = 'lighter' for additive glow layers.
 *
 * Performance: all geometry precomputed at resize(); no per-frame allocation
 * (Float32Array vertex pools reused). DPR capped at 2. rAF paused when
 * document.hidden (Page Visibility API).
 */

const MAX_DPR = 2;

// ── Track-signature helpers (HONEST: deterministic from track identity only) ──
// FNV-1a 32-bit hash of a string (e.g. "Title|Artist"). Same track → same hash.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}
// mulberry32 PRNG — tiny, deterministic, seeded by the track hash.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Tuning presets ────────────────────────────────────────────────────────────
// 'baseline'  — the original shipped character (numbers preserved exactly).
// 'phrasing'  — BD82 tune: calmer breath, coherent pulse-weather, slow master
//               swells (time-based, decorative, declared), per-track signatures.
const TUNES = {
  baseline: {
    ambientFreqPlay: (i) => 1.2 + i * 1.8,
    ambientAmpPlay:  (i) => 0.08 + i * 0.14,
    ambientFreqIdle: 0.35,
    ambientAmpIdle:  0.04,
    speedPlay:       (i) => 0.18 + i * 0.34,
    speedIdle:       (i) => 0.04 + i * 0.06,
    maxPulsesPlay:   4,
    spawnRatePlay:   (i) => 0.8 + i * 1.6,
    widthFor:        () => 0.06 + Math.random() * 0.10,
    dotThreshold:    0.45,
    masterLFO:       null,           // no phrasing swell
    weather:         false,          // fully random pulse directions
  },
  phrasing: {
    ambientFreqPlay: (i) => 0.7 + i * 0.9,     // calmer base breath
    ambientAmpPlay:  (i) => 0.10 + i * 0.12,
    ambientFreqIdle: 0.22,                      // tide-like rest
    ambientAmpIdle:  0.07,                      // ALIVE at rest — resting heart, not flatline
    speedPlay:       (i) => 0.14 + i * 0.30,    // gravitas over frenzy
    speedIdle:       (i) => 0.035 + i * 0.05,
    maxPulsesPlay:   3,
    spawnRatePlay:   (i) => 0.6 + i * 1.2,
    // calm = broad swells; climax = tighter, sharper fronts
    widthFor:        (i, rnd) => (0.13 - i * 0.06) + rnd * 0.08,
    dotThreshold:    0.42,
    // two slow swells multiplying brightness: ~9s phrase + ~37s movement.
    // Time-based and decorative — declared in the honesty note.
    masterLFO:       (ts) => 1
                       + 0.10 * Math.sin(ts * 0.001 * (2 * Math.PI / 9))
                       + 0.08 * Math.sin(ts * 0.001 * (2 * Math.PI / 37)),
    weather:         true,           // coherent dominant direction, slow drift
  },
};

// Palette — Blue Law: ONLY blue. No gold used here.
const BG        = '#08080a';                          // --bg
const HEX_BASE  = [14, 68, 255];                      // #0E44FF
const HEX_MID   = [77, 130, 255];                     // #4d82ff  brighter mid
const HEX_CORE  = [160, 200, 255];                    // #a0c0ff  hot core

// Geometry helpers
function hexVertices(cx, cy, r) {
  // Flat-top hex: 6 vertices starting at angle 0 (right)
  const v = new Float32Array(12); // x0,y0,x1,y1,...
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i; // flat-top: 0°,60°,...
    v[i * 2]     = cx + r * Math.cos(a);
    v[i * 2 + 1] = cy + r * Math.sin(a);
  }
  return v;
}

function tracePath(ctx, verts) {
  ctx.beginPath();
  ctx.moveTo(verts[0], verts[1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(verts[i * 2], verts[i * 2 + 1]);
  ctx.closePath();
}

// Color helpers
function rgba(rgb, a) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
}
function lerpRgb(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ reducedMotion?: boolean }} opts
 * @returns {{ setPlaying(b:boolean):void, setIntensity(n:number):void, resize():void, destroy():void }}
 */
export function initElectricHex(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('electric-hex: canvas 2D context unavailable');

  // State
  let playing   = false;
  let intensity = 0.5;
  let reducedMotion = !!opts.reducedMotion;
  let rafId     = null;
  let hidden    = document.hidden;

  // Grid geometry — populated by buildGrid()
  let hexes     = []; // { verts, cx, cy, row, col, phase }
  let cols      = 0;
  let rows      = 0;
  let hexR      = 0;   // hex circumradius (px, logical)

  // Pulse streams: array of active pulse objects
  let pulses    = [];

  // Timing
  let lastT     = 0;

  // Tuning preset (default: phrasing — the BD82 tune; 'baseline' = shipped original)
  let tune      = TUNES.phrasing;

  // Per-track signature traits (HONEST: derived only from track identity via setSeed).
  // Defaults = neutral character when no track has been seeded yet.
  let traits = {
    speedMul: 1,        // 0.82..1.22  per-track tempo of the lattice
    freqMul:  1,        // 0.85..1.20  breath rate flavor
    widthMul: 1,        // 0.85..1.25  wavefront breadth flavor
    dirBias:  [1, 1, 1, 1], // weights over the 4 pulse directions
  };

  // Pulse-weather: a dominant direction that persists and slowly drifts,
  // so waves read as weather systems instead of noise (phrasing tune only).
  let weatherDir   = Math.floor(Math.random() * 4);
  let weatherNext  = 0;   // timestamp (ms) of next drift

  // ── Build the flat-top hex grid ────────────────────────────────────────────
  function buildGrid() {
    const W = canvas.width;
    const H = canvas.height;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    // Compute hex radius so we get a pleasing density
    // Target: ~12-18 hex columns across the canvas (logical pixels)
    const logW = W / dpr;
    const logH = H / dpr;
    const targetCols = Math.round(logW / 36);
    hexR = logW / (targetCols * Math.sqrt(3)); // flat-top: col-pitch = r * sqrt(3)
    hexR = Math.max(8, Math.min(hexR, 28));    // clamp

    // Flat-top layout:
    //   column pitch: dx = r * sqrt(3)
    //   row pitch:    dy = r * 1.5
    //   odd cols offset down by r * 0.75
    const dx = hexR * Math.sqrt(3);
    const dy = hexR * 1.5;

    cols = Math.ceil(logW / dx) + 2;
    rows = Math.ceil(logH / dy) + 2;

    hexes = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cx = (c - 0.5) * dx;
        const cy = (r - 0.5) * dy + (c % 2 === 1 ? hexR * 0.75 : 0);
        const verts = hexVertices(cx * dpr, cy * dpr, hexR * dpr * 0.92);
        hexes.push({
          verts,
          cx: cx * dpr,
          cy: cy * dpr,
          row: r,
          col: c,
          phase: Math.random() * Math.PI * 2,  // ambient breathing offset
          charge: 0,                             // current energy level [0..1]
          decay: 0.6 + Math.random() * 0.3,     // individual decay rate
        });
      }
    }
  }

  // ── Resize ─────────────────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width  = Math.floor(canvas.clientWidth  * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    pulses = [];
    buildGrid();
  }

  // ── Spawn a pulse stream ────────────────────────────────────────────────────
  // A pulse is a wave-front travelling across the grid in a direction.
  // direction: 0=left-to-right, 1=top-to-bottom, 2=diagonal, 3=diagonal-back
  function spawnPulse(ts) {
    let dir;
    if (tune.weather) {
      // Weather model: mostly the dominant direction (drifting slowly), with the
      // track's own directional bias folded in; occasional cross-current.
      if (ts >= weatherNext) {
        weatherDir  = pickWeightedDir();
        weatherNext = ts + 18000 + Math.random() * 14000;  // drift every 18–32s
      }
      dir = Math.random() < 0.72 ? weatherDir : pickWeightedDir();
    } else {
      dir = Math.floor(Math.random() * 4);
    }
    // progress 0..1 across the grid; speed varies with playing+intensity
    const baseSpeed = (playing ? tune.speedPlay(intensity) : tune.speedIdle(intensity)) * traits.speedMul;
    pulses.push({
      progress: 0,
      speed: baseSpeed * (0.7 + Math.random() * 0.6),
      dir,
      width: tune.widthFor(intensity, Math.random()) * traits.widthMul,
      brightness: (playing ? 0.55 : 0.25) * (0.7 + intensity * 0.6),
    });
  }

  function pickWeightedDir() {
    const w = traits.dirBias;
    const total = w[0] + w[1] + w[2] + w[3];
    let r = Math.random() * total;
    for (let d = 0; d < 4; d++) { r -= w[d]; if (r <= 0) return d; }
    return 3;
  }

  // ── Hex charge from pulse ───────────────────────────────────────────────────
  function pulseChargeFor(hex, pulse) {
    // Normalize hex position to [0..1] along pulse direction
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const W = canvas.width;
    const H = canvas.height;
    let t;
    switch (pulse.dir) {
      case 0: t = hex.cx / W; break;                       // left → right
      case 1: t = hex.cy / H; break;                       // top → bottom
      case 2: t = (hex.cx / W + hex.cy / H) * 0.5; break; // diagonal ↘
      case 3: t = (hex.cx / W + (H - hex.cy) / H) * 0.5; break; // diagonal ↗
      default: t = hex.cx / W;
    }
    const dist = Math.abs(t - pulse.progress);
    if (dist > pulse.width * 2) return 0;
    // Gaussian envelope
    const sigma = pulse.width;
    return pulse.brightness * Math.exp(-(dist * dist) / (2 * sigma * sigma));
  }

  // ── Draw one frame ─────────────────────────────────────────────────────────
  function draw(ts) {
    const dt = Math.min((ts - lastT) / 1000, 0.05); // seconds, capped at 50ms
    lastT = ts;

    const W = canvas.width;
    const H = canvas.height;

    // Clear to near-black
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    if (reducedMotion) {
      drawReducedMotion(ts);
      return;
    }

    // Advance pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].progress += pulses[i].speed * dt;
      if (pulses[i].progress > 1.3) pulses.splice(i, 1);
    }

    // Spawn new pulses on cadence
    const maxPulses = playing ? tune.maxPulsesPlay : 1;
    const spawnRate  = playing
      ? tune.spawnRatePlay(intensity)   // pulses/sec
      : (0.15 + intensity * 0.2);
    if (pulses.length < maxPulses && Math.random() < spawnRate * dt) {
      spawnPulse(ts);
    }

    // Phrasing swell: slow time-based undulation of overall energy (decorative,
    // declared in the honesty note; null in baseline tune).
    const swell = tune.masterLFO ? Math.max(0.75, tune.masterLFO(ts)) : 1;

    // Update hex charges from pulses + ambient breathing
    const ambientFreq = (playing ? tune.ambientFreqPlay(intensity) : tune.ambientFreqIdle) * traits.freqMul;
    const ambientAmp  = (playing ? tune.ambientAmpPlay(intensity) : tune.ambientAmpIdle) * swell;

    for (const h of hexes) {
      // Ambient base: slow sinusoidal breathing
      const ambient = ambientAmp * (0.5 + 0.5 * Math.sin(h.phase + ts * 0.001 * ambientFreq));

      // Sum pulse contributions
      let pulseSum = 0;
      for (const p of pulses) pulseSum += pulseChargeFor(h, p);

      h.charge = Math.min(1, (ambient + pulseSum) * swell);
    }

    // ── Draw hex grid — two passes for depth ──────────────────────────────
    // Pass 1: filled bodies (source-over, very dim)
    ctx.globalCompositeOperation = 'source-over';
    for (const h of hexes) {
      if (h.charge < 0.005) continue;
      const c = h.charge;
      const fillCol = lerpRgb(HEX_BASE, HEX_MID, c);
      tracePath(ctx, h.verts);
      ctx.fillStyle = rgba(fillCol, c * 0.13);
      ctx.fill();
    }

    // Pass 2: stroked edges (lighter compositing for additive glow)
    ctx.globalCompositeOperation = 'lighter';
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    ctx.lineWidth = Math.max(0.8, dpr * 0.75);

    for (const h of hexes) {
      const c = h.charge;
      if (c < 0.003) continue;

      // Stroke: blue glow, brighter at high charge
      const strokeCol = lerpRgb(HEX_BASE, HEX_CORE, c);
      tracePath(ctx, h.verts);
      ctx.strokeStyle = rgba(strokeCol, Math.min(1, c * 0.85 + 0.08));
      ctx.stroke();
    }

    // Pass 3: core dots at peak-charged hexes (the "lit nodes")
    const dotTh = tune.dotThreshold;
    for (const h of hexes) {
      if (h.charge < dotTh) continue;
      const dotR = Math.max(1, (h.charge - dotTh) * hexR * dpr * 0.5);
      ctx.beginPath();
      ctx.arc(h.cx, h.cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(HEX_CORE, h.charge * 0.7);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  // ── Reduced-motion fallback: near-static, just slow ambient ───────────────
  function drawReducedMotion(ts) {
    ctx.globalCompositeOperation = 'source-over';
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    ctx.lineWidth = Math.max(0.8, dpr * 0.75);

    for (const h of hexes) {
      const ambient = 0.06 + 0.04 * Math.sin(h.phase + ts * 0.0003);
      tracePath(ctx, h.verts);
      ctx.strokeStyle = rgba(HEX_BASE, ambient);
      ctx.stroke();
    }
  }

  // ── rAF loop ───────────────────────────────────────────────────────────────
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    // Self-heal: the initial resize() can run before CSS layout settles (or a
    // ResizeObserver callback can miss a race), leaving the bitmap stuck at a
    // tiny pre-layout size. If the canvas box no longer matches the bitmap,
    // re-fit. Cheap (a few ops/frame) and robust against any timing.
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const wantW = Math.floor(canvas.clientWidth  * dpr);
    const wantH = Math.floor(canvas.clientHeight * dpr);
    if (wantW > 0 && wantH > 0 && (wantW !== canvas.width || wantH !== canvas.height)) {
      resize();
    }
    draw(ts);
  }

  function start() {
    if (rafId !== null) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ── Visibility change handler ──────────────────────────────────────────────
  function onVisibility() {
    hidden = document.hidden;
    if (hidden) {
      pause();
    } else {
      start();
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  resize();
  draw(performance.now());   // paint one static frame immediately, so the canvas
                             // is never blank before the rAF loop starts (matters
                             // for first paint, hidden tabs, and screenshots).
  if (!document.hidden) start();
  document.addEventListener('visibilitychange', onVisibility);

  // ── Public controller ──────────────────────────────────────────────────────
  return {
    /**
     * setPlaying(bool) — playing mode: faster wave-fronts, higher brightness,
     * more concurrent pulse streams. Idle: single slow ambient breath, dim glow.
     */
    setPlaying(b) {
      playing = !!b;
      // Clear stale pulses so speed/brightness reset immediately
      pulses = [];
    },

    /**
     * setIntensity(n: 0..1) — scales both animation speed and hex brightness.
     * The widget drives this from playback progress (e.g. near the end of a
     * track => intensity ramps toward 1 for a climax effect).
     */
    setIntensity(n) {
      intensity = Math.max(0, Math.min(1, n));
    },

    /**
     * setSeed(str) — give the lattice a per-track signature. HONEST: the input
     * is the track's identity ("Title|Artist"); everything derived is
     * deterministic — the same song always wears the same face, different
     * songs differ. No audio analysis is involved or implied.
     */
    setSeed(str) {
      const rnd = mulberry32(fnv1a(String(str)));
      traits.speedMul = 0.82 + rnd() * 0.40;          // 0.82 .. 1.22
      traits.freqMul  = 0.85 + rnd() * 0.35;          // 0.85 .. 1.20
      traits.widthMul = 0.85 + rnd() * 0.40;          // 0.85 .. 1.25
      traits.dirBias  = [0.4 + rnd(), 0.4 + rnd(), 0.4 + rnd(), 0.4 + rnd()];
      weatherDir  = (rnd() * 4) | 0;                  // each song opens on its own wind
      weatherNext = 0;                                 // allow immediate re-pick on next spawn
      // Re-phase a third of the lattice so the change of song is felt, gently.
      for (const h of hexes) {
        if (rnd() < 0.33) h.phase = rnd() * Math.PI * 2;
      }
    },

    /**
     * setTune(name) — switch tuning preset: 'baseline' (shipped original) or
     * 'phrasing' (calmer breath, pulse-weather, slow swells). Unknown names no-op.
     */
    setTune(name) {
      if (TUNES[name]) { tune = TUNES[name]; pulses = []; }
    },

    /**
     * resize() — call whenever the canvas container changes size.
     * Re-fits to clientWidth/clientHeight, re-precomputes all hex geometry.
     * DPR is capped at MAX_DPR (2) for performance.
     */
    resize,

    /**
     * destroy() — cancels the rAF loop and removes the visibilitychange listener.
     * Call when unmounting the widget.
     */
    destroy() {
      pause();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
