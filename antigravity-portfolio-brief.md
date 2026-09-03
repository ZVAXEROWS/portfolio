# Portfolio Rebuild — Antigravity Build Brief
For: Ahmed Mohamed Khalaf — Dev ⇄ UI/UX dual-mode portfolio

---

## 0. How to use this document

Don't paste this whole file into Antigravity in one shot. Feed it **Phase 1**, let it
finish and review the output, then feed **Phase 2**, and so on. Agentic coding tools
produce far more reliable results in small, checkable increments than in one giant
generation. Section 8 has the exact phase prompts, pre-written and ready to paste.

If you attach the Zajno reference HTML file to Antigravity, paste this instruction
directly above it:

> Analyze the attached file only to understand *techniques* — smooth-scroll setup,
> scroll-triggered reveals, cursor/hover interactions, transition patterns, loader
> logic. Do not copy any of its copy, class names, asset URLs, color values, fonts,
> audio, tracking scripts, or visual branding. Reimplement the underlying idea from
> scratch, adapted to the black-and-white design system and content below.

---

## 1. Concept

One site, one shell, two personas. A persistent toggle switch ("Dev" / "UI") swaps
the content of every section between your developer identity and your UI/UX
designer identity, using a wipe transition instead of a page reload or route change.
Same URL, same nav, same footer — only the body content and a few visual accents
change.

## 2. Design system (strict constraints)

- **Colors:** exactly two — near-black (`#0a0a0a`) and off-white (`#f5f5f2`). No
  accent hue. Mode difference is expressed through layout/type/imagery, not color.
- **Type:** one strong display typeface for headings (bold, geometric or condensed),
  one clean sans for body. Large type scale — this genre of site leans on
  oversized headlines.
- **Texture:** faint animated grain/noise overlay (~4–6% opacity) over the whole
  page so flat black/white doesn't feel sterile.
- **Motion respect:** every animation must check `prefers-reduced-motion` and fall
  back to instant/no-motion states.
- **Mobile:** cursor-follow and magnetic hover are desktop-only (disable below
  ~768px or on touch devices); keep scroll reveals and the mode-toggle transition
  everywhere, just lighter/faster on mobile.

## 3. Information architecture

**Shared shell (present in both modes)**
- Header: name/logo, nav links, Dev/UI toggle switch, (optional) mute icon if sound is added later
- Preloader: counts 0→100 on first load, then reveals the page
- Footer: social links (LinkedIn, GitHub, Instagram, Behance, Dribbble, Discord), email, © line

**Dev mode**
- Hero: "Ahmed Mohamed — Software Developer / CS Student"
- About: 3rd-year CS student at Ain Shams University, Head of UI/UX & Design at
  ConnectX, builds cross-platform apps, 2D games, systems-level projects
- Tech stack: C++, Python, Java, Qt, SFML, Streamlit, Git/GitHub, Godot, Linux
- Featured projects (link to GitHub repos):
  - **cudaml** — CUDA-accelerated ML in C++, GPU-parallel regression training
  - **cppml** — C++ ML library from scratch (regression, scaling, matrix ops)
  - **FOS (FCIS Operating System)** — C systems project, custom CLI/OS features, QEMU
  - **dot-man** — Python CLI dotfile manager, git-branch-per-config, secret redaction
  - **Text Completer** — real-time autocomplete widget, custom trie + Qt UI
  - **Examination System** — Java OOP exam platform, encryption, role-based access
  - **Heart Disease Prediction** — Python/Streamlit ML app
  - **ConnectX Website** — Figma-to-production site for a student org
- CV: dev CV PDF
- Contact

**UI mode**
- Hero: "Ahmed Mohamed — UI/UX Designer"
- About: same bio, weighted toward design leadership and visual craft
- Tools: Figma, Adobe XD, Framer, Spline, Photoshop, Illustrator, After Effects,
  Premiere Pro, Canva
- Gallery (image-forward case study grid, not a plain list):
  - **Money Insights** — financial management app, multiple themes & wireframes
  - **Gym** — fitness tracking & workout management app
  - **UniNotes** — study materials app for CIS students, live on Google Play
- Links: Behance, Dribbble
- CV: design CV PDF
- Contact

## 4. Signature interactions (the "real-time hover" system)

1. **Custom cursor** — small dot + trailing ring, lerped toward the real pointer
   position every frame (`requestAnimationFrame`, not CSS `cursor`). On hover over
   any interactive element it scales up and/or the ring gets magnetically pulled a
   few px toward the element's center.
2. **Split-text hover scramble** — nav links, hero headline, and section titles are
   split into `<span>` characters on load. On hover, characters briefly cycle
   through random glyphs before settling back to the real letters (short duration,
   ~300–500ms, staggered per character). This is the standout effect — apply it
   consistently to every clickable text element so it reads as a system, not a
   one-off gimmick.
3. **Underline draw** — inline text links get a 1px underline that draws
   left-to-right on hover (`transform: scaleX` on a pseudo-element), not the
   scramble effect — reserve scramble for headings/nav, underline for body links,
   so the hierarchy stays legible.
4. **Scroll reveals** — GSAP ScrollTrigger fades/translates each section's content
   up into place as it enters the viewport. Keep it subtle: 20–30px translate,
   400–600ms, no bounce.
