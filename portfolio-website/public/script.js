document.getElementById('year').textContent = new Date().getFullYear();

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

(async function loadProjects() {
  const el = document.getElementById('projects');
  try {
    const projects = await (await fetch('/api/projects')).json();
    el.innerHTML = projects.map(p => `
      <a class="card" href="${esc(p.link) || '#'}">
        ${p.image ? `<img class="thumb" src="${esc(p.image)}" alt="${esc(p.title)}">` : '<div class="thumb"></div>'}
        <div class="body"><h3>${esc(p.title)}</h3><small>${esc(p.category)} · ${esc(p.year)}</small><p>${esc(p.summary)}</p></div>
      </a>`).join('');
  } catch {
    el.textContent = 'Could not load projects.';
  }
})();

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true;
  status.textContent = 'Sending…';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const data = await res.json();
    if (res.ok) { status.textContent = 'Thanks — your message was sent.'; form.reset(); }
    else status.textContent = data.errors ? Object.values(data.errors).join(' ') : data.error;
  } catch {
    status.textContent = 'Network error. Please try again.';
  }
  btn.disabled = false;
});
