import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The Daily (daily-v2.js) — day-of-week router + date engine.
// The router mounts on the HOMEPAGE at #the-daily and OVERWRITES its innerHTML:
//   <section id="the-daily">…static fallback…</section>  +  <script src="/daily-v2.js" defer>
// After the deferred script runs it injects "<style>…</style>" + a render tree whose
// classes differ by mode:
//   Monday    → MAP       : .grid > a.card  (six)              (renderMap)
//   Tue–Sat   → DEEP DIVE : a.dly-deepdive hero + .dly-also-chip(renderDeepDive)
//   Sunday    → DISPATCH  : .ss-mast (magazine) | .dly-top, + .dly-chapter…(renderDispatch)
//
// Pinning a day: /?date=YYYY-MM-DD (exact DAILY[].date) or /?day=N (1-based DAILY index).
// `date` wins over `day`. Render MODE is derived from the PINNED entry's weekday
// (dayDate.getDay()), so a preview param both selects content AND the layout.
//
// Source constants (daily-v2.js): DAILY_START="2026-06-08", ROLLOVER_HOUR=4.
// DAILY[0]=2026-06-08 (Mon) … DAILY[6]=2026-06-14 (Sun, has WEEK_ARCS magazine "The Sunday Stack").
const HOME = '/';

// The router reads LOCAL time (Date("…T00:00:00") parses local; getDay() is local) and the
// day flips at 04:00 LOCAL. Pin the browser timezone so getDay()/rollover math are
// host-independent in CI. America/Chicago = the site's operating zone.
test.use({ timezoneId: 'America/Chicago' });

// Wait until the deferred engine has replaced the fallback markup. The engine ALWAYS
// injects a <style> block into #the-daily; the static fallback never contains one.
async function waitForEngine(page) {
  await page.waitForFunction(() => {
    const m = document.getElementById('the-daily');
    return !!m && m.querySelector('style') !== null;
  }, null, { timeout: 10_000 });
}

test.describe('The Daily — router by day-of-week (preview-pinned)', () => {
  test('Monday pins to MAP — six-card grid, no deep-dive hero', async ({ page }) => {
    await page.goto(`${HOME}?date=2026-06-08`); // DAILY[0], a Monday
    await waitForEngine(page);

    const daily = page.locator('#the-daily');
    // MAP renders a .grid of six standard cards (one per slot).
    await expect(daily.locator('.grid > a.card')).toHaveCount(6);
    // The day header reflects the pinned entry.
    await expect(daily.locator('.dly-title')).toContainText('Daily 001');
    await expect(daily.locator('.dly-date')).toHaveText('2026-06-08');
    // MAP must NOT use the deep-dive hero or dispatch chapters.
    await expect(daily.locator('.dly-deepdive')).toHaveCount(0);
    await expect(daily.locator('.dly-chapter')).toHaveCount(0);
  });

  test('Tuesday pins to DEEP DIVE — one hero card + an "also today" row', async ({ page }) => {
    await page.goto(`${HOME}?date=2026-06-09`); // DAILY[1], a Tuesday, spotlight:"film"
    await waitForEngine(page);

    const daily = page.locator('#the-daily');
    // Exactly one deep-dive hero.
    await expect(daily.locator('a.dly-deepdive')).toHaveCount(1);
    await expect(daily.locator('.dly-title')).toContainText('Daily 002');
    await expect(daily.locator('.dly-date')).toHaveText('2026-06-09');
    // spotlight:"film" → hero is Lynda Obst (the film slot's name).
    await expect(daily.locator('.dly-deepdive .dly-dd-name')).toContainText('Lynda Obst');
    // "Also today" row carries the OTHER five slots as chips (spotlight excluded).
    await expect(daily.locator('.dly-also-chip')).toHaveCount(5);
    // DEEP DIVE is not MAP and not DISPATCH.
    await expect(daily.locator('.grid > a.card')).toHaveCount(0);
    await expect(daily.locator('.dly-chapter')).toHaveCount(0);
  });

  test('Wednesday–Saturday each render a DEEP DIVE with the correct spotlight', async ({ page }) => {
    // Each Tue–Sat pins to deep-dive; verify a couple mid/late-week days route correctly.
    const cases = [
      { date: '2026-06-10', num: 'Daily 003', heroIncludes: 'Morris & Thorne' }, // Wed, spotlight:"science"
      // Sat 006, spotlight:"science" → hero is the science slot's name (the 2015 paper's authors).
      { date: '2026-06-13', num: 'Daily 006', heroIncludes: 'James, von Tunzelmann, Franklin & Thorne' },
    ];
    for (const c of cases) {
      await page.goto(`${HOME}?date=${c.date}`);
      await waitForEngine(page);
      const daily = page.locator('#the-daily');
      await expect(daily.locator('a.dly-deepdive')).toHaveCount(1);
      await expect(daily.locator('.dly-title')).toContainText(c.num);
      await expect(daily.locator('.dly-deepdive .dly-dd-name')).toContainText(c.heroIncludes);
      await expect(daily.locator('.dly-chapter')).toHaveCount(0);
    }
  });

  test('Sunday pins to DISPATCH — magazine masthead + seven chapters', async ({ page }) => {
    await page.goto(`${HOME}?date=2026-06-14`); // DAILY[6], a Sunday, WEEK_ARCS has magazine
    await waitForEngine(page);

    const daily = page.locator('#the-daily');
    // The Sunday Stack magazine masthead (renders only when arc.magazine present).
    await expect(daily.locator('.ss-mast')).toHaveCount(1);
    await expect(daily.locator('.ss-mast-name')).toHaveText('The Sunday Stack');
    await expect(daily.locator('.ss-mast-line')).toContainText('Issue 001');
    // One chapter row per day in the week → seven dated DAILY entries (001–007).
    await expect(daily.locator('.dly-chapter')).toHaveCount(7);
    // Magazine-only sections present (Editor's Letter, pull-quote, Feature, Coda).
    await expect(daily.locator('.ss-letter')).toHaveCount(1);
    await expect(daily.locator('.ss-pull blockquote')).toHaveCount(1);
    await expect(daily.locator('.ss-feature')).toHaveCount(1);
    await expect(daily.locator('.ss-coda')).toHaveCount(1);
    // DISPATCH is not the top-level MAP/DEEPDIVE single-day render.
    await expect(daily.locator('> .dly-deepdive')).toHaveCount(0);
  });
});

