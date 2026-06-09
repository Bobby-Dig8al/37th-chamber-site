/**
 * electric-hex.js — Electric Hex canvas visualizer for 37th Chamber
 *
 * HONESTY NOTICE: This is a live canvas animation modulated by Spotify playback
 * progress and an estimated cadence derived from track position and duration.
 * It is NOT audio-reactive in any signal-processing sense — Spotify's Web API
 * provides no raw audio data. It reacts to PROGRESS (time elapsed in the track)
 * and to the playing/paused state. It is honest to call it "live"; it is
 * dishonest to call it "audio-reactive."
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
  function spawnPulse() {
    const dir = Math.floor(Math.random() * 4);
    // progress 0..1 across the grid; speed varies with playing+intensity
    const baseSpeed = playing
      ? 0.18 + intensity * 0.34
      : 0.04 + intensity * 0.06;
    pulses.push({
      progress: 0,
      speed: baseSpeed * (0.7 + Math.random() * 0.6),
      dir,
      width: 0.06 + Math.random() * 0.10,   // fraction of grid width
      brightness: (playing ? 0.55 : 0.25) * (0.7 + intensity * 0.6),
    });
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
    const maxPulses = playing ? 4 : 1;
    const spawnRate  = playing
      ? (0.8 + intensity * 1.6)   // pulses/sec
      : (0.15 + intensity * 0.2);
    if (pulses.length < maxPulses && Math.random() < spawnRate * dt) {
      spawnPulse();
    }

    // Update hex charges from pulses + ambient breathing
    const ambientFreq = playing ? (1.2 + intensity * 1.8) : 0.35;
    const ambientAmp  = playing ? (0.08 + intensity * 0.14) : 0.04;

    for (const h of hexes) {
      // Ambient base: slow sinusoidal breathing
      const ambient = ambientAmp * (0.5 + 0.5 * Math.sin(h.phase + ts * 0.001 * ambientFreq));

      // Sum pulse contributions
      let pulseSum = 0;
      for (const p of pulses) pulseSum += pulseChargeFor(h, p);

      h.charge = Math.min(1, ambient + pulseSum);
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
    for (const h of hexes) {
      if (h.charge < 0.45) continue;
      const dotR = Math.max(1, (h.charge - 0.45) * hexR * dpr * 0.5);
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
