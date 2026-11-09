/* V4.45 — One-time, viewport-triggered statistics. Zero dependencies. */
(() => {
  'use strict';
  const counters = document.querySelectorAll('.about-stat .ak-stat-number[data-count-to]');
  if (!counters.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 1700;
  const render = (node, number) => {
    node.textContent = new Intl.NumberFormat('en-US').format(number) + '+';
  };
  function animate(node) {
    if (node.dataset.countPlayed === 'true') return;
    node.dataset.countPlayed = 'true';
    const target = Number(node.dataset.countTo);
    if (!Number.isFinite(target) || target < 0) return;
    if (reducedMotion) { render(node, target); return; }
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      render(node, Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      animate(target);
    });
  }, {threshold: 0.25});
  counters.forEach(node => observer.observe(node));
})();
