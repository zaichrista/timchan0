// Posts the contact form to the Google Apps Script web app (see apps-script/Code.gs).
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const endpoint = (window.SITE_CONFIG || {}).CONTACT_ENDPOINT;
  const data = Object.fromEntries(new FormData(form));

  if (!endpoint) { status.textContent = 'Contact form is not connected yet.'; return; }
  if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.message.trim().length < 10) {
    status.textContent = 'Please enter your name, a valid email and a message of at least 10 characters.';
    return;
  }

  const btn = form.querySelector('button');
  btn.disabled = true;
  status.textContent = 'Sending…';
  try {
    // URL-encoded body is a "simple" request, so no CORS preflight (Apps Script can't answer one).
    const res = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(data) });
    const out = await res.json();
    if (out.ok) { status.textContent = 'Thanks — your message was sent.'; form.reset(); }
    else status.textContent = out.error || 'Something went wrong. Please try again.';
  } catch {
    status.textContent = 'Network error. Please try again.';
  }
  btn.disabled = false;
});
