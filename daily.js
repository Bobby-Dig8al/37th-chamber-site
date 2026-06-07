/* The Daily — five good people across culture, every day.
   Date-indexed + self-rendering. We POINT, never reproduce (copyright-safe:
   names, works, our own lines, and links back to the source). Stack days
   ahead in DAILY[] and each appears on its date — no daily push needed. */

const DAILY_START = "2026-06-06";        // DAILY[0] is this date
const DAILY = [
  {
    date: "2026-06-06",
    music:     { name: "Ben Harper", work: "Fight for Your Mind (1995) · Diamonds on the Inside (2003)",
                 why: "A conscience with a slide guitar. Go hear it loud.", link: "https://www.benharper.com/music" },
    book:      { name: "1984", by: "George Orwell",
                 why: "The book that named the cage.", link: "https://en.wikipedia.org/wiki/Nineteen_Eighty-Four",
                 project: "Want to make an updated film of it with your AI? Here's how to start: read the book. Then come back for your ops manual — the AI for creatives chamber (soon).",
                 credo: "I didn't steal anyone's work. I built my own — weaving together threads from my entire life into what you see before you." },
    film:      { name: "Hayao Miyazaki", work: "Studio Ghibli", why: "Hand-drawn worlds with a moral spine. Craft as devotion.", link: "https://en.wikipedia.org/wiki/Hayao_Miyazaki", pick: true },
    artist:    { name: "Vincent van Gogh", work: "painter", why: "Unseen in his own time. Beauty out of struggle — diamonds on the inside.", link: "https://en.wikipedia.org/wiki/Vincent_van_Gogh", pick: true },
    scientist: { name: "Nikola Tesla", work: "inventor", why: "Built the modern world out of electrons — and gave it away. Our kind of giant.", link: "https://en.wikipedia.org/wiki/Nikola_Tesla", pick: true }
  }
  // ← stack more days here (one object per day, in order). They auto-appear on their date.
];

(function () {
  const mount = document.getElementById("the-daily");
  if (!mount) return;

  // pick today's entry by date index; clamp to the last stacked entry
  const MS = 86400000;
  const start = new Date(DAILY_START + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let idx = Math.floor((today - start) / MS);
  if (idx < 0) idx = 0;
  if (idx >= DAILY.length) idx = DAILY.length - 1;   // graceful: hold last until stack is topped up
  const d = DAILY[idx];

  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const A = (href, txt) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(txt)}</a>`;

  function row(icon, label, e, extra = "") {
    if (!e) return "";
    const work = e.work ? ` <span class="dly-work">— ${esc(e.work)}</span>` : (e.by ? ` <span class="dly-work">— ${esc(e.by)}</span>` : "");
    const swap = e.pick ? ` <span class="dly-pick" title="a personal pick">▷</span>` : "";
    return `<div class="dly-row">
      <span class="dly-ico">${icon}</span>
      <div class="dly-body">
        <div class="dly-head"><span class="dly-label">${label}</span> ${A(e.link, e.name)}${work}${swap}</div>
        <div class="dly-why">${esc(e.why)}</div>${extra}
      </div></div>`;
  }

  const bookExtra = d.book ? `
      <div class="dly-project">${esc(d.book.project)}</div>
      <div class="dly-credo">“${esc(d.book.credo)}” <span class="dly-sig">— bobby</span></div>` : "";

  mount.innerHTML = `
    <style>
      #the-daily{width:100%;max-width:980px;margin:0 0 1.4rem;border:1px solid rgba(255,214,10,.34);
        background:rgba(255,214,10,.025);position:relative;overflow:hidden;padding:1.1rem 1.25rem 1.2rem}
      #the-daily::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#0E44FF;
        box-shadow:0 0 8px rgba(14,68,255,.95),0 0 20px rgba(14,68,255,.55)}
      .dly-top{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:.9rem}
      .dly-title{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:#FFD60A;font-weight:600}
      .dly-date{font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:#8f8a73}
      .dly-row{display:flex;gap:.7rem;padding:.55rem 0;border-top:1px solid rgba(143,138,115,.16)}
      .dly-row:first-of-type{border-top:0}
      .dly-ico{font-size:1rem;line-height:1.5;flex-shrink:0;width:1.4rem;text-align:center;filter:grayscale(.2)}
      .dly-body{flex:1;min-width:0}
      .dly-head{font-size:.98rem;color:#f3eede;line-height:1.4}
      .dly-label{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#8f8a73;margin-right:.2rem}
      .dly-head a{color:#FFD60A;text-decoration:none;font-weight:600}
      .dly-head a:hover{text-decoration:underline}
      .dly-work{color:#8f8a73;font-size:.86rem}
      .dly-pick{color:#8f8a73;font-size:.7rem;cursor:help}
      .dly-why{font-size:.86rem;color:#cbc6b4;line-height:1.45;margin-top:.1rem}
      .dly-project{margin-top:.45rem;font-size:.84rem;color:#d9b400;line-height:1.45;border-left:2px solid rgba(255,214,10,.4);padding-left:.6rem}
      .dly-credo{margin-top:.4rem;font-size:.8rem;color:#8f8a73;font-style:italic;line-height:1.45}
      .dly-sig{font-style:normal;color:#d9b400}
    </style>
    <div class="dly-top"><span class="dly-title">Today &middot; five good people</span><span class="dly-date">${esc(d.date)}</span></div>
    ${row("🎵","Music",d.music)}
    ${row("📕","Book",d.book,bookExtra)}
    ${row("🎬","Film",d.film)}
    ${row("🎨","Artist",d.artist)}
    ${row("🔬","Science",d.scientist)}
  `;
})();
