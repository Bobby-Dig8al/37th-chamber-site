/* daily-v2.js — The Daily, hybrid engine.
   Monday   = THE MAP     — 6-box grid (v1 behavior, unchanged)
   Tue–Sat  = DEEP DIVE   — one focused hero card for the day's standout
   Sunday   = DISPATCH    — magazine-style synthesis of the week

   BACKWARD-COMPAT: existing DAILY[] objects (no spotlight/deepWhy) work correctly on all days.
   NEW OPTIONAL FIELDS: spotlight (slot key), deepWhy (extended prose for Tue–Sat).
   NEW: WEEK_ARCS[] — one entry per week, keyed by Monday date. Sunday reads this.

   Preview any day: /?date=YYYY-MM-DD  or  /?day=N (1-based).
   The day rolls at ROLLOVER_HOUR (04:00) local.
   Bump the ?v= on <script src="/daily-v2.js?v=N"> on each edit. */

const DAILY_START   = "2026-06-08";   // DAILY[0] is this date — Daily 001 · Interstellar
const ROLLOVER_HOUR = 4;              // day flips at 04:00 local

/* ─────────────────────────────────────────────────────────────────────────────
   WEEK ARCS — one object per week, keyed by weekStart (Monday date).
   Required for Sunday DISPATCH render. Falls back to MAP if entry is absent.
   ───────────────────────────────────────────────────────────────────────────── */
const WEEK_ARCS = [
  {
    weekStart:  "2026-06-08",
    weekNum:    1,
    theme:      "Interstellar",
    synthesis:  `A wormhole that began as a blind date. Kip Thorne met Lynda Obst through Carl \
Sagan in 1980; together they carried a physics problem all the way to a $675M film twenty-five \
years later. This week moved through the people who built it, the math that held it honest \
(Einstein–Rosen, 1935; Morris–Thorne, 1988; Kerr, 1963), the rendering that turned geodesic \
equations into IMAX frames — and produced a real peer-reviewed paper as a byproduct. The week \
ended where the science ends: at the singularity, where relativity breaks down and Thorne himself \
marks the line between established truth and educated guess.`,
    thread:     `Art served as a research instrument — the renderer was precise enough to yield a \
real result, published free, given away.`
  },
  {
    weekStart:  "TBD",
    weekNum:    2,
    theme:      "Dune",
    synthesis:  `Frank Herbert spent five years on the ecology, the religion, the language, and \
the politics before he wrote the plot. A 1957 trip to watch the US government attempt to stabilize \
Oregon's coastal sands with poverty grass handed him the engine: an ecosystem that fights back. \
Twenty-three publishers said no; Chilton Books — better known for auto-repair manuals — said yes \
in 1965. This week moved through Hans Zimmer's invented instruments and borrowed desert silence, \
the thermodynamics of a stillsuit, the closed biological loop of sandworm and spice, Herbert's own \
stated warning that charismatic leaders should carry a label on their foreheads, and the Arabic and \
Islamic scholarship that gave the Fremen their bones. It ended where Herbert always meant it to end: \
not with a hero's triumph, but with a sentence. "No more terrible disaster could befall your people \
than for them to fall into the hands of a Hero."`,
    thread:     `The world-building was the argument — Herbert built Arrakis so that the ecology \
would force the politics, and the politics would prove the warning.`
  }
  // add one object per week as the queue grows
];

/* ─────────────────────────────────────────────────────────────────────────────
   DAILY — one object per day, in chronological order.
   All v1 fields (num, theme, date, intro, music, film, science, book, artist, show) unchanged.
   New optional fields:
     spotlight: "music"|"film"|"science"|"book"|"artist"|"show"
                — which slot is the Tue–Sat hero. Absent → defaults to "music".
     deepWhy:   string — extended prose for the deep-dive card (~60–120 words).
                Absent → falls back to the spotlight slot's .why (shorter, still works).
   ───────────────────────────────────────────────────────────────────────────── */