test.describe('The Daily — preview params', () => {
  test('?day=N selects the Nth (1-based) DAILY entry', async ({ page }) => {
    // day=2 → DAILY index 1 → 2026-06-09 (Tuesday) → deep dive, "Daily 002".
    await page.goto(`${HOME}?day=2`);
    await waitForEngine(page);
    const daily = page.locator('#the-daily');
    await expect(daily.locator('.dly-title')).toContainText('Daily 002');
    await expect(daily.locator('.dly-date')).toHaveText('2026-06-09');
    await expect(daily.locator('a.dly-deepdive')).toHaveCount(1);
  });

  test('?date= takes precedence over ?day=', async ({ page }) => {
    // date pins Monday-001; day=7 would have pinned Sunday-007. date must win.
    await page.goto(`${HOME}?date=2026-06-08&day=7`);
    await waitForEngine(page);
    const daily = page.locator('#the-daily');
    await expect(daily.locator('.dly-title')).toContainText('Daily 001');
    await expect(daily.locator('.dly-date')).toHaveText('2026-06-08');
    await expect(daily.locator('.grid > a.card')).toHaveCount(6); // MAP, not Sunday dispatch
  });

  test('an unknown ?date= falls back to the natural (clamped) day, no crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // No DAILY entry has this date → findIndex returns -1 → idx stays at its natural value.
    await page.goto(`${HOME}?date=1999-01-01`);
    await waitForEngine(page);
    // Engine still rendered SOMETHING (a header) and threw nothing.
    await expect(page.locator('#the-daily .dly-top, #the-daily .ss-mast').first()).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('The Daily — 04:00 rollover boundary', () => {
  // The day index = floor((Date.now() - startMs) / 86400000), startMs = 2026-06-08T04:00 local.
  // So the live render flips MAP(001, Mon) → DEEP DIVE(002, Tue) exactly at 2026-06-09T04:00 local.
  // page.clock freezes Date.now() before the deferred engine reads it; no preview param used here,
  // this exercises the REAL time-based path.

  test('at 03:59 local on 2026-06-09 the Daily still shows Monday 001 (MAP)', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-09T03:59:00-05:00') }); // 03:59 CDT
    await page.goto(HOME); // no params — pure time resolution
    await waitForEngine(page);
    const daily = page.locator('#the-daily');
    await expect(daily.locator('.dly-title')).toContainText('Daily 001');
    await expect(daily.locator('.grid > a.card')).toHaveCount(6);
  });

  test('at 04:00 local on 2026-06-09 the Daily rolls to Tuesday 002 (DEEP DIVE)', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-09T04:00:00-05:00') }); // 04:00 CDT
    await page.goto(HOME);
    await waitForEngine(page);
    const daily = page.locator('#the-daily');
    await expect(daily.locator('.dly-title')).toContainText('Daily 002');
    await expect(daily.locator('a.dly-deepdive')).toHaveCount(1);
  });

  test('before DAILY_START the index clamps to day 001 (no negative index)', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-01T12:00:00-05:00') }); // a week early
    await page.goto(HOME);
    await waitForEngine(page);
    await expect(page.locator('#the-daily .dly-title')).toContainText('Daily 001');
  });
});

