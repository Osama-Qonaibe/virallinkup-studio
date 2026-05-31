import { Router } from 'express';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs-extra';

const router = Router();
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');

router.post('/clone', async (req, res) => {
  try {
    const { repoUrl, name } = req.body;
    const projectPath = path.join(PROJECTS_DIR, name);
    if (await fs.pathExists(projectPath)) return res.status(409).json({ error: 'Project already exists' });
    await fs.ensureDir(projectPath);
    const git = simpleGit();
    await git.clone(repoUrl, projectPath);
    const meta = { name, repoUrl, clonedAt: new Date().toISOString(), port: null };
    await fs.writeJson(path.join(projectPath, '.studio.json'), meta);
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:project/push', async (req, res) => {
  try {
    const { message = 'Update from ViralLinkUp Studio' } = req.body;
    const projectPath = path.join(PROJECTS_DIR, req.params.project);
    const token = process.env.GITHUB_TOKEN;
    const git = simpleGit(projectPath);
    const remotes = await git.getRemotes(true);
    if (remotes.length > 0 && token) {
      const remote = remotes[0].refs.push;
      const authedUrl = remote.replace('https://', `https://${token}@`);
      await git.remote(['set-url', 'origin', authedUrl]);
    }
    await git.add('.');
    await git.commit(message);
    await git.push('origin', 'main');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:project/pull', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.project);
    const git = simpleGit(projectPath);
    await git.pull();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:project/status', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.project);
    const git = simpleGit(projectPath);
    const status = await git.status();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
