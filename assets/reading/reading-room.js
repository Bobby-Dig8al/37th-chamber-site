/* ═══════════════════════════════════════════════════════════════════════════
   reading-room.js — THE 37TH CHAMBER · premium reading furniture
   ---------------------------------------------------------------------------
   Vanilla JS, zero dependencies, self-contained, progressive enhancement.
   The article is fully readable with this file absent or JS disabled; every-
   thing here is additive chrome injected at runtime.

   Enhances any long-form article with:
     1. a sticky top READ-PROGRESS bar (role=progressbar)
     2. an auto READ-TIME estimate ("N min read") from word count
     3. a CHAPTER NAV rail built from the article's <h2> (and optional <h3>)
        — click to scroll, scroll-spy current-section highlight
     4. HOVER-FOOTNOTE citation cards — a.ref / [data-rr-ref] links show a
        Wikipedia-preview-style card on hover OR keyboard focus, with content
        pulled from a sources map (inline JSON, global, or the page .roots).

   ── HOW TO ATTACH ─────────────────────────────────────────────────────────
   Drop the two lines in <head> (or before </body>):
       <link rel="stylesheet" href="/assets/reading/reading-room.css">
       <script src="/assets/reading/reading-room.js" defer></script>
   With no config it auto-targets <main class="wrap">, <main>, or <article>,
   reads <h2> as chapters, and turns any <a class="ref"> / [data-rr-ref] into
   a hover-footnote. Override anything via a data-reading-room JSON attribute
   on the <body> or the article, or window.READING_ROOM = {...}. See README.

   ── ACCESSIBILITY ─────────────────────────────────────────────────────────
   · Progress bar exposes aria valuenow/min/max.
   · Rail is a real <nav> with a labelled list of in-page links (keyboard +
     screen-reader friendly); current section gets aria-current="true".
   · Citation cards open on focus as well as hover; Escape and blur dismiss;
     prefers-reduced-motion disables transitions and uses instant scroll.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* run once, even if included twice */
  if (window.__readingRoomLoaded) return;
  window.__readingRoomLoaded = true;

  /* ── config resolution ────────────────────────────────────────────────── */
  var DEFAULTS = {
    articleSelector: 'main.wrap, main[role="main"], main, article',
    headingSelector: 'h2',          // chapters; add 'h3' to nest sub-entries
    subHeadingSelector: null,        // e.g. 'h3' to render nested rail entries
    refSelector: 'a.ref, a[data-rr-ref], [data-rr-ref]',
    wordsPerMinute: 225,             // adult prose average
    progress: true,
    readTime: true,
    rail: true,
    footnotes: true,
    railLabel: 'In this chamber',
    railMobileLabel: 'Contents',
    minHeadingsForRail: 2,           // don't build a rail for 0–1 sections
    sources: null                    // { "<href or id>": {title,meta,blurb,url,external} }
  };

  function parseJSONAttr(el, name) {
    if (!el) return null;
    var raw = el.getAttribute(name);
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch (e) { console.warn('[reading-room] bad JSON in ' + name + ':', e); return null; }
  }

  function resolveConfig() {
    var cfg = {};
    for (var k in DEFAULTS) cfg[k] = DEFAULTS[k];
    var fromBody = parseJSONAttr(document.body, 'data-reading-room');
    var fromGlobal = (typeof window.READING_ROOM === 'object') ? window.READING_ROOM : null;
    [fromBody, fromGlobal].forEach(function (src) {
      if (src) for (var k in src) if (src.hasOwnProperty(k)) cfg[k] = src[k];
    });
    return cfg;
  }

  /* ── tiny DOM helpers ─────────────────────────────────────────────────── */
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var a in attrs) if (attrs.hasOwnProperty(a)) n.setAttribute(a, attrs[a]);
    return n;
  }
  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/[‘’“”]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim().replace(/\s+/g, '-').slice(0, 60) || 'section';
  }
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* throttle to one call per animation frame */
  function rafThrottle(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /* ── boot ─────────────────────────────────────────────────────────────── */
  function init() {
    var cfg = resolveConfig();
    var article = document.querySelector(cfg.articleSelector);
    if (!article) return;                       // nothing to enhance — bail quietly

    article.classList.add('rr-root');

    var headings = collectHeadings(article, cfg);

    if (cfg.progress) buildProgress(article);
    if (cfg.readTime) buildReadTime(article, cfg);
    if (cfg.rail && headings.length >= cfg.minHeadingsForRail) buildRail(article, headings, cfg);
    if (cfg.footnotes) buildFootnotes(article, cfg);
  }

  /* collect headings, ensure each has a stable id, return [{el,level,text,id}] */
  function collectHeadings(article, cfg) {
    var sel = cfg.headingSelector;
    if (cfg.subHeadingSelector) sel += ',' + cfg.subHeadingSelector;
    var nodes = Array.prototype.slice.call(article.querySelectorAll(sel));
    var seen = {};
    return nodes.map(function (h) {
      var id = h.id;
      if (!id) {
        var base = slugify(h.textContent);
        id = base; var i = 2;
        while (document.getElementById(id) || seen[id]) { id = base + '-' + (i++); }
        h.id = id;
      }
      seen[id] = true;
      var isSub = cfg.subHeadingSelector && h.matches(cfg.subHeadingSelector);
      return { el: h, id: id, text: h.textContent.trim(), level: isSub ? 3 : 2 };
    });
  }

  /* ── 1 · READ-PROGRESS BAR ────────────────────────────────────────────── */
  function buildProgress(article) {
    var bar = el('div', 'rr-progress', {
      role: 'progressbar', 'aria-label': 'Reading progress',
      'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0'
    });
    var fill = el('div', 'rr-progress__fill');
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var update = rafThrottle(function () {
      var top = article.getBoundingClientRect().top + window.pageYOffset;
      // progress across the article body, finishing as its bottom reaches the
      // bottom of the viewport (so 100% == "you've seen the end").
      var start = top - 0;
      var end = top + article.offsetHeight - window.innerHeight;
      var span = Math.max(1, end - start);
      var pct = ((window.pageYOffset - start) / span) * 100;
      pct = Math.min(100, Math.max(0, pct));
      fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ── 2 · READ-TIME ESTIMATE ───────────────────────────────────────────── */
  function countWords(article) {
    // clone so we can strip non-prose (rail/roots/nav) without touching the page
    var clone = article.cloneNode(true);
    clone.querySelectorAll(
      '.rr-rail,.rr-progress,.rr-readtime,.roots,.signoff,nav,script,style,pre,code'
    ).forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    var text = (clone.textContent || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }

  function buildReadTime(article, cfg) {
    var words = countWords(article);
    if (words < 40) return;                     // too short to bother
    var mins = Math.max(1, Math.round(words / cfg.wordsPerMinute));

    var chip = el('div', 'rr-readtime', {
      role: 'note', 'aria-label': mins + ' minute read, about ' + words + ' words'
    });
    chip.innerHTML =
      '<span class="rr-readtime__dot" aria-hidden="true"></span>' +
      '<span class="rr-readtime__n">' + mins + ' min</span> read';

    // place it just before the first horizontal rule, else after the dek,
    // else at the top of the article.
    var anchor = article.querySelector('hr.rule') ||
                 article.querySelector('.dek') ||
                 article.querySelector('h1');
    if (anchor && anchor.parentNode) {
      if (anchor.classList.contains('dek') || anchor.tagName === 'H1') {
        anchor.parentNode.insertBefore(chip, anchor.nextSibling);
      } else {
        anchor.parentNode.insertBefore(chip, anchor);
      }
    } else {
      article.insertBefore(chip, article.firstChild);
    }
  }

  /* ── 3 · CHAPTER NAV RAIL ─────────────────────────────────────────────── */
  function buildRail(article, headings, cfg) {
    var nav = el('nav', 'rr-rail', { 'aria-label': cfg.railLabel });
    nav.id = 'rr-rail';

    // mobile disclosure toggle (CSS hides it on wide screens)
    var toggle = el('button', 'rr-rail__toggle', {
      type: 'button', 'aria-expanded': 'true', 'aria-controls': 'rr-rail-list'
    });
    toggle.appendChild(document.createTextNode(cfg.railMobileLabel));

    var label = el('div', 'rr-rail__label');
    label.textContent = cfg.railLabel;

    var list = el('ul', 'rr-rail__list', { id: 'rr-rail-list' });

    var links = [];
    headings.forEach(function (h) {
      var li = el('li', 'rr-rail__item' + (h.level === 3 ? ' rr-rail__item--h3' : ''));
      var a = el('a', 'rr-rail__link', { href: '#' + h.id });
      a.textContent = h.text;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToHeading(h.el);
        history.replaceState(null, '', '#' + h.id);
        // move focus to the section for screen-reader continuity
        h.el.setAttribute('tabindex', '-1');
        h.el.focus({ preventScroll: true });
      });
      li.appendChild(a);
      list.appendChild(li);
      links.push({ heading: h, item: li, link: a });
    });

    nav.appendChild(toggle);
    nav.appendChild(label);
    nav.appendChild(list);

    // place the rail as the article's first child so the fixed-position math
    // and the mobile inline-collapse both anchor to the column.
    article.insertBefore(nav, article.firstChild);

    // mobile collapse behaviour — default open on wide, collapsed on narrow
    function syncMobileDefault() {
      var narrow = window.matchMedia('(max-width:62rem)').matches;
      nav.setAttribute('data-collapsed', narrow ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', narrow ? 'false' : 'true');
    }
    toggle.addEventListener('click', function () {
      var collapsed = nav.getAttribute('data-collapsed') === 'true';
      nav.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
    });
    syncMobileDefault();

    setupScrollSpy(links);
  }

  function scrollToHeading(target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset - 18;
    window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  /* scroll-spy: highlight the section whose start is the last one above the
     reading line (a third of the way down the viewport). */
  function setupScrollSpy(links) {
    if (!links.length) return;
    var activeIndex = -1;

    function setActive(idx) {
      if (idx === activeIndex) return;
      links.forEach(function (l, i) {
        var on = i === idx;
        l.item.classList.toggle('rr-rail__item--active', on);
        if (on) l.link.setAttribute('aria-current', 'true');
        else l.link.removeAttribute('aria-current');
      });
      activeIndex = idx;
      // keep the active link in view within a scrollable rail
      if (idx >= 0 && links[idx].link.scrollIntoView) {
        var rail = links[idx].link.closest('.rr-rail');
        if (rail && rail.scrollHeight > rail.clientHeight) {
          links[idx].link.scrollIntoView({ block: 'nearest' });
        }
      }
    }

    function computeActive() {
      var line = window.innerHeight * 0.33;
      var idx = 0;
      for (var i = 0; i < links.length; i++) {
        var top = links[i].heading.el.getBoundingClientRect().top;
        if (top - line <= 0) idx = i; else break;
      }
      // before the first heading scrolls past the line, still mark the first
      // once the user has scrolled into the article at all
      if (window.pageYOffset < 4) idx = 0;
      setActive(idx);
    }

    var onScroll = rafThrottle(computeActive);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    computeActive();
  }

  /* ── 4 · HOVER-FOOTNOTE CITATION CARDS ────────────────────────────────── */
  function buildFootnotes(article, cfg) {
    var sources = resolveSources(article, cfg);
    var refs = Array.prototype.slice.call(article.querySelectorAll(cfg.refSelector));
    if (!refs.length) return;

    // one shared card element, repositioned per-link
    var card = el('div', 'rr-card', { role: 'tooltip', 'aria-hidden': 'true' });
    card.id = 'rr-card';
    document.body.appendChild(card);

    var current = null;     // the link currently owning the card
    var hideTimer = null;

    function dataFor(ref) {
      // priority: explicit data-rr-* on the link → sources map by id → by href
      // → harvested from the link's own text/href (graceful default).
      var inline = {
        title: ref.getAttribute('data-rr-title'),
        meta: ref.getAttribute('data-rr-meta'),
        blurb: ref.getAttribute('data-rr-blurb'),
        kicker: ref.getAttribute('data-rr-kicker'),
        url: ref.getAttribute('data-rr-url')
      };
      var key = ref.getAttribute('data-rr-ref') || ref.getAttribute('href') || '';
      var mapped = sources[key] || sources[key.replace(/^#/, '')] || null;

      var href = inline.url || (mapped && mapped.url) || ref.getAttribute('href') || '';
      var external = /^https?:\/\//i.test(href) &&
        href.indexOf(location.host) === -1;

      // A title is "trusted HTML" only when it came from the page's own .roots
      // block (mapped.titleHtml). Inline/config/text-fallback titles are plain
      // text with optional [em]…[/em] markers and get escaped.
      var title, titleHtml = false;
      if (inline.title) { title = inline.title; }
      else if (mapped && mapped.title) { title = mapped.title; titleHtml = !!mapped.titleHtml; }
      else { title = ref.textContent.replace(/ⓘ/g, '').trim(); }   // strip the ⓘ glyph

      return {
        kicker: inline.kicker || (mapped && mapped.kicker) || (external ? 'Source' : 'Reference'),
        title: title,
        titleHtml: titleHtml,
        meta: inline.meta || (mapped && mapped.meta) || '',
        blurb: inline.blurb || (mapped && mapped.blurb) || '',
        url: href,
        external: external
      };
    }

    function renderCard(d) {
      card.innerHTML = '';
      var kick = el('div', 'rr-card__kicker'); kick.textContent = d.kicker;
      card.appendChild(kick);
      var title = el('div', 'rr-card__title');
      title.innerHTML = d.titleHtml ? d.title : escapeButKeepEm(d.title);
      card.appendChild(title);
      if (d.meta) { var m = el('div', 'rr-card__meta'); m.textContent = d.meta; card.appendChild(m); }
      if (d.blurb) { var b = el('p', 'rr-card__blurb'); b.textContent = d.blurb; card.appendChild(b); }
      if (d.url) {
        var attrs = { href: d.url, 'class': 'rr-card__link' };
        if (d.external) { attrs.target = '_blank'; attrs.rel = 'noopener noreferrer'; }
        var link = el('a', 'rr-card__link', attrs);
        if (d.external) link.setAttribute('data-external', '');
        link.textContent = d.external ? 'Open source' : 'Go to reference';
        card.appendChild(link);
      }
    }

    function positionCard(ref) {
      // measure after render so width/height are real
      var r = ref.getBoundingClientRect();
      var cw = card.offsetWidth, ch = card.offsetHeight;
      var margin = 10;
      var left = r.left + (r.width / 2) - (cw / 2);
      left = Math.min(window.innerWidth - cw - margin, Math.max(margin, left));
      // prefer above the link; flip below if it would clip the top
      var top = r.top - ch - 10;
      if (top < margin) top = r.bottom + 10;
      card.style.left = Math.round(left) + 'px';
      card.style.top = Math.round(top) + 'px';
    }

    function show(ref) {
      clearTimeout(hideTimer);
      current = ref;
      renderCard(dataFor(ref));
      // render first (display via visibility), then measure + place
      card.setAttribute('data-open', 'true');
      card.setAttribute('aria-hidden', 'false');
      positionCard(ref);
    }
    function hide() {
      hideTimer = setTimeout(function () {
        card.setAttribute('data-open', 'false');
        card.setAttribute('aria-hidden', 'true');
        current = null;
      }, 120);
    }

    refs.forEach(function (ref) {
      ref.classList.add('rr-ref');
      ref.setAttribute('aria-describedby', 'rr-card');
      // a small superscript glyph cues the footnote affordance
      if (!ref.querySelector('.rr-ref__sup')) {
        var sup = el('sup', 'rr-ref__sup', { 'aria-hidden': 'true' });
        sup.textContent = 'ⓘ';
        ref.appendChild(sup);
      }
      ref.addEventListener('mouseenter', function () { show(ref); });
      ref.addEventListener('mouseleave', hide);
      ref.addEventListener('focus', function () { show(ref); });
      ref.addEventListener('blur', hide);
    });

    // keep the card alive while the pointer is over it (so its link is clickable)
    card.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    card.addEventListener('mouseleave', hide);

    // Escape dismisses; reposition on scroll/resize while open
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current) { card.setAttribute('data-open', 'false'); card.setAttribute('aria-hidden', 'true'); current = null; }
    });
    var reposition = rafThrottle(function () { if (current) positionCard(current); });
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition);
  }

  /* allow <em> in titles (book titles) but escape everything else */
  function escapeButKeepEm(s) {
    var tmp = document.createElement('div');
    tmp.textContent = s;
    return tmp.innerHTML
      .replace(/\[em\](.*?)\[\/em\]/g, '<em>$1</em>');
  }

  /* Build the sources map. Order of precedence:
       1. cfg.sources (inline JSON / global)
       2. a <script type="application/json" id="rr-sources"> block
       3. harvested from the page's .roots citation block (keyed by href) */
  function resolveSources(article, cfg) {
    var map = {};
    function mergeInto(obj) { if (obj) for (var k in obj) if (obj.hasOwnProperty(k)) map[k] = obj[k]; }

    // 3 — harvest .roots first (lowest priority), so explicit config overrides
    var rootsLinks = document.querySelectorAll('.roots a[href]');
    Array.prototype.forEach.call(rootsLinks, function (a) {
      var href = a.getAttribute('href');
      if (!href || map[href]) return;
      var external = /^https?:\/\//i.test(href);
      // the visible text is a rich citation; use it as the title, drop the
      // visually-hidden "(opens in new tab)" helper text if present.
      var clone = a.cloneNode(true);
      clone.querySelectorAll('span').forEach(function (s) {
        if (/opens in new tab/i.test(s.textContent)) s.parentNode.removeChild(s);
      });
      map[href] = {
        kicker: external ? 'Source' : 'Reference',
        title: clone.innerHTML.trim(),   // keeps <em> for book titles
        titleHtml: true,                 // page-authored HTML — trusted as-is
        url: href,
        external: external
      };
    });

    // 2 — JSON script block
    var jsonEl = document.getElementById('rr-sources');
    if (jsonEl) {
      try { mergeInto(JSON.parse(jsonEl.textContent)); }
      catch (e) { console.warn('[reading-room] bad JSON in #rr-sources:', e); }
    }

    // 1 — explicit config (highest priority)
    mergeInto(cfg.sources);

    return map;
  }

  /* ── start when DOM is ready ──────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
