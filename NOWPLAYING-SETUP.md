# Now Playing Widget — Deploy Guide

> **Solo operator edition.** Every step is yours to run; every secret stays with you.
> Estimated time: 30–45 minutes, one coffee.

---

## Overview

The widget is three pieces working together:

| Piece | Who deploys it | Where |
|---|---|---|
| `spotify-worker.js` | You (Wrangler) | Cloudflare Workers |
| `nowplaying.js` + `electric-hex.js` + `nowplaying.css` | Auto (GitHub Pages) | 37th-chamber.com |
| Mount markup in `index.html` | You (one-liner edit) | Homepage |

The Worker is the secure proxy — it holds your Spotify credentials and never exposes them. The front-end holds nothing but the Worker's public URL.

---

## Step 1 — Create a Spotify Developer App

**Get your Client ID and Client Secret.**

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account.
2. Click **Create app**.
3. Fill in:
   - **App name:** `37th-chamber-now-playing` (or whatever you like — it's internal)
   - **App description:** anything
   - **Redirect URI:** `http://127.0.0.1:8888/callback`
     _(exact match matters — use this string as-is)_
   - Check **Web API**
4. Click **Save**.
5. On the app's dashboard, click **Settings**. Copy and save:
   - **Client ID** (public — safe to see)
   - **Client Secret** (treat like a password — never commit it)

> The Redirect URI does not need to serve anything real. It is only used once, below, to capture a code from the URL bar.

---

## Step 2 — Obtain a Refresh Token (one-time setup)

You need a long-lived refresh token. You do this once; the Worker uses it forever (or until you revoke it).

### 2a — Build the authorize URL

Replace `YOUR_CLIENT_ID` with your real Client ID, then paste the entire URL into your browser:

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=user-read-currently-playing%20user-read-playback-state
```

Spotify will ask you to approve access. Click **Agree**.

### 2b — Grab the code from the redirect URL

After approving, your browser lands on a page that probably shows a connection error (nothing is listening at 127.0.0.1:8888 — that is fine). Look at the **address bar**. The URL looks like:

```
http://127.0.0.1:8888/callback?code=AQD...long-string-here...
```

Copy everything after `code=`. That is your one-time authorization code.

### 2c — Exchange the code for tokens

Run this `curl` command in PowerShell (replace all three placeholders):

```powershell
curl.exe -X POST https://accounts.spotify.com/api/token `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=authorization_code&code=YOUR_CODE_FROM_STEP_2B&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

You get back JSON like:

```json
{
  "access_token": "BQD...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "AQB...long-string...",
  "scope": "user-read-currently-playing user-read-playback-state"
}
```

**Save the `refresh_token`.** It is the long-lived credential. The `access_token` expires in an hour and can be ignored — the Worker fetches fresh ones automatically using the refresh token.

> Store the refresh token somewhere safe (your password manager). Do NOT commit it to the repo.

---

## Step 3 — Deploy the Worker with Wrangler

### 3a — Log in to Cloudflare

```powershell
npx wrangler login
```

This opens a browser tab. Approve it. You are authenticated.

### 3b — Check the CORS origin in the Worker

Open `spotify-worker.js` in your editor. Find the line that sets the allowed origin (it will look something like):

```js
const ALLOWED_ORIGIN = 'https://37th-chamber.com';
```

Confirm it says `https://37th-chamber.com`. The Worker also allows `http://localhost` and `http://127.0.0.1` for local dev — those are already set. Leave them as-is.

### 3c — Deploy

```powershell
npx wrangler deploy spotify-worker.js
```

Wrangler prints a deployed URL like:

```
https://spotify-worker.<your-subdomain>.workers.dev
```

Copy that URL — you need it in Step 4.

### 3d — Set the three secrets

Run each command separately. Wrangler prompts you to paste the value — it never echoes it to the terminal.

```powershell
npx wrangler secret put SPOTIFY_CLIENT_ID
```
Paste your Client ID, press Enter.

```powershell
npx wrangler secret put SPOTIFY_CLIENT_SECRET
```
Paste your Client Secret, press Enter.

```powershell
npx wrangler secret put SPOTIFY_REFRESH_TOKEN
```
Paste your refresh token, press Enter.

> Secrets are stored encrypted in Cloudflare's vault. They are never in your code, never in the repo, never in a `.env` file.

---

## Step 4 — Wire the Worker URL to the Homepage

Open `index.html`. Find the `#now-playing` div (it is already in the file):

```html
<div id="now-playing" data-worker-url=""></div>
<script type="module" src="nowplaying.js"></script>
```

Set `data-worker-url` to your deployed Worker URL:

```html
<div id="now-playing" data-worker-url="https://spotify-worker.<your-subdomain>.workers.dev"></div>
<script type="module" src="nowplaying.js"></script>
```

Leave it empty (`data-worker-url=""`) to run in idle/demo mode — the hex canvas still animates, no live fetch happens.

---

## Step 5 — Mount Markup (reference)

The exact two lines that belong in `index.html` wherever you want the widget:

```html
<div id="now-playing" data-worker-url="https://spotify-worker.<your-subdomain>.workers.dev"></div>
<script type="module" src="nowplaying.js"></script>
```

`nowplaying.js` is an ES module — the `type="module"` attribute is required. No bundler, no build step.

---

## Step 6 — Verify

1. Push your changes. GitHub Pages rebuilds (usually under 60 seconds).
2. Open `https://37th-chamber.com` in Brave.
3. Start playing a track on Spotify (any device — phone, desktop, web player).
4. The now-playing card should appear within ~10 seconds (the poll interval).
5. Change songs. The card updates on the next poll.
6. Open DevTools → Network. Confirm requests go to your `workers.dev` URL, not to `spotify.com` directly. Confirm the response contains only `isPlaying`, `title`, `artist`, `album`, `albumArtUrl`, `progressMs`, `durationMs`, `trackUrl` — no tokens, no scopes.

---

## Security Callouts

```
┌─────────────────────────────────────────────────────────────────┐
│  SECRETS LIVE ONLY IN WRANGLER (Cloudflare encrypted vault).    │
│  Never in the repo. Never in .env. Never in index.html.         │
│                                                                 │
│  THE WORKER returns only the seven safe fields listed above.    │
│  No access token. No refresh token. No client secret.           │
│                                                                 │
│  CORS is locked to https://37th-chamber.com.                    │
│  Requests from any other origin are rejected by the Worker.     │
│  localhost is allowed for local dev only.                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

**Card shows nothing / status says "not playing"**
- You must have something actively playing on Spotify. Paused counts as not-playing. The Spotify API returns HTTP 204 (no content) when nothing is queued — the Worker correctly returns `{ "isPlaying": false }` and the widget shows idle state.

**CORS error in the console**
- The `ALLOWED_ORIGIN` in `spotify-worker.js` does not match the URL you are loading from. For local testing, open from `http://localhost` or `http://127.0.0.1` (not `file://`). For production, confirm the Worker is set to `https://37th-chamber.com` (no trailing slash).

**401 Unauthorized from the Worker**
- The refresh token is invalid or has been revoked. Repeat Step 2 to get a fresh one, then re-run `wrangler secret put SPOTIFY_REFRESH_TOKEN`.

**Worker deployed but nothing appears on the page**
- Confirm `data-worker-url` is set and not empty.
- Confirm the `<script type="module">` tag is present (not a plain `<script>`).
- Check the browser console for module load errors — most likely a path issue with `./electric-hex.js`.

**"Token expired" errors in Worker logs**
- This should not happen in normal operation — the Worker automatically refreshes the access token using the refresh token before each request. If you see this, the refresh token itself has expired (rare; Spotify only revokes them if the user disconnects the app or the token is unused for months). Repeat Step 2.

**The hex canvas is not visible**
- Confirm `nowplaying.css` is loaded (the card's `<canvas>` needs its dimensions set).
- The canvas is the ONLY blue element on the page. If you see blue text or blue card fills anywhere, that is a Blue Law violation — check your CSS.

---

*Built by bd8 + BD82 · 37th Chamber · knowledge is free, forever.*
