import chokidar from 'chokidar';
import path from 'path';

const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');
const watchers = new Map();

export default function previewHandler(ws, req) {
  const url = new URL(req.url, 'http://localhost');
  const project = url.searchParams.get('project') || '';
  if (!project) return ws.close();

  const projectPath = path.join(PROJECTS_DIR, project);

  const watcher = chokidar.watch(projectPath, {
    ignored: /(node_modules|\.git|dist)/,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('all', (event, filePath) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'reload', event, file: path.relative(projectPath, filePath) }));
    }
  });

  ws.on('close', () => watcher.close());
}