const DAILY = [
  /* ── WEEK 1: INTERSTELLAR ─────────────────────────────────────────────── */
  {
    num: "001", theme: "Interstellar", date: "2026-06-08",
    // Monday → MAP render. spotlight/deepWhy are irrelevant on Mondays.
    intro: "Today, one true thread — <em>Interstellar.</em> Carl Sagan introduced Kip Thorne to editor Lynda Obst (~1980 blind date); she later became a Hollywood producer, and together they conceived the film twenty-five years on. Thorne's real physics built its wormhole and its black hole.",
    music:   { name:"Hans Zimmer",       work:"Interstellar (OST)",          why:"The organ that turns a docking scene into a prayer.", link:"https://open.spotify.com/album/3B61kSKTxlY36cYgzvf3cP" },
    film:    { name:"Christopher Nolan", work:"Interstellar",                why:"Love across spacetime, with the physics kept honest.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" },
    science: { name:"Kip Thorne",        work:"The Science of Interstellar", why:"Co-originated the film with producer Lynda Obst; his black-hole math rendered Gargantua — and produced real papers.", link:"https://en.wikipedia.org/wiki/Kip_Thorne" },
    book:    { name:"Carl Sagan",        work:"Contact",                     why:"Its wormhole was built by Thorne himself — the direct ancestor.", link:"https://en.wikipedia.org/wiki/Contact_(novel)" },
    artist:  { name:"Chesley Bonestell", work:"space art",                   why:"Father of space art; made the cosmos visible decades before any probe could.", link:"https://en.wikipedia.org/wiki/Chesley_Bonestell" },
    show:    { name:"Cosmos",            work:"Carl Sagan (1980)",           why:"Made a generation feel the universe.", link:"https://en.wikipedia.org/wiki/Cosmos:_A_Personal_Voyage" }
  },
  {
    num: "002", theme: "Interstellar", date: "2026-06-09",
    // Tuesday → DEEP DIVE. Spotlight: film (Lynda Obst — the producer who carried the idea).
    spotlight: "film",
    deepWhy: `Lynda Obst was a magazine editor when Carl Sagan set her up on a blind date with \
physicist Kip Thorne in 1980. She became a Hollywood producer — credits include Contact (1997). \
Twenty-five years after that introduction, she and Thorne co-wrote a treatment for what became \
Interstellar, shepherding it through Spielberg's development, a director change, and a studio \
transition before it reached Christopher Nolan. Without that 1980 dinner, there is no film.`,
    intro: "Interstellar week, day two — <em>how it got made.</em> Not the science yet — the people who carried a physics problem all the way to the screen.",
    music:   { label:"The Matchmaker",     name:"Carl Sagan",                    work:"the introduction",        why:"Sagan connected Kip Thorne to Lynda Obst — a blind date in 1980 that became the spark for the film, a quarter-century later.", link:"https://en.wikipedia.org/wiki/Carl_Sagan" },
    film:    { label:"The Producer",       name:"Lynda Obst",                    work:"a 2006 treatment",        why:"She and Thorne carried the idea from a treatment to the screen over years.", link:"https://en.wikipedia.org/wiki/Lynda_Obst" },
    science: { label:"The First Director", name:"Steven Spielberg",              work:"attached for years",      why:"Spielberg developed it first; when DreamWorks left Paramount for Disney in 2009, the film stayed at the studio while Spielberg moved on — and Jonathan Nolan recommended his brother Christopher.", link:"https://en.wikipedia.org/wiki/Steven_Spielberg" },
    book:    { label:"The Screenwriter",   name:"Jonathan Nolan",                work:"the early draft",         why:"Wrote the first script — and learned relativity to do it.", link:"https://en.wikipedia.org/wiki/Jonathan_Nolan" },
    artist:  { label:"The Pact",           name:"Kip Thorne",                    work:"the deal",                why:"His two conditions: nothing violates established physics; every speculation springs from real science.", link:"https://en.wikipedia.org/wiki/Kip_Thorne" },
    show:    { label:"The Ancestor",       name:"Contact (1985)",                work:"Sagan's novel",           why:"The wormhole Thorne worked out for Contact seeded the one in this film.", link:"https://en.wikipedia.org/wiki/Contact_(novel)" }
  },
  {
    num: "003", theme: "Interstellar", date: "2026-06-10",
    // Wednesday → DEEP DIVE. Spotlight: science (Morris & Thorne 1988 — the traversable wormhole).
    spotlight: "science",
    deepWhy: `Einstein and Rosen found the bridge in 1935 trying to eliminate singularities — but \
their construction was a wall, not a door: anything entering would hit a singularity before crossing. \
It took until 1988 for Morris and Thorne to work out the conditions for a traversable wormhole: wide \
enough to fit a ship, stable enough to survive the passage, gentle enough not to kill the crew. The \
price is exotic matter — material with negative energy density. Whether nature permits enough of it \
remains an open question. That honest uncertainty is what the film inherited.`,
    intro: "Interstellar week, Wednesday — <em>the wormhole.</em> Before the black hole, the film asks you to accept one thing: a tunnel through spacetime can exist, you could survive it, and it looks nothing like the movies told you.",
    music:   { label:"Einstein–Rosen, 1935", name:"Einstein & Rosen",         work:"the first bridge",           why:"Trying to rid physics of singularities, they found two sheets of spacetime joined by a 'bridge' — the first wormhole, though they thought no one could cross it.", link:"https://en.wikipedia.org/wiki/Einstein%E2%80%93Rosen_bridge" },
    film:    { label:"The Sphere, Not the Hole", name:"the VFX team & Thorne", work:"visualizing the wormhole",  why:"Thorne insisted it appear as a shimmering sphere — what relativity actually predicts you'd see — and the team published the ray-tracing math behind it.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" },
    science: { label:"Making It Passable", name:"Morris & Thorne, 1988",       work:"the traversable wormhole",  why:"The 1935 bridge was a wall, not a door; their 1988 paper first worked out how one could be wide, stable, and gentle enough to survive.", link:"https://en.wikipedia.org/wiki/Wormhole" },
    book:    { label:"Exotic Matter", name:"Kip Thorne",                       work:"The Science of Interstellar", why:"Holding a wormhole open needs matter with negative energy — 'exotic matter' — and no one knows whether nature permits enough of it.", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    artist:  { label:"The Namer", name:"John Wheeler",                         work:"coined 'wormhole,' 1957",   why:"Wheeler named the thing, and imagined 'quantum foam' — spacetime at the tiniest scale riddled with wormholes winking in and out.", link:"https://en.wikipedia.org/wiki/John_Archibald_Wheeler" },
    show:    { label:"Fold the Paper", name:"Romilly's napkin",                work:"the on-screen lecture",     why:"Fold the paper so two points touch, push a pencil through: the whole idea in one gesture — a tunnel you exit alive, unlike a black hole's dead end.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" }
  },
  {
    num: "004", theme: "Interstellar", date: "2026-06-11",
    // Thursday → DEEP DIVE. Spotlight: film (DNGR render — the Guinness record).
    spotlight: "film",
    deepWhy: `Double Negative built Gargantua from Thorne's equations, not artistic license. The \
renderer pushed whole bundles of light rays through Kerr geometry — the first IMAX-grade images of \
a physically correct spinning black hole. Two honest compromises were made: the Doppler beaming \
asymmetry (which makes one side of the accretion disk brighter) was softened, and lens flare was \
suppressed, for visual clarity. Guinness certified it the most scientifically accurate black hole in \
a film. The renderer was precise enough to surface a new astrophysical result — caustics near a \
fast-spinning hole can produce up to 13 images of a single star — which became a peer-reviewed paper.`,
    intro: "Interstellar week, Thursday — <em>Gargantua.</em> Six ways into the black hole at the film's center: the physics is real, the rendering set a world record, and the very center stays unknown.",
    music:   { label:"The Event Horizon", name:"Hans Zimmer",           work:"'Detach' (OST)",             why:"As they cross the point where no signal returns, the Temple Church organ swells into a threshold as final as the horizon itself.", link:"https://en.wikipedia.org/wiki/Interstellar_(soundtrack)" },
    film:    { label:"The DNGR Render", name:"Double Negative & Thorne", work:"the black hole on screen",  why:"Built from Thorne's equations, the renderer earned the Guinness record for the most accurate black hole on film — with two honest compromises: the Doppler beaming asymmetry softened and glare suppressed, for clarity.", link:"https://www.guinnessworldrecords.com/world-records/418612-most-scientifically-accurate-black-hole-in-a-movie" },
    science: { label:"Gravitational Lensing", name:"the wrapped disk",  work:"why it's above and below",  why:"Gargantua bends the far side of the accretion disk up and over the shadow — so you see the same disk twice, around the equator and arching overhead.", link:"https://en.wikipedia.org/wiki/Gravitational_lens" },
    book:    { label:"The Singularity", name:"Kip Thorne",              work:"The Science of Interstellar", why:"At the center, relativity predicts infinite curvature and then breaks down — the one place the film's science is honestly speculation.", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    artist:  { label:"The Disk, Real", name:"Event Horizon Telescope", work:"M87*, 2019",                 why:"Five years after Gargantua, 200+ scientists photographed a real black hole — brighter on one side from Doppler beaming, the asymmetry the film left out.", link:"https://en.wikipedia.org/wiki/Messier_87" },
    show:    { label:"Near-Maximal Spin", name:"the Kerr limit",        work:"~99.8% of maximum",          why:"Gargantua must spin almost as fast as physics allows — only that extreme keeps Miller's planet in its close, time-warped orbit.", link:"https://en.wikipedia.org/wiki/Kerr_metric" }
  },
  {
    num: "005", theme: "Interstellar", date: "2026-06-12",
    // Friday → DEEP DIVE. Spotlight: science (Kip Thorne's time-dilation math).
    spotlight: "science",
    deepWhy: `Thorne spent years checking the math behind the film's most emotionally devastating \
sequence: Cooper returns from Miller's planet younger than his dying daughter. The twin paradox — \
established relativity since Langevin's 1911 thought experiment — is real. But the specific \
conditions that produce a 60,000× time dilation (one hour on the surface equals seven years on \
Earth) require a huge, near-maximally-spinning black hole with an accretion disk hot enough to \
explain the radiation. Thorne concluded the scenario is "marginally possible" — the film's most \
extreme claim, and its most carefully checked.`,
    intro: "Interstellar week, Friday — <em>time.</em> Not the abstract kind — the kind that costs you your daughter's childhood while you step off a ship.",
    music:   { label:"The Ticking Clock", name:"Hans Zimmer",          work:"'Mountains' (OST)",          why:"Built on a ticking pulse — each tick a day passing on Earth — so you feel the dilation before you understand it.", link:"https://en.wikipedia.org/wiki/Interstellar_(soundtrack)" },
    film:    { label:"The Cost", name:"the reunion",                   work:"Cooper & Murph",             why:"He comes back younger than his dying, elderly daughter — the twin effect dramatized so exactly Thorne checked the math for years.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" },
    science: { label:"The Math of It", name:"Kip Thorne",              work:"The Science of Interstellar", why:"He works out the exact conditions — a huge, near-maximally-spinning Gargantua — that make Miller's planet's 60,000× dilation 'marginally possible.'", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    book:    { label:"The Twin Paradox", name:"Einstein / Langevin",   work:"the 1911 thought experiment", why:"Relativity says the traveler returns younger than the one who stayed — the physics that makes Cooper and Murph's reunion a tragedy, not a miracle.", link:"https://en.wikipedia.org/wiki/Twin_paradox" },
    artist:  { label:"Time Made Liquid", name:"Salvador Dalí",         work:"The Persistence of Memory (1931)", why:"The melting watches have been popularly read as time refusing to stay rigid — though Dalí credited the image to a vision of melting Camembert, not Einstein. Whatever the source, the resonance with relativity outlasted his disclaimer.", link:"https://en.wikipedia.org/wiki/The_Persistence_of_Memory" },
    show:    { label:"Time as Family", name:"Dark",                    work:"Netflix (2017–2020)",        why:"Where Interstellar separates a father and daughter across decades, Dark loops time until characters parent themselves — time's violence on family, taken further.", link:"https://en.wikipedia.org/wiki/Dark_(TV_series)" }
  },
  {
    num: "006", theme: "Interstellar", date: "2026-06-13",
    // Saturday → DEEP DIVE. Spotlight: science (Roy Kerr — the two-page solution).
    spotlight: "science",
    deepWhy: `In 1963 Roy Kerr solved Einstein's field equations for a rotating mass — two pages \
that produced the geometry governing every spinning black hole ever observed, Gargantua included. \
He found the solution by identifying the flaw in a proof it couldn't exist. Sixty years later, \
mathematicians proved Kerr black holes are stable under perturbations (2023). The renderer DNGR \
built for the film was a numerical integrator running light rays through this exact geometry at \
IMAX resolution — Thorne's equations, operationalized as an art instrument. The two-page paper \
is the quiet foundation under everything the week built.`,
    intro: "Interstellar week, Saturday — <em>the summit.</em> Where the beauty dissolves into the machinery: a two-page 1963 paper, a renderer built on geodesics, and one honest physicist who labels his own climax 'speculation.'",
    music:   { label:"The Kerr Metric", name:"Roy Kerr, 1963",        work:"the spinning-hole solution", why:"In two pages, Kerr solved Einstein's equations for a rotating mass — the one object that governs every spinning black hole, Gargantua included.", link:"https://en.wikipedia.org/wiki/Kerr_metric" },
    film:    { label:"The Renderer", name:"DNGR",                     work:"ray-bundles through spacetime", why:"Instead of one ray per pixel, it pushed whole bundles through Kerr geometry — the first IMAX-grade images of a physically correct spinning black hole.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    science: { label:"The Paper from the Movie", name:"James, von Tunzelmann, Franklin & Thorne", work:"Class. Quantum Gravity, 2015", why:"Run as a research instrument, the renderer found caustics near a fast-spinning hole make up to 13 images of one star — a real result the VFX set up.", link:"https://arxiv.org/abs/1502.03808" },
    book:    { label:"The Equations, Shown", name:"Kip Thorne",        work:"The Science of Interstellar", why:"He walks every established result equation by equation, then draws a hard line: the bulk, the tesseract — labeled, explicitly, an educated guess.", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    artist:  { label:"The Man Who Found It", name:"Roy Kerr",         work:"and the 2023 stability proof", why:"Kerr found his solution by spotting the flaw in a proof it couldn't exist — and 60 years later, mathematicians proved Kerr black holes are stable.", link:"https://www.britannica.com/biography/Roy-P-Kerr" },
    show:    { label:"The Honest Edge", name:"truth / guess / speculation", work:"Thorne's own taxonomy", why:"He sorts the film's science into three tiers, so you know exactly where established physics ends and the story takes over.", link:"https://www.sciencefriday.com/articles/truth-educated-guesses-and-speculations-in-interstellar/" }
  },
  {
    num: "007", theme: "Interstellar", date: "2026-06-14",
    // Sunday → DISPATCH render (reads WEEK_ARCS["2026-06-08"]).
    // The per-day fields are still used for the chapter rows inside the dispatch.
    spotlight: "book",   // used in the chapter row compact display
    intro: "Interstellar week, Sunday — <em>the synthesis.</em> A week of equations earns you this: not more rigor, but the view from the top — what it means when you put the math down and look out.",
    music:   { label:"The Score's Heart", name:"Hans Zimmer",         work:"'Cornfield Chase' (OST)",    why:"Written in one night as his idea of fatherhood — a piano sketch he played for Nolan, who then revealed the film's entire plot in response.", link:"https://en.wikipedia.org/wiki/Interstellar_(soundtrack)" },
    film:    { label:"Love Across Spacetime", name:"Brand's speech",  work:"the film's emotional thesis", why:"The film's most debated line argues love transcends time and space — poetry doing what physics can't. A theme, not a fact, and the film knows it.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" },
    science: { label:"Knowledge, Given Away", name:"the 2015 paper",  work:"art that became research",   why:"The renderer was precise enough to yield a peer-reviewed result — so the art became science, and the knowledge was published, free to all.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    book:    { label:"The Human in the Equations", name:"Kip Thorne", work:"The Science of Interstellar", why:"His rules kept the science serving the story; the book is the receipt — every idea labeled truth, guess, or speculation.", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    artist:  { label:"The Cosmic Perspective", name:"Carl Sagan",     work:"Pale Blue Dot (1994)",       why:"From six billion kilometers, Earth is 'a mote of dust suspended in a sunbeam' — Sagan turned our smallness into an argument for kindness.", link:"https://en.wikipedia.org/wiki/Pale_Blue_Dot" },
    show:    { label:"Why We Go", name:"Cooper's creed",              work:"the explorer's faith",       why:"That we're defined by overcoming the impossible, our destiny ahead and not behind. (A theme, not a fact.)", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" }
  },
  /* ── WEEK 2: DUNE ────────────────────────────────────────────────────── */
  {
    num: "008", theme: "Dune", date: "TBD",
    // Monday → MAP render. spotlight/deepWhy are irrelevant on Mondays.
    intro: "A new week, a new masterwork — <em>Dune.</em> Frank Herbert spent five years researching it after a 1957 trip over the shifting sands of the Oregon coast convinced him that an ecosystem could be the protagonist of a story. Twenty-three publishers rejected the manuscript before Chilton Books — better known for auto-repair manuals — said yes in 1965.",
    music:   { name:"Hans Zimmer",         work:"Dune (OST, 2021)",              why:"He spent months in Monument Valley to feel what Arrakis would sound like — then invented new instruments to say it.", link:"https://variety.com/2021/artisans/awards/hans-zimmer-dune-score-1235094486/" },
    film:    { name:"Denis Villeneuve",    work:"Dune: Part One (2021)",         why:"Before a single set was built, he and production designer Patrice Vermette flew over Jordan's Wadi Rum to build a visual bible — no greenscreen, no sci-fi chrome.", link:"https://en.wikipedia.org/wiki/Dune_(2021_film)" },
    science: { name:"Frank Herbert",       work:"the Oregon Dunes, 1957",        why:"A US government attempt to stabilize shifting coastal sands with poverty grass sparked five years of ecological research — and Arrakis.", link:"https://www.opb.org/article/2021/10/23/florence-oregon-movies-dune-frank-herbert-science-fiction-novels/" },
    book:    { name:"Frank Herbert",       work:"Dune (1965)",                   why:"Rejected by 23 publishers. Won the inaugural Nebula and tied for the Hugo. The first science-fiction novel built around an ecosystem.", link:"https://en.wikipedia.org/wiki/Dune_(novel)" },
    artist:  { name:"H. R. Giger",        work:"Jodorowsky's Dune (unbuilt)",   why:"Before Alien, Giger was designing for a 14-hour Dune film that never got made — and his visual DNA seeded a generation of sci-fi cinema.", link:"https://en.wikipedia.org/wiki/Jodorowsky%27s_Dune" },
    show:    { name:"Jodorowsky's Dune",  work:"documentary (2013)",            why:"The greatest film never made: a 2013 doc about how an unmade adaptation influenced Star Wars, Alien, and The Terminator.", link:"https://en.wikipedia.org/wiki/Jodorowsky%27s_Dune" }
  },
  {
    num: "009", theme: "Dune", date: "TBD",
    // Tuesday → DEEP DIVE. Spotlight: music (Zimmer's invented instruments + Monument Valley).
    spotlight: "music",
    deepWhy: `Hans Zimmer turned down Tenet to make Dune — Christopher Nolan's reaction was, \
in Zimmer's words, "not great." He then built instruments that don't exist: flutes from PVC \
plumbing pipe for a breathier, less resonant tone; asked cellist Tina Guo to play like a Tibetan \
warhorn. He hired vocalists Loire Cotler, Lisa Gerrard, and Edie Lehmann Boddicker to invent a \
new musical language over more than a year — drawing from Jewish niggun, South Indian vocal \
percussion, and Tuvan throat singing. Then he went alone into Monument Valley to check his \
instincts against real sand. Gerrard recorded her parts in a wardrobe closet in Brooklyn during \
COVID lockdown; the sound meant to echo off desert mountains was captured in coats and shelves.`,
    intro: "Dune week, day two — <em>the score.</em> Hans Zimmer turned down Tenet to make Dune. He then built instruments that don't exist, hired three vocalists to invent a new musical language, and went alone into Monument Valley to verify his instincts against real sand.",
    music:   { label:"The Invented Language",  name:"Loire Cotler, Lisa Gerrard & Edie Lehmann Boddicker", work:"Dune vocal ensemble",   why:"Over more than a year, with linguist David Peterson (who built Game of Thrones' languages), they devised chants drawn from Jewish niggun, South Indian vocal percussion, and Tuvan throat singing.", link:"https://variety.com/2021/artisans/awards/hans-zimmer-dune-score-1235094486/" },
    film:    { label:"The PVC Flute",          name:"Hans Zimmer",              work:"hybrid instruments",              why:"He built flutes from plumbing pipe for a breathier, less resonant sound, and asked cellist Tina Guo to play like a Tibetan warhorn.", link:"https://www.indiewire.com/features/general/dune-hans-zimmer-score-1234673017/" },
    science: { label:"The Desert Trip",        name:"Hans Zimmer",              work:"Monument Valley, Arizona",        why:"\"There was a moment when I disappeared into Monument Valley… to check the veracity of my ideas.\" The trip shaped which silences stayed in.", link:"https://variety.com/2021/artisans/awards/hans-zimmer-dune-score-1235094486/" },
    book:    { label:"The Wardrobe Session",   name:"Lisa Gerrard",             work:"\"Paul's Dream\" / \"Gom Jabbar\"", why:"She recorded her parts in a wardrobe closet in Brooklyn during COVID lockdown — sound meant to bounce off desert mountains captured in coats and shelves.", link:"https://www.brooklynvegan.com/yes-that-is-dead-can-dances-lisa-gerrard-on-the-dune-score/" },
    artist:  { label:"The Voice Behind the Voice", name:"Lisa Gerrard",        work:"Dead Can Dance",                  why:"Before Dune she defined timeless vocal mysticism with Dead Can Dance — a language-agnostic sound that was already halfway to Arrakis.", link:"https://en.wikipedia.org/wiki/Dead_Can_Dance" },
    show:    { label:"The Armenian Duduk",     name:"the duduk",                work:"a real instrument",               why:"Among the real-world instruments woven into the score, the Armenian duduk surfaces — its reed sound predating Western orchestras by millennia, making the future sound ancient.", link:"https://en.wikipedia.org/wiki/Duduk" }
  },
  {
    num: "010", theme: "Dune", date: "TBD",
    // Wednesday → DEEP DIVE. Spotlight: science (Herbert's desert ecology — stillsuit engineering).
    spotlight: "science",
    deepWhy: `Arrakis was not invented at a desk. Herbert built its ecology from real desert \
science: aeolian physics, sand-dune stabilization research, and the thermodynamics of water \
conservation. The stillsuit is a genuine engineering problem — with surface temperatures near \
350 K, water loss by evaporation is catastrophic, and Herbert worked out the numbers: capture \
every drop of sweat and breath through heat-exchange filtration. Barchan dunes — crescent-shaped, \
formed by unidirectional wind — can migrate more than 100 metres a year; Arrakis's great ergs \
follow the same physics. Herbert published Dune six years before the first Earth Day, treating \
a planet's ecology as the load-bearing structure of civilization. The planet is not the setting. \
It is the argument.`,
    intro: "Dune week, Wednesday — <em>the planet.</em> Arrakis was not invented at a desk. Herbert built its ecology from real desert science: aeolian physics, sand-dune stabilization research, and the thermodynamics of water conservation. The planet is the argument.",
    music:   { label:"The Moving Sands",       name:"barchan dunes",            work:"aeolian science",                 why:"Crescent-shaped barchan dunes — formed by wind blowing from one direction — can migrate more than 100 metres a year. Arrakis's great ergs follow the same physics.", link:"https://en.wikipedia.org/wiki/Dune" },
    film:    { label:"Wadi Rum as Arrakis",    name:"Denis Villeneuve",         work:"Jordan location shoot",           why:"He and Vermette flew over Wadi Rum in 2018; the deep ochres and scale of Jordan's valley became the template — practical plates that VFX extended, not replaced.", link:"https://www.moviemaker.com/dune-production-designer-patrice-vermette-denis-villeneuve/" },
    science: { label:"The Stillsuit",          name:"Herbert's water engineering", work:"evaporation thermodynamics",  why:"With Arrakis surface temperatures reaching ~350 K, water loss by evaporation is catastrophic. The stillsuit is a real engineering problem: capture every drop of sweat and breath through heat-exchange filtration. Herbert knew the numbers.", link:"https://www.cornellsun.com/article/2024/04/the-science-behind-arrakis-understanding-the-climate-and-ecosystem-of-dune" },
    book:    { label:"The First Eco-Novel",    name:"Frank Herbert",            work:"Dune (1965)",                    why:"Published six years before the first Earth Day, Dune treated a planet's ecology as the load-bearing structure of civilization — the first major SF novel to do so.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    artist:  { label:"The Stabilizers",        name:"US Soil Conservation Service", work:"Oregon Dunes, 1950s",       why:"Government researchers planting European beach grass to anchor shifting coastal dunes handed Herbert his central metaphor: humans engineering a landscape that fights back.", link:"https://www.opb.org/article/2021/10/23/florence-oregon-movies-dune-frank-herbert-science-fiction-novels/" },
    show:    { label:"Terraforming as Science", name:"NASA study, 1976",        work:"On the Habitability of Mars",    why:"The year Herbert published Children of Dune, NASA formally studied planetary ecosynthesis — the same problem Kynes and Leto II grapple with. Frontier science then, frontier science now. (Note: Mars terraforming remains theoretical.)", link:"https://en.wikipedia.org/wiki/Terraforming" }
  },
  {
    num: "011", theme: "Dune", date: "TBD",
    // Thursday → DEEP DIVE. Spotlight: science (the sandworm lifecycle — closed ecological loop).
    spotlight: "science",
    deepWhy: `Shai-Hulud is not a monster. It is a closed ecological loop: sandtrout surround \
underground water, keeping the desert arid; they metamorphose into sandworms that metabolize that \
pressure into melange as a metabolic byproduct; and melange makes interstellar civilization \
possible. Pull one thread and the universe unravels. The loop mirrors real nutrient cycles — \
mole crickets and cyanobacteria have been offered as loose real-world analogs. The worm's body \
uses ring segments (a nod to annelid biology) but its forward motion more closely resembles \
rectilinear locomotion, like a legless lizard hunting by sand vibration. Herbert layered European \
dragon mythology — armored, territorial, hoarding the planet's treasure — beneath the ecological \
logic to give Shai-Hulud its mythic weight.`,
    intro: "Dune week, Thursday — <em>the worm and the spice.</em> Shai-Hulud is not a monster. It is a closed ecological loop: sandtrout seal the planet's water underground, sandworms metabolize that pressure into melange, and melange makes interstellar civilization possible. Pull one thread and the universe unravels.",
    music:   { label:"The Sound of the Worm",  name:"Hans Zimmer",              work:"\"Ripple in the Sand\" (OST)",   why:"Low-frequency drones built from new synthesizer modules — you feel the worm before you see it. Physics as score: infrasound that moves through bodies the way a sandworm moves through dune.", link:"https://en.wikipedia.org/wiki/Music_of_Dune_(2021_film)" },
    film:    { label:"The Ring Segments",      name:"Patrice Vermette / VFX",   work:"sandworm design",               why:"The worm's body is arranged in ring segments — a nod to annelid biology — but its forward motion uses rectilinear locomotion closer to a legless lizard hunting by sand vibration.", link:"https://www.uc.edu/news/articles/2024/03/uc-biologist-sheds-light-on-biology-of-dunes-sandworms.html" },
    science: { label:"The Lifecycle",         name:"Frank Herbert",             work:"sandtrout → sandworm ecology", why:"Sandtrout surround underground water, keeping the desert arid. They metamorphose into sandworms that produce spice as a metabolic byproduct. A fictional closed loop that mirrors real nutrient cycles — mole crickets and cyanobacteria have been offered as a loose real-world analog.", link:"https://zenodo.org/records/10521778" },
    book:    { label:"The Oil Read",           name:"critics vs. Herbert",      work:"melange as resource metaphor", why:"Many readers see spice-as-oil — a scarce colonial resource extracted from a desert people. Herbert stated in Dune Genesis (1980) that water scarcity was his primary analog; the oil reading was layered on by history. Both sit in the text.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    artist:  { label:"The Dragon Lineage",    name:"Frank Herbert / Beowulf",   work:"the fire-drake archetype",     why:"Herbert drew on European dragon mythology — armored, territorial, hoarding the planet's treasure — to give Shai-Hulud its mythic weight beneath the ecological logic.", link:"https://en.wikipedia.org/wiki/Sandworm_(Dune)" },
    show:    { label:"Riding the Worm",        name:"the Fremen technique",     work:"thumper and maker hooks",      why:"Hooking a ring segment open to expose flesh to abrasive sand, then surfing the turn: a fictional survival technique built on actual knowledge of how large animals respond to irritant pressure.", link:"https://dune.fandom.com/wiki/Sandworm" }
  },
  {
    num: "012", theme: "Dune", date: "TBD",
    // Friday → DEEP DIVE. Spotlight: book (Herbert's stated warning — Paul as cautionary tale).
    spotlight: "book",
    deepWhy: `Herbert didn't write Paul Atreides as a hero. He wrote him as a cautionary tale — \
and was disturbed when readers missed it. "I wrote the Dune series because I had this idea that \
charismatic leaders ought to come with a warning label on their forehead: 'May be dangerous to \
your health.'" Dune Messiah (1969) exists because the first book's audience cheered for the jihad. \
Denis Villeneuve's Part Two earns its place closest to Herbert's intent: the camera watches \
Chani's doubt, not Paul's certainty. Ibn Khaldun mapped this cycle in the 14th century — desert \
tribes overthrowing decadent empires, then becoming the next decadent empire — and Herbert had \
read him. The messiah who succeeds becomes the next tyrant. That is not a plot twist. It is the \
thesis.`,
    intro: "Dune week, Friday — <em>the warning.</em> Herbert didn't write Paul Atreides as a hero. He wrote him as a cautionary tale — and was disturbed when readers missed it. Dune Messiah (1969) exists because the first book's audience cheered for the jihad.",
    music:   { label:"The Score's Ambivalence", name:"Hans Zimmer",             work:"\"Paul's Dream\" (OST)",         why:"The track that introduces Paul's prescient visions is not triumphant — it's unsettled, built on female voices that sound like prophecy as pressure, not gift.", link:"https://en.wikipedia.org/wiki/Music_of_Dune_(2021_film)" },
    film:    { label:"The Villeneuve Shift",   name:"Dune: Part Two (2024)",     work:"Paul as unreliable center",     why:"Where Part One holds Paul as a possible hero, Part Two reframes: the camera watches Chani's doubt, not Paul's certainty. The film earns its place closer to Herbert's intent than any prior adaptation.", link:"https://nerdist.com/article/dune-part-two-paul-atreides-character-framing-portrayal-close-to-frank-herbert-novels-not-a-hero/" },
    science: { label:"The Charisma Problem",   name:"Herbert's warning label",   work:"Dune Messiah (1969)",           why:"\"I wrote the Dune series because I had this idea that charismatic leaders ought to come with a warning label on their forehead: 'May be dangerous to your health.'\" — Frank Herbert.", link:"https://christandpopculture.com/dune-and-disaster-or-why-charismatic-leaders-should-come-with-a-warning-label/" },
    book:    { label:"The Villain Arc",       name:"Frank Herbert",              work:"Dune → Dune Messiah arc",       why:"Book one ends with Paul's military victory and the beginning of a galactic jihad. Herbert said that readers rooted for it — so he wrote the sequel to spell out what they had cheered for.", link:"https://en.wikipedia.org/wiki/Dune_Messiah" },
    artist:  { label:"The Trapped Prescient", name:"Ibn Khaldun (1332–1406)",   work:"cyclical theory of government", why:"The 14th-century Arab historian mapped the cycle of desert tribes overthrowing decadent empires — Herbert had read him, and built Paul's arc on that wheel. The messiah who succeeds becomes the next tyrant.", link:"https://en.wikipedia.org/wiki/Ibn_Khaldun" },
    show:    { label:"Cannot Transcend Transcendence", name:"Norman Spinrad",   work:"critical reading of Paul",      why:"Spinrad's formulation: Paul is trapped in his own myth and \"cannot achieve the grace of the Bodhisattva.\" He wants to stop the jihad. He cannot. That is the tragedy — not the loss.", link:"https://xenoswarm.wordpress.com/2015/12/22/dune-messiah-as-anti-hero/" }
  },
  {
    num: "013", theme: "Dune", date: "TBD",
    // Saturday → DEEP DIVE. Spotlight: science (Arabic/Islamic sources — Muad'Dib etymology).
    spotlight: "science",
    deepWhy: `Herbert spent years reading the Qur'an, Arab history, and Ibn Khaldun before he \
wrote a word of the Fremen. The name Muad'Dib is nearly identical to the Arabic mu'addib — \
"educator," "he who teaches good manners" — chosen deliberately for a character the Fremen would \
call "instructor-of-boys." The ZenSunni faith is a reasoned projection: what might Zen Buddhism \
and Sunni Islam produce after ten thousand years of diaspora? David Peterson (who built Dothraki \
and High Valyrian for Game of Thrones) rendered the Fremen's Chakobsa as a fully-fledged \
constructed language rooted in Herbert's Arabic-influenced vocabulary. Greig Fraser won the 2022 \
Oscar for Best Cinematography on Part One and shot Part Two entirely in IMAX — giving the \
scholarship a visual scale to match.`,
    intro: "Dune week, Saturday — <em>the foundations.</em> Herbert spent years reading the Qur'an and studying Arab history. The Fremen are not a single culture pasted on a desert — they are a structural synthesis of Bedouin, Sufi, and Zendiq traditions, built into the novel's bones.",
    music:   { label:"The Fremen Tongue",     name:"David Peterson",            work:"Chakobsa language (2021 film)", why:"The linguist who built Dothraki and High Valyrian for Game of Thrones rendered the Fremen's Chakobsa as a fully-fledged constructed language rooted in Herbert's Arabic-influenced vocabulary.", link:"https://winteriscoming.net/posts/the-guy-who-made-dothraki-for-game-of-thrones-crafted-the-fremen-language-for-dune-01hqrjezfkxf" },
    film:    { label:"The Photograph Never Taken", name:"Greig Fraser ASC ACS", work:"Dune: Part One (2021)",        why:"Fraser won the 2022 Oscar for Best Cinematography on Part One; Part Two was shot entirely in IMAX, adopting large-format spherical lensing throughout.", link:"https://britishcinematographer.co.uk/greig-fraser-asc-acs-dune-part-two/" },
    science: { label:"Muad'Dib, the Teacher", name:"Arabic etymology",          work:"the name Herbert chose",       why:"Paul's Fremen name is nearly identical to the Arabic mu'addib — 'educator,' 'he who teaches good manners.' Herbert, who studied Arabic and Islamic philosophy, chose it deliberately.", link:"https://baheyeldin.com/literature/arabic-and-islamic-themes-in-frank-herberts-dune.html" },
    book:    { label:"The ZenSunni Faith",    name:"Frank Herbert",             work:"the Fremen religion",          why:"Herbert built the Fremen's ZenSunni faith as a synthesis of Zen Buddhism and Sunni Islam — not caricature, but a reasoned projection of what a people carrying those traditions across ten thousand years of diaspora might practice.", link:"https://en.wikipedia.org/wiki/Dune_(novel)" },
    artist:  { label:"Lawrence of Arabia",    name:"David Lean (1962)",          work:"cinematic source",            why:"Herbert cited the 1962 film as an influence — a Western outsider among desert people, adopted, mythologized, and ultimately an engine of violence he could not fully control. Paul's arc rhymes.", link:"https://en.wikipedia.org/wiki/Lawrence_of_Arabia_(film)" },
    show:    { label:"The Jihad as Anti-Gift", name:"Herbert on colonialism",    work:"the Fremen's stolen narrative", why:"The Fremen are the people with ancient knowledge of their planet. The outsider arrives, is adopted, becomes their messiah, and leads them into a war that serves his purposes. Herbert wanted you to notice that structure — and to be uncomfortable.", link:"https://www.slashfilm.com/638538/the-oil-must-flow-how-does-denis-villeneuves-dune-deal-with-the-books-middle-east-inspirations/" }
  },
  {
    num: "014", theme: "Dune", date: "TBD",
    // Sunday → DISPATCH render (reads WEEK_ARCS for the Dune weekStart).
    // The per-day fields are still used for chapter rows inside the dispatch.
    spotlight: "book",   // used in the chapter row compact display
    intro: "Dune week, Sunday — <em>the synthesis.</em> A week built around one question: how do you build a world with real weight? Herbert's answer: spend five years on the ecology, the religion, the language, and the politics before you write the plot. Let the system generate the story.",
    music:   { label:"The Score as System", name:"Hans Zimmer",                 work:"the whole OST as an ecology",   why:"Like the novel, the score is designed as a closed system — vocal languages, invented instruments, real desert acoustics. Remove one element and the whole thing shifts. Same principle Herbert used on Arrakis.", link:"https://en.wikipedia.org/wiki/Music_of_Dune_(2021_film)" },
    film:    { label:"The Adaptation Problem", name:"Denis Villeneuve",          work:"Part One + Part Two, together",  why:"It took two films — five hours — to carry the first novel. That is the measure of how much Herbert actually built. Villeneuve earned the assignment by treating the book as an architecture problem, not a plot problem.", link:"https://en.wikipedia.org/wiki/Dune:_Part_Two" },
    science: { label:"Ecology as Ethics",    name:"Frank Herbert",               work:"Dune as ecocritical text",      why:"Published before the environmental movement had a name, Dune argued that you cannot separate politics, religion, and ecology — that resource control is always also moral control. The ecology is the ethics.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    book:    { label:"The Sequels as Correction", name:"Frank Herbert",          work:"Dune Messiah → God Emperor",   why:"Herbert wrote five sequels specifically to correct readers' misreadings of Paul as hero. The series is a philosophical argument in six volumes — each book tightening the critique, each protagonist showing what unchecked power does next.", link:"https://en.wikipedia.org/wiki/Dune_(franchise)" },
    artist:  { label:"The First Time",       name:"Kyle MacLachlan",             work:"David Lynch's Dune (1984)",     why:"Lynch's film was a box-office disaster — and MacLachlan's debut. It took forty years and two Villeneuve films to show the novel's full shape. Some worlds need time to find the right door.", link:"https://en.wikipedia.org/wiki/Dune_(1984_film)" },
    show:    { label:"The One Line",         name:"Frank Herbert",               work:"the warning, restated",         why:"\"No more terrible disaster could befall your people than for them to fall into the hands of a Hero.\" That is the novel's argument. Everything Herbert built — the worm, the spice, the messiah — exists to make that sentence land.", link:"https://www.goodreads.com/quotes/10128956-i-wrote-the-dune-series-because-i-had-this-idea" }
  }
  // ← stack more themed days here. They auto-appear on their date.
];

/* ─────────────────────────────────────────────────────────────────────────────
   ENGINE — read-only below; all editorial decisions live in DAILY[] + WEEK_ARCS[]
   ───────────────────────────────────────────────────────────────────────────── */

(function () {
  const mount = document.getElementById("the-daily");
  if (!mount) return;

  /* ── Date resolution (identical to v1) ─────────────────────────────────── */
  const MS   = 86400000;
  const startMs = new Date(DAILY_START + "T00:00:00").getTime() + ROLLOVER_HOUR * 3600000;
  let idx = Math.floor((Date.now() - startMs) / MS);
  if (idx < 0) idx = 0;
  if (idx >= DAILY.length) idx = DAILY.length - 1;

  const _p  = new URLSearchParams(location.search);
  const _pd = _p.get("date"), _pn = _p.get("day");
  if (_pd) { const i = DAILY.findIndex(x => x.date === _pd); if (i >= 0) idx = i; }
  else if (_pn) { const i = parseInt(_pn, 10) - 1; if (i >= 0 && i < DAILY.length) idx = i; }

  const d       = DAILY[idx];
  const dayDate = new Date(d.date + "T" + String(ROLLOVER_HOUR).padStart(2, "0") + ":00:00");

  /* ── Render mode by day-of-week ──────────────────────────────────────────
     0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat  */
  const dow  = dayDate.getDay();
  const mode = dow === 1 ? "map" : dow === 0 ? "dispatch" : "deepdive";

  /* ── Utilities ────────────────────────────────────────────────────────── */
  const esc = s => String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");

  const SLOT_LABELS  = ["music","film","science","book","artist","show"];
  const SLOT_VERBS   = { music:"listen", film:"watch", science:"explore",
                         book:"read", artist:"see", show:"watch" };
  const SLOT_DISPLAY = { music:"Music", film:"Film", science:"Science",
                         book:"Book", artist:"Artist", show:"Show" };

  /* ── Shared: one standard card (v1 format, used in MAP + dispatch chapter rows) ── */
  function renderCard(slot, e) {
    if (!e) return "";
    const lbl  = e.label  || SLOT_DISPLAY[slot];
    const verb = SLOT_VERBS[slot] || "explore";
    const work = e.work ? ` — ${esc(e.work)}` : "";
    return `<a class="card" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">
      <span class="chip">${esc(lbl)}</span>
      <span class="k">${esc(e.name)}${work}</span>
      <span class="d">${esc(e.why)}</span>
      <span class="go">${esc(verb)} →</span>
    </a>`;
  }

  /* ── MAP render (Monday — identical to v1) ────────────────────────────── */
  function renderMap(day) {
    return `
      <div class="dly-top">
        <span class="dly-title">Daily ${esc(day.num)} &middot; ${esc(day.theme)}</span>
        <span class="dly-date">${esc(day.date)}</span>
      </div>
      ${day.intro ? `<p class="dly-intro">${day.intro}</p>` : ""}
      <div class="grid">
        ${SLOT_LABELS.map(s => renderCard(s, day[s])).join("")}
      </div>`;
  }

  /* ── DEEP DIVE render (Tuesday–Saturday) ────────────────────────────────
     Hero: the spotlight slot. Below: compact "also today" pill row. */
  function renderDeepDive(day) {
    const spotKey  = (day.spotlight && day[day.spotlight]) ? day.spotlight : "music";
    const spotSlot = day[spotKey];
    const verb     = SLOT_VERBS[spotKey] || "explore";
    const lbl      = spotSlot.label || SLOT_DISPLAY[spotKey];
    const work     = spotSlot.work ? ` — ${esc(spotSlot.work)}` : "";
    const whyText  = day.deepWhy ? esc(day.deepWhy) : esc(spotSlot.why);

    // "also today" row — all six slots except the spotlight, rendered as dim chips with names
    const alsoChips = SLOT_LABELS
      .filter(s => s !== spotKey && day[s])
      .map(s => {
        const e = day[s];
        const n = e.label || SLOT_DISPLAY[s];
        return `<a class="dly-also-chip" href="${esc(e.link)}" target="_blank" rel="noopener" title="${esc(e.why)}">${esc(n)}: ${esc(e.name)}</a>`;
      }).join("");

    return `
      <div class="dly-top">
        <span class="dly-title">Daily ${esc(day.num)} &middot; ${esc(day.theme)}</span>
        <span class="dly-date">${esc(day.date)}</span>
      </div>
      ${day.intro ? `<p class="dly-intro">${day.intro}</p>` : ""}
      <a class="dly-deepdive" href="${esc(spotSlot.link)}" target="_blank" rel="noopener noreferrer">
        <span class="chip">${esc(lbl)}</span>
        <span class="dly-dd-name">${esc(spotSlot.name)}${work}</span>
        <p class="dly-dd-why">${whyText}</p>
        <span class="go">${esc(verb)} →</span>
      </a>
      ${alsoChips ? `<div class="dly-also"><span class="dly-also-label">Also today</span>${alsoChips}</div>` : ""}`;
  }

  /* ── DISPATCH render (Sunday) ──────────────────────────────────────────
     Finds the week's WEEK_ARCS entry + all 7 DAILY entries for the week.
     Falls back to MAP if no WEEK_ARCS entry exists. */
  function getMondayOf(date) {
    // Returns YYYY-MM-DD of the Monday on or before `date`
    const d2 = new Date(date.getTime());
    const dow2 = d2.getDay(); // 0=Sun
    const offset = dow2 === 0 ? 6 : dow2 - 1; // days back to Monday
    d2.setDate(d2.getDate() - offset);
    return d2.toISOString().slice(0, 10);
  }

  function renderDispatch(currentDay, currentDate) {
    const mondayStr = getMondayOf(currentDate);
    const arc       = WEEK_ARCS.find(w => w.weekStart === mondayStr);

    if (!arc) {
      // No arc authored yet — graceful fallback to MAP
      return renderMap(currentDay);
    }

    // Collect all days in this week from DAILY[]
    const weekDays = DAILY.filter(x => {
      if (!x.date) return false;
      const ds  = new Date(x.date + "T12:00:00");
      const mon = getMondayOf(ds);
      return mon === mondayStr;
    });

    // Week masthead
    let html = `
      <div class="dly-top">
        <span class="dly-title">Week ${esc(String(arc.weekNum))} &middot; ${esc(arc.theme)} &middot; Sunday Dispatch</span>
        <span class="dly-date">${esc(currentDay.date)}</span>
      </div>
      <p class="dly-intro">${esc(arc.synthesis)}</p>
      <div class="dly-rule"></div>`;

    // Chapter rows — one per day in the week
    for (const wd of weekDays) {
      const wdDate   = new Date(wd.date + "T12:00:00");
      const wdDow    = wdDate.getDay();
      const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const dayLabel = `Daily ${esc(wd.num)} &middot; ${esc(dayNames[wdDow])} ${esc(wd.date)}`;

      if (wdDow === 1) {
        // Monday: compact 6-box grid
        html += `
          <div class="dly-chapter">
            <div class="dly-dateline">${dayLabel} &middot; The Map</div>
            ${wd.intro ? `<p class="dly-ch-intro">${wd.intro}</p>` : ""}
            <div class="grid dly-grid-compact">
              ${SLOT_LABELS.map(s => renderCard(s, wd[s])).join("")}
            </div>
          </div>`;
      } else {
        // Tue–Sat: spotlight card + also-today row (compact)
        const spotKey  = (wd.spotlight && wd[wd.spotlight]) ? wd.spotlight : "music";
        const spotSlot = wd[spotKey];
        const verb     = SLOT_VERBS[spotKey] || "explore";
        const slotLbl  = spotSlot.label || SLOT_DISPLAY[spotKey];
        const work2    = spotSlot.work ? ` — ${esc(spotSlot.work)}` : "";
        const whyText2 = wd.deepWhy ? esc(wd.deepWhy) : esc(spotSlot.why);

        const alsoChips2 = SLOT_LABELS
          .filter(s => s !== spotKey && wd[s])
          .map(s => {
            const e = wd[s];
            const n = e.label || SLOT_DISPLAY[s];
            return `<span class="dly-also-chip dly-also-plain" title="${esc(e.why)}">${esc(n)}: ${esc(e.name)}</span>`;
          }).join("");

        html += `
          <div class="dly-chapter">
            <div class="dly-dateline">${dayLabel}</div>
            ${wd.intro ? `<p class="dly-ch-intro">${wd.intro}</p>` : ""}
            <a class="dly-deepdive dly-dd-compact" href="${esc(spotSlot.link)}" target="_blank" rel="noopener noreferrer">
              <span class="chip">${esc(slotLbl)}</span>
              <span class="dly-dd-name">${esc(spotSlot.name)}${work2}</span>
              <p class="dly-dd-why">${whyText2}</p>
              <span class="go">${esc(verb)} →</span>
            </a>
            ${alsoChips2 ? `<div class="dly-also"><span class="dly-also-label">Also</span>${alsoChips2}</div>` : ""}
          </div>`;
      }
    }

    // Closing thread line
    if (arc.thread) {
      html += `<div class="dly-rule"></div><p class="dly-thread">${esc(arc.thread)}</p>`;
    }

    return html;
  }

  /* ── Styles (scoped to #the-daily) ──────────────────────────────────────
     v1 base styles are preserved. v2 adds dly-* rules for new render modes. */
  const styles = `
    /* ── v1 base (unchanged) ── */
    #the-daily{width:100%;max-width:980px;margin:0 0 1.4rem;border:1px solid rgba(255,214,10,.34);
      background:rgba(255,214,10,.025);position:relative;overflow:hidden;padding:1.2rem 1.25rem 1.35rem}
    #the-daily::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
      background:rgba(255,214,10,.5);
      box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.55)}
    .dly-top{display:flex;align-items:baseline;justify-content:space-between;
      gap:1rem;flex-wrap:wrap;margin-bottom:.55rem}
    .dly-title{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;
      color:#FFD60A;font-weight:600}
    .dly-date{font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:#8f8a73}
    .dly-intro{font-size:.9rem;color:#cbc6b4;line-height:1.55;margin:0 0 1.1rem}
    .dly-intro em{color:#FFD60A;font-style:italic}
    #the-daily .card .chip{position:static;align-self:flex-start;margin:0 0 .45rem}

    /* ── v2: DEEP DIVE hero card ── */
    .dly-deepdive{display:flex;flex-direction:column;gap:.6rem;text-decoration:none;color:inherit;
      width:100%;border:1px solid rgba(255,214,10,.4);background:rgba(255,214,10,.03);
      padding:1.5rem 1.5rem 1.35rem;position:relative;overflow:hidden;transition:.16s ease;
      margin-bottom:1rem}
    .dly-deepdive::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
      background:#0E44FF;
      box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.6)}
    .dly-deepdive:hover{border-color:#FFD60A;background:rgba(255,214,10,.06);transform:translateY(-2px)}
    .dly-dd-name{font-size:clamp(1.4rem,4vw,2rem);letter-spacing:.04em;text-transform:uppercase;
      color:#FFD60A;font-weight:600;line-height:1.1}
    .dly-dd-why{font-size:.96rem;line-height:1.62;color:#f3eede;max-width:52rem;margin:0}
    .dly-deepdive .go{font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:#8f8a73}
    .dly-deepdive:hover .go{color:#FFD60A}
    .dly-deepdive .chip{position:static;align-self:flex-start;margin:0 0 .35rem}

    /* compact variant inside dispatch chapters */
    .dly-dd-compact{padding:1.1rem 1.25rem 1rem;margin-bottom:.7rem}
    .dly-dd-compact .dly-dd-name{font-size:clamp(1.1rem,3vw,1.5rem)}
    .dly-dd-compact .dly-dd-why{font-size:.9rem}

    /* ── v2: also-today row ── */
    .dly-also{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .55rem;
      margin-top:.1rem;margin-bottom:.5rem}
    .dly-also-label{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;
      color:#8f8a73;margin-right:.3rem}
    .dly-also-chip{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;
      color:#8f8a73;border:1px solid rgba(143,138,115,.3);padding:.14rem .45rem;
      border-radius:2px;text-decoration:none;transition:color .14s,border-color .14s;white-space:nowrap}
    .dly-also-chip:hover{color:#FFD60A;border-color:rgba(255,214,10,.5)}
    .dly-also-plain{cursor:default}
    .dly-also-plain:hover{color:#8f8a73;border-color:rgba(143,138,115,.3)}

    /* ── v2: DISPATCH layout ── */
    .dly-rule{width:100%;height:2px;background:#0E44FF;border-radius:2px;margin:1.3rem 0;
      box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.6),0 0 38px rgba(14,68,255,.32)}
    .dly-chapter{margin-bottom:2rem;padding-bottom:1.4rem;
      border-bottom:1px solid rgba(255,214,10,.1)}
    .dly-chapter:last-of-type{border-bottom:none}
    .dly-dateline{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
      color:#8f8a73;margin-bottom:.55rem}
    .dly-ch-intro{font-size:.88rem;color:#cbc6b4;line-height:1.55;margin:0 0 .8rem;max-width:50rem}
    .dly-thread{font-style:italic;color:#d9b400;font-size:.9rem;line-height:1.6;
      margin:1rem 0 0;max-width:50rem}

    /* compact grid inside dispatch Monday chapter */
    .dly-grid-compact{grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));
      font-size:.9em}
  `;

  /* ── Assemble HTML by mode ────────────────────────────────────────────── */
  let body;
  if (mode === "map") {
    body = renderMap(d);
  } else if (mode === "deepdive") {
    body = renderDeepDive(d);
  } else {
    // dispatch — pass the resolved Date for Monday-finding
    body = renderDispatch(d, dayDate);
  }

  mount.innerHTML = `<style>${styles}</style>${body}`;
})();
