/**
 * preloader.js
 * Progress-bar loader — no numeric counter.
 * Drives the bar width from 0% → 100% with ease-out quad.
 * Fires 'preloaderDone' on window when complete.
 */

(function () {
  const overlay = document.getElementById('preloader');
  const bar     = document.getElementById('preloader-bar');

  if (!overlay) return;

  // Skip animation on return visits within same session
  if (sessionStorage.getItem('portfolioLoaded')) {
    overlay.classList.add('is-done');
    window.dispatchEvent(new CustomEvent('preloaderDone'));
    return;
  }

  // Reduced motion: skip immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }

  const DURATION = 1400; // ms
  let start = null;

  function tick(ts) {
    if (!start) start = ts;
    const elapsed  = ts - start;
    const progress = Math.min(elapsed / DURATION, 1);

    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);

    if (bar) bar.style.width = `${Math.floor(eased * 100)}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      if (bar) bar.style.width = '100%';
      // Small hold so full bar is visible
      setTimeout(finish, 240);
    }
  }

  function finish() {
    overlay.classList.add('is-done');
    sessionStorage.setItem('portfolioLoaded', '1');
    window.dispatchEvent(new CustomEvent('preloaderDone'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tick));
  } else {
    requestAnimationFrame(tick);
  }
})();
