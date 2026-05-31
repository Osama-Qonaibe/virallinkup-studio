import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsRouter from './routes/projects.js';
import filesRouter from './routes/files.js';
import githubRouter from './routes/github.js';
import terminalHandler from './ws/terminal.js';
import previewHandler from './ws/preview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist/public')));

app.use('/api/projects', projectsRouter);
app.use('/api/files', filesRouter);
app.use('/api/github', githubRouter);

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const type = url.searchParams.get('type');
  if (type === 'terminal') terminalHandler(ws, req);
  if (type === 'preview') previewHandler(ws, req);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[OsamaStudio] Running on port ${PORT}`);
});
