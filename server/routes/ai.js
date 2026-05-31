import express from 'express';
import { refactorCode, explainCode, completeCode } from '../services/ai.js';
import pool from '../db.js';

const router = express.Router();

async function getKeyForProvider(provider) {
  const res = await pool.query(
    'SELECT key_value, endpoint FROM api_keys WHERE LOWER(name) LIKE $1 LIMIT 1',
    [`%${provider.toLowerCase()}%`]
  );
  return res.rows[0] || null;
}

router.post('/refactor', async (req, res) => {
  const { code, language, instruction, provider = 'openai' } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const key = await getKeyForProvider(provider);
  if (!key) return res.status(400).json({ error: `No API key found for ${provider}` });
  try {
    const result = await refactorCode({ code, language, instruction, apiKey: key.key_value, endpoint: key.endpoint });
    res.json({ result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/explain', async (req, res) => {
  const { code, language, provider = 'openai' } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const key = await getKeyForProvider(provider);
  if (!key) return res.status(400).json({ error: `No API key found for ${provider}` });
  try {
    const result = await explainCode({ code, language, apiKey: key.key_value, endpoint: key.endpoint });
    res.json({ result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/complete', async (req, res) => {
  const { prefix, suffix, language, provider = 'openai' } = req.body;
  const key = await getKeyForProvider(provider);
  if (!key) return res.status(400).json({ error: `No API key found for ${provider}` });
  try {
    const result = await completeCode({ prefix, suffix, language, apiKey: key.key_value, endpoint: key.endpoint });
    res.json({ result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