5. **Mode-toggle transition** — clicking the Dev/UI switch triggers a circular
   clip-path wipe (expanding from the toggle's position) that covers the screen,
   swaps the DOM content underneath, then reveals. ~600–800ms total.
6. **Smooth scroll** — Lenis wrapping the whole page so scroll has inertia/easing
   instead of the browser default.
7. **Grain overlay** — a fixed, full-viewport `<canvas>` or repeating noise PNG at
   low opacity, animated by shifting its position every ~100ms for a subtle static feel.

## 5. Tech constraints

- Plain HTML/CSS/JS. No framework, no build step required (keep it deployable
  straight to GitHub Pages, same as the current site).
- Libraries allowed: GSAP (core + ScrollTrigger), Lenis. Nothing else unless a
  specific need comes up (e.g., a tiny marquee could just be CSS `@keyframes`,
  no need for a slider library).
- No jQuery. No analytics/ad pixels. No autoplay audio by default.
- Organize JS into small modules by concern, not one giant script:
  `cursor.js`, `split-text.js`, `scroll-reveal.js`, `mode-toggle.js`, `preloader.js`,
  `main.js` (wires them up). Keep it readable — this is a portfolio a recruiter
  or fellow dev might open the source of.

## 6. File structure

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── cursor.js
│   ├── split-text.js
│   ├── scroll-reveal.js
│   ├── mode-toggle.js
│   └── preloader.js
├── assets/
│   ├── img/        (project thumbnails, headshot)
│   ├── cv/
│   │   ├── cv-dev.pdf
│   │   └── cv-ui.pdf
│   └── noise.png    (or generate via canvas, no asset needed)
└── README.md
```

## 7. Content data to hand Antigravity (so it doesn't invent placeholder copy)

Paste section 3's project/tool lists directly into the prompt — real repo names,
real links, real tool names — so Antigravity fills the site with your actual work
instead of lorem-ipsum "Project One / Project Two" placeholders.

---

## 8. Phase prompts (paste into Antigravity one at a time)

### Phase 1 — Skeleton & content (no animation yet)
```
Build the HTML skeleton and content for a personal portfolio site. Plain HTML/CSS/JS,
no build tools, deployable to GitHub Pages. Two-color design system only: near-black
#0a0a0a and off-white #f5f5f2, no accent colors.

Structure: a shared header (logo/name, nav, a Dev/UI toggle switch), a hero section,
about section, a skills/tools section, a projects/gallery section, a contact section,
and a footer with social links. Build TWO content variants for the middle sections —
one for "Dev mode" and one for "UI mode" — both present in the DOM but only one
visible at a time (toggle just switches a class for now, no transition yet).

Use this real content:
[paste Dev mode + UI mode content from section 3 above]

Focus only on semantic HTML structure and basic responsive CSS layout (flex/grid,
mobile-first). No JS animation, no custom cursor, no scroll effects yet — just a
clean, readable, fully responsive static page in both modes.
```

### Phase 2 — Design system polish
```
Refine the CSS design system: pick one bold display typeface for headings and one
clean sans-serif for body text (use free Google Fonts, self-hosted or CDN-linked).
Establish a large, confident type scale (oversized headline in the hero). Add
consistent spacing tokens (CSS custom properties) and a subtle animated grain/noise
overlay across the whole page at low opacity (canvas-based, shifting position every
~100ms is fine). Keep everything strictly black/off-white. Improve the projects/
gallery section into a proper responsive card grid.
```

### Phase 3 — Core motion system
```
Add these interactions as separate, well-commented JS modules (cursor.js,
split-text.js, scroll-reveal.js, preloader.js), wired together from main.js:

1. Custom cursor: a small dot + ring that follows the pointer with lerped easing
   via requestAnimationFrame, scales up on hover over links/buttons, disabled on
   touch devices and screens under 768px (fall back to default cursor there).
2. Split-text hover effect: split nav links, the hero headline, and section titles
   into individual character spans on load. On hover, characters briefly cycle
   through random characters before resolving back to the real letters (staggered,
   ~300-500ms). Apply consistently to all headings/nav — not just one demo element.
3. Underline-draw hover on inline body text links (scaleX transform on a
   pseudo-element), distinct from the scramble effect used on headings/nav.
4. Scroll reveals using GSAP + ScrollTrigger: each section's content fades and
   translates up ~24px into place as it enters the viewport.
5. Lenis smooth scroll wrapping the whole page.
6. Preloader: full-screen overlay with a counter animating 0 to 100 on first load,
   then fading out to reveal the page.

All motion must check `prefers-reduced-motion: reduce` and skip/shorten animations
accordingly. Keep GSAP/Lenis loaded via CDN.
```

### Phase 4 — Mode toggle transition
```
Replace the simple class-toggle from Phase 1 with a real transition: when the
Dev/UI switch is clicked, animate a circular clip-path wipe expanding from the
toggle's screen position to cover the viewport, swap the visible content block
underneath at the midpoint, then reveal by animating the clip-path back down.
Total duration ~600-800ms. Make sure keyboard/focus state still lands correctly
after the swap (don't trap focus, don't lose the toggle's accessible state).
```

### Phase 5 — Accessibility, performance, and deploy prep
```
Pass over the whole site for: prefers-reduced-motion fallbacks on every animation
(cursor, split-text, scroll reveal, mode transition, grain), keyboard navigability
(toggle switch and all nav/links reachable and operable via keyboard, visible focus
states), color contrast between #0a0a0a and #f5f5f2 (should already pass easily),
alt text on all images, and meta tags (title, description, Open Graph) for both
the dev and design personas. Confirm the site has no build step and works as static
files so it can be deployed directly to GitHub Pages.
```

---

## 9. Notes for you

- Drop `cv-dev.pdf` and `cv-ui.pdf` into `assets/cv/` before Phase 1 — the CV link
  in the footer/contact section should point to whichever one matches the active mode.
- Real project thumbnails (screenshots of Money Insights, Gym, UniNotes, and any
  dev project you want a visual for) will make the UI gallery land much better than
  generic icons — grab those from your existing Behance/Dribbble or app screenshots
  before Phase 2.
- If you do want the sound-on-hover idea from Zajno later, add it as its own Phase 6
  request, opt-in and muted by default — don't fold it into the core build.
