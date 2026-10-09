// Paste into the Google Sheet: Extensions > Apps Script.
// Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
// Put the resulting URL in public/config.js as CONTACT_ENDPOINT.

const NOTIFY_EMAIL = 'client@example.com'; // where new messages are emailed

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.website) return json({ ok: true }); // honeypot: bots fill this

    const name = clean(p.name, 100);
    const email = clean(p.email, 200);
    const message = clean(p.message, 5000);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return json({ ok: false, error: 'Please fill in all fields correctly.' });
    }

    const sheet = SpreadsheetApp.getActive().getSheetByName('Messages');
    sheet.appendRow([new Date(), name, email, message]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: 'Portfolio message from ' + name,
      body: message + '\n\n— ' + name + ' <' + email + '>'
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'Server error. Please try again.' });
  }
}

// Trim, cap length, and stop spreadsheet formula injection (=, +, -, @ at the start).
function clean(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
