/**
 * mode-toggle.js
 * Dev ⇄ UI clip-path wipe — white (#f5f5f2) wipe always.
 * At midpoint: swaps body class and (if visible) swaps CV iframe src.
 */

(function () {
  const toggleBtnUI  = document.getElementById('btn-ui');
  const toggleBtnDev = document.getElementById('btn-dev');
  const wipeEl       = document.getElementById('mode-wipe');

  if (!toggleBtnUI || !toggleBtnDev || !wipeEl) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WIPE_DURATION = reducedMotion ? 0 : 680;

  let currentMode = 'dev';
  let isAnimating  = false;

  // ── Helpers ─────────────────────────────────────────

  function getButtonCenter(btn) {
    const rect = btn.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width  / 2),
      y: Math.round(rect.top  + rect.height / 2),
    };
  }

  function setActiveBtn(mode) {
    toggleBtnUI.classList.toggle('is-active', mode === 'ui');
    toggleBtnDev.classList.toggle('is-active', mode === 'dev');
    toggleBtnUI.setAttribute('aria-pressed',  String(mode === 'ui'));
    toggleBtnDev.setAttribute('aria-pressed', String(mode === 'dev'));
  }

  function applyMode(mode) {
    document.body.classList.toggle('is-dev-mode', mode === 'dev');

    document.title = mode === 'dev'
      ? 'Ahmed Mohamed — AI Developer / CS Student'
      : 'Ahmed Mohamed — UI/UX Designer';

    currentMode = mode;
    window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode } }));
  }

  // ── Clip-path wipe (white, always) ──────────────────

  function wipeTransition(targetMode, originBtn) {
    if (isAnimating || targetMode === currentMode) return;
    isAnimating = true;

    if (reducedMotion) {
      applyMode(targetMode);
      setActiveBtn(targetMode);
      isAnimating = false;
      return;
    }

    const { x, y } = getButtonCenter(originBtn);
    const origin   = `${x}px ${y}px`;

    // Phase 1: wipe expands (white flash)
    wipeEl.style.transition = 'none';
    wipeEl.style.clipPath   = `circle(0% at ${origin})`;
    void wipeEl.offsetWidth; // force reflow

    wipeEl.style.transition = `clip-path ${WIPE_DURATION / 2}ms cubic-bezier(0.87, 0, 0.13, 1)`;
    wipeEl.style.clipPath   = `circle(150% at ${origin})`;

    // Phase 2: swap at midpoint, then retract
    setTimeout(() => {
      applyMode(targetMode);
      setActiveBtn(targetMode);

      requestAnimationFrame(() => {
        wipeEl.style.transition = `clip-path ${WIPE_DURATION / 2}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        wipeEl.style.clipPath   = `circle(0% at ${origin})`;

        setTimeout(() => {
          isAnimating = false;
          originBtn.focus({ preventScroll: true });
        }, WIPE_DURATION / 2 + 60);
      });
    }, WIPE_DURATION / 2);
  }

  // ── Event listeners ──────────────────────────────────

  toggleBtnUI.addEventListener('click',  () => wipeTransition('ui',  toggleBtnUI));
  toggleBtnDev.addEventListener('click', () => wipeTransition('dev', toggleBtnDev));
})();
