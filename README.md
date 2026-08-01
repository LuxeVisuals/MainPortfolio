# LuxeVisuals — Portfolio Website

A 5-page portfolio site (Home, Rules & TOS, Pricing, Portfolio, Contact) built
with plain HTML/CSS/JS — no build tools, no framework, no npm install. It's
designed to be hosted for free on **GitHub Pages**.

This README assumes you've never set up a GitHub repo before and walks
through it from zero.

---

## 1. What you need

- A [GitHub account](https://github.com/join) (free)
- [Git](https://git-scm.com/downloads) installed on your computer
- A code editor — [VS Code](https://code.visualstudio.com/) is a good free option
- (Optional, for local preview) [Node.js](https://nodejs.org/) or Python, either works

---

## 2. Create the GitHub repository

1. Log in to GitHub and click the **+** in the top-right corner → **New repository**.
2. Name it something like `luxevisuals-portfolio` (the name doesn't matter, but avoid spaces).
3. Set it to **Public** — GitHub Pages' free tier requires public repos (unless you're on GitHub Pro/Team).
4. **Do not** check "Add a README" — you already have one in this folder.
5. Click **Create repository**. GitHub will show you a page with setup commands — keep that tab open.

---

## 3. Choosing a license

This project ships with an **"All Rights Reserved"** `LICENSE` file by default. That's usually the right call for a personal brand site — it protects your designs, your monogram, and your copy from being reused without permission.

If you'd rather let other developers freely reuse the *code* of this site (not your artwork, portfolio pieces, or branding) for their own projects, you can swap in the **MIT License** instead:

- Delete the contents of `LICENSE`
- Paste in the [MIT License text](https://choosealicense.com/licenses/mit/), replacing the copyright line with your name and year

Either way, keeping *some* license file (rather than none) makes your rights explicit — GitHub repos with no license default to standard copyright, but stating it directly avoids any ambiguity.

---

## 4. Push this project to GitHub

Open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "Initial commit — LuxeVisuals portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with the values GitHub showed you in Step 2.

---

## 5. Turn on GitHub Pages

1. In your repository on GitHub, go to **Settings** → **Pages** (in the left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, select `main` and folder `/ (root)`, then **Save**.
4. Wait a minute or two, then refresh — GitHub will show a green box with your live URL, something like:

```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

That's your live portfolio. Any time you push new commits to `main`, the site updates automatically within a minute or so.

---

## 6. Adding your real logo & profile picture

The site currently ships with an SVG recreation of your gold "LV" monogram as a placeholder for both the sidebar logo and the homepage profile picture. Swap in your real files:

1. Drop your actual logo image into `assets/images/` — e.g. `assets/images/logo.png`.
2. Drop your profile picture into the same folder — e.g. `assets/images/profile.png`.
3. Update the `src` attributes in each HTML file:
   - Every `<img class="brand-mark" src="assets/images/logo.svg">` → point to your new logo file.
   - In `index.html`, `<img src="assets/images/profile.svg" alt="LuxeVisuals profile">` → point to your new profile picture.
4. Commit and push — the live site updates automatically.

*(Tip: keep the profile picture roughly square — the homepage frame crops it to a square.)*

---

## 7. Adding portfolio work

This is fully automatic. The Portfolio page is split into three categories, each with its own folder:

```
portfolio/ui/          UI design frames & clips
portfolio/scripting/   animation scripting clips
portfolio/reviews/     client reviews
```

For each category:

1. Export your finished pieces as `.png`, `.jpg`, `.jpeg` (images) or `.mp4` (video).
2. Name them in order starting at `1`: `1.png`, `2.mp4`, `3.jpg`...
3. Drop them into the matching subfolder above.
4. Commit and push. The Portfolio page scans the folders automatically — no editing of HTML or JS required.

The sidebar's Portfolio nav item expands into UI / Scripting / Client Reviews sub-links (`portfolio.html?cat=ui`, `?cat=scripting`, `?cat=reviews`). Visiting `portfolio.html` with no `?cat=` shows everything mixed together.

**Important:** the auto-detection works by asking the server "does this file exist?", which only works when the site is actually served over `http(s)` — i.e. on GitHub Pages, or a local dev server (see below). Double-clicking `index.html` to open it directly from your file explorer will *not* be able to scan the folder, because browsers block that kind of request for local files.

---

## 8. Previewing locally before you push

To see your changes before pushing, run a tiny local server from the project folder (either works, pick whichever you have installed):

```bash
# Option A — Node.js
npx serve .

# Option B — Python 3
python3 -m http.server 8000
```

Then open the URL it gives you (e.g. `http://localhost:8000`) in your browser.

---

## 9. Project structure

```
luxevisuals-portfolio/
├── index.html          Home page
├── tos.html             Rules & TOS page
├── pricing.html          Pricing page
├── portfolio.html        Portfolio page (auto-loading grid)
├── contact.html          Contact page
├── css/
│   └── style.css         All styling (colors, layout, animation)
├── js/
│   ├── main.js           Shared nav/menu/scroll-reveal behaviour
│   └── portfolio.js      Auto-scans /portfolio and builds the grid + lightbox
├── assets/images/        Logo, profile picture
├── portfolio/
│   ├── ui/                Numbered UI work (1.png, 2.mp4, ...)
│   ├── scripting/          Numbered scripting work
│   └── reviews/            Numbered client reviews
├── LICENSE
└── README.md              You are here
```

---

## 10. Updating text (pricing, TOS, socials, etc.)

Everything is plain HTML — open the relevant page in a code editor and edit the text directly:

- **Pricing** → `pricing.html`
- **Rules & TOS** → `tos.html`
- **Social links** → `contact.html` (and the footer of every page)
- **Bio / capabilities / stats** → `index.html`

There's no CMS or database — editing the `.html` files and pushing to GitHub is the whole workflow.

---

## 11. A note on custom domains (optional)

If you'd like `luxevisuals.com` (or similar) instead of the `github.io` URL:

1. Buy a domain from any registrar (Namecheap, Cloudflare, Google Domains successor, etc.).
2. In your repo's **Settings → Pages**, add it under **Custom domain**.
3. In your domain registrar's DNS settings, add a `CNAME` record pointing to `YOUR-USERNAME.github.io`.

GitHub's own guide covers this in more depth: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
