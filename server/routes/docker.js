import express from 'express';
import { runInContainer, stopContainer, listRunning } from '../services/docker.js';
import path from 'path';

const router = express.Router();
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/home/almalinux/projects';

router.post('/:project/run', async (req, res) => {
  const { image, cmd, env } = req.body;
  if (!image || !cmd) return res.status(400).json({ error: 'image and cmd required' });
  const projectPath = path.join(PROJECTS_DIR, req.params.project);
  try {
    const { container, stream } = await runInContainer({ image, cmd, projectPath, env });
    res.json({ containerId: container.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:containerId/stop', async (req, res) => {
  await stopContainer(req.params.containerId);
  res.json({ ok: true });
});

router.get('/running', async (req, res) => {
  try {
    res.json(await listRunning());
  } catch (e) {
    res.json([]);
  }
});

export default router;
