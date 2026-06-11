/**
 * minihearth.js — BENCH PROTOTYPE · the corner mini-Hearth
 * A compact now-playing card that travels with the visitor page-to-page.
 *
 * CONTINUITY MODEL (v0, honest): state lives in the DATA, not the DOM.
 * Every page resyncs to the same track via the same public Last.fm read;
 * the per-track seed (setSeed) makes the lattice pattern IDENTICAL per song,
 * so navigation never changes the character — only the breath restarts.
 * v1 option (engine state hand-off via sessionStorage for exact phase carry)
 * is noted in the bench page; needs a tiny getState/setState API on the engine.
 *
 * HONESTY: visual only — the site plays NO audio; this is a window, not a speaker.
 * SECURITY: textContent only for external strings; art origin validated.
 */
import { initElectricHex } from './electric-hex.js';

const POLL_MS = 15_000;
const mount = document.getElementById('mini-hearth');
if (mount) {
  const user = mount.dataset.lastfmUser || '';
  const key  = mount.dataset.lastfmKey || '';

  mount.innerHTML = '';
  const card = document.createElement('a');
  card.className = 'mh-card';
  card.href = '/';
  card.title = 'Now playing in the chamber — the Hearth';
  card.setAttribute('aria-label', 'Now playing in the chamber');

  const row = document.createElement('div');
  row.className = 'mh-row';
  const art = document.createElement('img');
  art.className = 'mh-art';
  art.alt = '';
  art.setAttribute('aria-hidden', 'true');
  const meta = document.createElement('div');
  meta.className = 'mh-meta';
  const t = document.createElement('div');
  t.className = 'mh-title';
  const a = document.createElement('div');
  a.className = 'mh-artist';
  meta.appendChild(t); meta.appendChild(a);
  row.appendChild(art); row.appendChild(meta);

  const canvas = document.createElement('canvas');
  canvas.className = 'mh-hex';
  canvas.setAttribute('aria-hidden', 'true');

  card.appendChild(row);
  card.appendChild(canvas);
  mount.appendChild(card);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hex = initElectricHex(canvas, { reducedMotion });

  let lastKey = '';
  async function poll() {
    try {
      const u = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json&limit=1`;
      const j = await (await fetch(u)).json();
      const tr = j?.recenttracks?.track?.[0];
      if (!tr) return idle();
      const playing = tr['@attr']?.nowplaying === 'true';
      const title = tr.name || '';
      const artist = tr.artist?.['#text'] || '';
      const k = title + '|' + artist;
      t.textContent = title || 'The room is quiet';
      a.textContent = artist || '';
      const img = (tr.image || []).find(i => i.size === 'medium')?.['#text'] || '';
      if (img && /^https:\/\/(i\.scdn\.co|lastfm\.freetls\.fastly\.net|[a-z0-9-]+\.last\.fm)\//i.test(img)) {
        art.src = img; art.style.display = '';
      } else { art.removeAttribute('src'); art.style.display = 'none'; }
      if (k !== lastKey) { lastKey = k; if (hex.setSeed) hex.setSeed(k); }
      hex.setPlaying(playing);
      hex.setIntensity(playing ? 0.55 : 0.18);
    } catch { idle(); }
  }
  function idle() {
    t.textContent = 'The room is quiet';
    a.textContent = '';
    hex.setPlaying(false);
    hex.setIntensity(0.12);
  }
  poll();
  setInterval(poll, POLL_MS);
}
