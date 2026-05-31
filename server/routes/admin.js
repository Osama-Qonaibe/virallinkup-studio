import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

const JWT_SECRET  = process.env.STUDIO_JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS  = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASS) {
  console.error('[FATAL] STUDIO_JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

function requireAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  if (username.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase())
    return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, ADMIN_PASS);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

router.get('/keys', requireAdmin, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, project, endpoint, created_at FROM api_keys ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

router.get('/keys/:id/value', requireAdmin, async (req, res) => {
  const result = await pool.query('SELECT key_value FROM api_keys WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ key_value: result.rows[0].key_value });
});

router.post('/keys', requireAdmin, async (req, res) => {
  const { name, key_value, project, endpoint } = req.body;
  if (!name || !key_value) return res.status(400).json({ error: 'name and key_value required' });
  const result = await pool.query(
    'INSERT INTO api_keys (name, key_value, project, endpoint) VALUES ($1, $2, $3, $4) RETURNING id, name, project, endpoint, created_at',
    [name, key_value, project || null, endpoint || null]
  );
  res.json(result.rows[0]);
});

router.delete('/keys/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM api_keys WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
