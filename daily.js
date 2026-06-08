/* The Daily — six good people, every day, around one masterwork.
   Themed deep-dives, date-queued: stack days ahead in DAILY[] and each appears
   on its date. We POINT, never reproduce (names, our own lines, links to source).
   The day rolls at 04:00 LOCAL (bd8's BOD), not midnight.
   Goal (after Interstellar): 3 women / 3 men where the theme allows — theme wins.
   Renders a 6-box card grid (3 across, then 3) using the site's .grid/.card,
   with a category .chip per card (chip layout, no emoji icons).
   NOTE: bump the ?v= on the <script src="/daily.js?v=N"> when you edit this file. */

const DAILY_START   = "2026-06-08";   // DAILY[0] is this date — Daily 001 · Interstellar
const ROLLOVER_HOUR = 4;              // the day flips at 04:00 local

const DAILY = [
  {
    num: "001", theme: "Interstellar", date: "2026-06-08",
    intro: "Today, one true thread — <em>Interstellar.</em> Carl Sagan introduced Kip Thorne to the producer who seeded the film; Thorne's real physics built its wormhole and its black hole.",
    music:   { name:"Hans Zimmer",       work:"Interstellar (OST)",          why:"The organ that turns a docking scene into a prayer.", link:"https://open.spotify.com/album/3B61kSKTxlY36cYgzvf3cP" },
    film:    { name:"Christopher Nolan", work:"Interstellar",                why:"Love across spacetime, with the physics kept honest.", link:"https://en.wikipedia.org/wiki/Interstellar_(film)" },
    science: { name:"Kip Thorne",        work:"The Science of Interstellar", why:"Originated the film; his black-hole math rendered Gargantua — and produced real papers.", link:"https://en.wikipedia.org/wiki/Kip_Thorne" },
    book:    { name:"Carl Sagan",        work:"Contact",                     why:"Its wormhole was built by Thorne himself — the direct ancestor.", link:"https://en.wikipedia.org/wiki/Contact_(novel)" },
    artist:  { name:"Chesley Bonestell", work:"space art",                   why:"Father of space art; made the cosmos visible decades before any probe could.", link:"https://en.wikipedia.org/wiki/Chesley_Bonestell" },
    show:    { name:"Cosmos",            work:"Carl Sagan (1980)",           why:"Made a generation feel the universe.", link:"https://en.wikipedia.org/wiki/Cosmos:_A_Personal_Voyage" }
  },
  {
    num: "002", theme: "World War II", date: "2026-06-09",
    intro: "One true thread — <em>the Second World War.</em> Six who met the worst of the century with meaning, witness, and craft.",
    music:   { name:"Billie Holiday", work:"“Strange Fruit” (1939)", why:"The anti-lynching anthem — a nation fighting fascism abroad while lynching its own at home.", link:"https://en.wikipedia.org/wiki/Strange_Fruit" },
    film:    { name:"Hedy Lamarr",    work:"actress & inventor",            why:"Hollywood star who co-invented frequency-hopping in 1942 to beat the Nazis — the bones of Bluetooth and spread-spectrum wireless.", link:"https://en.wikipedia.org/wiki/Hedy_Lamarr" },
    science: { name:"Viktor Frankl",  work:"Man's Search for Meaning",      why:"Logotherapy forged in the camps: meaning as survival.", link:"https://en.wikipedia.org/wiki/Viktor_Frankl" },
    book:    { name:"Kurt Vonnegut",  work:"Slaughterhouse-Five",           why:"Survived the Dresden firebombing as a POW; wrote the war's absurd grief.", link:"https://en.wikipedia.org/wiki/Slaughterhouse-Five" },
    artist:  { name:"Lee Miller",     work:"war photographer",              why:"Vogue model turned combat photographer; shot the liberation of Dachau and Buchenwald.", link:"https://en.wikipedia.org/wiki/Lee_Miller" },
    show:    { name:"Dan Carlin",     work:"Hardcore History",              why:"Ghosts of the Ostfront / Supernova in the East — the war at human scale.", link:"https://www.dancarlin.com/hardcore-history-series/" }
  },
  {
    num: "003", theme: "Human Rights", date: "2026-06-10",
    intro: "Today, one true thread — <em>human rights.</em> Six who insisted dignity is recognized, not granted — and paid to prove it.",
    music:   { label:"Music",           name:"Nina Simone",       work:"“Mississippi Goddam”",          why:"The movement's voice — she turned the piano into a demand.", link:"https://en.wikipedia.org/wiki/Nina_Simone" },
    film:    { label:"Film",            name:"Ava DuVernay",      work:"Selma · 13th",                 why:"Selma's bridge; 13th's case that slavery was rewritten, not ended.", link:"https://en.wikipedia.org/wiki/Ava_DuVernay" },
    science: { label:"The Declaration", name:"Eleanor Roosevelt", work:"the UDHR (1948)",              why:"Chaired the drafting of the charter that named rights universal.", link:"https://en.wikipedia.org/wiki/Universal_Declaration_of_Human_Rights" },
    book:    { label:"Memoir",          name:"Nelson Mandela",    work:"Long Walk to Freedom",         why:"27 years jailed, then chose reconciliation over revenge.", link:"https://en.wikipedia.org/wiki/Long_Walk_to_Freedom" },
    artist:  { label:"Art",             name:"Ai Weiwei",         work:"dissident art",                why:"Turns surveillance and exile into work the state can't unsee.", link:"https://en.wikipedia.org/wiki/Ai_Weiwei" },
    show:    { label:"The March",       name:"John Lewis",        work:"Good Trouble (2020)",          why:"Beaten at Selma's bridge at 25; made “good trouble” a life.", link:"https://en.wikipedia.org/wiki/John_Lewis" }
  },
  {
    num: "004", theme: "The Harlem Renaissance", date: "2026-06-11",
    intro: "Today, one true thread — <em>the Harlem Renaissance.</em> A few square miles of 1920s Manhattan where Black America remade the country's art.",
    music:   { label:"Blues",        name:"Bessie Smith",       work:"Empress of the Blues",          why:"The voice that made the blues a national art.", link:"https://en.wikipedia.org/wiki/Bessie_Smith" },
    film:    { label:"Cinema",       name:"Oscar Micheaux",     work:"pioneering Black film",         why:"Built a Black film industry when Hollywood wouldn't.", link:"https://en.wikipedia.org/wiki/Oscar_Micheaux" },
    science: { label:"The Idea",     name:"W.E.B. Du Bois",     work:"The Souls of Black Folk",       why:"Named double-consciousness; co-founded the NAACP.", link:"https://en.wikipedia.org/wiki/W._E._B._Du_Bois" },
    book:    { label:"Literature",   name:"Zora Neale Hurston", work:"Their Eyes Were Watching God",  why:"Wrote Black womanhood whole, in its own voice.", link:"https://en.wikipedia.org/wiki/Zora_Neale_Hurston" },
    artist:  { label:"Sculpture",    name:"Augusta Savage",     work:"sculptor",                      why:"Sculpted Harlem's faces; taught a generation, fought for their place.", link:"https://en.wikipedia.org/wiki/Augusta_Savage" },
    show:    { label:"The Stage",    name:"Duke Ellington",     work:"the Cotton Club",               why:"Made the orchestra speak — jazz as America's classical music.", link:"https://en.wikipedia.org/wiki/Duke_Ellington" }
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
  const d = DAILY[idx];

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function card(label, verb, e) {
    if (!e) return "";
    const lbl = e.label || label;   // per-figure label override; falls back to the default slot label
    const work = e.work ? ` — ${esc(e.work)}` : "";
    return `<a class="card" href="${esc(e.link)}" target="_blank" rel="noopener">
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
      #the-daily::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#0E44FF;
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
