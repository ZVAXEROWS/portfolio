/**
 * scroll-reveal.js
 * GSAP scroll animations:
 *   1. Pinned horizontal scroll — Dev mode, desktop ≥768px
 *      (scroll hijack: vertical → horizontal → vertical)
 *   2. Skills depth parallax (#skills recedes as #projects slides in)
 *   3. Heading parallax
 *   4. Fade-up for [data-reveal] elements
 *
 * Bug fixes vs old implementation:
 *   • Synchronous measurement via void track.offsetWidth (no rAF race)
 *   • kill → refresh → init order on mode toggle (never refresh while pin-spacer is live)
 *   • pinSpacing:true for predictable spacer height
 *   • onRefresh callback recalculates scrollDist on resize
 *   • UI mode is completely untouched — no pin, no scroll hijack
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile      = () => window.innerWidth < 768;

  // ── Fallback: instantly reveal all [data-reveal] elements ─────
  function fallbackReveal() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
  }

  // ── 1. Fade-up for [data-reveal] ──────────────────────────────
  function initFadeReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackReveal();
      return;
    }
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (reducedMotion) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });
  }

  // ── 2. Heading parallax ──────────────────────────────────────
  function initParallax() {
    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.section__heading').forEach(heading => {
      const section = heading.closest('section');
      if (!section || section.id === 'projects' || section.id === 'skills') return;
      gsap.fromTo(heading,
        { y: 12 },
        { y: -12, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    });
  }

  // ── 3. Skills depth parallax ─────────────────────────────────
  let skillsParallaxTween = null;

  function killSkillsParallax() {
    if (skillsParallaxTween) { skillsParallaxTween.kill(); skillsParallaxTween = null; }
  }

  function initSkillsParallax() {
    killSkillsParallax();
    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const skillsSec   = document.getElementById('skills');
    const projectsSec = document.getElementById('projects');
    if (!skillsSec || !projectsSec) return;
    const skillsInner = skillsSec.querySelector('.section-inner');
    if (!skillsInner) return;
    skillsParallaxTween = gsap.to(skillsInner, {
      y: -30, scale: 0.96, opacity: 0.5, ease: 'none',
      scrollTrigger: { trigger: projectsSec, start: 'top bottom', end: 'top top', scrub: true },
    });
  }

  // ── 4. Horizontal scroll pin — Dev mode, desktop only ────────
  //
  //  When #projects hits viewport top the page pins.
  //  Vertical scroll drives the project cards sideways via transform.
  //  When the last card is visible the pin releases and vertical
  //  scrolling resumes normally.
  //
  //  Key correctness rules:
  //  a) Measure AFTER gsap.set(x:0) + void offsetWidth (synchronous reflow).
  //     Old code used requestAnimationFrame which ran after layout could change.
  //  b) Kill the trigger with kill(true) before any refresh call.
  //     kill(true) removes the pin-spacer DOM node; refresh() on a live spacer
  //     double-counts height and creates the black empty space bug.
  //  c) onRefresh recalculates scrollDist so window resize always stays accurate.
  // ─────────────────────────────────────────────────────────────
  let hTween   = null;
  let hTrigger = null;

  function killHorizontalScroll() {
    if (hTrigger) { hTrigger.kill(true); hTrigger = null; }  // true = revert pin-spacer
    if (hTween)   { hTween.kill();       hTween   = null; }
    const track = document.getElementById('dev-projects-track');
    if (track && typeof gsap !== 'undefined') gsap.set(track, { clearProps: 'x,transform' });
  }

  function initHorizontalScroll() {
    killHorizontalScroll(); // always kill first (sync)

    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.body.classList.contains('is-dev-mode')) return;

    const track   = document.getElementById('dev-projects-track');
    const section = document.getElementById('projects');
    if (!track || !section) return;

    // Reset any transform so scrollWidth reflects natural layout width
    gsap.set(track, { x: 0, clearProps: 'transform' });
    void track.offsetWidth; // force synchronous reflow — measurement is now accurate

    function getScrollDist() {
      // Extra padding = the track's CSS padding-right so last card clears the edge
      const pr = parseFloat(getComputedStyle(track).paddingRight) || 64;
      return Math.max(0, track.scrollWidth - window.innerWidth + pr);
    }

    const scrollDist = getScrollDist();
    if (scrollDist <= 0) return;

    hTween = gsap.to(track, { x: -scrollDist, ease: 'none', paused: true });

    hTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${getScrollDist()}`,
      pin: true,
      pinSpacing: true,   // GSAP adds a spacer equal to scrollDist — vertical resume is correct
      anticipatePin: 1,
      scrub: 1,
      animation: hTween,
      invalidateOnRefresh: true,
      onRefresh() {
        // After resize, recalculate the scroll distance and update the tween
        const dist = getScrollDist();
        if (hTween && dist > 0) {
          gsap.set(track, { x: 0 });
          hTween.vars.x = -dist;
          hTween.invalidate().progress(0);
        }
      },
    });
  }

  // ── Entry ────────────────────────────────────────────────────
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackReveal(); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    initFadeReveals();
    initParallax();
    initSkillsParallax();
    initHorizontalScroll();
  }

  // ── Boot (two paths: with/without preloader) ─────────────────
  window.addEventListener('preloaderDone', () => setTimeout(init, 300));
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (typeof ScrollTrigger !== 'undefined') init(); }, 600);
  });

  // ── Mode toggle (UI ⇄ Dev) ────────────────────────────────────
  //
  //  Safe order:
  //    1. kill horizontal scroll (sync, removes pin-spacer immediately)
  //    2. kill skills parallax
  //    3. If in projects section, snap scroll to top of section
  //    4. refresh() — now safe because no pin-spacer exists
  //    5. After wipe animation (~460ms), re-init everything
  // ─────────────────────────────────────────────────────────────
  window.addEventListener('modeChanged', (e) => {
    if (typeof ScrollTrigger === 'undefined') return;

    const incomingMode = e.detail && e.detail.mode;
    const projectsSec  = document.getElementById('projects');

    // Steps 1 & 2: kill triggers synchronously
    killHorizontalScroll();
    killSkillsParallax();

    // Step 3: snap scroll position if user is inside projects
    if (projectsSec) {
      const rect = projectsSec.getBoundingClientRect();
      if (rect.top < 150 && rect.bottom > 150) {
        const navH    = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const targetY = Math.max(0, window.scrollY + rect.top - navH);
        window.scrollTo({ top: targetY, behavior: 'instant' });
        if (window.__lenis) window.__lenis.scrollTo(targetY, { immediate: true });
      }
    }

    // Step 4: refresh — safe now that pin-spacer is gone
    ScrollTrigger.refresh();
    if (window.__lenis) window.__lenis.resize();

    // Step 5: re-init after wipe transition completes
    setTimeout(() => {
      initSkillsParallax();
      initHorizontalScroll();
      ScrollTrigger.refresh();
      if (window.__lenis) window.__lenis.resize();

      // Reveal any [data-reveal] elements in the newly active mode
      if (!reducedMotion) {
        const sel = incomingMode === 'dev' ? '.mode-dev' : '.mode-ui';
        document.querySelectorAll(`${sel} [data-reveal], ${sel}[data-reveal]`).forEach(el => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        });
      }
    }, 460);
  });

  // ── Resize — debounced, kill → init order ───────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger === 'undefined') return;
      killHorizontalScroll();
      killSkillsParallax();
      ScrollTrigger.refresh();
      initSkillsParallax();
      initHorizontalScroll();
      ScrollTrigger.refresh();
    }, 300);
  });
})();

