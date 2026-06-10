import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Washington Square (chess) chamber — layout + a11y regression guard.
// The coordinate-label tests below would have FAILED on the 2026-06-09 bug where
// the file-label row (role="presentation") missed [role="row"]{display:contents}
// and the a–h labels stacked vertically in column 1.
const BOARD = '/chambers/washington-square/';

test.describe('Washington Square board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BOARD);
    await page.waitForSelector('#board .file-label', { timeout: 10_000 });
  });

  test('file labels (a–h) form ONE horizontal row, each aligned under its file', async ({ page }) => {
    const labels = page.locator('#board .file-label');
    await expect(labels).toHaveCount(8);
    const rects = await labels.evaluateAll(els =>
      els.map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y) }; }));
    // THE regression assertions: one row (same y), spread across columns (distinct x).
    expect(new Set(rects.map(r => r.y)).size, 'all file labels share one row').toBe(1);
    expect(new Set(rects.map(r => r.x)).size, 'file labels spread across 8 columns').toBe(8);
    // each label sits under its own file column
    for (const f of ['a', 'd', 'h']) {
      const labelX = rects.find(r => r.t === f).x;
      const sqX = await page.locator(`#board [data-sq="${f}4"]`).evaluate(e => Math.round(e.getBoundingClientRect().x));
      expect(Math.abs(labelX - sqX), `${f}-label aligned under the ${f}-file`).toBeLessThan(30);
    }
  });

  test('rank labels (1–8) form ONE vertical column', async ({ page }) => {
    const rects = await page.locator('#board .rank-label').evaluateAll(els =>
      els.map(e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y) }; }));
    expect(rects.length).toBe(8);
    expect(new Set(rects.map(r => r.x)).size, 'rank labels share one column').toBe(1);
    expect(new Set(rects.map(r => r.y)).size, 'rank labels span 8 rows').toBe(8);
  });

  test('board renders all 64 squares', async ({ page }) => {
    await expect(page.locator('#board .sq')).toHaveCount(64);
  });

  test('no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'page should not scroll sideways').toBeLessThanOrEqual(1);
  });

  test('no critical or serious accessibility violations on the board', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#board').analyze();
    const bad = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    const summary = bad.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
    expect(bad.length, JSON.stringify(summary, null, 2)).toBe(0);
  });
});
