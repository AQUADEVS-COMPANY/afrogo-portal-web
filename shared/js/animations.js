/* Scroll reveal (IntersectionObserver) and number count-up. Only transform/opacity. */
(function (w, d) {
  'use strict';
  const P = w.Portal;

  P.animations = {
    /** Call again after inserting dynamic [data-reveal] nodes. */
    reveal(root = d) {
      const els = P.$$('[data-reveal]:not(.is-visible)', root);
      if (!els.length) return;
      if (P.reducedMotion() || !('IntersectionObserver' in w)) {
        els.forEach((el) => el.classList.add('is-visible'));
        return;
      }
      els.forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      els.forEach((el) => io.observe(el));
    },
    countUp(el, to, ms = 800) {
      if (P.reducedMotion() || to < 2) { el.textContent = String(to); return; }
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
  };

  P.ready(() => P.animations.reveal());
})(window, document);
