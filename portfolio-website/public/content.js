// Loads text + links from a Google Sheet and fills the page.
//
// HTML hooks (design however you like):
//   data-key="hero_title"        -> element text from Site tab, row key "hero_title"
//   data-href-key="instagram_url"-> element href from Site tab (element hidden if empty)
//   data-src-key="hero_image"   -> <img> src from Site tab (image stays hidden if empty)
//   data-list="Projects"         -> repeats the <template> inside it, once per visible row of that tab
//     data-field="title"         -> text from column "title"
//     data-field-src="logo"       -> <img> src from column "logo" (image stays hidden if empty)
//     data-show-if="title"        -> element hidden when column "title" is empty
//     data-field-href="link"     -> href from column "link" (element hidden if empty, unless it also has data-keep)
// Anything not found in the sheet keeps the default text written in the HTML.
(function () {
  const cfg = window.SITE_CONFIG || {};
  const CACHE_KEY = 'site-content-v1:' + cfg.SHEET_ID;
  const SAFE_URL = /^(https?:|mailto:|tel:|#|\/)/i;

  function toData(valueRanges) {
    const data = {};
    valueRanges.forEach(vr => {
      const name = vr.range.split('!')[0].replace(/'/g, '');
      const rows = vr.values || [];
      if (name === 'Site') {
        data.Site = {};
        rows.slice(1).forEach(r => { if (r[0]) data.Site[String(r[0]).trim()] = r[1] ?? ''; });
      } else {
        const head = (rows[0] || []).map(h => String(h).trim());
        data[name] = rows.slice(1)
          .filter(r => r.some(c => String(c).trim() !== ''))
          .map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
      }
    });
    return data;
  }

  function setHref(el, url) {
    url = String(url || '').trim();
    if (url && SAFE_URL.test(url)) { el.setAttribute('href', url); el.hidden = false; }
    else { el.removeAttribute('href'); el.hidden = !el.hasAttribute('data-keep'); } // data-keep: stay visible without a link
  }

  function render(data) {
    const site = data.Site || {};

    document.querySelectorAll('[data-key]').forEach(el => {
      const k = el.dataset.key;
      if (k in site) el.textContent = site[k];
    });
    document.querySelectorAll('[data-content-key]').forEach(el => {
      const k = el.dataset.contentKey;
      if (k in site) el.setAttribute('content', site[k]);
    });
    document.querySelectorAll('[data-href-key]').forEach(el => {
      const k = el.dataset.hrefKey;
      if (k in site) setHref(el, site[k]);
    });

    document.querySelectorAll('[data-src-key]').forEach(el => {
      const url = String(site[el.dataset.srcKey] || '').trim();
      if (url && /^(https?:|\/|[\w.-]+\/)/i.test(url)) { el.src = url; el.hidden = false; }
    });

    document.querySelectorAll('[data-list]').forEach(list => {
      const rows = data[list.dataset.list];
      const tpl = list.querySelector('template');
      if (!rows || !tpl) return;

      list.querySelectorAll(':scope > :not(template)').forEach(n => n.remove());
      rows
        .filter(r => String(r.visible ?? 'TRUE').toUpperCase() !== 'FALSE')
        .sort((a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0))
        .forEach(row => {
          const node = tpl.content.cloneNode(true);
          node.querySelectorAll('[data-field]').forEach(el => {
            const v = row[el.dataset.field] ?? '';
            el.textContent = v;
            el.hidden = String(v).trim() === '';
          });
          node.querySelectorAll('[data-field-href]').forEach(el => setHref(el, row[el.dataset.fieldHref]));
          node.querySelectorAll('[data-field-src]').forEach(el => {
            const url = String(row[el.dataset.fieldSrc] || '').trim();
            if (url && /^(https?:|\/|[\w.-]+\/)/i.test(url)) { el.src = url; el.hidden = false; }
          });
          node.querySelectorAll('[data-show-if]').forEach(el => {
            if (String(row[el.dataset.showIf] ?? '').trim() === '') el.hidden = true;
          });
          list.appendChild(node);
        });
    });
    window.dispatchEvent(new Event('resize')); // lets timeline.js re-measure
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  }

  async function load() {
    if (!cfg.SHEET_ID || !cfg.API_KEY) return; // not configured: keep defaults

    const cached = readCache();
    if (cached) render(cached); // instant paint, then refresh below

    // One request per tab, so a tab that doesn't exist yet (e.g. Timeline) doesn't break the others.
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${cfg.SHEET_ID}/values/`;
    try {
      const results = await Promise.allSettled((cfg.TABS || []).map(async t => {
        const res = await fetch(`${base}${encodeURIComponent(t)}?key=${cfg.API_KEY}`, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(t + ': Sheets API ' + res.status);
        return res.json();
      }));
      const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      if (!ok.length) throw new Error(results[0] && results[0].reason ? results[0].reason.message : 'no tabs loaded');
      const data = toData(ok);
      writeCache(data);
      render(data);
    } catch (err) {
      console.warn('Could not refresh content from the sheet:', err.message);
    }
  }

  window.SiteContent = { toData, render }; // exposed for testing
  load();
})();
