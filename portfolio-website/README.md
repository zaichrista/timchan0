# Portfolio Website

Static site on GitHub Pages. All text and links come from a Google Sheet the client edits; the contact form saves to the sheet via Google Apps Script. No server in production.

- `public/` — the site (deployed as is). `config.js` holds the sheet ID, API key and form URL.
- `public/content.js` — fills the page from the sheet (cached in the browser, falls back to the HTML defaults).
- `apps-script/Code.gs` — contact form backend.
- `sheet-template/website-content.xlsx` — one workbook with all three tabs; import it into Google Sheets.
- `SETUP.md` — step-by-step setup and hand-off guide.
- `server.js` — optional local preview: `npm install && npm run dev` (http://localhost:3000).
