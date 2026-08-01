/* =============================================================================
   LuxeVisuals — Portfolio auto-loader (category-aware)

   Portfolio pieces live in three subfolders under /portfolio:
     portfolio/ui/          UI design frames & clips
     portfolio/scripting/   animation scripting clips
     portfolio/reviews/     client reviews

   Inside each folder, name files sequentially starting at 1:
   1.png, 2.mp4, 3.jpg, 4.jpeg ... — no manifest, no config needed.
   This script probes each folder for those files and builds the grid +
   lightbox automatically.

   Which folder(s) get scanned is controlled by a ?cat= query param on
   portfolio.html:
     portfolio.html            -> mixes all three categories together
     portfolio.html?cat=ui     -> UI only
     portfolio.html?cat=scripting -> Scripting only
     portfolio.html?cat=reviews   -> Client Reviews only

   NOTE: this relies on fetch() HEAD requests, which only work when the site
   is served over http(s) — e.g. GitHub Pages, or a local dev server such as
   `npx serve` / `python3 -m http.server`. Opening index.html directly from
   disk (file://) will NOT be able to probe the folder due to browser CORS
   rules — see the README for how to preview locally.
   ============================================================================= */

(() => {
  const CATEGORIES = {
    ui: { folder: "portfolio/ui/", label: "UI", tag: "UI" },
    scripting: { folder: "portfolio/scripting/", label: "Scripting", tag: "SCRIPT" },
    reviews: { folder: "portfolio/reviews/", label: "Client Reviews", tag: "REVIEW" },
  };
  const CATEGORY_ORDER = ["ui", "scripting", "reviews"];

  const HERO_COPY = {
    all: {
      title: "Portfolio",
      eyebrow: "Selected Work",
      lede: "A running record of finished UI frames, scripted animations, and client reviews. Click any piece to view it full screen.",
    },
    ui: {
      title: "UI",
      eyebrow: "Selected Work — UI",
      lede: "Finished UI frames and full interface redesigns. Click any piece to view it full screen.",
    },
    scripting: {
      title: "Scripting",
      eyebrow: "Selected Work — Scripting",
      lede: "Scripted visual animations — tweens, transitions, and reveals. Click any piece to view it full screen.",
    },
    reviews: {
      title: "Client Reviews",
      eyebrow: "Selected Work — Client Reviews",
      lede: "Feedback and reviews from past clients. Click any piece to view it full screen.",
    },
  };

  const EXTENSIONS = ["png", "jpg", "jpeg", "mp4"];
  const MAX_ITEMS = 300; // hard ceiling, just in case
  const MAX_CONSECUTIVE_MISSES = 3; // stop scanning after this many empty slots in a row

  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;

  /* ---------------- Category resolution ---------------- */

  const params = new URLSearchParams(location.search);
  const requestedCat = params.get("cat");
  const activeCat = CATEGORIES[requestedCat] ? requestedCat : "all";

  applyHeroCopy(activeCat);
  markActiveSubNav(activeCat);

  function applyHeroCopy(cat) {
    const copy = HERO_COPY[cat] || HERO_COPY.all;
    const titleEl = document.getElementById("portfolio-title");
    const eyebrowEl = document.getElementById("portfolio-eyebrow");
    const ledeEl = document.getElementById("portfolio-lede");
    if (titleEl) titleEl.textContent = copy.title;
    if (eyebrowEl) eyebrowEl.textContent = copy.eyebrow;
    if (ledeEl) ledeEl.textContent = copy.lede;
    document.title = `${copy.title === "Portfolio" ? "Portfolio" : copy.title + " — Portfolio"} — LuxeVisuals`;
  }

  function markActiveSubNav(cat) {
    document.querySelectorAll(".nav-sub a").forEach((a) => {
      const linkCat = new URL(a.href, location.href).searchParams.get("cat");
      a.classList.toggle("active", linkCat === cat);
    });
  }

  /* ---------------- Scanning ---------------- */

  const fileExists = (url) =>
    fetch(url, { method: "HEAD", cache: "no-store" })
      .then((res) => res.ok)
      .catch(() => false);

  async function findItem(folder, n) {
    for (const ext of EXTENSIONS) {
      const url = `${folder}${n}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await fileExists(url)) {
        return { url, type: ext === "mp4" ? "video" : "image" };
      }
    }
    return null;
  }

  async function scanFolder(catKey) {
    const { folder, tag } = CATEGORIES[catKey];
    const found = [];
    let misses = 0;

    for (let n = 1; n <= MAX_ITEMS; n++) {
      // eslint-disable-next-line no-await-in-loop
      const item = await findItem(folder, n);
      if (item) {
        found.push({ ...item, cat: catKey, tag });
        misses = 0;
      } else {
        misses++;
        if (misses >= MAX_CONSECUTIVE_MISSES) break;
      }
    }
    return found;
  }

  /* ---------------- Tiles + Lightbox ---------------- */

  function buildTile(item) {
    const tile = document.createElement("div");
    tile.className = "portfolio-item reveal";

    const kindTag = document.createElement("span");
    kindTag.className = "kind-tag";
    kindTag.textContent = item.tag;
    tile.appendChild(kindTag);

    let media;
    if (item.type === "video") {
      media = document.createElement("video");
      media.src = item.url;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.autoplay = true;
      media.preload = "metadata";
    } else {
      media = document.createElement("img");
      media.src = item.url;
      media.loading = "lazy";
      media.alt = "";
    }
    tile.appendChild(media);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;
    tile.appendChild(overlay);

    tile.addEventListener("click", () => openLightbox(item));
    return tile;
  }

  let lightbox, stage, closeBtn;

  function ensureLightbox() {
    if (lightbox) return;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
      <div class="lightbox-stage"></div>
    `;
    document.body.appendChild(lightbox);
    stage = lightbox.querySelector(".lightbox-stage");
    closeBtn = lightbox.querySelector(".lightbox-close");

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  function openLightbox(item) {
    ensureLightbox();
    stage.innerHTML = "";
    let media;
    if (item.type === "video") {
      media = document.createElement("video");
      media.src = item.url;
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.playsInline = true;
    } else {
      media = document.createElement("img");
      media.src = item.url;
      media.alt = "";
    }
    stage.appendChild(media);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      stage.innerHTML = "";
    }, 300);
  }

  /* ---------------- Load + render ---------------- */

  async function loadPortfolio() {
    let found = [];

    if (activeCat === "all") {
      const results = await Promise.all(CATEGORY_ORDER.map((cat) => scanFolder(cat)));
      CATEGORY_ORDER.forEach((cat, i) => {
        found = found.concat(results[i]);
      });
    } else {
      found = await scanFolder(activeCat);
    }

    grid.innerHTML = "";

    if (!found.length) {
      const folderHint =
        activeCat === "all"
          ? "portfolio/ui, portfolio/scripting, or portfolio/reviews"
          : CATEGORIES[activeCat].folder;
      grid.innerHTML = `
        <div class="portfolio-empty">
          No work uploaded yet — drop numbered files (1.png, 2.mp4 …)
          into <code>${folderHint}</code> to populate this page.
        </div>`;
      return;
    }

    found.forEach((item) => grid.appendChild(buildTile(item)));

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    } else {
      grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    }
  }

  grid.innerHTML = `
    <div class="portfolio-loading">
      <div class="spin"></div>
      Scanning /portfolio …
    </div>`;

  loadPortfolio();
})();
