/**
 * cursor.js
 * Custom dot + ring cursor with lerped rAF tracking.
 * Disabled on touch devices and screens < 768px.
 *
 * Color: mix-blend-mode:difference — automatically inverts
 *        against dark or light backgrounds. No accent hue ever.
 */

(function () {
  // Touch / small-screen guard
  const isTouch  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isSmall  = () => window.innerWidth < 768;

  if (isTouch) return;

  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (!dot || !ring) return;

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let dotX   = mouseX, dotY   = mouseY;
  let ringX  = mouseX, ringY  = mouseY;
  let visible = false;

  // Lerp factor
  const DOT_LERP  = 0.18;
  const RING_LERP = 0.09;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    if (!isSmall()) {
      dotX  = lerp(dotX,  mouseX, DOT_LERP);
      dotY  = lerp(dotY,  mouseY, DOT_LERP);
      ringX = lerp(ringX, mouseX, RING_LERP);
      ringY = lerp(ringY, mouseY, RING_LERP);

      dot.style.transform  = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!visible) {
      visible = true;
      dot.classList.remove('is-hidden');
      ring.classList.remove('is-hidden');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.classList.add('is-hidden');
    ring.classList.add('is-hidden');
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    if (visible) {
      dot.classList.remove('is-hidden');
      ring.classList.remove('is-hidden');
    }
  });

  // Hover state: scale ring on interactive elements
  function addHoverListeners() {
    const targets = document.querySelectorAll(
      'a, button, [data-cursor-hover], .gallery-card, .dev-project-item'
    );
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });
  }

  // Initialize after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      dot.classList.add('is-hidden');
      ring.classList.add('is-hidden');
      addHoverListeners();
      requestAnimationFrame(tick);
    });
  } else {
    dot.classList.add('is-hidden');
    ring.classList.add('is-hidden');
    addHoverListeners();
    requestAnimationFrame(tick);
  }

  // Re-attach listeners after mode toggle (new elements visible)
  window.addEventListener('modeChanged', addHoverListeners);
})();
