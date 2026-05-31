import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/providers', async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, project FROM api_keys WHERE name ILIKE '%AI_PROVIDER%' OR name ILIKE '%BASE_URL%' OR name ILIKE '%MODEL%' OR name ILIKE '%API_KEY%' ORDER BY name"
  );
  res.json(result.rows);
});

router.post('/chat', async (req, res) => {
  const { messages, provider, baseUrl, model, keyId, fileContext } = req.body;

  let apiKey = '';
  if (keyId) {
    const r = await pool.query('SELECT key_value FROM api_keys WHERE id = $1', [keyId]);
    if (r.rows.length) apiKey = r.rows[0].key_value;
  }

  const systemPrompt = fileContext
    ? `You are a coding assistant. The user is working on this file:\n\`\`\`\n${fileContext}\n\`\`\`\nHelp them with their code. When suggesting code changes, wrap code in triple backticks with the language.`
    : 'You are a helpful coding assistant.';

  const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];

  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/chat/completions`
    : 'https://api.openai.com/v1/chat/completions';

  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({ model: model || 'gpt-4o-mini', messages: allMessages, stream: false })
    });

    if (!fetchRes.ok) {
      const err = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: err });
    }

    const data = await fetchRes.json();
    res.json({ content: data.choices?.[0]?.message?.content || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
