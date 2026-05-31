import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = Router();
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');

function safePath(project, filePath) {
  const base = path.resolve(PROJECTS_DIR, project);
  const target = path.resolve(base, filePath || '');
  if (!target.startsWith(base)) throw new Error('Path traversal detected');
  return target;
}

router.get('/:project/tree', async (req, res) => {
  try {
    const root = safePath(req.params.project, '');
    const tree = await buildTree(root, root);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:project/read', async (req, res) => {
  try {
    const filePath = safePath(req.params.project, req.query.path);
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:project/write', async (req, res) => {
  try {
    const filePath = safePath(req.params.project, req.body.path);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, req.body.content || '');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:project/delete', async (req, res) => {
  try {
    const filePath = safePath(req.params.project, req.query.path);
    await fs.remove(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:project/rename', async (req, res) => {
  try {
    const from = safePath(req.params.project, req.body.from);
    const to = safePath(req.params.project, req.body.to);
    await fs.move(from, to);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function buildTree(dir, root) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const children = await Promise.all(
    entries
      .filter(e => !['node_modules', '.git', 'dist', '.studio.json'].includes(e.name))
      .map(async e => {
        const fullPath = path.join(dir, e.name);
        const relativePath = path.relative(root, fullPath);
        if (e.isDirectory()) {
          return { name: e.name, path: relativePath, type: 'dir', children: await buildTree(fullPath, root) };
        }
        return { name: e.name, path: relativePath, type: 'file' };
      })
  );
  return children.sort((a, b) => (a.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name));
}

export default router;
