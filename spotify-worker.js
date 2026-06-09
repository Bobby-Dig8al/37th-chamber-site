/**
 * spotify-worker.js — Cloudflare Worker
 * Secure proxy for Spotify "currently playing" — the 37th Chamber homepage widget.
 *
 * What it does:
 *   1. Exchanges a stored refresh token for a short-lived access token via
 *      Spotify's OAuth2 token endpoint (grant_type=refresh_token).
 *   2. Calls GET /v1/me/player/currently-playing with that token.
 *   3. Maps the Spotify response to the canonical WORKER RESPONSE JSON contract.
 *   4. Returns it with CORS headers locked to the site origin.
 *   The Worker holds all secrets server-side; ZERO secrets ever reach the browser.
 *
 * Required Cloudflare Worker secrets (set with wrangler — see below):
 *   SPOTIFY_CLIENT_ID      Your Spotify app's client ID.
 *   SPOTIFY_CLIENT_SECRET  Your Spotify app's client secret.
 *   SPOTIFY_REFRESH_TOKEN  A long-lived refresh token scoped to
 *                          user-read-currently-playing and user-read-playback-state.
 *
 * Set secrets (run once each, from your project root after `wrangler login`):
 *   npx wrangler secret put SPOTIFY_CLIENT_ID
 *   npx wrangler secret put SPOTIFY_CLIENT_SECRET
 *   npx wrangler secret put SPOTIFY_REFRESH_TOKEN
 *
 * Deploy:
 *   npx wrangler deploy spotify-worker.js --name spotify-now-playing
 *
 * CORS origin — edit ALLOWED_ORIGINS below if your domain changes.
 */

// ─── CORS ────────────────────────────────────────────────────────────────────
// Locked to production site + localhost variants for local dev.
const ALLOWED_ORIGINS = new Set([
  'https://37th-chamber.com',
  'https://www.37th-chamber.com',
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:8080',
  'http://127.0.0.1',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8080',
]);

// ─── CACHE ───────────────────────────────────────────────────────────────────
// Simple in-memory guard: stores the last upstream response and when it was
// fetched. Because each Worker isolate is ephemeral, this cache lives only
// as long as the isolate — it is not shared across all requests globally,
// but it prevents chatty bursts from a single hot isolate.
// For stronger caching across isolates, see the Cloudflare Cache API block below.
let memCache = { payload: null, fetchedAt: 0 };
const MEM_TTL_MS = 10_000; // 10 seconds

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://37th-chamber.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

/** Pick the largest album art image Spotify offers (by width). */
function largestArtUrl(images) {
  if (!images || images.length === 0) return null;
  // Spotify returns images sorted largest-first in most contexts,
  // but we sort explicitly to be certain.
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url ?? null;
}

// ─── TOKEN EXCHANGE ───────────────────────────────────────────────────────────
async function getAccessToken(env) {
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.SPOTIFY_REFRESH_TOKEN,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    // Do NOT include any token, credential, or scope in the thrown message.
    throw new Error(`Token refresh failed: upstream status ${res.status}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Token refresh succeeded but response contained no access_token');
  }

  return data.access_token;
}

// ─── SPOTIFY CURRENTLY-PLAYING ───────────────────────────────────────────────
async function fetchCurrentlyPlaying(accessToken) {
  const res = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  // 204 = nothing is playing (no active session or playback paused / empty queue).
  if (res.status === 204 || res.status === 202) {
    return { isPlaying: false };
  }

  if (!res.ok) {
    throw new Error(`Spotify currently-playing fetch failed: upstream status ${res.status}`);
  }

  const data = await res.json();

  // Spotify may return 200 with a body but is_playing=false (e.g., podcast paused).
  // We still map it — isPlaying reflects the actual state.
  const isPlaying = data.is_playing === true;
  const item = data.item;

  // Guard: if Spotify sends a non-track item (podcast episode) we still map safely.
  const title     = item?.name        ?? null;
  const artist    = item?.artists?.map((a) => a.name).join(', ') ?? null;
  const album     = item?.album?.name ?? null;
  const albumArtUrl = largestArtUrl(item?.album?.images ?? []);
  const progressMs  = data.progress_ms  ?? 0;
  const durationMs  = item?.duration_ms ?? 0;
  const trackUrl    = item?.external_urls?.spotify ?? null;

  return {
    isPlaying,
    title,
    artist,
    album,
    albumArtUrl,
    progressMs,
    durationMs,
    trackUrl,
  };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    // ── OPTIONS preflight ──────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // ── Only GET is meaningful ─────────────────────────────────────────────
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    // ── In-memory cache check ──────────────────────────────────────────────
    const now = Date.now();
    if (memCache.payload && now - memCache.fetchedAt < MEM_TTL_MS) {
      return jsonResponse(memCache.payload, 200, origin);
    }

    // ── Cloudflare Cache API (cross-isolate, ~10s TTL) ─────────────────────
    // Uses the Cache API keyed on a fixed internal URL (never the real Spotify
    // endpoint — that would leak auth headers into the cache).
    const cacheKey = new Request('https://internal.cache/spotify-now-playing');
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const payload = await cached.json();
      // Refresh in-memory guard too.
      memCache = { payload, fetchedAt: now };
      return jsonResponse(payload, 200, origin);
    }

    // ── Live fetch ─────────────────────────────────────────────────────────
    let payload;
    try {
      const accessToken = await getAccessToken(env);
      payload = await fetchCurrentlyPlaying(accessToken);
    } catch (err) {
      // Safe generic error — never include the token, secret, or scopes.
      // Log the real message to the Workers console (viewable only in your
      // Cloudflare dashboard, not in the response body).
      console.error('[spotify-worker] upstream error:', err.message);
      return jsonResponse(
        { error: 'Unable to fetch playback data. Try again shortly.' },
        502,
        origin
      );
    }

    // ── Populate caches ────────────────────────────────────────────────────
    // In-memory (current isolate).
    memCache = { payload, fetchedAt: now };

    // Cloudflare Cache API (cross-isolate). We set Cache-Control so the
    // Cache API stores it for ~10 s. The widget also polls at ~10 s intervals.
    const cacheResponse = new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        // max-age=10: cache stores for 10 s; s-maxage covers shared CDN layers.
        'Cache-Control': 'public, max-age=10, s-maxage=10',
      },
    });
    // cache.put is fire-and-forget — we don't await to avoid adding latency.
    void cache.put(cacheKey, cacheResponse);

    return jsonResponse(payload, 200, origin);
  },
};
