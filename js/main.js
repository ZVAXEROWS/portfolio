/**
 * main.js
 * Wires up all modules and initializes Lenis smooth scroll.
 * Load order: preloader → cursor → split-text → scroll-reveal → mode-toggle → main
 * (all scripts loaded with defer in HTML, so DOM is ready when these run)
 */

(function () {
  // ── Lenis Smooth Scroll ──────────────────────────────
  // Lenis is loaded via CDN (defer), so we wait for it.
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    // Prevent browser auto-scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    window.__lenis = lenis;

    // Force top of page immediately on start
    lenis.scrollTo(0, { immediate: true });

    // Integrate with GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      // Standalone rAF loop
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Pause Lenis during mode-toggle wipe so scroll doesn't shift
    window.addEventListener('modeChanged', () => {
      lenis.stop();
      setTimeout(() => {
        lenis.resize();
        lenis.start();
      }, 700);
    });

    // Reduced motion: disable smooth scroll
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lenis.destroy();
    }
  }

  // ── Lazy Load CV Iframes (Prevents PDF viewer autofocus jumping to CV on page load) ──
  function initLazyCV() {
    const cvSection = document.getElementById('cv');
    if (!cvSection) return;

    function loadIframes() {
      document.querySelectorAll('#cv iframe[data-src]').forEach(iframe => {
        if (!iframe.src && iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
        }
      });
    }

    // Load if user clicks any CV nav anchor
    document.querySelectorAll('a[href="#cv"]').forEach(anchor => {
      anchor.addEventListener('click', loadIframes, { once: true });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadIframes();
          observer.disconnect();
        }
      }, { rootMargin: '300px 0px' });
      observer.observe(cvSection);
    } else {
      window.addEventListener('scroll', () => {
        if (cvSection.getBoundingClientRect().top < window.innerHeight * 1.5) {
          loadIframes();
        }
      }, { passive: true, once: true });
    }
  }

  // ── Nav active state on scroll ───────────────────────
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === `#${id}` ? 'var(--neon)' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(sec => observer.observe(sec));
  }

  // ── Smooth anchor clicks (Lenis handles these, but fallback) ─
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        // Lenis will intercept if loaded; this is a non-Lenis fallback
        if (typeof Lenis === 'undefined') {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Nav hide on scroll down ───────────────────────────
  function initNavBehavior() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    let lastY   = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > 80) {
            nav.style.transform = currentY > lastY
              ? 'translateY(-100%)'
              : 'translateY(0)';
          } else {
            nav.style.transform = 'translateY(0)';
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    });

    nav.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  // ── Entry Point ───────────────────────────────────────
  function init() {
    initLenis();
    initLazyCV();
    initNavHighlight();
    initAnchorScroll();
    initNavBehavior();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();