import pty from 'node-pty';
import path from 'path';

const PROJECTS_DIR = process.env.PROJECTS_DIR || path.resolve('./studio-projects');

export default function terminalHandler(ws, req) {
  const url = new URL(req.url, 'http://localhost');
  const project = url.searchParams.get('project') || '';
  const cwd = project ? path.join(PROJECTS_DIR, project) : PROJECTS_DIR;

  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd,
    env: { ...process.env, TERM: 'xterm-color' }
  });

  shell.onData(data => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'output', data }));
  });

  ws.on('message', msg => {
    try {
      const { type, data, cols, rows } = JSON.parse(msg);
      if (type === 'input') shell.write(data);
      if (type === 'resize') shell.resize(cols, rows);
    } catch {}
  });

  ws.on('close', () => shell.kill());
}
