export default {
  id: 'typescript',
  name: 'TypeScript',
  icon: 'ts',
  color: '#3178c6',
  monaco: { language: 'typescript' },
  lsp: { command: 'typescript-language-server', args: ['--stdio'] },
  docker: { image: 'node:20-alpine', runCmd: 'npx ts-node' },
  fileTree: {
    priority: ['src', 'tsconfig.json', 'package.json', '.env'],
    ignore: ['node_modules', '.git', 'dist'],
  },
  detect: (files) => files.includes('tsconfig.json'),
  templates: [],
};
