import { test, expect } from '@playwright/test';

// Electric-Hex canvas (electric-hex.js) + the .np-hex-canvas mount band.
//
// electric-hex.js is an ES module with a single export, initElectricHex(canvas, opts),
// returning a controller: { setPlaying, setIntensity, setSeed, setTune, resize, destroy }.
// The widget (nowplaying.js) mounts it on <canvas class="np-hex-canvas"> whose height is
// the CSS clamp(112px, 24vw, 160px) (nowplaying.css, Day-45 2x-Y band).
//
// We exercise the module in isolation rather than through the full widget so the test
// has no dependency on a live Spotify Worker / mock wiring. We navigate to the served
// homepage ('/') for two reasons that are load-bearing:
//   1. nowplaying.css is linked from index.html (<link href="/nowplaying.css">), so the
//      real .np-hex-canvas clamp is in scope — we assert the SAME stylesheet that ships.
//   2. Being on the real http://localhost:8799 origin lets the module's own relative
//      imports and our '/electric-hex.js' import resolve against the static server.
// Then we inject a real <canvas class="np-hex-canvas"> and import the real module — no
// invented selectors, no invented API, no stubbed source.

const HOME = '/';
const HEX_MIN = 112;   // clamp lower bound (px) — nowplaying.css
const HEX_MAX = 160;   // clamp upper bound (px) — nowplaying.css

// We mount our fixture on the real homepage ('/') to inherit its origin + nowplaying.css.
// The homepage makes its own external requests (e.g. an analytics beacon) that can fail to
// resolve inside the sandbox and surface as "Failed to load resource: net::ERR_*". Those are
// page-environment noise, NOT electric-hex errors. Filter them so the assertion stays scoped
// to genuine JS errors / uncaught exceptions from the module under test.
const isModuleError = (t) =>
  !/Failed to load resource/i.test(t) && !/net::ERR_/i.test(t);

// Attach console+pageerror collectors, returning the filtered error array.
function collectErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error' && isModuleError(msg.text())) errors.push(msg.text()); });
  page.on('pageerror', err => { const t = String(err); if (isModuleError(t)) errors.push(t); });
  return errors;
}

// Mount the real canvas (exact class from nowplaying.js: 'np-hex-canvas') inside a
// fixed-width box so 24vw resolves predictably, import the real module, and stash the
// controller on window for assertions. Returns whether getContext('2d') succeeded.
async function mountHex(page, { reducedMotion = false } = {}) {
  return page.evaluate(async (rm) => {
    // Fixed-width host so the clamp's 24vw term is deterministic across viewports.
    const host = document.createElement('div');
    host.id = 'hex-test-host';
    host.style.width = '400px';
    document.body.appendChild(host);

    const canvas = document.createElement('canvas');
    canvas.className = 'np-hex-canvas';   // EXACT class from nowplaying.js / nowplaying.css
    host.appendChild(canvas);

    // Real module, resolved against the live static origin.
    const mod = await import('/electric-hex.js');
    if (typeof mod.initElectricHex !== 'function') {
      return { imported: false };
    }
    const ctrl = mod.initElectricHex(canvas, { reducedMotion: rm });
    window.__hexCtrl = ctrl;
    window.__hexCanvas = canvas;
    return {
      imported: true,
      hasController: !!ctrl,
      // The 2D context is required by initElectricHex (it throws otherwise); reaching
      // here at all means getContext('2d') returned non-null.
      backingW: canvas.width,
      backingH: canvas.height,
    };
  }, reducedMotion);
}

