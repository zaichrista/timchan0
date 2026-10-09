// Draws the journey line: starts centred under the hero, curves to the left edge,
// then runs down the timeline past one dot per entry. The whole path is faint;
// a solid copy is revealed as the visitor scrolls onto it.
(function () {
  const journey = document.querySelector('.journey');
  if (!journey) return;
  const svg = journey.querySelector('.journey-line');
  const base = svg.querySelector('.line-base');
  const solid = svg.querySelector('.line-solid');
  const NS = 'http://www.w3.org/2000/svg';
  const REACH = 0.8; // the line is "reached" once it is this far down the viewport

  let samples = [];   // [y, length] along the path; y only ever increases
  let total = 0;
  let dots = [];      // { y, circle, item }
  let top = 0;        // journey's distance from the top of the document
  let journeyH = 1;
  let startY = 0;     // where the line begins, relative to the journey

  function layout() {
    const W = journey.clientWidth;
    const H = journey.offsetHeight;
    const jr = journey.getBoundingClientRect();
    top = jr.top + window.scrollY;
    journeyH = H;

    // The timeline block (line + text) sits left of centre, so the line has room to curve.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const GAP = 2.25 * rem, PAD = 16;
    const textW = Math.min(34 * rem, W - 24 - GAP - PAD);
    const lineX = Math.max(24, (W - (textW + GAP)) / 2 - W * 0.09);
    journey.style.setProperty('--line-x', lineX + 'px');

    const hero = journey.querySelector('.scene-hero');
    // The label (snowflake above "Career") sits centred just below the subheading, and the
    // line begins directly under it. Vertical positions come from layout offsets plus rect
    // differences, so the entrance transform doesn't skew them.
    const sub = hero.querySelector('.hero-copy p');
    const x0 = W / 2;
    const subBottom = sub.offsetTop + sub.offsetHeight + (hero.offsetTop || 0);
    const label = journey.querySelector('.journey-label');
    let y0 = subBottom + 24;
    if (label) {
      const labelTop = subBottom + 28;
      label.style.left = (x0 - label.offsetWidth / 2) + 'px';
      label.style.top = labelTop + 'px';
      y0 = labelTop + label.offsetHeight + 10;
    }
    startY = y0;

    const items = [...journey.querySelectorAll('.tl-item')];
    const ys = items.map(item => {
      const year = item.querySelector('.tl-head') || item;
      const r = year.getBoundingClientRect();
      return r.top - jr.top + r.height / 2;
    });
    if (!ys.length) { base.removeAttribute('d'); solid.removeAttribute('d'); return; }

    const yc = Math.max(y0 + 40, ys[0] - 60);   // where the curve meets the left-hand line
    const k = (yc - y0) * 0.55;
    const yEnd = ys[ys.length - 1] + 70;
    const d = `M${x0} ${y0} C${x0} ${y0 + k} ${lineX} ${yc - k} ${lineX} ${yc} L${lineX} ${yEnd}`;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    base.setAttribute('d', d);
    solid.setAttribute('d', d);
    total = solid.getTotalLength();
    solid.style.strokeDasharray = total;

    samples = [];
    const n = 300;
    for (let i = 0; i <= n; i++) {
      const len = (total * i) / n;
      samples.push([solid.getPointAtLength(len).y, len]);
    }

    svg.querySelectorAll('.tl-dot, .tl-ring').forEach(c => c.remove());
    const wasOn = dots.map(d => d.on); // keep state across re-layouts so dots don't flash or re-pulse
    dots = ys.map((y, i) => {
      const ring = document.createElementNS(NS, 'circle');   // expands and fades when the dot is hit
      ring.setAttribute('class', 'tl-ring');
      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('class', wasOn[i] ? 'tl-dot reached' : 'tl-dot');
      [ring, circle].forEach(c => {
        c.setAttribute('cx', lineX); c.setAttribute('cy', y); c.setAttribute('r', 6);
        svg.appendChild(c);
      });
      return { y, circle, ring, item: items[i], on: !!wasOn[i] };
    });

    update();
  }

  function lengthAt(y) {
    if (y <= samples[0][0]) return 0;
    for (let i = 1; i < samples.length; i++) {
      if (y <= samples[i][0]) {
        const [y1, l1] = samples[i - 1], [y2, l2] = samples[i];
        return y2 === y1 ? l2 : l1 + ((y - y1) / (y2 - y1)) * (l2 - l1);
      }
    }
    return total;
  }

  function update() {
    if (!samples.length) return;
    // The black tip starts at the very top of the line (nothing drawn on load) and
    // travels down the screen as you scroll, stopping at REACH of the viewport height.
    const tipScreen = Math.min(window.innerHeight * REACH, top + startY + window.scrollY * 0.6);
    const reachY = window.scrollY - top + tipScreen;
    const len = lengthAt(reachY);
    solid.style.visibility = len < 1 ? 'hidden' : 'visible'; // no stray round cap at zero length
    solid.style.strokeDashoffset = total - len;
    dots.forEach(d => {
      const on = d.y <= reachY;
      d.item.classList.toggle('reached', on);
      if (on === d.on) return;
      d.on = on;
      d.circle.classList.toggle('reached', on);
      d.ring.classList.toggle('pulse', on); // removed when scrolling back up, so it replays
    });

    // Background drifts from off-white to off-white with a hint of green as you scroll down.
    const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, journeyH - window.innerHeight * 0.4)));
    document.documentElement.style.setProperty('--p', p.toFixed(3));
    // The snowflake turns slowly as you scroll.
    document.documentElement.style.setProperty('--spin', (window.scrollY * 0.4).toFixed(2));
    document.documentElement.classList.toggle('scrolled', window.scrollY > 10);
  }

  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  // Sheet content replaces the placeholder items and changes the height.
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(journey);
  layout();
})();
