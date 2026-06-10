/* The Daily — six good people, every day, around one masterwork.
   WEEK-ARCS now: one theme per week, deepening daily (NYT-crossword model),
   Sunday = the synthesis. Date-queued: stack days in DAILY[] and each appears
   on its date. We POINT, never reproduce (names + our own framing + links to source).
   The day rolls at 04:00 LOCAL (bd8's BOD), not midnight.
   PREVIEW any day before it rotates:  /?date=YYYY-MM-DD   or   /?day=N  (1-based).
   NOTE: bump the ?v= on <script src="/daily.js?v=N"> when you edit this file. */

const DAILY_START   = "2026-06-08";   // DAILY[0] is this date — Daily 001 · Interstellar
const ROLLOVER_HOUR = 4;              // the day flips at 04:00 local

const DAILY = [
  {
    num: "001", theme: "Interstellar", date: "2026-06-08",
    intro: "Today, one true thread — <em>Interstellar.</em> Carl Sagan introduced Kip Thorne to editor Lynda Obst (~1980 blind date); she later became a Hollywood producer, and together they conceived the film twenty-five years on. Thorne's real physics built its wormhole and its black hole.",
    music:   { name:"Hans Zimmer",       work:"Interstellar (OST)",          why:"The organ that turns a docking scene into a prayer.", link:"https://open.spotify.com/album/3B61kSKTxlY36cYgzvf3cP" },
    film:    { name:"Christopher Nolan", work:"Interstellar",                why:"Love across spacetime, with the physics kept honest.", link:"/references/interstellar-film/" },
    science: { name:"Kip Thorne",        work:"The Science of Interstellar", why:"Co-originated the film with producer Lynda Obst; his black-hole math rendered Gargantua — and produced real papers.", link:"/references/kip-thorne/" },
    book:    { name:"Carl Sagan",        work:"Contact",                     why:"Its wormhole was built by Thorne himself — the direct ancestor.", link:"/references/contact/" },
    artist:  { name:"Chesley Bonestell", work:"space art",                   why:"Father of space art; made the cosmos visible decades before any probe could.", link:"/references/chesley-bonestell/" },
    show:    { name:"Cosmos",            work:"Carl Sagan (1980)",           why:"Made a generation feel the universe.", link:"/references/carl-sagan/" }
  },
  {
    num: "002", theme: "Interstellar", date: "2026-06-09",
    intro: "Interstellar week, day two — <em>how it got made.</em> Not the science yet — the people who carried a physics problem all the way to the screen.",
    music:   { label:"The Matchmaker",     name:"Carl Sagan",                    work:"the introduction",        why:"Sagan connected Kip Thorne to Lynda Obst — a blind date in 1980 that became the spark for the film, a quarter-century later.", link:"/references/carl-sagan/" },
    film:    { label:"The Producer",       name:"Lynda Obst",                    work:"a 2006 treatment",        why:"She and Thorne carried the idea from a treatment to the screen over years.", link:"/references/kip-thorne/" },
    science: { label:"The First Director", name:"Steven Spielberg",              work:"attached for years",      why:"Spielberg developed it first; when DreamWorks left Paramount for Disney in 2009, the film stayed at the studio while Spielberg moved on — and Jonathan Nolan recommended his brother Christopher.", link:"/references/making-interstellar/" },
    book:    { label:"The Screenwriter",   name:"Jonathan Nolan",                work:"the early draft",         why:"Wrote the first script — and learned relativity to do it.", link:"/references/making-interstellar/" },
    artist:  { label:"The Pact",           name:"Kip Thorne",                    work:"the deal",                why:"His two conditions: nothing violates established physics; every speculation springs from real science.", link:"/references/kip-thorne/" },
    show:    { label:"The Ancestor",       name:"Contact (1985)",                work:"Sagan's novel",           why:"The wormhole Thorne worked out for Contact seeded the one in this film.", link:"/references/contact/" }
  },
  {
    num: "003", theme: "Interstellar", date: "2026-06-10",
    intro: "Interstellar week, Wednesday — <em>the wormhole.</em> Before the black hole, the film asks you to accept one thing: a tunnel through spacetime can exist, you could survive it, and it looks nothing like the movies told you.",
    music:   { label:"Einstein–Rosen, 1935", name:"Einstein & Rosen",         work:"the first bridge",           why:"Trying to rid physics of singularities, they found two sheets of spacetime joined by a \"bridge\" — the first wormhole, though they thought no one could cross it.", link:"/references/the-wormhole/" },
    film:    { label:"The Sphere, Not the Hole", name:"the VFX team & Thorne", work:"visualizing the wormhole",   why:"Thorne insisted it appear as a shimmering sphere — what relativity actually predicts you'd see — and the team published the ray-tracing math behind it.", link:"/references/interstellar-film/" },
    science: { label:"Making It Passable", name:"Morris & Thorne, 1988",       work:"the traversable wormhole",   why:"The 1935 bridge was a wall, not a door; their 1988 paper first worked out how one could be wide, stable, and gentle enough to survive.", link:"/references/the-wormhole/" },
    book:    { label:"Exotic Matter", name:"Kip Thorne",                       work:"The Science of Interstellar", why:"Holding a wormhole open needs matter with negative energy — \"exotic matter\" — and no one knows whether nature permits enough of it.", link:"/references/kip-thorne/" },
    artist:  { label:"The Namer", name:"John Wheeler",                         work:"coined \"wormhole,\" 1957",   why:"Wheeler named the thing, and imagined \"quantum foam\" — spacetime at the tiniest scale riddled with wormholes winking in and out.", link:"/references/the-wormhole/" },
    show:    { label:"Fold the Paper", name:"Romilly's napkin",                work:"the on-screen lecture",      why:"Fold the paper so two points touch, push a pencil through: the whole idea in one gesture — a tunnel you exit alive, unlike a black hole's dead end.", link:"/references/interstellar-film/" }
  },
  {
    num: "004", theme: "Interstellar", date: "2026-06-11",
    intro: "Interstellar week, Thursday — <em>Gargantua.</em> Six ways into the black hole at the film's center: the physics is real, the rendering set a world record, and the very center stays unknown.",
    music:   { label:"The Event Horizon", name:"Hans Zimmer",           work:"\"Detach\" (OST)",            why:"As they cross the point where no signal returns, the Temple Church organ swells into a threshold as final as the horizon itself.", link:"/references/interstellar-soundtrack/" },
    film:    { label:"The DNGR Render", name:"Double Negative & Thorne", work:"the black hole on screen",   why:"Built from Thorne's equations, the renderer earned the Guinness record for the most accurate black hole on film — with one honest, documented compromise: the Doppler beaming asymmetry softened, for clarity.", link:"https://www.guinnessworldrecords.com/world-records/418612-most-scientifically-accurate-black-hole-in-a-movie" },
    science: { label:"Gravitational Lensing", name:"the wrapped disk",  work:"why it's above and below",   why:"Gargantua bends the far side of the accretion disk up and over the shadow — so you see the same disk twice, around the equator and arching overhead.", link:"/references/gravitational-lensing/" },
    book:    { label:"The Singularity", name:"Kip Thorne",              work:"The Science of Interstellar", why:"At the center, relativity predicts infinite curvature and then breaks down — the one place the film's science is honestly speculation.", link:"/references/kip-thorne/" },
    artist:  { label:"The Disk, Real", name:"Event Horizon Telescope", work:"M87*, 2019",                 why:"Five years after Gargantua, 200+ scientists photographed a real black hole — brighter on one side from Doppler beaming, the asymmetry the film left out.", link:"/references/gravitational-lensing/" },
    show:    { label:"Near-Maximal Spin", name:"the Kerr limit",        work:"~99.8% of maximum",          why:"Gargantua must spin almost as fast as physics allows — only that extreme keeps Miller's planet in its close, time-warped orbit.", link:"/references/kerr-metric/" }
  },
  {
    num: "005", theme: "Interstellar", date: "2026-06-12",
    intro: "Interstellar week, Friday — <em>time.</em> Not the abstract kind — the kind that costs you your daughter's childhood while you step off a ship.",
    music:   { label:"The Ticking Clock", name:"Hans Zimmer",          work:"\"Mountains\" (OST)",         why:"Built on a ticking pulse — each tick a day passing on Earth — so you feel the dilation before you understand it.", link:"/references/interstellar-soundtrack/" },
    film:    { label:"The Cost", name:"the reunion",                   work:"Cooper & Murph",             why:"He comes back younger than his dying, elderly daughter — the twin effect dramatized so exactly Thorne checked the math for years.", link:"/references/interstellar-film/" },
    science: { label:"The Math of It", name:"Kip Thorne",              work:"The Science of Interstellar", why:"He works out the exact conditions — a huge, near-maximally-spinning Gargantua — that make Miller's planet's 60,000× dilation \"marginally possible.\"", link:"/references/kip-thorne/" },
    book:    { label:"The Twin Paradox", name:"Einstein / Langevin",   work:"the 1911 thought experiment", why:"Relativity says the traveler returns younger than the one who stayed — the physics that makes Cooper and Murph's reunion a tragedy, not a miracle.", link:"/references/time-dilation/" },
    artist:  { label:"Time Made Liquid", name:"Salvador Dalí",         work:"The Persistence of Memory (1931)", why:"The melting watches have been popularly read as time refusing to stay rigid — though Dalí credited the image to a vision of melting Camembert, not Einstein. Whatever the source, the resonance with relativity outlasted his disclaimer.", link:"/references/persistence-of-memory/" },
    show:    { label:"Time as Family", name:"Dark",                    work:"Netflix (2017–2020)",        why:"Where Interstellar separates a father and daughter across decades, Dark loops time until characters parent themselves — time's violence on family, taken further.", link:"/references/dark/" }
  },
  {
    num: "006", theme: "Interstellar", date: "2026-06-13",
    intro: "Interstellar week, Saturday — <em>the summit.</em> Where the beauty dissolves into the machinery: a two-page 1963 paper, a renderer built on geodesics, and one honest physicist who labels his own climax \"speculation.\"",
    music:   { label:"The Kerr Metric", name:"Roy Kerr, 1963",        work:"the spinning-hole solution", why:"In two pages, Kerr solved Einstein's equations for a rotating mass — the one object that governs every spinning black hole, Gargantua included.", link:"/references/kerr-metric/" },
    film:    { label:"The Renderer", name:"DNGR",                     work:"ray-bundles through spacetime", why:"Instead of one ray per pixel, it pushed whole bundles through Kerr geometry — the first IMAX-grade images of a physically correct spinning black hole.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    science: { label:"The Paper from the Movie", name:"James, von Tunzelmann, Franklin & Thorne", work:"Class. Quantum Gravity, 2015", why:"Run as a research instrument, the renderer found caustics near a fast-spinning hole make up to 13 images of one star — a real result the VFX set up.", link:"https://arxiv.org/abs/1502.03808" },
    book:    { label:"The Equations, Shown", name:"Kip Thorne",        work:"The Science of Interstellar", why:"He walks every established result equation by equation, then draws a hard line: the bulk, the tesseract — labeled, explicitly, an educated guess.", link:"/references/kip-thorne/" },
    artist:  { label:"The Man Who Found It", name:"Roy Kerr",         work:"and the 2023 stability proof", why:"Kerr found his solution by spotting the flaw in a proof it couldn't exist — and six decades later, mathematicians proved Kerr black holes are stable.", link:"/references/kerr-metric/" },
    show:    { label:"The Honest Edge", name:"truth / guess / speculation", work:"Thorne's own taxonomy",  why:"He sorts the film's science into three tiers, so you know exactly where established physics ends and the story takes over.", link:"https://www.sciencefriday.com/articles/truth-educated-guesses-and-speculations-in-interstellar/" }
  },
  {
    num: "007", theme: "Interstellar", date: "2026-06-14",
    intro: "Interstellar week, Sunday — <em>the synthesis.</em> A week of equations earns you this: not more rigor, but the view from the top — what it means when you put the math down and look out.",
    music:   { label:"The Score's Heart", name:"Hans Zimmer",         work:"\"Cornfield Chase\" (OST)",   why:"Written in one night as his idea of fatherhood — a piano sketch he played for Nolan, who then revealed the film's entire plot in response. The Harrison & Harrison organ at Temple Church gave the score its final voice.", link:"/references/interstellar-soundtrack/" },
    film:    { label:"Love Across Spacetime", name:"Brand's speech",  work:"the film's emotional thesis", why:"The film's most debated line argues love transcends time and space — poetry doing what physics can't. A theme, not a fact, and the film knows it.", link:"/references/interstellar-film/" },
    science: { label:"Knowledge, Given Away", name:"the 2015 paper",  work:"art that became research",    why:"The renderer was precise enough to yield a peer-reviewed result — so the art became science, and the knowledge was published, free to all.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    book:    { label:"The Human in the Equations", name:"Kip Thorne", work:"The Science of Interstellar", why:"His rules kept the science serving the story; the book is the receipt — every idea labeled truth, guess, or speculation, because he thought you deserved to know.", link:"/references/kip-thorne/" },
    artist:  { label:"The Cosmic Perspective", name:"Carl Sagan",     work:"Pale Blue Dot (1994)",        why:"From six billion kilometers, Earth is \"a mote of dust suspended in a sunbeam\" — Sagan turned our smallness into an argument for kindness.", link:"/references/carl-sagan/" },
    show:    { label:"Why We Go", name:"Cooper's creed",              work:"the explorer's faith",       why:"That we're defined by overcoming the impossible, our destiny ahead and not behind — the drive a film about equations can still make a room go silent. (A theme, not a fact.)", link:"/references/interstellar-film/" }
  }
  // ← stack more themed days here (one object per day, in order). They auto-appear on their date.
];

(function () {
  const mount = document.getElementById("the-daily");
  if (!mount) return;

  // today's index — the day rolls at ROLLOVER_HOUR (04:00) local, not midnight
  const MS = 86400000;
  const start = new Date(DAILY_START + "T00:00:00").getTime() + ROLLOVER_HOUR * 3600000;
  let idx = Math.floor((Date.now() - start) / MS);
  if (idx < 0) idx = 0;
  if (idx >= DAILY.length) idx = DAILY.length - 1;   // hold the last until the queue is topped up
  // preview override: /?date=YYYY-MM-DD or /?day=N (1-based) shows any day before it rotates
  const _p = new URLSearchParams(location.search);
  const _pd = _p.get("date"), _pn = _p.get("day");
  if (_pd) { const i = DAILY.findIndex(x => x.date === _pd); if (i >= 0) idx = i; }
  else if (_pn) { const i = parseInt(_pn, 10) - 1; if (i >= 0 && i < DAILY.length) idx = i; }
  const d = DAILY[idx];

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function card(label, verb, e) {
    if (!e) return "";
    const lbl = e.label || label;   // per-figure label override; falls back to the default slot label
    const work = e.work ? ` — ${esc(e.work)}` : "";
    return `<a class="card" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">
      <span class="chip">${esc(lbl)}</span>
      <span class="k">${esc(e.name)}${work}</span>
      <span class="d">${esc(e.why)}</span>
      <span class="go">${verb} →</span>
    </a>`;
  }

  mount.innerHTML = `
    <style>
      #the-daily{width:100%;max-width:980px;margin:0 0 1.4rem;border:1px solid rgba(255,214,10,.34);
        background:rgba(255,214,10,.025);position:relative;overflow:hidden;padding:1.2rem 1.25rem 1.35rem}
      #the-daily::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:rgba(255,214,10,.5);
        box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.55)}
      .dly-top{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:.55rem}
      .dly-title{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#FFD60A;font-weight:600}
      .dly-date{font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:#8f8a73}
      .dly-intro{font-size:.9rem;color:#cbc6b4;line-height:1.55;margin:0 0 1.1rem}
      .dly-intro em{color:#FFD60A;font-style:italic}
      #the-daily .card .chip{position:static;align-self:flex-start;margin:0 0 .45rem}
    </style>
    <div class="dly-top"><span class="dly-title">Daily ${esc(d.num)} &middot; ${esc(d.theme)}</span><span class="dly-date">${esc(d.date)}</span></div>
    ${d.intro ? `<p class="dly-intro">${d.intro}</p>` : ""}
    <div class="grid">
      ${card("Music","listen",d.music)}
      ${card("Film","watch",d.film)}
      ${card("Science","explore",d.science)}
      ${card("Book","read",d.book)}
      ${card("Artist","see",d.artist)}
      ${card("Show","watch",d.show)}
    </div>
  `;
})();
