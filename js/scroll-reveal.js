/**
 * scroll-reveal.js
 * Premium GSAP scroll animations:
 *   1. Pinned layer stacking transition (#skills → #projects)
 *   2. Horizontal scroll for projects (Dev mode: 8 projects horizontal pin & scrub)
 *   3. Heading parallax (foreground/background depth)
 *   4. Fade-up for [data-reveal] elements
 *
 * All effects behind prefers-reduced-motion check.
 * Pin and horizontal scroll disabled below 768px (fallback to smooth touch scroll).
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile      = () => window.innerWidth < 768;

  // ── Fallback ─────────────────────────────────────────
  function fallbackReveal() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
  }

  // ── 1. Simple fade-up for [data-reveal] ─────────────
  function initFadeReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackReveal();
      return;
    }

    const elements = document.querySelectorAll('[data-reveal]');

    elements.forEach(el => {
      if (reducedMotion) {
        el.style.opacity   = '1';
        el.style.transform = 'none';
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  // ── 2. Heading parallax ─────────────────────────────
  function initParallax() {
    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.section__heading').forEach(heading => {
      const section = heading.closest('section');
      if (!section || section.id === 'projects' || section.id === 'skills') return;

      gsap.fromTo(heading,
        { y: 12 },
        {
          y: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end:   'bottom top',
            scrub: true,
          },
        }
      );
    });
  }

  // ── 3. Pinned Layer Stacking: Skills → Projects ──────
  let skillsPinTrigger = null;
  let skillsParallaxTween = null;

  function killSkillsLayerStack() {
    if (skillsPinTrigger) {
      skillsPinTrigger.kill();
      skillsPinTrigger = null;
    }
    if (skillsParallaxTween) {
      skillsParallaxTween.kill();
      skillsParallaxTween = null;
    }
  }

  function initSkillsLayerStack() {
    killSkillsLayerStack();

    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const skillsSec = document.getElementById('skills');
    const projectsSec = document.getElementById('projects');

    if (!skillsSec || !projectsSec) return;

    // Pin the skills section in place as the user scrolls past it
    skillsPinTrigger = ScrollTrigger.create({
      trigger: skillsSec,
      start: 'top top',
      endTrigger: projectsSec,
      end: 'top top',
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    // Subtle depth parallax effect on skills content as projects layer covers it
    const skillsInner = skillsSec.querySelector('.section-inner');
    if (skillsInner) {
      skillsParallaxTween = gsap.to(skillsInner, {
        y: -30,
        scale: 0.96,
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: projectsSec,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    }
  }

  // ── 4. Horizontal scroll for projects (Dev Mode: 8 Projects Pin & Scrub) ──
  let horizontalTween = null;
  let horizontalTrigger = null;

  function killHorizontalScroll() {
    if (horizontalTween) {
      horizontalTween.kill();
      horizontalTween = null;
    }
    if (horizontalTrigger) {
      horizontalTrigger.kill();
      horizontalTrigger = null;
    }
  }

  function initHorizontalScroll() {
    killHorizontalScroll();

    if (reducedMotion || isMobile()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const isDev = document.body.classList.contains('is-dev-mode');

    // UI mode uses the responsive 3-column showcase on desktop (no artificial pin gap)
    if (!isDev) return;

    const track = document.getElementById('dev-projects-track');
    const section = document.getElementById('projects');

    if (!track || !section) return;

    // Reset x position cleanly before measurement
    gsap.set(track, { x: 0, clearProps: 'transform' });

    requestAnimationFrame(() => {
      const trackWidth = track.scrollWidth;
      const windowWidth = window.innerWidth;
      const extraOffset = Math.max(60, windowWidth * 0.08);
      const scrollDist = Math.max(0, trackWidth - windowWidth + extraOffset);

      if (scrollDist <= 0) return;

      horizontalTween = gsap.to(track, {
        x: -scrollDist,
        ease: 'none',
        paused: true,
      });

      horizontalTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollDist * 1.15}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        animation: horizontalTween,
        invalidateOnRefresh: true,
        onLeave: () => {
          gsap.set(track, { x: -scrollDist });
        },
        onLeaveBack: () => {
          gsap.set(track, { x: 0 });
        },
      });
    });
  }

  // ── Entry ────────────────────────────────────────────
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initFadeReveals();
    initParallax();
    initSkillsLayerStack();
    initHorizontalScroll();
  }

  // ── Boot timing ──────────────────────────────────────
  window.addEventListener('preloaderDone', () => {
    setTimeout(init, 300);
  });

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        init();
      }
    }, 600);
  });

  // Re-init horizontal scroll, skills layer stack, and refresh on mode toggle
  window.addEventListener('modeChanged', () => {
    if (typeof ScrollTrigger === 'undefined') return;

    setTimeout(() => {
      initSkillsLayerStack();
      initHorizontalScroll();
      ScrollTrigger.refresh();

      if (!reducedMotion) {
        document.querySelectorAll('[data-reveal]').forEach(el => {
          if (el.style.opacity === '0' || el.style.opacity === '') {
            gsap.fromTo(
              el,
              { opacity: 0, y: 24 },
              {
                opacity: 1, y: 0,
                duration: 0.55,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 90%',
                  once: true,
                },
              }
            );
          }
        });
      }
    }, 150);
  });

  // Handle window resize smoothly
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        initSkillsLayerStack();
        initHorizontalScroll();
        ScrollTrigger.refresh();
      }
    }, 250);
  });
})();
