export default {
  id: 'php',
  name: 'PHP / Laravel',
  icon: 'php',
  color: '#777bb4',
  monaco: { language: 'php' },
  lsp: { command: 'intelephense', args: ['--stdio'] },
  docker: {
    image: 'php:8.3-fpm-alpine',
    compose: 'docker-compose.laravel.yml',
    runCmd: 'php artisan',
  },
  fileTree: {
    priority: ['app', 'config', 'routes', 'resources', 'database', 'public', '.env'],
    ignore: ['vendor', 'node_modules', '.git', 'storage/framework', 'storage/logs'],
  },
  detect: (files) => files.includes('artisan') || files.includes('composer.json'),
  templates: ['laravel'],
};