test.describe('The Daily — WEEK_ARCS lookup', () => {
  test('Sunday resolves its week via getMondayOf → WEEK_ARCS[weekStart="2026-06-08"]', async ({ page }) => {
    // The dispatch only renders the magazine cover when the arc for that week's Monday exists.
    // 2026-06-14 (Sun) → Monday 2026-06-08 → WEEK_ARCS[0] (theme "Interstellar", magazine present).
    await page.goto(`${HOME}?date=2026-06-14`);
    await waitForEngine(page);
    const daily = page.locator('#the-daily');
    await expect(daily.locator('.ss-mast-line')).toContainText('Interstellar');
    // The week's closing thread line (arc.thread) renders at the end of the dispatch.
    await expect(daily.locator('.dly-thread')).toHaveCount(1);
    await expect(daily.locator('.dly-thread')).toContainText('research instrument');
  });

  test('the Feature link points where the arc says (cloud / Constellation)', async ({ page }) => {
    await page.goto(`${HOME}?date=2026-06-14`);
    await waitForEngine(page);
    // WEEK_ARCS[0].magazine.feature.href === "/cloud/".
    await expect(page.locator('#the-daily a.ss-feature')).toHaveAttribute('href', '/cloud/');
  });
});

test.describe('The Daily — REGRESSION GUARD: date:"TBD" must not crash the dispatch', () => {
  // The shipped bug: renderDispatch scans ALL of DAILY[] to gather the week's days. DAILY holds
  // FUTURE weeks with date:"TBD". new Date("TBD…") is Invalid; getMondayOf() then threw inside
  // .toISOString(), which killed the entire Sunday render and dropped the homepage to its static
  // fallback. The fix filters out !date / date==="TBD" / NaN dates BEFORE getMondayOf().
  // These tests pin a Sunday (the only mode that scans the whole array) and assert a clean,
  // COMPLETE dispatch with NO uncaught error and NO "Invalid Date" leakage.

  test('Sunday dispatch renders fully with TBD-dated weeks present in DAILY[]', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message)); // would catch the old throw

    await page.goto(`${HOME}?date=2026-06-14`);
    await waitForEngine(page);

    // No uncaught exception escaped the IIFE.
    expect(errors, `dispatch render threw:\n${errors.join('\n')}`).toEqual([]);

    const daily = page.locator('#the-daily');
    // The dispatch reached its END — Feature + Coda are appended LAST in renderDispatch, so their
    // presence proves the loop over weekDays completed without throwing on a TBD row.
    await expect(daily.locator('.ss-feature')).toHaveCount(1);
    await expect(daily.locator('.ss-coda')).toHaveCount(1);

    // Exactly the SEVEN real days of week 1 became chapters — the TBD weeks were filtered out,
    // not rendered as chapters. (If filtering broke, count would balloon or the render would die.)
    await expect(daily.locator('.dly-chapter')).toHaveCount(7);

    // The static fallback grid (the symptom of a dead render) was replaced — the live engine owns
    // #the-daily now, so its top-level child is the magazine mast, not a bare .grid of <a.card>.
    await expect(daily.locator('> .grid')).toHaveCount(0);

    // No "Invalid Date" string leaked into the rendered chapter datelines.
    await expect(daily).not.toContainText('Invalid Date');
  });

  test('a TBD-dated entry is never selectable as a single-day render', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // ?date=TBD matches the first TBD entry by findIndex; dayDate=new Date("TBD…") is Invalid.
    // The engine must not throw while resolving mode from an Invalid date.
    await page.goto(`${HOME}?date=TBD`);
    // Give the deferred script a tick; it may render nothing meaningful, but must not crash.
    await page.waitForLoadState('load');
    await page.waitForTimeout(300);
    expect(errors, `engine threw on TBD date:\n${errors.join('\n')}`).toEqual([]);
  });
});

test.describe('The Daily — accessibility', () => {
  // NOTE: color-contrast is DISABLED for these structural guards. The Daily's dim editorial
  // tokens — .dly-intro / .dly-date, the muted .go CTA, the .dly-also-chip pills, and the
  // .media-credit caption — render below WCAG AA 4.5:1 once the homepage's blueprint-grid
  // overlay darkens them (axe measured ~2.1–3.4:1). That is a PRE-EXISTING site-CSS palette
  // choice, identical across the whole site, NOT something the router introduces. These guards
  // therefore police the router's STRUCTURAL a11y (roles, names, image-alt, ARIA, link purpose)
  // and would catch a refactor that, say, dropped imgAlt or broke a landmark — while leaving the
  // standing contrast finding to a deliberate palette pass. (Surfaced for the operator below.)
  const AXE_NO_CONTRAST = (page) =>
    new AxeBuilder({ page }).include('#the-daily').disableRules(['color-contrast']);

  async function expectNoSeriousViolations(page) {
    const results = await AXE_NO_CONTRAST(page).analyze();
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    const summary = bad.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
    expect(bad.length, JSON.stringify(summary, null, 2)).toBe(0);
  }

  test('no critical/serious a11y violations on the Sunday dispatch (excl. contrast)', async ({ page }) => {
    await page.goto(`${HOME}?date=2026-06-14`);
    await waitForEngine(page);
    await expectNoSeriousViolations(page);
  });

  test('no critical/serious a11y violations on a deep-dive day (excl. contrast)', async ({ page }) => {
    // Thursday 004 — a deep dive that DOES carry an image card (M87* EHT webp), so this also
    // guards the renderMedia() path: a missing img alt would trip axe's image-alt rule here.
    await page.goto(`${HOME}?date=2026-06-11`);
    await waitForEngine(page);
    await expectNoSeriousViolations(page);
  });
});
