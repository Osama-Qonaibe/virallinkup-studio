import javascriptPlugin from './javascript/index.js';
import typescriptPlugin from './typescript/index.js';
import phpPlugin from './php/index.js';
import pythonPlugin from './python/index.js';

const registry = new Map();

function register(plugin) {
  if (!plugin.id || !plugin.name) throw new Error('Plugin must have id and name');
  registry.set(plugin.id, plugin);
}

function get(id) { return registry.get(id); }
function all() { return Array.from(registry.values()); }

function detect(files = []) {
  for (const plugin of registry.values()) {
    if (plugin.detect && plugin.detect(files)) return plugin;
  }
  return javascriptPlugin;
}

register(javascriptPlugin);
register(typescriptPlugin);
register(phpPlugin);
register(pythonPlugin);

export { register, get, all, detect };
