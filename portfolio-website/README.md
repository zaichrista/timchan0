# Portfolio Website

Node + Express backend serving a static frontend.

## Run
```bash
npm install
cp .env.example .env   # optional: add SMTP details to get contact messages by email
npm run dev            # http://localhost:3000
```

## Structure
- `server.js` — Express app (helmet, JSON parsing, static files, error handling)
- `routes/projects.js` — `GET /api/projects` (optional `?category=`), `GET /api/projects/:id`
- `routes/contact.js` — `POST /api/contact` (validation, honeypot, rate limit 5/15min, saved to `data/messages.jsonl`, emailed if SMTP is set)
- `data/projects.json` — edit this to add your work
- `public/` — HTML, CSS, JS frontend

## Deploy
Any Node host (Render, Railway, Fly.io, a VPS). Set the env vars from `.env.example`; start command is `npm start`.
