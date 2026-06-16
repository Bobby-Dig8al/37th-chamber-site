/**
 * scrollytelling.js — THE 37TH CHAMBER · scroll-driven reveal + sticky-figure
 * A self-contained IntersectionObserver engine that reveals, pins, and
 * choreographs marked sections as the reader scrolls (NYT / Pudding style).
 * Vanilla JS, zero dependencies.
 *
 * PROGRESSIVE ENHANCEMENT (the law): the page is fully readable with this file
 * absent, blocked, or errored. We arm the hide→reveal cycle ONLY by adding the
 * class `.scrolly-on` to each root at init. No class → nothing hidden → prose
 * stands. A throw mid-init leaves earlier roots armed and later ones inert, all
 * still legible. We never remove content; we only toggle reveal classes.
 *
 * REDUCED MOTION: if the user asks for less motion we DO NOT arm `.scrolly-on`
 * at all (so the CSS never hides anything) and we skip the figure/parallax
 * loops. The active-step + progress bookkeeping still runs (cheap, class-only)
 * so a sticky figure can still answer the right caption — just without tweens.
 * The CSS reduced-motion block is the belt to this suspenders.
 *
 * WHAT IT DOES, by markup contract (all opt-in via data-attributes):
 *   1. [data-scrolly]            → element fades+rises in when it enters view.
 *        data-scrolly="up|left|right|in|blur"  picks the reveal flavor.
 *        data-scrolly-once (default true) → reveal once, then stop observing.
 *        data-scrolly-exit            → dim back down after it scrolls past.
 *   2. .scrolly-scene > .sc-figure + .sc-steps  → sticky-figure layout.
 *        Each .sc-step[data-step] becomes "active" when centered; the engine
 *        fires a `scrolly:step` CustomEvent and sets the figure's data-active
 *        so a figure can react (the demo redraws an orbit from it).
 *   3. [data-scrolly-progress]   → its first .scrolly-progress child gets
 *        --sc-pct (0→1) tracking how far the region has scrolled through view.
 *
 * SECURITY: reads only data-* attributes and element geometry. No network, no
 * innerHTML, no eval. Anything it writes is a class or a CSS custom property.
 *
 * API (optional; auto-inits on DOMContentLoaded over the whole document):
 *   Scrollytelling.init(root = document)  → wire any roots inside `root`.
 *   Scrollytelling.refresh()              → re-measure (after dynamic content).
 *   Scrollytelling.destroy()              → disconnect all observers.
 */
