/* =============================================================================
   LuxeVisuals — Portfolio auto-loader

   Drop files into the /portfolio folder named sequentially: 1, 2, 3, 4 ...
   Each number may be a .png (image) or .mp4 (video) — nothing else is needed,
   no manifest, no config. This script probes the folder for those files and
   builds the grid + lightbox automatically.

   NOTE: this relies on fetch() HEAD requests, which only work when the site
   is served over http(s) — e.g. GitHub Pages, or a local dev server such as
   `npx serve` / `python3 -m http.server`. Opening index.html directly from
   disk (file://) will NOT be able to probe the folder due to browser CORS
   rules — see the README for how to preview locally.
   ============================================================================= */

(() => {
  const FOLDER = "portfolio/";
  const EXTENSIONS = ["png", "mp4"];
  const MAX_ITEMS = 300; // hard ceiling, just in case
  const MAX_CONSECUTIVE_MISSES = 3; // stop scanning after this many empty slots in a row

  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;

  const fileExists = (url) =>
    fetch(url, { method: "HEAD", cache: "no-store" })
      .then((res) => res.ok)
      .catch(() => false);

  async function findItem(n) {
    for (const ext of EXTENSIONS) {
      const url = `${FOLDER}${n}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await fileExists(url)) {
        return { url, type: ext === "mp4" ? "video" : "image" };
      }
    }
    return null;
  }

  function buildTile(item) {
    const tile = document.createElement("div");
    tile.className = "portfolio-item reveal";

    const kindTag = document.createElement("span");
    kindTag.className = "kind-tag";
    kindTag.textContent = item.type === "video" ? "CLIP" : "FRAME";
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

  /* ---------------- Lightbox ---------------- */

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

    // Click outside the media (on the dark scrim) closes it
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
    // Stop playback after the fade-out
    setTimeout(() => {
      stage.innerHTML = "";
    }, 300);
  }

  /* ---------------- Scan + render ---------------- */

  async function loadPortfolio() {
    const found = [];
    let misses = 0;

    for (let n = 1; n <= MAX_ITEMS; n++) {
      // eslint-disable-next-line no-await-in-loop
      const item = await findItem(n);
      if (item) {
        found.push(item);
        misses = 0;
      } else {
        misses++;
        if (misses >= MAX_CONSECUTIVE_MISSES) break;
      }
    }

    grid.innerHTML = "";

    if (!found.length) {
      grid.innerHTML = `
        <div class="portfolio-empty">
          No work uploaded yet — drop numbered files (1.png, 2.mp4 …)
          into the <code>/portfolio</code> folder to populate this page.
        </div>`;
      return;
    }

    found.forEach((item) => grid.appendChild(buildTile(item)));

    // Re-run reveal-on-scroll for newly injected tiles
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
