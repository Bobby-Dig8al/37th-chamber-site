import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Now Playing widget — BLUE-LAW invariant guard.
//
// THE LAW (nowplaying.css header + electric-hex.js header + index.html palette):
//   The ONLY blue element in the widget is the electric-hex canvas (.np-hex-canvas);
//   it paints itself in the #0E44FF family. ALL card text — title, artist, album,
//   status — is GOLD-family (#FFD60A / #d9b400) or the site --dim (#8f8a73, a warm
//   gray, deliberately NOT blue) on near-black (#08080a). No blue text, no blue
//   card fills.
//
// The widget builds its own DOM (no production page mounts it yet), so we mount the
// REAL nowplaying.js + nowplaying.css in mock mode via tests/fixtures/nowplaying-fixture.html.
// These tests would FAIL if any card text token were swapped to --electric, or if a
// stray blue fill/border landed anywhere outside the canvas.

const FIXTURE = '/tests/fixtures/nowplaying-fixture.html';

// Production palette — verbatim from index.html :root + electric-hex.js.
// (#0E44FF = rgb(14,68,255) is the charge — canvas-only, asserted via the --electric token test.)
const GOLD_RGB     = [255, 214, 10];  // #FFD60A — --gold
const GOLD_SOFT_RGB = [217, 180, 0];  // #d9b400 — --gold-soft
const DIM_RGB      = [143, 138, 115]; // #8f8a73 — --dim (warm gray, not blue)

// Playback-state mocks (match nowplaying.js Worker JSON schema).
const PLAYING_MOCK = {
  isPlaying: true,
  title: 'Lateralus',
  artist: 'Tool',
  album: 'Lateralus',
  albumArtUrl: null,
  progressMs: 90000,
  durationMs: 564000,
  trackUrl: 'https://open.spotify.com/track/0000000000000000000000',
};
const IDLE_REMEMBERS_MOCK = {
  isPlaying: false,
  title: 'Lateralus',
  artist: 'Tool',
  album: 'Lateralus',
  albumArtUrl: null,
  progressMs: 0,
  durationMs: 0,
  trackUrl: null,
};
const IDLE_QUIET_MOCK = { isPlaying: false };

function fixtureUrl(mock) {
  return `${FIXTURE}?mock=${encodeURIComponent(JSON.stringify(mock))}`;
}

// "Blue" = the blue channel meaningfully dominates both red and green. This is the
// honest definition for THIS palette: every allowed color (gold, gold-soft, dim) is
// red>=green>blue, while the electric charge is blue>>red,green. The threshold (40)
// is wide enough to catch any blue/violet/cyan text but never trips on gold or dim.
function isBlueish([r, g, b]) {
  return b > r + 40 && b > g + 40;
}

// Parse a computed CSS color ("rgb(r, g, b)" / "rgba(r, g, b, a)") into [r,g,b].
function parseRgb(str) {
  const m = String(str).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
  return [parts[0], parts[1], parts[2]];
}

