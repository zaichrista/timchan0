const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const MESSAGES = path.join(__dirname, '..', 'data', 'messages.jsonl');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages, please try again later.' }
});

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

router.post('/', limiter, async (req, res, next) => {
  try {
    const { name, email, message, website } = req.body || {};

    // Honeypot: bots fill the hidden "website" field. Pretend success.
    if (website) return res.json({ ok: true });

    const errors = {};
    if (!name || String(name).trim().length < 2) errors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''))) errors.email = 'Please enter a valid email.';
    if (!message || String(message).trim().length < 10) errors.message = 'Message must be at least 10 characters.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const entry = {
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 200),
      message: String(message).trim().slice(0, 5000),
      receivedAt: new Date().toISOString()
    };

    await fs.appendFile(MESSAGES, JSON.stringify(entry) + '\n');

    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_TO,
        replyTo: entry.email,
        subject: `Portfolio message from ${entry.name}`,
        text: `${entry.message}\n\n— ${entry.name} <${entry.email}>`
      });
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
