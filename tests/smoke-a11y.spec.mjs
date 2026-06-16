import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Smoke + a11y guard across the key pages.
// Each page must: load with no real console errors / uncaught exceptions, expose exactly ONE <main>,
// carry a working skip-link as the first focusable element, and pass an axe-core scan with zero
// serious/critical WCAG violations.
//
// All four templates ship the SAME a11y furniture (verified in source):
//   <a class="skip-link" href="#main">Skip to content</a>   ← first focusable in <body>
//   <main class="wrap" id="main"> … </main>                  ← exactly one
// So one parameterized suite covers every page identically.

// Only the pages that actually exist in the repo (verified on disk: /, /work/, /references/, /about/).
const PAGES = [
  { name: 'home',       path: '/' },
  { name: 'work',       path: '/work/' },
  { name: 'references', path: '/references/' },
  { name: 'about',      path: '/about/' },
];

// The homepage loads daily-v2.js + nowplaying.js (ES module). nowplaying.js fires client-side
// fetches to last.fm (ws.audioscrobbler.com) and the page loads a GoatCounter beacon (gc.zgo.at).
// The zero-dependency static test server can't reach those hosts, so their request failures and the
// widget's BY-DESIGN console.warn ('[nowplaying] last.fm fetch failed — keeping last state') are
// EXPECTED noise — not page errors. We ignore only these known-external sources; any first-party
// console.error or uncaught exception still fails the test.
const EXTERNAL_NOISE = ['audioscrobbler.com', 'gc.zgo.at', 'goatcounter.com', '[nowplaying]'];
const isExternalNoise = (text = '') => EXTERNAL_NOISE.some((h) => text.includes(h));

for (const pg of PAGES) {
  test.describe(`smoke + a11y — ${pg.name} (${pg.path})`, () => {
    test('loads with no console errors or uncaught exceptions', async ({ page }) => {
      const errors = [];
      // Real JS exceptions (first-party bugs) — always fatal.
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      // console.error only (console.warn is used by the nowplaying widget by design); drop external noise.
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isExternalNoise(text) || isExternalNoise(msg.location()?.url || '')) return;
        errors.push(`console.error: ${text}`);
      });

      await page.goto(pg.path, { waitUntil: 'load' });
      // Let deferred scripts (daily-v2.js) run + any synchronous render settle.
      await page.waitForLoadState('networkidle').catch(() => {});

      expect(errors, errors.join('\n')).toEqual([]);
    });

    test('has exactly one <main>', async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'load' });
      await expect(page.locator('main')).toHaveCount(1);
      // The shared template id — the skip-link target.
      await expect(page.locator('main#main')).toHaveCount(1);
    });

    test('has a skip-link that targets #main and is the first focusable element', async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'load' });

      const skip = page.locator('a.skip-link');
      await expect(skip).toHaveCount(1);
      await expect(skip).toHaveAttribute('href', '#main');

      // The skip target must exist for the link to do anything.
      const target = skip.getAttribute('href').then((h) => page.locator(h));
      await expect(await target).toHaveCount(1);

      // First Tab from the top lands on the skip-link (it is the first focusable node in <body>).
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? { cls: el.className, href: el.getAttribute('href') } : null;
      });
      expect(focused?.cls).toContain('skip-link');
      expect(focused?.href).toBe('#main');
    });

    test('no critical or serious accessibility violations (axe-core)', async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle').catch(() => {});

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      const summary = bad.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
      expect(bad.length, JSON.stringify(summary, null, 2)).toBe(0);
    });
  });
}
