/**
 * split-text.js
 * Scramble hover effect on [data-scramble] elements.
 *
 * FLICKER FIX:
 *   - isAnimating flag prevents any re-trigger mid-animation
 *   - All intervals are tracked and cleared on mouseLeave
 *   - Scramble characters use currentColor (inherits from section theme)
 *   - No opacity or color change on the container itself
 *
 * COLOR RULE: characters always render as currentColor.
 * The .is-scrambling class only reduces opacity — no hue ever.
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GLYPHS     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@#./[]{}';
  const STAGGER_MS = 28;   // delay between each char starting, ms
  const CYCLE_MS   = 55;   // interval per glyph cycle, ms
  const CYCLES     = 6;    // cycles before resolving to real char

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  // Split element text into per-char spans (once per element)
  function splitElement(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';

    const raw = el.innerHTML;
    // Wrap each non-tag character in a span; preserve HTML tags (e.g. <br>)
    el.innerHTML = raw.replace(/(<[^>]+>)|([^<])/g, (_, tag, char) => {
      if (tag)       return tag;
      if (char === ' ') return '<span class="char">\u00a0</span>'; // &nbsp;
      return `<span class="char" data-char="${char}">${char}</span>`;
    });
  }

  // Track all active intervals for an element so we can cancel on leave
  const activeIntervals = new WeakMap();

  function clearIntervals(el) {
    const ids = activeIntervals.get(el);
    if (!ids) return;
    ids.forEach(id => clearInterval(id));
    activeIntervals.set(el, []);
  }

  function scramble(el) {
    if (reducedMotion) return;
    const chars = el.querySelectorAll('.char[data-char]');
    if (!chars.length) return;

    clearIntervals(el); // clear any lingering intervals
    const ids = [];

    chars.forEach((span, i) => {
      const original  = span.dataset.char;
      let cyclesDone  = 0;

      span.classList.add('is-scrambling');

      const id = setInterval(() => {
        span.textContent = randomGlyph();
        cyclesDone++;

        if (cyclesDone >= CYCLES) {
          clearInterval(id);
          // Staggered resolve: each char waits i * STAGGER_MS
          setTimeout(() => {
            span.textContent = original;
            span.classList.remove('is-scrambling');
          }, i * STAGGER_MS);
        }
      }, CYCLE_MS);

      ids.push(id);
    });

    activeIntervals.set(el, ids);
  }

  // Resolve all chars back to their originals immediately (e.g. on mouse leave)
  function resolveImmediate(el) {
    clearIntervals(el);
    el.querySelectorAll('.char[data-char]').forEach(span => {
      span.textContent = span.dataset.char;
      span.classList.remove('is-scrambling');
    });
  }

  // Attach listeners (idempotent — checks data-scramble-init)
  function initScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      if (el.dataset.scrambleInit) return;
      el.dataset.scrambleInit = '1';

      splitElement(el);
      activeIntervals.set(el, []);

      const hoverEl   = el.closest('a, button') || el;
      let isAnimating = false;

      hoverEl.addEventListener('mouseenter', () => {
        if (isAnimating || reducedMotion) return;
        isAnimating = true;
        scramble(el);

        // Duration: last char resolve + a small buffer
        const total = chars => chars * STAGGER_MS + CYCLES * CYCLE_MS + 80;
        const n     = el.querySelectorAll('.char[data-char]').length;
        setTimeout(() => { isAnimating = false; }, total(n));
      });

      // If user leaves mid-scramble: resolve chars, unlock guard
      hoverEl.addEventListener('mouseleave', () => {
        if (!isAnimating) return;
        resolveImmediate(el);
        isAnimating = false;
      });
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScramble);
  } else {
    initScramble();
  }

  // Re-init after mode switch (new elements become visible)
  window.addEventListener('modeChanged', initScramble);

  // Expose
  window.initScramble = initScramble;
})();