test.describe('Electric-Hex canvas — module + mount', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOME);
  });

  test('module imports and initElectricHex mounts a controller on the canvas', async ({ page }) => {
    const r = await mountHex(page);
    expect(r.imported, 'electric-hex.js exports initElectricHex').toBe(true);
    expect(r.hasController, 'initElectricHex returns a controller object').toBe(true);
    // initElectricHex throws if the 2D context is unavailable; a populated backing
    // store proves the canvas mounted and resize() ran (DPR-scaled clientWidth/Height).
    expect(r.backingW, 'canvas backing-store width populated by resize()').toBeGreaterThan(0);
    expect(r.backingH, 'canvas backing-store height populated by resize()').toBeGreaterThan(0);
  });

  test('canvas mounts with the .np-hex-canvas class and a 2D context', async ({ page }) => {
    await mountHex(page);
    const canvas = page.locator('#hex-test-host canvas.np-hex-canvas');
    await expect(canvas).toHaveCount(1);
    const ctxOk = await canvas.evaluate(c => !!c.getContext('2d'));
    expect(ctxOk, '.np-hex-canvas has a usable 2D context').toBe(true);
  });

  test('canvas rendered height matches the CSS clamp (112–160px)', async ({ page }) => {
    await mountHex(page);
    const h = await page.locator('#hex-test-host canvas.np-hex-canvas')
      .evaluate(c => c.getBoundingClientRect().height);
    // clamp(112px, 24vw, 160px): on a 400px host the preferred 24vw varies with the
    // viewport, but the rendered height must stay within the clamp's hard bounds.
    expect(h, `rendered height ${h}px within clamp`).toBeGreaterThanOrEqual(HEX_MIN);
    expect(h, `rendered height ${h}px within clamp`).toBeLessThanOrEqual(HEX_MAX);
  });

  test('initializing + driving the API produces no console errors', async ({ page }) => {
    const errors = collectErrors(page);

    const r = await mountHex(page);
    expect(r.imported).toBe(true);

    // Exercise every public method, then let a couple of rAF frames run so the draw
    // loop executes against the seeded/playing state (where a runtime error would surface).
    await page.evaluate(async () => {
      const c = window.__hexCtrl;
      c.setTune('phrasing');
      c.setSeed('Strobe|deadmau5');
      c.setPlaying(true);
      c.setIntensity(0.9);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      c.setPlaying(false);
      c.setIntensity(0.1);
      c.resize();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });

    expect(errors, `console/page errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('public API setPlaying / setIntensity / setSeed / setTune / resize / destroy exist and are callable', async ({ page }) => {
    await mountHex(page);
    const report = await page.evaluate(() => {
      const c = window.__hexCtrl;
      const names = ['setPlaying', 'setIntensity', 'setSeed', 'setTune', 'resize', 'destroy'];
      const present = names.filter(n => typeof c[n] === 'function');
      const errs = [];
      // Callable with representative args — none of these return a value, so we only
      // assert that invoking them does not throw.
      try { c.setPlaying(true); }            catch (e) { errs.push('setPlaying: ' + e.message); }
      try { c.setIntensity(0.75); }          catch (e) { errs.push('setIntensity: ' + e.message); }
      try { c.setSeed('Title|Artist'); }     catch (e) { errs.push('setSeed: ' + e.message); }
      try { c.setTune('baseline'); }         catch (e) { errs.push('setTune: ' + e.message); }
      try { c.setTune('phrasing'); }         catch (e) { errs.push('setTune(phrasing): ' + e.message); }
      try { c.resize(); }                    catch (e) { errs.push('resize: ' + e.message); }
      return { present, errs };
    });
    // The four named in the task plus the documented resize/destroy.
    expect(report.present).toEqual(['setPlaying', 'setIntensity', 'setSeed', 'setTune', 'resize', 'destroy']);
    expect(report.errs, report.errs.join(' | ')).toEqual([]);
  });

  test('setTune ignores unknown preset names without throwing', async ({ page }) => {
    await mountHex(page);
    const threw = await page.evaluate(() => {
      try { window.__hexCtrl.setTune('does-not-exist'); return false; }
      catch { return true; }
    });
    expect(threw, 'unknown tune name is a documented no-op').toBe(false);
  });

  test('destroy() stops the loop cleanly (no errors after teardown)', async ({ page }) => {
    const errors = collectErrors(page);
    await mountHex(page);
    await page.evaluate(async () => {
      window.__hexCtrl.destroy();
      // Give a few frames after teardown — a leaked rAF or listener would error here.
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    expect(errors, errors.join(' | ')).toEqual([]);
  });
});

// Reduced-motion path: emulate prefers-reduced-motion and confirm the module takes the
// drawReducedMotion() branch without error and still paints (canvas backing store sized).
test.describe('Electric-Hex — reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('reduced-motion path renders without error', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto(HOME);
    const r = await mountHex(page, { reducedMotion: true });
    expect(r.imported).toBe(true);
    expect(r.hasController).toBe(true);

    // Drive the API under reduced motion and let frames run; draw() routes to
    // drawReducedMotion(ts) and must not throw.
    await page.evaluate(async () => {
      const c = window.__hexCtrl;
      c.setSeed('Reduced|Motion');
      c.setPlaying(true);
      c.setIntensity(0.8);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });

    const h = await page.locator('#hex-test-host canvas.np-hex-canvas')
      .evaluate(c => c.getBoundingClientRect().height);
    expect(h, 'canvas still occupies the clamp band under reduced motion').toBeGreaterThanOrEqual(HEX_MIN);
    expect(errors, `errors under reduced motion: ${errors.join(' | ')}`).toEqual([]);
  });
});
