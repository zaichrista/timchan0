// Sun / moon button: switches light and dark mode and remembers the choice.
(function () {
  const root = document.documentElement;
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  function sync() {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
  sync();
  root.classList.add('ready');
})();