function eqRgb(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

test.describe('Now Playing — Blue-Law invariant', () => {
  test('widget mounts: wrapper, card text nodes, and the hex canvas all present', async ({ page }) => {
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-hex-canvas', { timeout: 10_000 });

    await expect(page.locator('#now-playing .np-wrapper')).toHaveCount(1);
    await expect(page.locator('#now-playing .np-hex-canvas')).toHaveCount(1);
    // Playing state renders the mock track text.
    await expect(page.locator('#now-playing .np-title')).toHaveText('Lateralus');
    await expect(page.locator('#now-playing .np-artist')).toHaveText('Tool');
  });

  test('the ONLY blue element is .np-hex-canvas (no blue text/fill/border anywhere else)', async ({ page }) => {
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-hex-canvas', { timeout: 10_000 });

    // Walk every element under the widget; flag any whose computed color, background,
    // border, box-shadow, or fill reads as blue — EXCEPT the canvas, which is allowed
    // to carry the charge (it paints blue via the 2D context, and its CSS may name
    // --electric in the wrapper accent bar, which we account for separately).
    const offenders = await page.evaluate(({ thresholdBlueTest }) => {
      // re-create isBlueish inside the page (functions don't serialize across evaluate)
      const isBlue = new Function('r', 'g', 'b', thresholdBlueTest);
      const root = document.getElementById('now-playing');
      const out = [];
      const all = root.querySelectorAll('*');
      for (const el of all) {
        const cls = el.className && el.className.toString ? el.className.toString() : '';
        // The canvas IS the charge — exempt it entirely.
        if (cls.indexOf('np-hex-canvas') !== -1) continue;
        const cs = getComputedStyle(el);
        const props = {
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          borderTopColor: cs.borderTopColor,
          borderRightColor: cs.borderRightColor,
          borderBottomColor: cs.borderBottomColor,
          borderLeftColor: cs.borderLeftColor,
          fill: cs.fill,
        };
        for (const [prop, val] of Object.entries(props)) {
          const m = String(val).match(/rgba?\(([^)]+)\)/);
          if (!m) continue;
          const p = m[1].split(',').map((s) => parseFloat(s.trim()));
          const a = p.length > 3 ? p[3] : 1;
          if (a === 0) continue; // transparent — not visible blue
          if (isBlue(p[0], p[1], p[2])) {
            out.push({ tag: el.tagName.toLowerCase(), cls, prop, val });
          }
        }
      }
      return out;
    }, { thresholdBlueTest: 'return b > r + 40 && b > g + 40;' });

    expect(offenders, `blue found outside the canvas:\n${JSON.stringify(offenders, null, 2)}`).toEqual([]);
  });

  test('card text (title / artist / album / status link) never computes to a blue color', async ({ page }) => {
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-title', { timeout: 10_000 });

    const selectors = ['.np-title', '.np-artist', '.np-album', '.np-track-link'];
    for (const sel of selectors) {
      const color = await page.locator(`#now-playing ${sel}`).first().evaluate(
        (el) => getComputedStyle(el).color
      );
      const rgb = parseRgb(color);
      expect(rgb, `${sel} has a parseable color (${color})`).not.toBeNull();
      expect(
        isBlueish(rgb),
        `${sel} text must not be blue — got ${color} (rgb ${rgb})`
      ).toBe(false);
    }
  });

  // KNOWN SOURCE BUG (nowplaying.css lines 18-26) — marked expected-fail so the
  // suite is green while documenting the defect loudly. When the CSS is fixed this
  // test will PASS unexpectedly, and Playwright will fail the run until the
  // test.fail() marker is removed — i.e. it is the regression target.
  //
  // THE BUG: the "fallback properties for isolated pages" block self-references:
  //     #now-playing { --gold: var(--gold, #FFD60A); --gold-soft: var(--gold-soft, …); … }
  // Per CSS spec a custom property whose value references ITSELF forms a cycle and
  // resolves to the guaranteed-invalid (empty) value. So on ANY page — including the
  // production homepage whose :root defines --gold — the #now-playing element's
  // --gold/--gold-soft/--dim/--electric all collapse to "", and every use site
  // (color: var(--gold)) falls back to `initial` → BLACK. Card text renders black on
  // near-black (#000 on #0c0b0a, contrast 1.06:1 — see the a11y test below).
  // THE FIX (one of): (a) delete the #now-playing fallback block and put literals at
  // the use sites — `color: var(--gold, #FFD60A)`; or (b) declare the literals
  // unconditionally — `#now-playing { --gold: #FFD60A; … }` (no self-var()).
  test('card text holds the exact gold/dim tokens (title=gold, artist=gold-soft, album=dim)', async ({ page }) => {
    // Token-cycle FIXED Day-48: nowplaying.css now declares the #now-playing tokens as
    // unconditional literals (no self-referential var()), so this guard now PASSES.
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-title', { timeout: 10_000 });

    const title  = parseRgb(await page.locator('#now-playing .np-title').evaluate((e) => getComputedStyle(e).color));
    const artist = parseRgb(await page.locator('#now-playing .np-artist').evaluate((e) => getComputedStyle(e).color));
    const album  = parseRgb(await page.locator('#now-playing .np-album').evaluate((e) => getComputedStyle(e).color));

    expect(eqRgb(title, GOLD_RGB), `title is --gold ${GOLD_RGB} (got ${title})`).toBe(true);
    expect(eqRgb(artist, GOLD_SOFT_RGB), `artist is --gold-soft ${GOLD_SOFT_RGB} (got ${artist})`).toBe(true);
    expect(eqRgb(album, DIM_RGB), `album is --dim ${DIM_RGB} (got ${album})`).toBe(true);
  });

  test('near-black floor holds: widget background is the --bg family, never blue', async ({ page }) => {
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-hex-canvas', { timeout: 10_000 });

    // The hex canvas CSS floor is --bg (#08080a). It is dark and decidedly not blue.
    const canvasBg = parseRgb(
      await page.locator('#now-playing .np-hex-canvas').evaluate((e) => getComputedStyle(e).backgroundColor)
    );
    expect(canvasBg, 'canvas background parses').not.toBeNull();
    expect(canvasBg[0]).toBeLessThan(40);
    expect(canvasBg[1]).toBeLessThan(40);
    expect(canvasBg[2]).toBeLessThan(40);
    expect(isBlueish(canvasBg), `canvas floor not blue (got ${canvasBg})`).toBe(false);
  });

  // Same KNOWN SOURCE BUG (the self-referential --electric in the #now-playing
  // fallback block collapses to ""). Marked expected-fail; flips to the regression
  // target once the CSS fallback is corrected. See the token test above for the fix.
  test('the charge IS present: the electric accent bar resolves --electric to the exact #0E44FF', async ({ page }) => {
    // Token-cycle FIXED Day-48 (unconditional literals in nowplaying.css) — --electric
    // now resolves to #0E44FF, so this guard now PASSES.
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-wrapper', { timeout: 10_000 });

    // The wrapper's ::before accent bar is painted with --electric. Confirm the token
    // resolves to the exact charge color — this proves blue lives ONLY on chrome/canvas,
    // and that the token wiring (index.html :root + nowplaying.css fallback) is intact.
    const electric = await page.locator('#now-playing .np-wrapper').evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--electric').trim();
    });
    // Normalize #0E44FF (any case) — token is set in nowplaying.css fallback + index.html :root.
    expect(electric.toLowerCase()).toBe('#0e44ff');
  });

  test('idle (room remembers): text stays gold/dim, still no blue', async ({ page }) => {
    await page.goto(fixtureUrl(IDLE_REMEMBERS_MOCK));
    await page.waitForSelector('#now-playing .np-title', { timeout: 10_000 });

    // Idle-remembers keeps the last track in the title (renderIdle path).
    await expect(page.locator('#now-playing .np-title')).toHaveText('Lateralus');

    for (const sel of ['.np-title', '.np-artist', '.np-album']) {
      const rgb = parseRgb(
        await page.locator(`#now-playing ${sel}`).evaluate((e) => getComputedStyle(e).color)
      );
      expect(isBlueish(rgb), `${sel} not blue in idle-remembers (got ${rgb})`).toBe(false);
    }
  });

  test('idle (quiet room): "The room is quiet" copy renders (text is not blue)', async ({ page }) => {
    await page.goto(fixtureUrl(IDLE_QUIET_MOCK));
    await page.waitForSelector('#now-playing .np-title', { timeout: 10_000 });

    // Quiet-room copy from renderIdle() when no last track is known.
    await expect(page.locator('#now-playing .np-title')).toHaveText('The room is quiet');

    // Blue-Law (literal): the title must never be blue. (It currently renders BLACK
    // due to the token-cycle bug — not blue, so the literal Law still holds; the gold
    // assertion lives in the expected-fail token test above, which is the fix target.)
    const titleRgb = parseRgb(
      await page.locator('#now-playing .np-title').evaluate((e) => getComputedStyle(e).color)
    );
    expect(isBlueish(titleRgb), `quiet-room title not blue (got ${titleRgb})`).toBe(false);
  });

  // Expected-fail as a DIRECT CONSEQUENCE of the token-cycle bug: black card text on
  // near-black background is a serious 'color-contrast' violation (#000 on #0c0b0a =
  // 1.06:1, well under WCAG AA 4.5:1). Fixing the CSS fallback (see token test above)
  // restores gold-on-near-black (~12:1) and clears this. Until then it is the
  // regression target — it flips green when the palette is repaired.
  test('no critical or serious accessibility violations on the widget', async ({ page }) => {
    // Token-cycle FIXED Day-48: card text is now gold (#FFD60A) on near-black (~12:1),
    // clearing the contrast violation. The tuner panel is hidden by default (Axe skips it)
    // and the toggle is labelled with an aria-hidden icon, so this guard now PASSES.
    await page.goto(fixtureUrl(PLAYING_MOCK));
    await page.waitForSelector('#now-playing .np-hex-canvas', { timeout: 10_000 });

    const results = await new AxeBuilder({ page }).include('#now-playing').analyze();
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    const summary = bad.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
    expect(bad.length, JSON.stringify(summary, null, 2)).toBe(0);
  });
});
