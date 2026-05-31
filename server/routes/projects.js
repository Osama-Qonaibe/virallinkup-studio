import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { execSync, spawn } from 'child_process';

const router = Router();
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');

fs.ensureDirSync(PROJECTS_DIR);

router.get('/', async (req, res) => {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = await Promise.all(
      entries.filter(e => e.isDirectory()).map(async e => {
        const metaPath = path.join(PROJECTS_DIR, e.name, '.studio.json');
        const meta = await fs.pathExists(metaPath) ? await fs.readJson(metaPath) : {};
        return { name: e.name, ...meta };
      })
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, template = 'html' } = req.body;
    const projectPath = path.join(PROJECTS_DIR, name);
    if (await fs.pathExists(projectPath)) return res.status(409).json({ error: 'Project already exists' });
    await fs.ensureDir(projectPath);
    await applyTemplate(projectPath, template);
    const meta = { name, template, createdAt: new Date().toISOString(), port: null };
    await fs.writeJson(path.join(projectPath, '.studio.json'), meta);
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.name);
    await fs.remove(projectPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:name/env', async (req, res) => {
  try {
    const envPath = path.join(PROJECTS_DIR, req.params.name, '.env');
    const content = await fs.pathExists(envPath) ? await fs.readFile(envPath, 'utf8') : '';
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:name/env', async (req, res) => {
  try {
    const envPath = path.join(PROJECTS_DIR, req.params.name, '.env');
    await fs.writeFile(envPath, req.body.content || '');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function applyTemplate(projectPath, template) {
  if (template === 'html') {
    await fs.writeFile(path.join(projectPath, 'index.html'), `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="app.js"></script>\n</body>\n</html>`);
    await fs.writeFile(path.join(projectPath, 'style.css'), `* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: sans-serif; padding: 2rem; }`);
    await fs.writeFile(path.join(projectPath, 'app.js'), `console.log('Project initialized');`);
  } else if (template === 'node') {
    await fs.writeFile(path.join(projectPath, 'index.js'), `import express from 'express';\nconst app = express();\napp.get('/', (req, res) => res.send('Hello World'));\napp.listen(3000, () => console.log('Server running on port 3000'));`);
    await fs.writeJson(path.join(projectPath, 'package.json'), { name: path.basename(projectPath), version: '1.0.0', type: 'module', main: 'index.js' }, { spaces: 2 });
  }
}

export default router;
