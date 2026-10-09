(function () {
  var NAME = 'Tim Chan', DURATION = 2000, TYPE_BY = 0.6, FONT_TIMEOUT = 6000; // name is fully typed by 60% of the load
  var loader = document.getElementById('loader');
  var text = document.getElementById('loader-text');
  var pct = document.getElementById('loader-pct');
  if (!loader) return;

  // Resolves once the Adobe Fonts kit has loaded (or after a timeout, so a blocked kit never traps the visitor).
  var fontsReady = false;
  var fontLoads = document.fonts && document.fonts.load ? Promise.all([
    document.fonts.load('400 1em "aptos-mono"'),
    document.fonts.load('500 1em "corporate-s-std-urw"'),
    document.fonts.load('300 1em "corporate-s-std-urw"')
  ]) : Promise.resolve();
  Promise.race([fontLoads, new Promise(function (r) { setTimeout(r, FONT_TIMEOUT); })])
    .catch(function () {})
    .then(function () { fontsReady = true; });

  var start = null;
  function finish() {
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
    setTimeout(function () { loader.remove(); }, 4000);
  }
  function tick(now) {
    if (start === null) start = now;
    var p = Math.min((now - start) / DURATION, 1);
    text.textContent = NAME.slice(0, Math.ceil(Math.min(p / TYPE_BY, 1) * NAME.length));
    if (p < 1) {
      pct.textContent = Math.round(p * 100);
      requestAnimationFrame(tick);
    } else if (!fontsReady) {
      pct.textContent = 99; // hold just short of 100% until the fonts arrive
      requestAnimationFrame(tick);
    } else {
      pct.textContent = 100;
      setTimeout(finish, 400);
    }
  }
  requestAnimationFrame(tick);
})();
