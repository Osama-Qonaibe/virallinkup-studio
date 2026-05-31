# ViralLinkUp Studio

Personal development environment for building, previewing, and deploying projects.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your values
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
pm2 start ecosystem.config.cjs
```

## Features

- Project management (create, clone, delete)
- Monaco code editor with auto-save
- Live preview with hot reload
- Integrated terminal (xterm.js)
- Environment variables editor
- GitHub integration (clone, push, pull)
