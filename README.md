# ViralLinkUp Studio v2

Professional polyglot IDE — personal development platform.

## Stack

- **Editor**: Monaco Editor + LSP
- **Terminal**: xterm.js + node-pty
- **AI**: LangChain.js (OpenAI / custom endpoint)
- **Runtime**: Docker API via dockerode
- **UI**: React + Tailwind CSS (Deep Space theme)
- **DB**: PostgreSQL
- **Deploy**: PM2 + esbuild

## Plugin System

Each language is a plugin in `plugins/<lang>/index.js`:

```js
export default {
  id: 'javascript',
  name: 'JavaScript / Node.js',
  monaco: { language: 'javascript' },
  lsp: { command: 'typescript-language-server', args: ['--stdio'] },
  docker: { image: 'node:20-alpine', runCmd: 'node' },
  fileTree: { priority: [...], ignore: [...] },
  detect: (files) => files.includes('package.json'),
};
```

To add a new language: create `plugins/<lang>/index.js` and register in `plugins/index.js`.

## Supported Languages

| Language | LSP | Docker | Status |
|----------|-----|--------|--------|
| JavaScript/Node.js | typescript-language-server | node:20-alpine | ✓ |
| TypeScript | typescript-language-server | node:20-alpine | ✓ |
| PHP/Laravel | intelephense | php:8.3-fpm | ✓ |
| Python | pylsp | python:3.12-slim | ✓ |

## Setup

```bash
npm install
cp .env.example .env
# Edit .env
npm run build
pm2 start ecosystem.config.cjs
```
