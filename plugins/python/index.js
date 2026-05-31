export default {
  id: 'python',
  name: 'Python',
  icon: 'py',
  color: '#3776ab',
  monaco: { language: 'python' },
  lsp: { command: 'pylsp', args: [] },
  docker: { image: 'python:3.12-slim', runCmd: 'python3' },
  fileTree: {
    priority: ['src', 'main.py', 'app.py', 'requirements.txt', '.env'],
    ignore: ['.git', '__pycache__', '.venv', 'dist'],
  },
  detect: (files) => files.includes('requirements.txt') || files.some(f => f.endsWith('.py')),
  templates: [],
};
