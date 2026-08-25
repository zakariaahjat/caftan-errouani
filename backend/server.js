const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname, '..')));

// Read DB
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB:', e.message);
    return null;
  }
}

// Write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing DB:', e.message);
    return false;
  }
}

// GET /api/db - Load entire database
app.get('/api/db', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Failed to read database' });
  res.json(db);
});

// PUT /api/db - Save entire database
app.put('/api/db', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  if (writeDB(req.body)) {
    res.json({ ok: true });
  } else {
    res.status(500).json({ error: 'Failed to write database' });
  }
});

// POST /api/db/reset - Reset to seed data
app.post('/api/db/reset', (req, res) => {
  const seedPath = path.join(__dirname, 'data', 'seed.json');
  try {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    if (writeDB(seed)) return res.json({ ok: true });
  } catch (e) {}
  res.status(500).json({ error: 'Reset failed' });
});

// GET /api/db/:collection - Load a specific collection
app.get('/api/db/:collection', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Failed to read database' });
  const coll = req.params.collection;
  if (!(coll in db)) return res.status(404).json({ error: 'Collection not found' });
  res.json(db[coll]);
});

// SPA fallback: serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/db`);
});
