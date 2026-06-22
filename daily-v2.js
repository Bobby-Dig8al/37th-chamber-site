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

const DAILY_START   = "2026-06-15";   // anchor for idx 0. The Daily PAUSED the week of 06-15 (no issues dated), so this anchor lands idx 7 = Dune on 2026-06-22; Interstellar (idx 0-6, dated 06-08..06-14) stays reachable via the ?date= archive. (A date-match selection would remove this calendar offset — see PR.)
const ROLLOVER_HOUR = 4;              // day flips at 04:00 local
const NOW_EFFECTIVE = Date.now();   // real time; the day rolls at ROLLOVER_HOUR (04:00) local

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
Sagan in 1980; together they carried a physics problem all the way to a $680M film twenty-five \
years later. This week moved through the people who built it, the math that held it honest \
(Einstein–Rosen, 1935; Morris–Thorne, 1988; Kerr, 1963), the rendering that turned geodesic \
equations into IMAX frames — and produced a real peer-reviewed paper as a byproduct. The week \
ended where the science ends: at the singularity, where relativity breaks down and Thorne himself \
marks the line between established truth and educated guess.`,
    thread:     `Art served as a research instrument — the renderer was precise enough to yield a \
real result, published free, given away.`,
    // ── THE SUNDAY STACK · Issue 001 — the magazine layer (optional; absent → plain dispatch).
    //    Editor's Letter = the reckoning (gonzo); synthesis + chapters = the record (sober);
    //    Feature + Coda = the frame. Authored + triple-verified 2026-06-13. ─────────────────
    magazine: {
      name:    "The Sunday Stack",
      issue:   "001",
      tagline: "the week the equations and the film became the same thing",
      letter: {
        kicker: "The Editor's Letter",
        dek:    "A blind date, a black hole, and the math they gave away free.",
        paragraphs: [
          `Here is the thing about a $680-million box-office spectacle built on theoretical physics: the most radical thing it did was give the math away. Carl Sagan introduced Kip Thorne to a magazine editor named Lynda Obst on a blind date around 1980, and the introduction took — not as romance, but as a friendship that lasted. A quarter-century later Obst, by then a Hollywood producer, came back to Thorne with a film to make, and the two co-originated it — a film carried through Steven Spielberg's hands and a studio shuffle (DreamWorks decamping from Paramount to Disney, the rights stranded behind) before it reached Christopher Nolan. From the first, it ran on two conditions Thorne set as the price of his involvement: nothing would violate firmly established laws of physics, and every speculation would spring from real science, not a screenwriter's invention. That is not a marketing posture. That is an <em>epistemological commitment</em>, and it changed what the production could become.`,
          `What it became, eventually, was a research instrument. Double Negative built Gargantua by running Thorne's equations through Kerr geometry — the geometry Roy Kerr solved in 1963 in roughly two pages, finding it by locating the flaw in a proof that said it couldn't be done. The renderer was not painting a picture of a black hole; it was running the physics and reading back whatever the physics returned. IMAX-grade. Physically correct. Two honest compromises, disclosed in the open: the Doppler-beaming asymmetry that makes one side of the disk brighter was softened, and the Doppler and gravitational frequency shifts that would have skewed its colours were left out — both for visual clarity. The film named its own lies. Then the renderer found something no one had predicted — caustics near a fast-spinning hole can stack up to thirteen images of a single star — and Thorne's team published it. <em>Classical and Quantum Gravity</em>, 2015. James, von Tunzelmann, Franklin, and Thorne. Peer-reviewed. Free.`,
          `Five years later the Event Horizon Telescope photographed M87* — a real black hole, hundreds of scientists, the first image of the actual thing — and it came in brighter on one side: the very Doppler asymmetry the film had smoothed away. The universe confirmed the homework. Thorne has always been honest about his taxonomy: truth, educated guess, speculation — and the singularity, the bulk, the tesseract are filed under speculation, labeled as such in his own account. That discipline is rarer than the physics. Sagan spent his life making the same argument from the other direction: from six billion kilometers out, Earth is <em>a mote of dust suspended in a sunbeam</em>, and that fact is not depressing — it is the premise. The view belongs to everyone or it belongs to no one.`,
          `This week we ran that parable through five days of Daily dispatches. The week began with a blind date and ended with a free physics paper — proof that beauty, built honestly, becomes knowledge, and knowledge belongs to everyone. The house creed is to use the irresistible to deliver the good. The irresistible here was a film that took in some $680 million in its original run — a number the market keeps. The good was a peer-reviewed result, published free and confirmed by the scientists who later pointed a telescope at the real sky. We do not improve on that story. We carry it forward.`
        ]
      },
      pullQuote: {
        text: `Two pages, written in 1963, gave the geometry of every spinning black hole ever observed. The renderer built to film one of them, run as an instrument, found a real result — and gave it away free.`,
        cite: ""
      },
      features: [{
        kicker: "The Map",
        title:  "The Constellation",
        href:   "/cloud/",
        cta:    "Wander the map →",
        blurb: [
          `The week's last chapter ended on a single line in a peer-reviewed journal — the result the renderer turned up when it was pointed at the math and run as an instrument, published free under four names: James, von Tunzelmann, Franklin and Thorne, in <em>Classical and Quantum Gravity</em>, 2015. Art had become research.`,
          `But no paper stands alone. This one has a family — the roots it grew from (the 1935 Einstein–Rosen bridge, the word "wormhole" coined in 1957, the traversable one worked out in 1988, Kerr's two-page geometry from 1963) and the work that has grown out of it since. We mapped the whole neighborhood. Every node is a real citation; every line is a path someone actually traced. So we hand you the map and step aside — the view, after all, is not ours alone.`
        ]
      },
      {
        kicker: "The Origin",
        title:  "The Blind Date",
        href:   "/references/kip-thorne/",
        cta:    "The man who bent the light →",
        blurb: [
          `Carl Sagan set it up. Around 1980 he introduced the physicist Kip Thorne to a magazine editor named Lynda Obst — a blind date that never became romance and never stopped being a friendship. A quarter-century later Obst, by then a Hollywood producer, brought Thorne a film to make, and the two co-originated it; it passed through Steven Spielberg's hands and a studio shuffle before it reached Christopher Nolan.`,
          `Thorne set the price of his involvement as two conditions: nothing would violate firmly established physics, and every speculation would spring from real science, not a screenwriter's invention. That is not a marketing posture — it is an <em>epistemological commitment</em>, and it is why a blockbuster could quietly become a research instrument.`
        ]
      },
      {
        kicker: "The Engine",
        title:  "Two Pages, 1963",
        href:   "/references/kerr-metric/",
        cta:    "Into the Kerr metric →",
        blurb: [
          `Roy Kerr solved Einstein's equations for a spinning mass in roughly two pages in 1963 — finding the answer by locating the flaw in a proof that said it couldn't exist. Every spinning black hole ever observed obeys that geometry, Gargantua included.`,
          `Double Negative built the film's black hole by running Thorne's equations through Kerr's geometry — not painting a picture, but running the physics and reading back whatever it returned, IMAX-grade. Then the renderer found something no one had predicted: caustics near a fast-spinning hole can stack up to thirteen images of a single star. Thorne's team published the result. Peer-reviewed. Free.`
        ]
      },
      {
        kicker: "The Confirmation",
        title:  "The Universe Did the Homework",
        href:   "/references/gravitational-lensing/",
        cta:    "See the lensing →",
        blurb: [
          `The film named its own lies. To keep Gargantua legible, the team softened the Doppler-beaming asymmetry that would have made one side of the disk far brighter, and left out the frequency shifts that would have skewed its colors — both disclosed in the open.`,
          `Five years later the Event Horizon Telescope photographed M87* — the first image of a real black hole, hundreds of scientists, the actual thing — and it came in brighter on one side: exactly the Doppler asymmetry the film had smoothed away. The universe confirmed the homework.`
        ]
      }],
      coda: {
        title: "Knowledge, given away",
        paragraphs: [
          `None of it went into a vault, or a patent, or a paywall. Everything this week produced — the geometry, the render, even the result the universe confirmed years on, when a real black hole sat for its portrait — was given away. The instrument built for spectacle had quietly done science, and the science belonged to anyone who cared to look up.`,
          `We keep coming back to one line because it keeps proving itself: <em>the view is not ours alone.</em> None of this week's beauty was diminished by being given away — that was the whole point. Knowledge is free, forever. The irresistible exists to deliver the good. That is the creed, and it is also just how the best things travel: you build something honest enough that it produces truth, and then you let it go. See you next Sunday.`
        ]
      }
    }
  },
  {
    weekStart:  "2026-06-22",
    weekNum:    2,
    theme:      "Dune",
    synthesis:  `Frank Herbert spent years on the ecology, the religion, the language, and \
the politics, building them as he wrote. A 1957 trip to watch the US government attempt to stabilize \
Oregon's coastal sands with poverty grass handed him the engine: an ecosystem that fights back. \
Twenty-three publishers said no; Chilton Books — better known for auto-repair manuals — said yes \
in 1965. This week moved through Hans Zimmer's invented instruments and borrowed desert silence, \
the thermodynamics of a stillsuit, the closed biological loop of sandworm and spice, Herbert's own \
stated warning that charismatic leaders should carry a label on their foreheads, and the Arabic and \
Islamic scholarship that gave the Fremen their bones. It comes back to the warning Herbert built the \
whole book to deliver — not a hero's triumph but the planetologist Kynes's line: "No more terrible disaster could befall your people \
than for them to fall into the hands of a Hero."`,
    thread:     `The world-building was the argument — Herbert built Arrakis so that the ecology \
would force the politics, and the politics would prove the warning.`
  },
  {
    weekStart:  "TBD",
    weekNum:    3,
    theme:      "Lost World",
    synthesis:  `A 454-gram rock purchased from a Mauritanian dealer in 2019. A pressure-measuring \
tool built from crystal chemistry. And the first physical evidence that the early solar system once \
held a world — at minimum 1,000 km in radius, possibly larger than the Moon — that no longer exists \
anywhere except in fragments falling through our sky. This week moved through the angrite meteorite \
NWA 12774 and Aaron Bell's CaTs-liquid geobarometer, through the rare chemistry that marks angrites \
as fundamentally alien to Earth and Mars, through the differentiation process that layered the \
protoplanet's interior into core, mantle, and crust within the solar system's first million years, \
through the giant-impact inference that destroyed it, and through the Grand Tack and Nice Model as \
frontier hypotheses — labeled as such — for how Jupiter's migration shaped which worlds survived. \
The week ended at the synthesis: the geobarometer is a tool, not just a finding. Bell's method can \
now be applied to other meteorites, opening a new way to read the solar system's lost inventory.`,
    thread:     `The science gave us a method, not just a result — one paper opened a pressure gauge \
that can now be turned on every angrite we hold.`
  },
  {
    weekStart:  "TBD",
    weekNum:    4,
    theme:      "The Vietnam War",
    synthesis:  `Ken Burns and Lynn Novick spent a decade gathering nearly eighty witnesses — American \
veterans, antiwar activists, North Vietnamese soldiers, South Vietnamese civilians — and refused to \
let any side hold the war alone. Trent Reznor and Atticus Ross scored it with the raw electronics of \
grief, without triumph or resolution. The photographs — a burning monk, a street execution, a child \
running from fire — changed the politics of a nation. Tim O'Brien and Michael Herr found the language \
the journalism couldn't hold. Maya Lin gave the dead their names in black granite. Thirty-nine million \
Americans watched. The ledger is not closed.`,
    thread:     `A war America never finished reckoning with — Burns and Novick gave us the instrument, \
Reznor and Ross scored the grief, the photographs bore witness, and Maya Lin cut the names into stone \
so we could not forget.`
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
asymmetry (which makes one side of the accretion disk brighter) was softened, and the Doppler and \
gravitational frequency shifts that would have skewed its colours were left out, for visual clarity. Guinness certified it the most scientifically accurate black hole in \
a film. The renderer was precise enough to surface a new astrophysical result — caustics near a \
fast-spinning hole can produce up to 13 images of a single star — which became a peer-reviewed paper.`,
    intro: "Interstellar week, Thursday — <em>Gargantua.</em> Six ways into the black hole at the film's center: the physics is real, the rendering set a world record, and the very center stays unknown.",
    music:   { label:"The Event Horizon", name:"Hans Zimmer",           work:"'Detach' (OST)",             why:"As they cross the point where no signal returns, the Temple Church organ swells into a threshold as final as the horizon itself.", link:"https://en.wikipedia.org/wiki/Interstellar_(soundtrack)" },
    film:    { label:"The DNGR Render", name:"Double Negative & Thorne", work:"the black hole on screen",  why:"Built from Thorne's equations, the renderer earned the Guinness record for the most accurate black hole on film — with two honest compromises: the Doppler beaming asymmetry softened and the colour-shifting frequency effects left out, for clarity.", link:"https://www.guinnessworldrecords.com/world-records/418612-most-scientifically-accurate-black-hole-in-a-movie" },
    science: { label:"Gravitational Lensing", name:"the wrapped disk",  work:"why it's above and below",  why:"Gargantua bends the far side of the accretion disk up and over the shadow — so you see the same disk twice, around the equator and arching overhead.", link:"https://en.wikipedia.org/wiki/Gravitational_lens" },
    book:    { label:"The Singularity", name:"Kip Thorne",              work:"The Science of Interstellar", why:"At the center, relativity predicts infinite curvature and then breaks down — the one place the film's science is honestly speculation.", link:"https://en.wikipedia.org/wiki/The_Science_of_Interstellar" },
    artist:  { label:"The Disk, Real", name:"Event Horizon Telescope", work:"M87*, 2019",                 why:"Five years after Gargantua, 200+ scientists photographed a real black hole — brighter on one side from Doppler beaming, the asymmetry the film left out.", link:"https://en.wikipedia.org/wiki/Messier_87",
               img:"/assets/daily/m87-eht-2019.webp", imgAlt:"The first direct image of a black hole — the supermassive black hole at the heart of galaxy M87, captured by the Event Horizon Telescope in 2019.", imgCredit:"EHT Collaboration" },
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
    music:   { label:"The Ticking Clock", name:"Hans Zimmer",          work:"'Mountains' (OST)",          why:"Built on a ticking pulse — each tick a day passing on Earth — so you feel the dilation before you understand it.", link:"https://www.youtube.com/watch?v=yAd6J0Yb4gQ" },
    film:    { label:"The Cost", name:"the reunion",                   work:"Cooper & Murph",             why:"He comes back younger than his dying, elderly daughter — the twin effect dramatized so exactly Thorne checked the math for years.", link:"https://www.legendary.com/film/interstellar/" },
    science: { label:"The Math of It", name:"Kip Thorne",              work:"The Science of Interstellar", why:"He works out the exact conditions — a huge, near-maximally-spinning Gargantua — that make Miller's planet's 60,000× dilation 'marginally possible.'", link:"https://wwnorton.com/books/9780393351378",
               img:"/assets/daily/005-accretion-disk.webp", imgAlt:"NASA visualization of a black hole: the accretion disk's far side warped above and below the shadow by gravity", imgCredit:"NASA Goddard / J. Schnittman" },
    book:    { label:"The Twin Paradox", name:"Einstein / Langevin",   work:"the 1911 thought experiment", why:"Relativity says the traveler returns younger than the one who stayed — the physics that makes Cooper and Murph's reunion a tragedy, not a miracle.", link:"https://en.wikisource.org/wiki/Translation:The_Evolution_of_Space_and_Time" },
    artist:  { label:"Time Made Liquid", name:"Salvador Dalí",         work:"The Persistence of Memory (1931)", why:"The melting watches have been popularly read as time refusing to stay rigid — though Dalí credited the image to a vision of melting Camembert, not Einstein. Whatever the source, the resonance with relativity outlasted his disclaimer.", link:"https://www.moma.org/collection/works/79018" },
    show:    { label:"Time as Family", name:"Dark",                    work:"Netflix (2017–2020)",        why:"Where Interstellar separates a father and daughter across decades, Dark loops time until characters parent themselves — time's violence on family, taken further.", link:"https://www.netflix.com/title/80100172" }
  },
  {
    num: "006", theme: "Interstellar", date: "2026-06-13",
    // Saturday → DEEP DIVE. Spotlight: science (Roy Kerr — the two-page solution).
    spotlight: "science",
    deepWhy: `In 1963 Roy Kerr solved Einstein's field equations for a rotating mass — two pages \
that produced the geometry governing every spinning black hole ever observed, Gargantua included. \
He found the solution by identifying the flaw in a proof it couldn't exist. Sixty years later, \
mathematicians proved Kerr black holes are stable under perturbations (2022). The renderer DNGR \
built for the film was a numerical integrator running light rays through this exact geometry at \
IMAX resolution — Thorne's equations, operationalized as an art instrument. The two-page paper \
is the quiet foundation under everything the week built.`,
    intro: "Interstellar week, Saturday — <em>the summit.</em> Where the beauty dissolves into the machinery: a two-page 1963 paper, a renderer built on geodesics, and one honest physicist who labels his own climax 'speculation.'",
    music:   { label:"The Kerr Metric", name:"Roy Kerr, 1963",        work:"the spinning-hole solution", why:"In two pages, Kerr solved Einstein's equations for a rotating mass — the one object that governs every spinning black hole, Gargantua included. (The link is Kerr's own 2007 telling of the discovery.)", link:"https://arxiv.org/abs/0706.1109" },
    film:    { label:"The Renderer", name:"DNGR",                     work:"ray-bundles through spacetime", why:"Instead of one ray per pixel, it pushed whole bundles through Kerr geometry — the first IMAX-grade images of a physically correct spinning black hole.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    science: { label:"The Paper from the Movie", name:"James, von Tunzelmann, Franklin & Thorne", work:"Class. Quantum Gravity, 2015", why:"Run as a research instrument, the renderer found caustics near a fast-spinning hole make up to 13 images of one star — a real result the VFX set up.", link:"https://arxiv.org/abs/1502.03808",
               img:"/assets/daily/005-accretion-disk.webp", imgAlt:"NASA visualization of a black hole: the accretion disk's far side warped above and below the shadow by gravity", imgCredit:"NASA Goddard / J. Schnittman" },
    book:    { label:"The Equations, Shown", name:"Kip Thorne",        work:"The Science of Interstellar", why:"He walks every established result equation by equation, then draws a hard line: the bulk, the tesseract — labeled, explicitly, an educated guess.", link:"https://wwnorton.com/books/9780393351378" },
    artist:  { label:"The Man Who Found It", name:"Roy Kerr",         work:"and the 2022 stability proof", why:"Kerr found his solution by spotting the flaw in a proof it couldn't exist — and 60 years later, mathematicians proved Kerr black holes are stable.", link:"https://www.canterbury.ac.nz/about-uc/why-uc/our-alumni/notable-alumni/roy-kerr" },
    show:    { label:"The Honest Edge", name:"truth / guess / speculation", work:"Thorne's own taxonomy", why:"He sorts the film's science into three tiers, so you know exactly where established physics ends and the story takes over.", link:"https://www.sciencefriday.com/articles/truth-educated-guesses-and-speculations-in-interstellar/" }
  },
  {
    num: "007", theme: "Interstellar", date: "2026-06-14",
    // Sunday → DISPATCH render (reads WEEK_ARCS["2026-06-08"]).
    // The per-day fields are still used for the chapter rows inside the dispatch.
    spotlight: "book",   // used in the chapter row compact display
    intro: "Interstellar week, Sunday — <em>the synthesis.</em> A week of equations earns you this: not more rigor, but the view from the top — what it means when you put the math down and look out.",
    music:   { label:"The Score's Heart", name:"Hans Zimmer",         work:"'Cornfield Chase' (OST)",    why:"Written in one night as his idea of fatherhood — a piano sketch he played for Nolan, who then revealed the film's entire plot in response.", link:"https://www.youtube.com/watch?v=JuSsvM8B4Jc" },
    film:    { label:"Love Across Spacetime", name:"Brand's speech",  work:"the film's emotional thesis", why:"The film's most debated line argues love transcends time and space — poetry doing what physics can't. A theme, not a fact, and the film knows it.", link:"https://www.legendary.com/film/interstellar/" },
    science: { label:"Knowledge, Given Away", name:"the 2015 paper",  work:"art that became research",   why:"The renderer was precise enough to yield a peer-reviewed result — so the art became science, and the knowledge was published, free to all.", link:"https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
    book:    { label:"The Human in the Equations", name:"Kip Thorne", work:"Truth, Guess, or Speculation", why:"His rules kept the science serving the story; the book is the receipt — every idea labeled truth, guess, or speculation.", link:"https://wwnorton.com/books/9780393351378" },
    artist:  { label:"The Cosmic Perspective", name:"Carl Sagan",     work:"Pale Blue Dot (1994)",       why:"From six billion kilometers, Earth is 'a mote of dust suspended in a sunbeam' — Sagan turned our smallness into an argument for kindness.", link:"https://www.penguinrandomhouse.com/books/159735/pale-blue-dot-by-carl-sagan/9780345376596/" },
    show:    { label:"Why We Go", name:"Cooper's creed",              work:"the explorer's faith",       why:"That we're defined by overcoming the impossible, our destiny ahead and not behind. (A theme, not a fact.)", link:"https://www.nasa.gov/humans-in-space/why-go-to-space/" }
  },
  /* ── WEEK 2: DUNE ────────────────────────────────────────────────────── */
  {
    num: "008", theme: "Dune", date: "2026-06-22",
    // Monday → MAP render. spotlight/deepWhy are irrelevant on Mondays.
    intro: "A new week, a new masterwork — <em>Dune.</em> Frank Herbert spent five years researching it after a 1957 trip over the shifting sands of the Oregon coast convinced him that an ecosystem could be the protagonist of a story. Twenty-three publishers rejected the manuscript before Chilton Books — better known for auto-repair manuals — said yes in 1965.",
    music:   { name:"Hans Zimmer",         work:"Dune (OST, 2021)",              why:"He went into Monument Valley to feel what Arrakis would sound like — then spent months inventing new instruments to say it.", link:"https://variety.com/2021/artisans/awards/hans-zimmer-dune-score-1235094486/" },
    film:    { name:"Denis Villeneuve",    work:"Dune: Part One (2021)",         why:"Before a single set was built, he and production designer Patrice Vermette flew over Jordan's Wadi Rum to build a visual bible — practical deserts over greenscreen, no sci-fi chrome.", link:"https://en.wikipedia.org/wiki/Dune_(2021_film)" },
    science: { name:"Frank Herbert",       work:"the Oregon Dunes, 1957",        why:"A US government attempt to stabilize shifting coastal sands with poverty grass sparked five years of ecological research — and Arrakis.", link:"https://www.opb.org/article/2021/10/23/florence-oregon-movies-dune-frank-herbert-science-fiction-novels/" },
    book:    { name:"Frank Herbert",       work:"Dune (1965)",                   why:"Rejected by 23 publishers. Won the inaugural Nebula and tied for the Hugo. The first science-fiction novel built around an ecosystem.", link:"https://en.wikipedia.org/wiki/Dune_(novel)" },
    artist:  { name:"H. R. Giger",        work:"Jodorowsky's Dune (unbuilt)",   why:"Before Alien, Giger was designing for a 14-hour Dune film that never got made — and his visual DNA seeded a generation of sci-fi cinema.", link:"https://en.wikipedia.org/wiki/Jodorowsky%27s_Dune" },
    show:    { name:"Jodorowsky's Dune",  work:"documentary (2013)",            why:"The greatest film never made: a 2013 doc about how an unmade adaptation influenced Star Wars, Alien, and the look of modern sci-fi cinema.", link:"https://en.wikipedia.org/wiki/Jodorowsky%27s_Dune" }
  },
  {
    num: "009", theme: "Dune", date: "2026-06-23",
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
    num: "010", theme: "Dune", date: "2026-06-24",
    // Wednesday → DEEP DIVE. Spotlight: science (Herbert's desert ecology — stillsuit engineering).
    spotlight: "science",
    deepWhy: `Arrakis was not invented at a desk. Herbert built its ecology from real desert \
science: aeolian physics, sand-dune stabilization research, and the thermodynamics of water \
conservation. The stillsuit is a genuine engineering problem — with peak sand-surface temperatures near \
350 K (~77°C), water loss by evaporation is catastrophic, and Herbert worked out the numbers: capture \
every drop of sweat and breath through heat-exchange filtration. Barchan dunes — crescent-shaped, \
formed by unidirectional wind — can migrate more than 100 metres a year; Arrakis's great ergs \
follow the same physics. Herbert published Dune five years before the first Earth Day, treating \
a planet's ecology as the load-bearing structure of civilization. The planet is not the setting. \
It is the argument.`,
    intro: "Dune week, Wednesday — <em>the planet.</em> Arrakis was not invented at a desk. Herbert built its ecology from real desert science: aeolian physics, sand-dune stabilization research, and the thermodynamics of water conservation. The planet is the argument.",
    music:   { label:"The Moving Sands",       name:"barchan dunes",            work:"aeolian science",                 why:"Crescent-shaped barchan dunes — formed by wind blowing from one direction — can migrate more than 100 metres a year. Arrakis's great ergs follow the same physics.", link:"https://en.wikipedia.org/wiki/Dune" },
    film:    { label:"Wadi Rum as Arrakis",    name:"Denis Villeneuve",         work:"Jordan location shoot",           why:"He and Vermette flew over Wadi Rum in 2018; the deep ochres and scale of Jordan's valley became the template — practical plates that VFX extended, not replaced.", link:"https://www.moviemaker.com/dune-production-designer-patrice-vermette-denis-villeneuve/" },
    science: { label:"The Stillsuit",          name:"Herbert's water engineering", work:"evaporation thermodynamics",  why:"With Arrakis peak sand-surface temperatures reaching ~350 K (~77°C), water loss by evaporation is catastrophic. The stillsuit is a real engineering problem: capture every drop of sweat and breath through heat-exchange filtration. Herbert knew the numbers.", link:"https://www.cornellsun.com/article/2024/04/the-science-behind-arrakis-understanding-the-climate-and-ecosystem-of-dune" },
    book:    { label:"The First Eco-Novel",    name:"Frank Herbert",            work:"Dune (1965)",                    why:"Published five years before the first Earth Day, Dune treated a planet's ecology as the load-bearing structure of civilization — the first major SF novel to do so.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    artist:  { label:"The Stabilizers",        name:"US Soil Conservation Service", work:"Oregon Dunes, 1950s",       why:"Government researchers planting European beach grass to anchor shifting coastal dunes handed Herbert his central metaphor: humans engineering a landscape that fights back.", link:"https://www.opb.org/article/2021/10/23/florence-oregon-movies-dune-frank-herbert-science-fiction-novels/" },
    show:    { label:"Terraforming as Science", name:"NASA study, 1976",        work:"On the Habitability of Mars",    why:"The year Herbert published Children of Dune, NASA formally studied planetary ecosynthesis — the same problem Kynes and Leto II grapple with. Frontier science then, frontier science now. (Note: Mars terraforming remains theoretical.)", link:"https://en.wikipedia.org/wiki/Terraforming" }
  },
  {
    num: "011", theme: "Dune", date: "2026-06-25",
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
    book:    { label:"The Oil Read",           name:"critics vs. Herbert",      work:"melange as resource metaphor", why:"Many readers see spice-as-oil — a scarce colonial resource extracted from a desert people. Herbert made the parallel explicit in Dune Genesis (1980): \"The scarce water of Dune is an exact analog of oil scarcity. CHOAM is OPEC.\" He built it in deliberately, from the start.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    artist:  { label:"The Dragon Lineage",    name:"Frank Herbert / Beowulf",   work:"the fire-drake archetype",     why:"European dragon mythology — armored, territorial, hoarding the planet's treasure — echoes beneath Shai-Hulud's ecological logic, giving the worm its mythic weight. (A reading critics draw; Herbert never spelled it out.)", link:"https://en.wikipedia.org/wiki/Sandworm_(Dune)" },
    show:    { label:"Riding the Worm",        name:"the Fremen technique",     work:"thumper and maker hooks",      why:"Hooking a ring segment open to expose flesh to abrasive sand, then surfing the turn: a fictional survival technique built on actual knowledge of how large animals respond to irritant pressure.", link:"https://dune.fandom.com/wiki/Sandworm" }
  },
  {
    num: "012", theme: "Dune", date: "2026-06-26",
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
    num: "013", theme: "Dune", date: "2026-06-27",
    // Saturday → DEEP DIVE. Spotlight: science (Arabic/Islamic sources — Muad'Dib etymology).
    spotlight: "science",
    deepWhy: `Herbert spent years reading the Qur'an, Arab history, and Ibn Khaldun before he \
wrote a word of the Fremen. The name Muad'Dib is nearly identical to the Arabic mu'addib — \
"educator," "he who teaches good manners" — chosen deliberately for a character the Fremen would \
call "instructor-of-boys." The ZenSunni faith is a reasoned projection: what might Zen Buddhism \
and Sunni Islam produce after ten thousand years of diaspora? David Peterson (who built Dothraki \
and High Valyrian for Game of Thrones) rendered the Fremen's Chakobsa as a fully-fledged \
constructed language rooted in Herbert's Arabic-influenced vocabulary. Greig Fraser won the 2022 \
Oscar for Best Cinematography on Part One and shot Part Two entirely for IMAX, on IMAX-certified digital cameras — giving the \
scholarship a visual scale to match.`,
    intro: "Dune week, Saturday — <em>the foundations.</em> Herbert spent years reading the Qur'an and studying Arab history. The Fremen are not a single culture pasted on a desert — they are a structural synthesis of Bedouin, Sufi, and Zendiq traditions, built into the novel's bones.",
    music:   { label:"The Fremen Tongue",     name:"David Peterson",            work:"Chakobsa language (2021 film)", why:"The linguist who built Dothraki and High Valyrian for Game of Thrones rendered the Fremen's Chakobsa as a fully-fledged constructed language rooted in Herbert's Arabic-influenced vocabulary.", link:"https://winteriscoming.net/posts/the-guy-who-made-dothraki-for-game-of-thrones-crafted-the-fremen-language-for-dune-01hqrjezfkxf" },
    film:    { label:"The Photograph Never Taken", name:"Greig Fraser ASC ACS", work:"Dune: Part One (2021)",        why:"Fraser won the 2022 Oscar for Best Cinematography on Part One; Part Two was shot entirely FOR IMAX (1.43:1) on IMAX-certified ARRI ALEXA 65 digital cameras — large-format and spherical, not IMAX film.", link:"https://britishcinematographer.co.uk/greig-fraser-asc-acs-dune-part-two/" },
    science: { label:"Muad'Dib, the Teacher", name:"Arabic etymology",          work:"the name Herbert chose",       why:"Paul's Fremen name is nearly identical to the Arabic mu'addib — 'educator,' 'he who teaches good manners.' Herbert, who studied Arabic and Islamic philosophy, chose it deliberately.", link:"https://baheyeldin.com/literature/arabic-and-islamic-themes-in-frank-herberts-dune.html" },
    book:    { label:"The ZenSunni Faith",    name:"Frank Herbert",             work:"the Fremen religion",          why:"Herbert built the Fremen's ZenSunni faith as a synthesis of Zen Buddhism and Sunni Islam — not caricature, but a reasoned projection of what a people carrying those traditions across ten thousand years of diaspora might practice.", link:"https://en.wikipedia.org/wiki/Dune_(novel)" },
    artist:  { label:"Lawrence of Arabia",    name:"David Lean (1962)",          work:"cinematic source",            why:"David Lean's 1962 film has been widely identified as a likely influence — a Western outsider among desert people, adopted, mythologized, and ultimately an engine of violence he could not fully control. (Herbert cited T. E. Lawrence the man; critics drew the film parallel.) Paul's arc rhymes.", link:"https://en.wikipedia.org/wiki/Lawrence_of_Arabia_(film)" },
    show:    { label:"The Jihad as Anti-Gift", name:"Herbert on colonialism",    work:"the Fremen's stolen narrative", why:"The Fremen are the people with ancient knowledge of their planet. The outsider arrives, is adopted, becomes their messiah, and leads them into a war that serves his purposes. Herbert wanted you to notice that structure — and to be uncomfortable.", link:"https://www.slashfilm.com/638538/the-oil-must-flow-how-does-denis-villeneuves-dune-deal-with-the-books-middle-east-inspirations/" }
  },
  {
    num: "014", theme: "Dune", date: "2026-06-28",
    // Sunday → DISPATCH render (reads WEEK_ARCS for the Dune weekStart).
    // The per-day fields are still used for chapter rows inside the dispatch.
    spotlight: "book",   // used in the chapter row compact display
    intro: "Dune week, Sunday — <em>the synthesis.</em> A week built around one question: how do you build a world with real weight? Herbert's answer: spend years on the ecology, the religion, the language, and the politics, and let the system generate the story.",
    music:   { label:"The Score as System", name:"Hans Zimmer",                 work:"the whole OST as an ecology",   why:"Like the novel, the score is designed as a closed system — vocal languages, invented instruments, real desert acoustics. Remove one element and the whole thing shifts. Same principle Herbert used on Arrakis.", link:"https://en.wikipedia.org/wiki/Music_of_Dune_(2021_film)" },
    film:    { label:"The Adaptation Problem", name:"Denis Villeneuve",          work:"Part One + Part Two, together",  why:"It took two films — five hours — to carry the first novel. That is the measure of how much Herbert actually built. Villeneuve earned the assignment by treating the book as an architecture problem, not a plot problem.", link:"https://en.wikipedia.org/wiki/Dune:_Part_Two" },
    science: { label:"Ecology as Ethics",    name:"Frank Herbert",               work:"Dune as ecocritical text",      why:"Published before the environmental movement had a name, Dune argued that you cannot separate politics, religion, and ecology — that resource control is always also moral control. The ecology is the ethics.", link:"https://daily.jstor.org/the-ecological-prescience-of-dune/" },
    book:    { label:"The Sequels as Correction", name:"Frank Herbert",          work:"Dune Messiah → God Emperor",   why:"Herbert wrote five sequels specifically to correct readers' misreadings of Paul as hero. The series is a philosophical argument in six volumes — each book tightening the critique, each protagonist showing what unchecked power does next.", link:"https://en.wikipedia.org/wiki/Dune_(franchise)" },
    artist:  { label:"The First Time",       name:"Kyle MacLachlan",             work:"David Lynch's Dune (1984)",     why:"Lynch's film was a box-office disaster — and MacLachlan's debut. It took forty years and two Villeneuve films to show the novel's full shape. Some worlds need time to find the right door.", link:"https://en.wikipedia.org/wiki/Dune_(1984_film)" },
    show:    { label:"The One Line",         name:"Frank Herbert",               work:"the warning, restated",         why:"\"No more terrible disaster could befall your people than for them to fall into the hands of a Hero.\" That is the novel's argument. Everything Herbert built — the worm, the spice, the messiah — exists to make that sentence land.", link:"https://www.goodreads.com/quotes/10128956-i-wrote-the-dune-series-because-i-had-this-idea" }
  },
  /* ── WEEK 3: PROTOPLANET / LOST WORLD ───────────────────────────────── */
  {
    num: "015", theme: "Lost World", date: "TBD",
    // Monday → MAP render. spotlight/deepWhy are irrelevant on Mondays.
    intro: "This week, one piece of rock — <em>NWA 12774.</em> A 454-gram fragment purchased from a Mauritanian dealer in 2019. In 2026, CU Boulder's Aaron Bell used a new pressure gauge built into its crystals to confirm: this shard once sat deep inside a planet that no longer exists.",
    music:   { label:"The Disk That Spun It All",   name:"Brian May, Patrick Moore & Chris Lintott", work:"Bang! — The Complete History of the Universe (2006)",   why:"The guitarist-turned-astrophysicist co-authored a book walking the whole story from the Big Bang through solar system formation to now — the disk that birthed lost worlds and surviving ones.", link:"https://en.wikipedia.org/wiki/Bang!_The_Complete_History_of_the_Universe" },
    film:    { label:"The Debris Field",             name:"Alfonso Cuarón",         work:"Gravity (2013)",                                         why:"Wreckage travels. A cascade of debris changes everything. The same physics applied 4.5 billion years ago when a protoplanet met its end.", link:"https://en.wikipedia.org/wiki/Gravity_(film)" },
    science: { label:"The Finding",                  name:"Aaron Bell et al.",      work:"NWA 12774 — Earth & Planetary Science Letters (2026)",    why:"First unequivocal physical evidence that the angrite parent body was planetary-embryo-sized — at minimum 1,000 km in radius, possibly larger than the Moon.", link:"https://www.colorado.edu/today/2026/06/01/rare-meteorite-provides-evidence-giant-early-planet" },
    book:    { label:"The Oldest Rocks We Have",     name:"Brigitte Zanda & Monica Rotaru", work:"Meteorites: Their Impact on Science and History (2001)", why:"A companion to thinking about what a meteorite actually records — deep-time chemistry frozen in stone.", link:"https://en.wikipedia.org/wiki/Meteorite" },
    artist:  { label:"Worlds Before Ours",           name:"Chesley Bonestell",      work:"space art",                                              why:"He painted solar system landscapes before any probe confirmed them. Some of those worlds may have looked like the one NWA 12774 fell from.", link:"https://en.wikipedia.org/wiki/Chesley_Bonestell" },
    show:    { label:"The Solar System, Built",      name:"How the Universe Works", work:"Science Channel",                                        why:"The planetary formation episodes give the visual context: a disk of gas and rock, hundreds of embryos — most of them gone.", link:"https://en.wikipedia.org/wiki/How_the_Universe_Works" }
  },
  {
    num: "016", theme: "Lost World", date: "TBD",
    // Tuesday → DEEP DIVE. Spotlight: science (angrite identity — what makes them alien).
    spotlight: "science",
    deepWhy: `Of the roughly 80,000 meteorites catalogued on Earth, only about 68 are angrites — \
a figure drawn from Bell's 2026 paper. They are among the oldest igneous rocks in the solar system, \
crystallizing within roughly four million years of the first calcium-aluminum-rich inclusions (CAIs), \
making them approximately 4.56 billion years old. Their chemistry is unlike anything Earth, Mars, or \
the Moon is made of: silica-undersaturated, rich in aluminum and titanium, with a clinopyroxene \
structure that records the pressure conditions of their formation. That alien composition is exactly \
why they matter — their parent body formed from starting materials fundamentally different from the \
surviving rocky planets, and the chemistry locked in their crystals is the record of a world that \
left no other trace.`,
    intro: "Day two — <em>the rock itself.</em> NWA 12774 is an angrite. Of the roughly 80,000 meteorites catalogued on Earth, only about 68 are angrites. They are among the oldest igneous rocks in the solar system — and their chemistry is unlike anything Earth, Mars, or the Moon is made of.",
    music:   { label:"From Dust",                    name:"Sufjan Stevens",         work:"Planetarium (with Bryce Dessner, 2017)",                  why:"A collaboration written around the solar system — ambient, slow, geological in temperament. The right texture for a rock 4.56 billion years old.", link:"https://en.wikipedia.org/wiki/Planetarium_(album)" },
    film:    { label:"The Asteroid Belt's Story",    name:"Terrence Malick",        work:"The Tree of Life (2011) — the creation sequence",         why:"The deep-time opening sequence: rock, water, light — the stuff of planetary formation shown without narration.", link:"https://en.wikipedia.org/wiki/The_Tree_of_Life_(film)" },
    science: { label:"What Makes an Angrite",        name:"angrite classification", work:"silica-undersaturated, Al-Ti-rich clinopyroxene",          why:"Angrites lack the silica that defines Earth, Mars, and most rocky bodies. Their chemistry points to a parent body that formed from fundamentally different starting materials.", link:"https://en.wikipedia.org/wiki/Angrite" },
    book:    { label:"Reading Rocks",                name:"Marcia Bjornerud",       work:"Timefulness: How Thinking Like a Geologist Can Help Save the World (2018)", why:"How geologists read time in stone — the same interpretive skill Bell applied to read pressure in a crystal.", link:"https://en.wikipedia.org/wiki/Timefulness" },
    artist:  { label:"The Surface We Never Saw",     name:"Michael Carroll",        work:"space art",                                              why:"Carroll paints planetary surfaces — including worlds that existed only briefly in the early solar system. A visual way in to the lost ones.", link:"https://en.wikipedia.org/wiki/Michael_Carroll_(artist)" },
    show:    { label:"The Meteorite Hunters",        name:"Meteorite Men",          work:"Science Channel (2009–2012)",                             why:"The logistics of the find — the Sahara, the search, the ID process. The NWA recovery chain for angrites runs through the same North African desert corridors the show documented.", link:"https://en.wikipedia.org/wiki/Meteorite_Men" }
  },
  {
    num: "017", theme: "Lost World", date: "TBD",
    // Wednesday → DEEP DIVE. Spotlight: science (the geobarometer — 17.5 kbar).
    spotlight: "science",
    deepWhy: `One kilobar is roughly the pressure at the deepest point of Earth's oceans. NWA \
12774's clinopyroxene formed at 17.5 ± 0.89 kilobars — the result of Bell's CaTs-liquid \
geobarometer, which converts aluminum enrichment in clinopyroxene directly into pressure. The \
mechanism: under increasing pressure, aluminum substitutes into the clinopyroxene crystal structure \
in a measurable way. Bell's model calibrates that substitution against known pressure conditions to \
produce a kilobar reading. From kilobars, a minimum planetary radius follows from gravitational \
self-compression models — the body had to be large enough to generate that pressure at its interior. \
The result: at least 1,000 km in radius. The geobarometer is now a tool, not just a result; it can \
be applied to any angrite, and potentially to other meteorite classes with the right mineralogy.`,
    intro: "Day three — <em>the pressure gauge.</em> One kilobar is roughly the pressure at the deepest point of Earth's oceans. NWA 12774's clinopyroxene formed at 17.5 kilobars. Bell's team built a new geobarometer — a pressure-measuring tool — from the mineralogy of the crystals themselves.",
    music:   { label:"Deep Pressure",                name:"Massive Attack",         work:"\"Teardrop\" (Mezzanine, 1998)",                          why:"Not a science reference — a texture. Deep, slow, layered. The weight of 17.5 kilobars.", link:"https://en.wikipedia.org/wiki/Mezzanine_(album)" },
    film:    { label:"The Core",                     name:"Jon Amiel",              work:"The Core (2003)",                                         why:"Fiction with bad physics — but the premise (deep planetary interiors, extreme pressure) is the right territory. Bell's real geobarometer is the actual science the film needed.", link:"https://en.wikipedia.org/wiki/The_Core_(film)" },
    science: { label:"How the Gauge Works",          name:"CaTs-liquid geobarometer", work:"clinopyroxene Al-enrichment under pressure",            why:"Aluminum substitutes into the clinopyroxene structure under pressure in a measurable way. Bell's model converts Al-content directly into kilobars — and from kilobars into minimum planetary radius.", link:"https://www.colorado.edu/today/2026/06/01/rare-meteorite-provides-evidence-giant-early-planet" },
    book:    { label:"Reading the Interior",         name:"Don Anderson",           work:"New Theory of the Earth (2007)",                          why:"Planetary interiors are inaccessible. This book covers the whole toolkit — seismology, geochemistry, mineralogy — for reading what's deep without drilling.", link:"https://en.wikipedia.org/wiki/Don_Anderson" },
    artist:  { label:"Pressure Made Visible",        name:"the clinopyroxene crystal", work:"NWA 12774 thin section",                             why:"The kaleidoscopic iridescence in the meteorite's thin section is the pressure record, written in crystal structure — visible in polarized light microscopy.", link:"https://www.livescience.com/space/meteoroids/kaleidoscopic-meteorite-could-be-a-piece-of-a-lost-world-from-the-early-solar-system-space-photo-of-the-week" },
    show:    { label:"Minerals Under the Scope",     name:"Geology Kitchen",        work:"YouTube channel",                                        why:"A visual anchor: thin-section petrography in action. The same technique used to read NWA 12774's pressure record.", link:"https://www.youtube.com/@GeologyKitchen" }
  },
  {
    num: "018", theme: "Lost World", date: "TBD",
    // Thursday → DEEP DIVE. Spotlight: science (planetary differentiation).
    spotlight: "science",
    deepWhy: `When a protoplanet grows large enough, radioactive decay and the heat of accretion \
melt its interior into a global magma ocean. Heavy iron sinks to the core; lighter silicates rise \
to the mantle and crystallize into a crust. This process — planetary differentiation — happened to \
Earth, Mars, the Moon, and to the angrite parent body, within the first million years of the solar \
system. The angrites' chemistry records that process: their aluminum-rich clinopyroxene is a mantle \
mineral, crystallized out of a differentiated interior at the pressures Bell measured. John Wood's \
1970 hypothesis that the Moon's highlands crystallized from a global magma ocean was the template — \
the same logic now applies to every differentiated body in the early solar system, including the one \
that left behind NWA 12774.`,
    intro: "Day four — <em>differentiation.</em> When a protoplanet grows large enough, its interior melts. Heavy iron sinks to the core. Lighter silicates rise to the mantle and crust. This happened to Earth, Mars, the Moon — and to the angrite parent body, within the first million years of the solar system.",
    music:   { label:"Magma",                        name:"Sunn O)))",              work:"Monoliths & Dimensions (2009)",                           why:"Heavy, slow, geological. Drone music for thinking about a world that became a magma ocean and sorted itself out under gravity.", link:"https://en.wikipedia.org/wiki/Monoliths_%26_Dimensions" },
    film:    { label:"The Layered World",             name:"Terrence Malick",        work:"The Tree of Life — creation sequence",                   why:"The layering shot — water separating from rock, light from dark — is differentiation made visual. It happened inside the angrite parent body first.", link:"https://en.wikipedia.org/wiki/The_Tree_of_Life_(film)" },
    science: { label:"The Process",                  name:"planetary differentiation", work:"core-mantle-crust sorting in early bodies",            why:"Heat from radioactive decay and accretionary impacts melted early protoplanets. Iron sank; silicates rose; crusts crystallized out of magma oceans — all within millions of years.", link:"https://en.wikipedia.org/wiki/Planetary_differentiation" },
    book:    { label:"The Magma Ocean",              name:"John Wood",              work:"lunar magma ocean hypothesis, 1970",                      why:"Wood's hypothesis that the Moon's highlands crystallized from a globe-wide magma ocean opened the door to applying the same reasoning to all early differentiated bodies, including the angrite parent body.", link:"https://en.wikipedia.org/wiki/Lunar_magma_ocean" },
    artist:  { label:"The Iron Core",                name:"cross-section diagrams", work:"planetary interior illustrations",                        why:"Every layered-interior diagram is a record of differentiation — iron below, silicate above. The angrite parent body had exactly this structure before it was destroyed.", link:"https://en.wikipedia.org/wiki/Planetary_differentiation" },
    show:    { label:"How Earth Layered",            name:"PBS Space Time",         work:"\"How Earth Got Its Layers\" (YouTube)",                  why:"Clean, sourced, visual walkthrough of exactly the differentiation process the angrite parent body also went through.", link:"https://www.youtube.com/user/pbsspacetime" }
  },
  {
    num: "019", theme: "Lost World", date: "TBD",
    // Friday → DEEP DIVE. Spotlight: book (Erik Asphaug — the violent early solar system).
    spotlight: "book",
    deepWhy: `Asphaug's argument: the current solar system is abnormally calm. The early inner \
solar system held hundreds of planetary embryos, and the models show most were lost — ejected, \
accreted, or catastrophically disrupted. No asteroid in the current solar system matches angrite \
spectra. The consensus inference — drawn from multiple lines of evidence — is that the angrite \
parent body was fully destroyed in a giant collision around 4.5 billion years ago, and what we hold \
are fragments. The leading model for the Moon's origin involves exactly this class of event: a \
Mars-sized body striking early Earth, with the debris coalescing into a satellite. The angrite \
parent body's fate may have been similar — a collision without a moon to show for it, only scattered \
meteorites crossing Earth's orbit for billions of years afterward.`,
    intro: "Day five — <em>the crash.</em> The solar system's early inner region held hundreds of planetary embryos. Models suggest most were lost. The angrite parent body — at least Moon-sized, possibly approaching Mars in scale — collided with something 4.5 billion years ago and ceased to exist as a world.",
    music:   { label:"The Impact",                   name:"Ennio Morricone",        work:"The Mission (OST, 1986)",                                 why:"The collision that ended the angrite parent body was not dramatic in the human sense — a slow-motion catastrophe in deep time. Morricone writes for that scale.", link:"https://en.wikipedia.org/wiki/The_Mission_(soundtrack)" },
    film:    { label:"The Giant Impact",             name:"the Moon's birth",       work:"giant-impact hypothesis",                                 why:"The leading model for the Moon's origin is a Mars-sized body (Theia) striking early Earth. The angrite parent body's fate may have been similar — a giant impact, nothing surviving intact.", link:"https://en.wikipedia.org/wiki/Giant-impact_hypothesis" },
    science: { label:"Why the Parent Body Is Gone",  name:"angrite parent body",   work:"no matching asteroid exists",                             why:"No asteroid in the current solar system matches angrite spectra. The consensus inference: the parent body was catastrophically disrupted and fully destroyed — the fragments are angrite meteorites.", link:"https://en.wikipedia.org/wiki/Angrite" },
    book:    { label:"The Violent Youth",            name:"Erik Asphaug",          work:"When the Earth Had Two Moons (2019)",                      why:"Asphaug argues the early solar system was far more violent than the current one — a landscape of giant impacts and lost worlds. NWA 12774 is evidence he's right.", link:"https://en.wikipedia.org/wiki/Erik_Asphaug" },
    artist:  { label:"The Moment of Impact",         name:"Don Davis",             work:"impact art",                                              why:"Davis painted the giant impact that formed the Moon for NASA — the visual standard for how planetary destruction looked in the early solar system.", link:"https://en.wikipedia.org/wiki/Don_Davis_(artist)" },
    show:    { label:"The Solar System's Lost Worlds", name:"How the Universe Works", work:"\"Solar System\" episodes",                           why:"The series covers the giant impact phase and lost-world hypothesis with animation and researchers. The visual complement to Bell's findings.", link:"https://en.wikipedia.org/wiki/How_the_Universe_Works" }
  },
  {
    num: "020", theme: "Lost World", date: "TBD",
    // Saturday → DEEP DIVE. Spotlight: science (Grand Tack + Nice Model, labeled as frontier).
    spotlight: "science",
    deepWhy: `Two leading frameworks — the Grand Tack (Walsh et al., Nature, 2011) and the Nice \
Model (Gomes et al., Nature, 2005) — offer different accounts of how the outer planets shaped which \
protoplanets survived. In the Grand Tack, Jupiter migrated inward to roughly 1.5 AU before Saturn's \
resonance pulled it back out, sculpting the inner disk and limiting Mars's growth. In the Nice \
Model, a delayed gravitational instability among the outer planets reshuffled small bodies and may \
have triggered the Late Heavy Bombardment. Both are leading hypotheses, actively debated — not \
settled history. They are presented here as models, not facts. What they agree on: the early inner \
solar system was chaotic enough to destroy the angrite parent body and leave no intact remnant. \
NWA 12774 is one of the surviving receipts.`,
    intro: "Day six — <em>the models.</em> How do theorists reconstruct a solar system they never saw? Two leading frameworks — the Grand Tack and the Nice Model — offer different accounts of how Jupiter's migration shaped which protoplanets survived and which were destroyed. Both are frontier theory, not settled history.",
    music:   { label:"The Migration",                name:"Philip Glass",           work:"Glassworks (1982)",                                       why:"Pattern that shifts slowly, then drastically, then resets. Jupiter's migration in the Grand Tack model is exactly this structure — a long inward move, a sharp reversal, a retreat.", link:"https://en.wikipedia.org/wiki/Glassworks_(Glass_album)" },
    film:    { label:"The Disruptor",                name:"Jupiter Ascending",      work:"Wachowski siblings (2015)",                               why:"Bad science, useful metaphor: Jupiter as the dominant force that reorganizes everything around it. In the Grand Tack model, that's literally what happened.", link:"https://en.wikipedia.org/wiki/Jupiter_Ascending" },
    science: { label:"Grand Tack + Nice Model (frontier)", name:"Walsh et al. 2011 / Gomes et al. 2005", work:"Jupiter migration + outer-planet instability", why:"Grand Tack: Jupiter migrated inward to ~1.5 AU then turned back, sculpting the inner disk. Nice Model: a delayed outer-planet instability reshuffled small bodies. Both are leading hypotheses, actively debated — not confirmed history.", link:"https://en.wikipedia.org/wiki/Grand_tack_hypothesis" },
    book:    { label:"The Nice Model (frontier)",    name:"Gomes et al., 2005",    work:"Nature — delayed instability of the outer solar system",   why:"A different framework: after the gas disk cleared, the outer planets underwent a delayed gravitational instability — reshuffling small bodies, potentially triggering the Late Heavy Bombardment. Leading hypothesis, actively debated.", link:"https://en.wikipedia.org/wiki/Nice_model" },
    artist:  { label:"The Simulation",              name:"planetary formation simulations", work:"N-body integrations",                           why:"Modern simulations run thousands of solar system formations and look for which produce outcomes like ours. The angrite parent body was one of the embryos that didn't survive.", link:"https://en.wikipedia.org/wiki/Planetary_system_formation" },
    show:    { label:"The Reshuffling",             name:"PBS Space Time",         work:"\"How Jupiter Shaped the Solar System\" (YouTube)",        why:"Clean explainer on Jupiter's outsized role in which worlds survived — the exact planetary-level context for NWA 12774's parent body.", link:"https://www.youtube.com/user/pbsspacetime" }
  },
  {
    num: "021", theme: "Lost World", date: "TBD",
    // Sunday → DISPATCH render (reads WEEK_ARCS for the Lost World weekStart).
    // The per-day fields are still used for chapter rows inside the dispatch.
    spotlight: "science",   // used in the chapter row compact display
    intro: "Protoplanet week, Sunday — <em>the synthesis.</em> A meteorite smaller than a dinner plate. A geobarometer built from crystal chemistry. And the first physical proof that the solar system once held a world at least as large as the Moon — a world with a core, a mantle, a crust, a history — that no longer exists anywhere except in fragments falling through our sky.",
    music:   { label:"The Long Count",              name:"Stars of the Lid",       work:"And Their Refinement of the Decline (2007)",              why:"Ambient music on a geological scale. For sitting with the fact that 4.5 billion years of history compressed into a 454-gram rock.", link:"https://en.wikipedia.org/wiki/Stars_of_the_Lid" },
    film:    { label:"What Survives",               name:"Terrence Malick",        work:"The Tree of Life (2011)",                                 why:"The film opens with the oldest question — why is there something rather than nothing — and answers with deep time and particularity. That's what a meteorite does too.", link:"https://en.wikipedia.org/wiki/The_Tree_of_Life_(film)" },
    science: { label:"The Synthesis",              name:"Aaron Bell et al., 2026", work:"Earth & Planetary Science Letters",                      why:"Their new geobarometer — a tool, not just an observation — can now be applied to other angrites and other meteorites. One paper opened a method, not just a finding.", link:"https://www.colorado.edu/today/2026/06/01/rare-meteorite-provides-evidence-giant-early-planet" },
    book:    { label:"The Deep Record",            name:"Robert Hazen",            work:"The Story of Earth (2012)",                               why:"A geologist's account of the planet's history told through minerals — from stardust to living planet. The lens for reading NWA 12774 as a chapter in that story, not an anomaly.", link:"https://en.wikipedia.org/wiki/Robert_Hazen" },
    artist:  { label:"The Lost World, Painted",   name:"Chesley Bonestell",        work:"space art",                                              why:"Bonestell painted worlds before we visited them. The angrite parent body is a world we'll never visit — but we hold a piece of it. He would have painted it.", link:"https://en.wikipedia.org/wiki/Chesley_Bonestell" },
    show:    { label:"The View From Here",         name:"Carl Sagan",              work:"Cosmos: A Personal Voyage — \"The Shore of the Cosmic Ocean\" (1980)", why:"Sagan called us 'star stuff' — the cosmos knowing itself. A 454-gram rock from a dead world is the solar system doing the same thing: remembering what it lost.", link:"https://en.wikipedia.org/wiki/Cosmos:_A_Personal_Voyage" }
  },
  /* ── WEEK 4: THE VIETNAM WAR (a moral week, not a glory week) ─────────── */
  {
    num: "022", theme: "Vietnam War", date: "TBD",
    // Monday → MAP render.
    intro: "Ten years in the making, nearly eighty witnesses, ten parts and roughly eighteen hours: <em>The Vietnam War</em> by Ken Burns and Lynn Novick is the most comprehensive American documentary account of a war the country still has not finished reckoning with.",
    music:   { label:"The Two Scores",       name:"Reznor & Ross · Yo-Yo Ma & the Silk Road Ensemble", work:"The Vietnam War score (2017)", why:"Two Academy Award-winning composers brought more than two hours of unresolved electronic grief across both scores; a cellist and the Silk Road Ensemble brought the Vietnamese sonic register alongside them.", link:"https://www.pbs.org/kenburns/the-vietnam-war/original-score" },
    film:    { label:"The Documentary",      name:"Ken Burns & Lynn Novick",  work:"The Vietnam War (PBS, 2017)", why:"Ten parts, roughly eighteen hours, premiered September 17, 2017; reached thirty-nine million viewers. The defining American documentary account of the war, told from all sides of the Pacific.", link:"https://www.pbs.org/kenburns/the-vietnam-war/about" },
    science: { label:"The Trigger",          name:"Gulf of Tonkin Resolution", work:"August 7, 1964 (signed Aug 10)", why:"Congress granted President Johnson authority to escalate without a formal war declaration — based on a reported second attack that Johnson and McNamara privately doubted had occurred.", link:"https://www.britannica.com/event/Gulf-of-Tonkin-Resolution" },
    book:    { label:"The Soldier's Weight", name:"Tim O'Brien",              work:"The Things They Carried (1990)", why:"O'Brien served in Vietnam and wrote the defining literary account of what the war cost the men who fought — blurring fiction and memoir to carry the weight more honestly.", link:"https://www.arts.gov/initiatives/nea-big-read/things-they-carried" },
    artist:  { label:"The Names",            name:"Maya Lin",                 work:"Vietnam Veterans Memorial (1982)", why:"A twenty-one-year-old Yale student won a competition of more than 1,400 entries with a black granite wall bearing the names of the dead — arranged by date of death, not by rank.", link:"https://www.britannica.com/topic/Vietnam-Veterans-Memorial" },
    show:    { label:"The Witnesses",        name:"Nearly 80 interviewees, North and South", work:"The Vietnam War (PBS, 2017)", why:"For the first time in a Burns documentary, combatants and civilians from North Vietnam and the Viet Cong speak alongside Americans — the view not held by any one flag.", link:"https://www.pbs.org/video/voices-from-all-sides-trace-deep-roots-of-vietnam-war-1505519939" }
  },
  {
    num: "023", theme: "Vietnam War", date: "TBD",
    // Tuesday → DEEP DIVE. Spotlight: music (the two scores + the era's radio).
    spotlight: "music",
    deepWhy: `The war had two soundtracks: the one that came through the radio while young men waited \
for orders, and the one Trent Reznor and Atticus Ross composed to hold the silence that came after. \
Lynn Novick recruited the Nine Inch Nails duo — already Oscar winners for The Social Network (2010) — \
after hearing their score for The Girl with the Dragon Tattoo. The result is more than two hours of \
original music: electronic, spare, and deliberately unresolved, mirroring a war that never achieved \
resolution. Alongside it, Yo-Yo Ma and the Silk Road Ensemble combined Western and Asian instruments — \
bawu, kamancheh — improvising on Vietnamese musical themes, bringing the other half of the human cost \
into the sonic frame. Two scores for two sides of one catastrophe.`,
    intro: "Vietnam week, day two — <em>the sound.</em> The war had two soundtracks: the radio the soldiers carried, and the score Reznor and Ross wrote to hold the silence that came after.",
    music:   { label:"The Score",        name:"Trent Reznor & Atticus Ross", work:"The Vietnam War Original Score (2017)", why:"More than two hours of original electronic music, raw and unresolved, by the Nine Inch Nails duo who won the Oscar for The Social Network (2010) and — with Jon Batiste — for Soul (2020).", link:"https://www.nin.com/vietnamoriginalscore/" },
    film:    { label:"Woodstock, 1969",  name:"Jimi Hendrix",                work:"\"The Star-Spangled Banner\" (live, August 1969)", why:"Around 9am on the Monday morning, after the festival had run a full day over, Hendrix played the national anthem through a Stratocaster until it sounded like napalm and the country tearing itself apart.", link:"https://en.wikipedia.org/wiki/The_Star-Spangled_Banner_(Jimi_Hendrix)" },
    science: { label:"What's Going On",  name:"Marvin Gaye",                 work:"What's Going On (1971)", why:"Released May 21, 1971, narrated from the perspective of a returning Vietnam veteran. Gaye's brother Frankie served in Vietnam; his letters home shaped the album. Became Motown's best-selling album to that date.", link:"https://www.smithsonianmag.com/history/marvin-gayes-whats-going-relevant-today-it-was-1971-180977750/" },
    book:    { label:"Fortunate Son",    name:"Creedence Clearwater Revival", work:"\"Fortunate Son\" (September 1969)", why:"Three minutes on the inequity of the draft — the sons of senators got deferments; the sons of everyone else got orders. Written by John Fogerty.", link:"https://en.wikipedia.org/wiki/Fortunate_Son" },
    artist:  { label:"The Question",     name:"Bob Dylan",                   work:"\"Blowin' in the Wind\" (1963)", why:"Recorded July 1962, released on The Freewheelin' Bob Dylan. Dylan resisted the protest-song framing even as it became the era's defining antiwar anthem.", link:"https://en.wikipedia.org/wiki/Blowin%27_in_the_Wind" },
    show:    { label:"The Silk Road",    name:"Yo-Yo Ma & the Silk Road Ensemble", work:"The Vietnam War (Original Soundtrack, 2017)", why:"Western strings woven with the bawu and kamancheh, improvising on Vietnamese musical themes — the other sonic register of a war that was never only American.", link:"https://silkroadensemble.bandcamp.com/album/the-vietnam-war-a-film-by-ken-burns-lynn-novick-icr009" }
  },
  {
    num: "024", theme: "Vietnam War", date: "TBD",
    // Wednesday → DEEP DIVE. Spotlight: science (how it escalated; the machinery).
    spotlight: "science",
    deepWhy: `The war did not arrive fully formed; it was assembled out of decisions that compounded. \
On August 2, 1964, North Vietnamese boats attacked the USS Maddox in the Gulf of Tonkin. A reported \
second attack on August 4 — relayed to Congress even as Johnson and McNamara privately concluded it \
had likely not occurred — became the pretext. Congress passed the Gulf of Tonkin Resolution on August 7 (signed into law August \
10), granting near-unlimited war-making authority without a formal declaration. That single act became \
the legal foundation for a force that peaked near 543,000 American troops in 1969. The resolution was \
repealed in 1971. The contested nature of the August 4 incident is now well-documented in the \
declassified record — a war built on an uncertain predicate, authorized in hours, prosecuted for a decade.`,
    intro: "Vietnam week, Wednesday — <em>the machinery.</em> A dubious incident in a gulf, a resolution passed in hours, a decade of escalation, and a poison sprayed across a jungle that is still working.",
    music:   { label:"The Draft in Three Minutes", name:"Creedence Clearwater Revival", work:"\"Fortunate Son\" (1969)", why:"The draft sent roughly 2.7 million Americans to Vietnam. Fogerty named the class inequity of deferments in under three minutes — the sons of the powerful stayed home.", link:"https://en.wikipedia.org/wiki/Fortunate_Son" },
    film:    { label:"The Escalation",   name:"Gulf of Tonkin Resolution",   work:"August 10, 1964 — the legal mechanism", why:"Johnson got war-making authority on a reported attack he and McNamara privately doubted. It became the legal basis for the entire escalation and was repealed in 1971.", link:"https://www.britannica.com/event/Gulf-of-Tonkin-Resolution" },
    science: { label:"Agent Orange",     name:"Operation Ranch Hand",        work:"1962–1971 — herbicide program over Vietnam, Laos, Cambodia", why:"The US sprayed herbicide contaminated with TCDD — a highly toxic dioxin — to clear jungle cover. Linked to cancers, birth defects, and neurological disorders in veterans and Vietnamese civilians across generations. The Agent Orange Act of 1991 established presumptive service connection for affected veterans.", link:"https://www.ncbi.nlm.nih.gov/books/NBK236351/" },
    book:    { label:"The Correspondent", name:"Michael Herr",               work:"Dispatches (1977)", why:"Herr reported for Esquire from Vietnam, 1967–1969 — an early landmark of New Journalism, the ground-level record of the war's sensory reality. He later narrated Apocalypse Now and co-wrote Full Metal Jacket.", link:"https://en.wikipedia.org/wiki/Dispatches_(book)" },
    artist:  { label:"Kent State",       name:"John Filo (photograph)",      work:"May 4, 1970 — Kent State University", why:"Ohio National Guardsmen fired between 61 and 67 rounds in 13 seconds, killing four students and wounding nine. Filo's Pulitzer-winning photograph — Mary Ann Vecchio over Jeffrey Miller — became the image of the home-front rupture.", link:"https://www.britannica.com/event/Kent-State-shootings" },
    show:    { label:"The Series",       name:"Ken Burns & Lynn Novick",     work:"The Vietnam War, Episodes 1–10 (PBS, 2017)", why:"The series traces the war's full arc — from the roots of French colonialism, through the defeat at Dien Bien Phu (1954), to the American withdrawal and Saigon's fall (1975). Ten years in production.", link:"https://www.pbs.org/kenburns/the-vietnam-war/" }
  },
  {
    num: "025", theme: "Vietnam War", date: "TBD",
    // Thursday → DEEP DIVE. Spotlight: book (the literature — truth that had to be carried).
    spotlight: "book",
    deepWhy: `Tim O'Brien was drafted and served with the 23rd Infantry Division. The Things They \
Carried (1990) is a collection of linked stories that deliberately blur fiction and fact — O'Brien \
calls it metafiction. He is not after the literal truth of any event; he is after story-truth, the \
kind that carries the emotional weight no report can hold. The book was a finalist for the Pulitzer \
and the National Book Critics Circle Award and has sold over two million copies. Michael Herr's \
Dispatches (1977), drawn from his Esquire reporting, is its companion: the correspondent's record of \
what the war sounded and smelled like from the ground — language traditional journalism could not reach.`,
    intro: "Vietnam week, Thursday — <em>the language.</em> O'Brien and Herr both understood the war could not be reported straight; it had to be carried.",
    music:   { label:"What's Going On",  name:"Marvin Gaye",                 work:"What's Going On (1971)", why:"The album narrated by a returning veteran ends without resolution. So does the war. That is not a failure of the art — it is the art's honesty.", link:"https://theconversation.com/whats-going-on-at-50-marvin-gayes-motown-classic-is-as-relevant-today-as-it-was-in-1971-155262" },
    film:    { label:"The Documentary",  name:"Ken Burns & Lynn Novick",     work:"The Vietnam War (PBS, 2017)", why:"The series draws on the written record — O'Brien, Herr, letters home, diaries — as part of its layered approach. The literature and the documentary are in conversation.", link:"https://kenburns.com/films/vietnam/" },
    science: { label:"The Physical Load", name:"Tim O'Brien",                work:"The Things They Carried (1990)", why:"The first chapter alone — an inventory of what soldiers physically and emotionally carried — is a document of the war's weight. O'Brien served with the 23rd Infantry Division.", link:"https://en.wikipedia.org/wiki/The_Things_They_Carried" },
    book:    { label:"The Correspondent", name:"Michael Herr",               work:"Dispatches (1977)", why:"Herr covered the war for Esquire, 1967–1969 — arriving at twenty-seven, leaving broken. The ground-level record: language that matched the sensory overload of combat in ways traditional journalism could not.", link:"https://en.wikipedia.org/wiki/Dispatches_(book)" },
    artist:  { label:"The Names",        name:"Maya Lin",                    work:"Vietnam Veterans Memorial (1982)", why:"Lin's wall insists on names, not glory — names cut into black granite, arranged by date of death. The most-visited memorial on the National Mall.", link:"https://www.history.com/articles/the-21-year-old-college-student-who-designed-the-vietnam-memorial" },
    show:    { label:"The Secret Record", name:"Ken Burns & Lynn Novick",    work:"The Vietnam War — White House recordings (PBS, 2017)", why:"The series includes secret audio from inside the Kennedy, Johnson, and Nixon administrations — the private record alongside the public story, and the gap between the two.", link:"https://www.pbs.org/kenburns/the-vietnam-war/about" }
  },
  {
    num: "026", theme: "Vietnam War", date: "TBD",
    // Friday → DEEP DIVE. Spotlight: artist (the photographs that changed the war — handled with gravity).
    spotlight: "artist",
    deepWhy: `Three photographers, three places, three moments across nine years — and what they saw \
changed the trajectory of a war. On June 11, 1963, the Buddhist monk Thich Quang Duc sat down in a \
Saigon intersection and, in a deliberate act of protest against the Diem government, was set alight. \
He did not move. Malcolm Browne — the only Western cameraman present — photographed it; Kennedy said \
no news photograph had ever generated so much worldwide emotion. Eddie Adams photographed Brigadier \
General Nguyen Ngoc Loan executing a prisoner on a Saigon street during Tet, February 1, 1968; the man \
Loan shot — a bound captive, Nguyen Van Lem — died on that street, and that death too was the war. \
Adams won the Pulitzer and spent years regretting what the frame did to Loan, because a single image \
cannot carry the context a war requires. The third, taken June 8, 1972, shows nine-year-old Phan Thi \
Kim Phuc running from a napalm strike on Trang Bang. Its authorship is under formal review — World \
Press Photo suspended Nick Ut's attribution in May 2025 after the documentary The Stringer; the \
Associated Press has not changed it. The photograph and its 1973 Pulitzer are not in dispute. Kim Phuc survived.`,
    intro: "Vietnam week, Friday — <em>the witness.</em> Three photographs, taken across nine years, that changed the politics of a nation. They are still working.",
    music:   { label:"Protest",          name:"Bob Dylan",                   work:"\"Blowin' in the Wind\" (1963)", why:"The era's moral question mark, adopted by a movement that needed language for what it saw in the photographs.", link:"https://en.wikipedia.org/wiki/Blowin%27_in_the_Wind" },
    film:    { label:"The Documentary",  name:"Ken Burns & Lynn Novick",     work:"The Vietnam War (PBS, 2017)", why:"The series incorporates the war's greatest photojournalism — remastered, placed in context, and returned to the people whose faces they captured.", link:"https://www.pbs.org/kenburns/the-vietnam-war/about" },
    science: { label:"The Burning Monk", name:"Malcolm Browne",              work:"Thich Quang Duc, June 11, 1963", why:"Browne was the only Western cameraman present when the monk set himself ablaze in protest. Kennedy said no news photograph had generated more worldwide emotion. Browne won the 1963 World Press Photo of the Year.", link:"https://www.worldpressphoto.org/collection/photo-contest/1963/malcolm-w-browne/1" },
    book:    { label:"Saigon, 1968",     name:"Eddie Adams",                 work:"\"Saigon Execution,\" February 1, 1968", why:"Adams photographed Gen. Nguyen Ngoc Loan shooting a bound prisoner, Nguyen Van Lem, during Tet. He won the 1969 Pulitzer — and later said the frame destroyed Loan's life, and that a single image cannot convey the context a war requires.", link:"https://en.wikipedia.org/wiki/Saigon_Execution" },
    artist:  { label:"Trang Bang, 1972", name:"AP photograph — authorship under formal review", work:"\"The Terror of War\" (\"Napalm Girl\"), June 8, 1972", why:"Nine-year-old Phan Thi Kim Phuc running from a napalm strike. Won the 1973 Pulitzer. World Press Photo suspended Nick Ut's attribution in May 2025 after the documentary The Stringer; AP has not changed it. Kim Phuc survived.", link:"https://www.npr.org/2025/06/05/nx-s1-5400606/napalm-girl-photo" },
    show:    { label:"The Archive",      name:"Vietnam War photojournalism", work:"World Press Photo archive — Adams (1968), Browne (1963)", why:"The archive holds the record of how photojournalists changed American opinion about the war — one front page at a time.", link:"https://www.worldpressphoto.org/collection/photo-contest/1968/eddie-adams/1" }
  },
  {
    num: "027", theme: "Vietnam War", date: "TBD",
    // Saturday → DEEP DIVE. Spotlight: film (Ken Burns the filmmaker — method + filmography + influence).
    spotlight: "film",
    deepWhy: `Ken Burns directed his first documentary in 1981 — Brooklyn Bridge — through Florentine \
Films. His breakthrough, The Civil War (1990), drew forty million viewers and set his method: archival \
photographs animated by slow pans and zooms, testimony from historians and descendants, narration that \
treats history as a story with moral weight. That pan-and-zoom across stills is now called the Ken \
Burns effect and is built into editing software worldwide — he did not invent it, but he used it more \
systematically than anyone before him. With Lynn Novick he co-directed The War (2007) and The Vietnam \
War (2017). More than forty documentaries for PBS make his the most widely watched history education \
in American broadcasting. The Vietnam War is his most contested subject and, arguably, his most necessary.`,
    intro: "Vietnam week, Saturday — <em>the filmmaker.</em> Ken Burns has been building the American public's memory of itself for forty years, one slow zoom at a time. This is the summit of that work.",
    music:   { label:"The Score",        name:"Trent Reznor & Atticus Ross", work:"The Vietnam War Original Score (2017)", why:"Reznor and Ross marked a new register for a Burns film — electronic rather than acoustic, unresolved rather than elegiac. Novick made the call.", link:"https://www.nin.com/vietnamoriginalscore/" },
    film:    { label:"The Filmmaker",    name:"Ken Burns",                   work:"Filmography, 1981–present (40+ PBS documentaries)", why:"The Civil War (1990), Baseball (1994), Jazz (2001), The War (2007), The National Parks (2009), Prohibition (2011), The Roosevelts (2014), The Vietnam War (2017), Country Music (2019). The defining body of American public-history filmmaking.", link:"https://www.pbs.org/kenburns/films" },
    science: { label:"The Technique",    name:"The Ken Burns effect",        work:"Pan-and-zoom on still photographs", why:"The slow zoom across historical photographs — used most systematically by Burns with Mathew Brady's Civil War images — is now named after him and built into editing software worldwide. He popularized it; he did not invent it.", link:"https://en.wikipedia.org/wiki/Ken_Burns_effect" },
    book:    { label:"The Reach",        name:"Ken Burns & Lynn Novick",     work:"The Vietnam War (PBS, 2017) — 39 million viewers", why:"Thirty-nine million viewers across premiere and encore. The second-highest-rated Burns/Novick film of the past two decades, after The War (2007). Premiered September 17, 2017.", link:"https://kenburns.com/films/vietnam/" },
    artist:  { label:"The Collaborator", name:"Lynn Novick",                 work:"Co-director: The War (2007), The Vietnam War (2017)", why:"Novick co-directed both films with Burns — and it was Novick who brought Reznor and Ross onto The Vietnam War.", link:"https://www.pbs.org/kenburns/the-vietnam-war/about" },
    show:    { label:"The Public Record", name:"Ken Burns",                  work:"NEH Jefferson Lecture — biography", why:"The NEH biography documents Burns's full body of work and his role in American public-history education — the institutional record of forty-plus years at the craft.", link:"https://www.neh.gov/about/awards/jefferson-lecture/ken-burns-biography" }
  },
  {
    num: "028", theme: "Vietnam War", date: "TBD",
    // Sunday → DISPATCH render (reads WEEK_ARCS for the Vietnam weekStart). The per-day fields feed the chapter row.
    spotlight: "book",
    intro: "Vietnam week, Sunday — <em>the reckoning.</em> The war ended in 1975. The reckoning has not.",
    music:   { label:"The Human Ledger", name:"Marvin Gaye",                 work:"What's Going On (1971)", why:"The album ends without resolution. So does the war. That is not a failure of the art — it is the art's honesty, and the only posture that does not lie.", link:"https://www.smithsonianmag.com/history/marvin-gayes-whats-going-relevant-today-it-was-1971-180977750/" },
    film:    { label:"The Document",     name:"Ken Burns & Lynn Novick",     work:"The Vietnam War (PBS, 2017)", why:"A decade of production, nearly eighty witnesses, archival footage from both sides of the Pacific: the fullest American documentary account of a war neither side understood at the time.", link:"https://www.pbs.org/kenburns/the-vietnam-war/" },
    science: { label:"The Cost",         name:"US National Archives",        work:"Vietnam War casualty statistics (DCAS)", why:"58,220 US military fatal casualties in the DCAS database; the wall in Washington bears 58,318 names — the two differ because names have been added and corrected over time. Vietnamese dead — North, South, civilian — number in the millions; estimates remain contested and should not be reduced to a single figure.", link:"https://www.archives.gov/research/military/vietnam-war/casualty-statistics" },
    book:    { label:"The Weight",       name:"Tim O'Brien",                 work:"The Things They Carried (1990)", why:"O'Brien: \"A true war story is never moral. It does not instruct, nor encourage virtue, nor suggest models of proper human behavior.\" That sentence is the instruction on what not to do with this week.", link:"https://www.arts.gov/initiatives/nea-big-read/things-they-carried" },
    artist:  { label:"The Wall",         name:"Maya Lin",                    work:"Vietnam Veterans Memorial, Washington, D.C. (1982)", why:"Names in chronological order, not rank; the visitor's reflection in the black granite places them among the dead. The controversy it provoked — the \"black gash of shame\" — was itself a final echo of the war's divisions.", link:"https://www.history.com/this-day-in-history/november-13/vietnam-veterans-memorial-dedicated" },
    show:    { label:"The View",         name:"Ken Burns & Lynn Novick",     work:"The Vietnam War — Vietnamese testimony (PBS, 2017)", why:"The series sets combatants and civilians from North Vietnam and the Viet Cong alongside Americans. The view is not ours alone — both the series's method and the week's closing argument.", link:"https://www.pbs.org/video/voices-from-all-sides-trace-deep-roots-of-vietnam-war-1505519939" }
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
  let idx = Math.floor((NOW_EFFECTIVE - startMs) / MS);
  if (idx < 0) idx = 0;
  if (idx >= DAILY.length) idx = DAILY.length - 1;
  // HOLD on the last real-dated day — don't auto-roll into un-dated future weeks.
  // Future weeks carry date:"TBD" until deliberately activated; without this clamp the raw
  // date math lands the live Daily on a premature TBD day once a week's real dates run out
  // (e.g. showing "Daily 009 · Dune · TBD" the day after the Interstellar week ended).
  // Theme-indexed cadence: a week advances only when its dates are set, not on the clock.
  let _lastDated = 0;
  for (let i = 0; i < DAILY.length; i++) {
    const _x = DAILY[i];
    if (_x.date && _x.date !== "TBD" && !isNaN(new Date(_x.date + "T12:00:00").getTime())) _lastDated = i;
  }
  const held = idx > _lastDated;   // today is PAST the last dated day → "held" (show the teaser, not the full issue)
  if (idx > _lastDated) idx = _lastDated;

  const _p  = new URLSearchParams(location.search);
  const _pd = _p.get("date"), _pn = _p.get("day");
  if (_pd) { const i = DAILY.findIndex(x => x.date === _pd); if (i >= 0) idx = i; }
  else if (_pn) { const i = parseInt(_pn, 10) - 1; if (i >= 0 && i < DAILY.length) idx = i; }
  const explicit = !!(_pd || _pn);   // a specific issue/day requested by URL → render it in FULL

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

  /* ── Shared: optional media slot (v2.1) ──────────────────────────────────
     Additive + backward-compatible: entries MAY carry img / imgAlt / imgCredit.
     Absent img → empty string → zero rendering change (degrade-gracefully contract).
     imgCredit renders as a VISIBLE caption — required for CC-BY sources (e.g.
     "EHT Collaboration" is a license condition, not a courtesy). */
  function renderMedia(e) {
    if (!e || !e.img) return "";
    const credit = e.imgCredit
      ? `<span class="media-credit">${esc(e.imgCredit)}</span>` : "";
    return `<span class="card-media"><img src="${esc(e.img)}" alt="${esc(e.imgAlt || e.name)}" loading="lazy" decoding="async">${credit}</span>`;
  }

  /* ── Shared: one standard card (v1 format, used in MAP + dispatch chapter rows) ── */
  function renderCard(slot, e) {
    if (!e) return "";
    const lbl  = e.label  || SLOT_DISPLAY[slot];
    const verb = SLOT_VERBS[slot] || "explore";
    const work = e.work ? ` — ${esc(e.work)}` : "";
    return `<a class="card" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">
      <span class="chip">${esc(lbl)}</span>
      ${renderMedia(e)}
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
        ${renderMedia(spotSlot)}
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

  /* ── The Sunday Stack TEASER — compact homepage card. The full issue lives in the
     archive (reached via ?date=); this keeps the magazine from crowding the homepage
     between weeks. Renders in place of the full magazine on the default homepage. ── */
  function renderMagazineTeaser(arc, mag, currentDay) {
    return `
      <a class="ss-teaser" href="/?date=${esc(currentDay.date)}" aria-label="${esc(mag.name)}, Issue ${esc(mag.issue)}: ${esc(arc.theme)} — read the full issue">
        <div class="ss-teaser-eyebrow">&#9679; This week&rsquo;s issue &middot; in the archive</div>
        <div class="ss-teaser-name" translate="no">${esc(mag.name)}</div>
        <div class="ss-teaser-line">Issue ${esc(mag.issue)} &middot; ${esc(arc.theme)} &middot; <span class="ss-mast-date">${esc(currentDay.date)}</span></div>
        ${mag.tagline ? `<div class="ss-teaser-tag">${esc(mag.tagline)}</div>` : ""}
        <div class="ss-teaser-cta">Read the full issue &rarr;</div>
      </a>`;
  }

  function renderDispatch(currentDay, currentDate) {
    const mondayStr = getMondayOf(currentDate);
    const arc       = WEEK_ARCS.find(w => w.weekStart === mondayStr);

    if (!arc) {
      // No arc authored yet — graceful fallback to MAP
      return renderMap(currentDay);
    }

    // Collect all days in this week from DAILY[] — guard TBD / invalid dates.
    // (DAILY holds future weeks with date:"TBD"; new Date("TBD…") is Invalid, and
    //  getMondayOf() then throws in .toISOString() — which silently kills the whole
    //  Sunday render and drops the homepage back to its static fallback.)
    const weekDays = DAILY.filter(x => {
      if (!x.date || x.date === "TBD") return false;
      const ds  = new Date(x.date + "T12:00:00");
      if (isNaN(ds.getTime())) return false;
      const mon = getMondayOf(ds);
      return mon === mondayStr;
    });

    const mag = arc.magazine;   // optional magazine layer (The Sunday Stack)

    // ── Masthead — elevated cover when a magazine block is present ──
    let html = mag ? `
      <div class="ss-mast">
        <div class="ss-mast-name" translate="no">${esc(mag.name)}</div>
        <div class="ss-mast-line">Issue ${esc(mag.issue)} &middot; ${esc(arc.theme)} &middot; <span class="ss-mast-date">${esc(currentDay.date)}</span></div>
        ${mag.tagline ? `<div class="ss-mast-tag">${esc(mag.tagline)}</div>` : ""}
      </div>` : `
      <div class="dly-top">
        <span class="dly-title">Week ${esc(String(arc.weekNum))} &middot; ${esc(arc.theme)} &middot; Sunday Dispatch</span>
        <span class="dly-date">${esc(currentDay.date)}</span>
      </div>`;

    // ── The Editor's Letter — the reckoning (magazine only; raw HTML is author-authored + verified) ──
    if (mag && mag.letter) {
      const L = mag.letter;
      html += `
      <section class="ss-letter" aria-label="Editor's Letter">
        ${L.kicker ? `<div class="ss-kicker">${esc(L.kicker)}</div>` : ""}
        ${L.dek ? `<p class="ss-dek">${L.dek}</p>` : ""}
        ${(L.paragraphs || []).map(p => `<p class="ss-letter-p">${p}</p>`).join("")}
      </section>`;
    }

    // ── One pull-quote, set large (magazine only) ──
    if (mag && mag.pullQuote) {
      html += `
      <figure class="ss-pull">
        <blockquote>${mag.pullQuote.text}</blockquote>
        ${mag.pullQuote.cite ? `<figcaption>${esc(mag.pullQuote.cite)}</figcaption>` : ""}
      </figure>`;
    }

    // ── The week itself — synthesis + chapters (the record). Magazine gets a section label. ──
    if (mag) {
      html += `<div class="dly-rule"></div><div class="ss-section">The Week, in seven movements</div><p class="dly-intro">${esc(arc.synthesis)}</p>`;
    } else {
      html += `<p class="dly-intro">${esc(arc.synthesis)}</p><div class="dly-rule"></div>`;
    }

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

    // ── The Features — a WELL of articles (magazine only; supports multiple). Back-compat: a
    //    single mag.feature is treated as a one-item well. ──
    const feats = mag ? (mag.features || (mag.feature ? [mag.feature] : [])) : [];
    if (feats.length) {
      html += `<div class="dly-rule"></div><div class="ss-section">In this issue &middot; ${feats.length} feature${feats.length > 1 ? "s" : ""}</div>`;
      html += `<div class="ss-features">` + feats.map(F => `
      <a class="ss-feature" href="${esc(F.href)}">
        ${F.kicker ? `<span class="ss-kicker">${esc(F.kicker)}</span>` : ""}
        <span class="ss-feature-title">${esc(F.title)}</span>
        ${(F.blurb || []).map(p => `<p class="ss-feature-p">${p}</p>`).join("")}
        ${F.cta ? `<span class="go">${esc(F.cta)}</span>` : ""}
      </a>`).join("") + `</div>`;
    }
    if (mag && mag.coda) {
      const C = mag.coda;
      html += `
      <section class="ss-coda" aria-label="Coda">
        ${C.title ? `<div class="ss-coda-title">${esc(C.title)}</div>` : ""}
        ${(C.paragraphs || []).map(p => `<p class="ss-coda-p">${p}</p>`).join("")}
      </section>`;
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

    /* ── v2.1: optional card media (absent img → nothing renders) ──
       Canon: gold hairline frame; electric blue GLOW-only on hover (the Blue Law);
       visible credit caption (CC-BY legal condition for EHT-class sources). */
    .card-media{display:block;margin:0 0 .2rem;border:1px solid rgba(255,214,10,.28);
      overflow:hidden;position:relative}
    .card-media img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
    .media-credit{position:absolute;right:.35rem;bottom:.3rem;font-size:.56rem;letter-spacing:.08em;
      text-transform:uppercase;color:#cbc6b4;background:rgba(8,8,10,.72);
      padding:.1rem .35rem;border-radius:2px}
    .card:hover .card-media,.dly-deepdive:hover .card-media{border-color:#FFD60A;
      box-shadow:0 0 8px rgba(14,68,255,.55)}

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

    /* ── The Sunday Stack — magazine layer (renders only when arc.magazine present) ── */
    .ss-mast{text-align:center;padding:.5rem 0 1.5rem;margin-bottom:.3rem}
    .ss-mast-name{display:inline-block;position:relative;font-size:clamp(1.9rem,6.5vw,3.1rem);
      font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#FFD60A;line-height:1;
      text-shadow:0 1px 0 #d9a800,0 2px 0 #b88e00,0 3px 0 #8f6f00,0 4px 6px rgba(0,0,0,.5)}
    .ss-mast-name::after{content:'';position:absolute;left:50%;bottom:-.36rem;transform:translateX(-50%);
      width:48%;height:3px;background:#0E44FF;border-radius:2px;
      box-shadow:0 0 6px rgba(14,68,255,1),0 0 16px rgba(14,68,255,.85),0 0 34px rgba(14,68,255,.55)}
    .ss-mast-line{margin-top:1rem;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#d9b400}
    .ss-mast-date{color:#8f8a73}
    .ss-mast-tag{margin-top:.55rem;font-size:.86rem;font-style:italic;color:#cbc6b4;letter-spacing:.01em}

    .ss-kicker{display:block;font-size:.64rem;letter-spacing:.22em;text-transform:uppercase;
      color:#0E44FF;font-weight:600;margin-bottom:.55rem;text-shadow:0 0 8px rgba(14,68,255,.55)}
    .ss-letter{max-width:46rem;margin:1.7rem auto 0;padding:0 .15rem}
    .ss-dek{font-size:clamp(1.05rem,3vw,1.32rem);line-height:1.42;color:#FFD60A;font-style:italic;
      font-weight:600;letter-spacing:.005em;margin:0 0 1.15rem}
    .ss-letter-p{font-size:1.01rem;line-height:1.74;color:#f3eede;margin:0 0 1.05rem}
    .ss-letter-p:last-child{margin-bottom:0}
    .ss-letter-p em,.ss-feature-p em,.ss-coda-p em{color:#FFD60A;font-style:italic}

    .ss-pull{max-width:43rem;margin:2.1rem auto;padding:.1rem 0 .1rem 1.35rem;border-left:3px solid #0E44FF;
      box-shadow:-1px 0 14px -7px rgba(14,68,255,.85)}
    .ss-pull blockquote{margin:0;font-size:clamp(1.3rem,4vw,1.85rem);line-height:1.32;
      color:#d9b400;font-style:italic;font-weight:600;letter-spacing:.004em}
    .ss-pull figcaption{margin-top:.7rem;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#8f8a73}

    .ss-section{display:flex;align-items:center;gap:1rem;text-align:center;
      font-size:.72rem;letter-spacing:.26em;text-transform:uppercase;color:#8f8a73;margin:.1rem 0 1.15rem}
    .ss-section::before,.ss-section::after{content:'';height:1px;background:rgba(143,138,115,.28);flex:1}

    .ss-features{display:grid;gap:1.1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));margin-top:.1rem}
    .ss-feature{display:flex;flex-direction:column;gap:.55rem;text-decoration:none;color:inherit;
      border:1px solid rgba(255,214,10,.4);background:rgba(255,214,10,.03);
      padding:1.5rem 1.5rem 1.35rem;position:relative;overflow:hidden;transition:.16s ease}
    .ss-feature::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#0E44FF;
      box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.6)}
    .ss-feature:hover{border-color:#FFD60A;background:rgba(255,214,10,.06);transform:translateY(-2px)}
    .ss-feature-title{font-size:clamp(1.3rem,4vw,1.9rem);letter-spacing:.04em;text-transform:uppercase;
      color:#FFD60A;font-weight:600;line-height:1.1}
    .ss-feature-p{font-size:.95rem;line-height:1.62;color:#f3eede;max-width:52rem;margin:0}
    .ss-feature .go{font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:#8f8a73;margin-top:.15rem}
    .ss-feature:hover .go{color:#FFD60A}

    .ss-coda{max-width:40rem;margin:1.7rem auto 0;text-align:center}
    .ss-coda-title{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#d9b400;margin-bottom:.75rem}
    .ss-coda-p{font-size:.96rem;line-height:1.7;color:#cbc6b4;margin:0 auto .8rem;max-width:38rem}
    .ss-coda-p:last-child{margin-bottom:0}

    /* ── The Sunday Stack TEASER — compact homepage card (full issue lives in the archive) ── */
    .ss-teaser{display:block;text-decoration:none;color:inherit;position:relative;overflow:hidden;
      border:1px solid rgba(255,214,10,.34);background:rgba(255,214,10,.025);padding:1.3rem 1.5rem;transition:.16s ease}
    .ss-teaser::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#0E44FF;
      box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.6)}
    .ss-teaser:hover{border-color:#FFD60A;background:rgba(255,214,10,.05);transform:translateY(-2px)}
    .ss-teaser-eyebrow{font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:#8f8a73;margin-bottom:.7rem}
    .ss-teaser-name{font-size:clamp(1.5rem,5vw,2.1rem);font-weight:600;letter-spacing:.05em;text-transform:uppercase;
      color:#FFD60A;line-height:1.05;text-shadow:0 1px 0 #d9a800,0 2px 0 #8f6f00,0 3px 5px rgba(0,0,0,.5)}
    .ss-teaser-line{margin-top:.5rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#d9b400}
    .ss-teaser-tag{margin-top:.5rem;font-size:.92rem;font-style:italic;color:#cbc6b4;max-width:40rem}
    .ss-teaser-cta{margin-top:.85rem;font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:#8f8a73}
    .ss-teaser:hover .ss-teaser-cta{color:#FFD60A}
  `;

  /* ── Assemble HTML by mode ────────────────────────────────────────────── */
  let body;
  if (mode === "map") {
    body = renderMap(d);
  } else if (mode === "deepdive") {
    body = renderDeepDive(d);
  } else {
    // dispatch — the homepage shows a COMPACT Sunday Stack teaser; the full issue lives in
    // the archive, reached via ?date=. The full magazine renders only when a specific issue
    // is explicitly requested by URL (so the homepage never crowds with the whole magazine).
    const _arc = WEEK_ARCS.find(w => w.weekStart === getMondayOf(dayDate));
    if (_arc && _arc.magazine && !explicit && held) {
      body = renderMagazineTeaser(_arc, _arc.magazine, d);   // BETWEEN/AFTER the week → compact teaser
    } else {
      body = renderDispatch(d, dayDate);                     // the actual Sunday (or explicit ?date=) → full multi-article issue
    }
  }

  mount.innerHTML = `<style>${styles}</style>${body}`;
})();
