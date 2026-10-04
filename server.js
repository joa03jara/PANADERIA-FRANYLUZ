const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'screens.json');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

function defaultData() {
  return {
    settings: {
      tagColor: '#E68C00',
      tagTextColor: '#3A0A0C',
      tagPosition: 'bottom-center',
      tagSize: 'md',
      logoPosition: 'top-center',
      logoSize: 'md'
    },
    screens: {
      '1': { name: 'Pantalla 1', items: [] },
      '2': { name: 'Pantalla 2', items: [] },
      '3': { name: 'Pantalla 3', items: [] }
    }
  };
}

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.screens) return defaultData();
    const defaults = defaultData();
    parsed.settings = Object.assign({}, defaults.settings, parsed.settings || {});
    return parsed;
  } catch (e) {
    const d = defaultData();
    saveData(d);
    return d;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let db = loadData();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${id}${ext}`);
  }
});

const ALLOWED = new Set(['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.webp', '.gif']);

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) {
      return cb(new Error('Formato no permitido. Subí un video (mp4, webm, mov) o una foto (jpg, png, webp, gif).'));
    }
    cb(null, true);
  }
});

function typeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  return 'image';
}

function validScreen(id) {
  return db.screens[id] !== undefined;
}

const app = express();
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(ROOT, 'public', 'assets')));
app.use(express.static(path.join(ROOT, 'public')));

app.get('/', (req, res) => res.redirect('/admin'));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT, 'public', 'admin.html'));
});

app.get('/screen/:id', (req, res, next) => {
  if (!validScreen(req.params.id)) return res.status(404).send('Pantalla no encontrada. Usá /screen/1, /screen/2 o /screen/3.');
  res.sendFile(path.join(ROOT, 'public', 'screen.html'));
});

// ---- API ----

app.get('/api/data', (req, res) => {
  res.json(db);
});

app.get('/api/screens/:id', (req, res) => {
  if (!validScreen(req.params.id)) return res.status(404).json({ error: 'not_found' });
  res.json(db.screens[req.params.id]);
});

app.patch('/api/settings', (req, res) => {
  const { tagColor, tagTextColor, tagPosition, tagSize, logoPosition, logoSize } = req.body || {};
  if (tagColor) db.settings.tagColor = tagColor;
  if (tagTextColor) db.settings.tagTextColor = tagTextColor;
  if (tagPosition) db.settings.tagPosition = tagPosition;
  if (tagSize) db.settings.tagSize = tagSize;
  if (logoPosition) db.settings.logoPosition = logoPosition;
  if (logoSize) db.settings.logoSize = logoSize;
  saveData(db);
  res.json(db.settings);
});

app.post('/api/screens/:id/items', upload.single('file'), (req, res) => {
  const id = req.params.id;
  if (!validScreen(id)) return res.status(404).json({ error: 'not_found' });
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo (video o foto).' });

  const label = (req.body.label || '').trim() || 'Producto sin nombre';
  const price = Number(req.body.price) || 0;
  const rawSeconds = req.body.seconds;
  const seconds = (rawSeconds === undefined || rawSeconds === null || rawSeconds === '')
    ? 8
    : (Number.isFinite(Number(rawSeconds)) ? Number(rawSeconds) : 8);
  const showPrice = !(req.body.showPrice === '0' || req.body.showPrice === 'false');
  const showLogo = !(req.body.showLogo === '0' || req.body.showLogo === 'false');

  const item = {
    id: crypto.randomBytes(6).toString('hex'),
    type: typeFromExt(req.file.originalname),
    file: `/uploads/${req.file.filename}`,
    label,
    price,
    seconds,
    showPrice,
    showLogo,
    createdAt: Date.now()
  };

  db.screens[id].items.push(item);
  saveData(db);
  res.json(item);
});

app.patch('/api/screens/:id/items/:itemId', (req, res) => {
  const id = req.params.id;
  if (!validScreen(id)) return res.status(404).json({ error: 'not_found' });
  const item = db.screens[id].items.find((it) => it.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'item_not_found' });

  if (req.body.label !== undefined) item.label = String(req.body.label).trim() || item.label;
  if (req.body.price !== undefined) item.price = Number(req.body.price) || 0;
  if (req.body.seconds !== undefined) item.seconds = Number(req.body.seconds) || item.seconds;
  if (req.body.showPrice !== undefined) item.showPrice = !!req.body.showPrice;
  if (req.body.showLogo !== undefined) item.showLogo = !!req.body.showLogo;

  saveData(db);
  res.json(item);
});

app.delete('/api/screens/:id/items/:itemId', (req, res) => {
  const id = req.params.id;
  if (!validScreen(id)) return res.status(404).json({ error: 'not_found' });
  const items = db.screens[id].items;
  const idx = items.findIndex((it) => it.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ error: 'item_not_found' });

  const [removed] = items.splice(idx, 1);
  saveData(db);

  const filePath = path.join(ROOT, removed.file.replace(/^\//, ''));
  fs.unlink(filePath, () => {});

  res.json({ ok: true });
});

app.post('/api/screens/:id/reorder', (req, res) => {
  const id = req.params.id;
  if (!validScreen(id)) return res.status(404).json({ error: 'not_found' });
  const order = req.body.order || [];
  const items = db.screens[id].items;
  const byId = new Map(items.map((it) => [it.id, it]));
  const reordered = order.map((oid) => byId.get(oid)).filter(Boolean);
  for (const it of items) {
    if (!order.includes(it.id)) reordered.push(it);
  }
  db.screens[id].items = reordered;
  saveData(db);
  res.json(db.screens[id]);
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Error inesperado' });
  }
  next();
});

app.listen(PORT, () => {
  console.log('');
  console.log('  Frayluz - Sistema de pantallas');
  console.log('  --------------------------------');
  console.log(`  Panel de administracion:  http://localhost:${PORT}/admin`);
  console.log(`  Pantalla 1:               http://localhost:${PORT}/screen/1`);
  console.log(`  Pantalla 2:               http://localhost:${PORT}/screen/2`);
  console.log(`  Pantalla 3:               http://localhost:${PORT}/screen/3`);
  console.log('');
});
