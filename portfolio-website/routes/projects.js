const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const FILE = path.join(__dirname, '..', 'data', 'projects.json');

async function load() {
  return JSON.parse(await fs.readFile(FILE, 'utf8'));
}

router.get('/', async (req, res, next) => {
  try {
    let projects = await load();
    if (req.query.category) {
      projects = projects.filter(p => p.category.toLowerCase() === String(req.query.category).toLowerCase());
    }
    res.json(projects);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = (await load()).find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
});

module.exports = router;