(function (global) {
  'use strict';

  var REDUCED = global.matchMedia
    ? global.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // live registry so refresh()/destroy() can act on everything we wired
  var observers = [];   // IntersectionObserver instances
  var sceneRafs = [];   // requestAnimationFrame ids for figure/progress loops
  var scrollFns = [];   // passive scroll/resize handlers, for teardown

  function isReduced() {
    // re-check live so a user toggling the OS setting mid-session is honored
    return global.matchMedia
      ? global.matchMedia('(prefers-reduced-motion: reduce)').matches
      : REDUCED;
  }

  /* ── 1. SIMPLE REVEALS: [data-scrolly] ──────────────────────────────── */
  function wireReveals(root) {
    var nodes = root.querySelectorAll('[data-scrolly]');
    if (!nodes.length) return;

    // group reveals by their nearest .scrolly root so we arm that root exactly
    // once; arming = adding .scrolly-on, which is what the CSS keys off.
    armRootsFor(nodes);

    if (isReduced()) return; // CSS leaves them visible; nothing to observe

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        var once = el.getAttribute('data-scrolly-once') !== 'false';
        if (e.isIntersecting) {
          el.classList.add('is-inview');
          el.classList.remove('is-past');
          if (once) { io.unobserve(el); }
        } else if (!once) {
          el.classList.remove('is-inview');
          // mark "scrolled past upward" for the optional exit-dim
          if (el.hasAttribute('data-scrolly-exit') &&
              e.boundingClientRect.top < 0) {
            el.classList.add('is-past');
          }
        }
      });
    }, {
      // reveal a touch before fully on-screen; the editorial sweet spot
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.15
    });

    nodes.forEach(function (n) { io.observe(n); });
    observers.push(io);
  }

  // add .scrolly-on to each distinct .scrolly ancestor (or the node itself if it
  // is the root). Only here, and only when NOT reduced-motion, do we ever hide.
  function armRootsFor(nodes) {
    if (isReduced()) return;
    var seen = [];
    nodes.forEach(function (n) {
      var root = n.closest('.scrolly') || n;
      if (seen.indexOf(root) === -1) { seen.push(root); }
    });
    seen.forEach(function (r) { r.classList.add('scrolly-on'); });
  }

  /* ── 2. STICKY-FIGURE SCENES: .scrolly-scene ────────────────────────── */
  function wireScenes(root) {
    var scenes = root.querySelectorAll('.scrolly-scene');
    scenes.forEach(function (scene) {
      var steps = Array.prototype.slice.call(
        scene.querySelectorAll('.sc-step'));
      var figure = scene.querySelector('.sc-figure');
      if (!steps.length) return;

      // arm the scene's root so inactive steps dim (skipped under reduced motion)
      var sroot = scene.closest('.scrolly') || scene;
      if (!isReduced()) sroot.classList.add('scrolly-on');

      var active = -1;
      function setActive(i) {
        if (i === active) return;
        active = i;
        steps.forEach(function (s, idx) {
          s.classList.toggle('is-active', idx === i);
        });
        var step = steps[i];
        var key = step ? (step.getAttribute('data-step') || String(i)) : '';
        if (figure) figure.setAttribute('data-active', key);
        // notify any figure/controller that wants to redraw itself
        scene.dispatchEvent(new CustomEvent('scrolly:step', {
          bubbles: true,
          detail: { index: i, key: key, step: step, figure: figure, scene: scene }
        }));
      }

      // choose the active step = the one whose center is nearest viewport center
      var io = new IntersectionObserver(function () {
        var vh = global.innerHeight || document.documentElement.clientHeight;
        var mid = vh / 2;
        var best = -1, bestDist = Infinity;
        steps.forEach(function (s, idx) {
          var r = s.getBoundingClientRect();
          var c = r.top + r.height / 2;
          var d = Math.abs(c - mid);
          // only consider steps that are at least partly on screen
          if (r.bottom > 0 && r.top < vh && d < bestDist) {
            bestDist = d; best = idx;
          }
        });
        if (best !== -1) setActive(best);
      }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] });

      steps.forEach(function (s) { io.observe(s); });
      observers.push(io);

      // a scroll handler refines the center pick between IO callbacks (smooth
      // hand-off as a step crosses center). Passive + rAF-coalesced; off under
      // reduced motion (IO alone is enough to land on the right step there).
      if (!isReduced()) {
        var ticking = false;
        function onScroll() {
          if (ticking) return;
          ticking = true;
          var id = global.requestAnimationFrame(function () {
            ticking = false;
            var vh = global.innerHeight;
            var mid = vh / 2, best = -1, bestDist = Infinity;
            steps.forEach(function (s, idx) {
              var r = s.getBoundingClientRect();
              var c = r.top + r.height / 2;
              var d = Math.abs(c - mid);
              if (r.bottom > 0 && r.top < vh && d < bestDist) {
                bestDist = d; best = idx;
              }
            });
            if (best !== -1) setActive(best);
          });
          sceneRafs.push(id);
        }
        global.addEventListener('scroll', onScroll, { passive: true });
        global.addEventListener('resize', onScroll, { passive: true });
        scrollFns.push(function () {
          global.removeEventListener('scroll', onScroll);
          global.removeEventListener('resize', onScroll);
        });
        onScroll();
      } else {
        // reduced motion: pick a sane default so the figure isn't blank
        setActive(0);
      }
    });
  }

  /* ── 3. PROGRESS RAILS: [data-scrolly-progress] ─────────────────────── */
  function wireProgress(root) {
    if (isReduced()) return; // a moving bar IS motion; skip it
    var regions = root.querySelectorAll('[data-scrolly-progress]');
    regions.forEach(function (region) {
      var rail = region.querySelector('.scrolly-progress');
      if (!rail) return;
      var ticking = false;
      function update() {
        if (ticking) return;
        ticking = true;
        var id = global.requestAnimationFrame(function () {
          ticking = false;
          var vh = global.innerHeight;
          var r = region.getBoundingClientRect();
          // 0 when the region's top hits viewport bottom; 1 when its bottom
          // reaches viewport top — i.e. fraction of region scrolled through.
          var total = r.height + vh;
          var pct = (vh - r.top) / total;
          pct = pct < 0 ? 0 : pct > 1 ? 1 : pct;
          rail.style.setProperty('--sc-pct', pct.toFixed(4));
        });
        sceneRafs.push(id);
      }
      global.addEventListener('scroll', update, { passive: true });
      global.addEventListener('resize', update, { passive: true });
      scrollFns.push(function () {
        global.removeEventListener('scroll', update);
        global.removeEventListener('resize', update);
      });
      update();
    });
  }

  /* ── lifecycle ──────────────────────────────────────────────────────── */
  function init(root) {
    root = root || document;
    try { wireReveals(root); } catch (e) { /* prose stays; fail soft */ }
    try { wireScenes(root); } catch (e) { /* prose stays; fail soft */ }
    try { wireProgress(root); } catch (e) { /* prose stays; fail soft */ }
  }

  function refresh() {
    // cheap re-measure: nudge every progress + scene loop once
    scrollFns.forEach(function () {});
    global.dispatchEvent(new Event('scroll'));
    global.dispatchEvent(new Event('resize'));
  }

  function destroy() {
    observers.forEach(function (io) { io.disconnect(); });
    observers = [];
    sceneRafs.forEach(function (id) { global.cancelAnimationFrame(id); });
    sceneRafs = [];
    scrollFns.forEach(function (off) { off(); });
    scrollFns = [];
  }

  var Scrollytelling = { init: init, refresh: refresh, destroy: destroy };

  // auto-init over the whole document once the DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  // expose for manual control + dynamic content
  global.Scrollytelling = Scrollytelling;

})(typeof window !== 'undefined' ? window : this);
