import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const SECRET = process.env.STUDIO_SECRET || 'studio-secret';

function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: result.rows[0].id, username }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

router.get('/keys', auth, async (req, res) => {
  const result = await pool.query('SELECT id, name, project, created_at FROM api_keys ORDER BY created_at DESC');
  res.json(result.rows);
});

router.get('/keys/:id/value', auth, async (req, res) => {
  const result = await pool.query('SELECT key_value FROM api_keys WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ key_value: result.rows[0].key_value });
});

router.post('/keys', auth, async (req, res) => {
  const { name, key_value, project } = req.body;
  if (!name || !key_value) return res.status(400).json({ error: 'name and key_value required' });
  const result = await pool.query(
    'INSERT INTO api_keys (name, key_value, project) VALUES ($1, $2, $3) RETURNING id, name, project, created_at',
    [name, key_value, project || null]
  );
  res.json(result.rows[0]);
});

router.delete('/keys/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM api_keys WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

router.put('/password', auth, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Min 6 chars' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [hash, req.admin.id]);
  res.json({ ok: true });
});

export default router;
