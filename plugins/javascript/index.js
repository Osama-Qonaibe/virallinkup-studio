export default {
  id: 'javascript',
  name: 'JavaScript / Node.js',
  icon: 'js',
  color: '#f7df1e',
  monaco: { language: 'javascript' },
  lsp: { command: 'typescript-language-server', args: ['--stdio'] },
  docker: { image: 'node:20-alpine', runCmd: 'node' },
  fileTree: {
    priority: ['src', 'public', 'package.json', '.env'],
    ignore: ['node_modules', '.git', 'dist'],
  },
  detect: (files) => files.includes('package.json') && !files.includes('tsconfig.json'),
  templates: [],
};
