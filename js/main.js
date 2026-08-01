/* LuxeVisuals — shared site behaviour: mobile nav, active links, scroll reveals */

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Active nav link (based on current file name) ---- */
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("?")[0];
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ---- Portfolio sub-nav: expand when on portfolio.html ---- */
  const portfolioSub = document.querySelector(".nav-sub");
  if (portfolioSub && current === "portfolio.html") {
    portfolioSub.classList.add("open");
  }

  /* ---- Mobile sidebar toggle ---- */
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".sidebar");
  const scrim = document.querySelector(".overlay-scrim");

  const closeMenu = () => {
    sidebar?.classList.remove("open");
    scrim?.classList.remove("open");
  };

  hamburger?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    scrim?.classList.toggle("open");
  });
  scrim?.addEventListener("click", closeMenu);
  document.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", closeMenu));

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }
});
