import { Router } from 'express';
import path from 'path';
import fs from 'fs-extra';

const router = Router();
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');

router.use('/:project/preview', async (req, res, next) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.project);
    const file = req.query.file || 'index.html';
    const filePath = path.resolve(projectPath, file);
    if (!filePath.startsWith(projectPath)) return res.status(403).send('Forbidden');
    if (await fs.pathExists(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } catch (err) {
    next(err);
  }
});

export default router;
