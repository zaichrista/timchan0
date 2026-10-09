// Eases [data-reveal] elements in as they scroll into view.
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
})();
