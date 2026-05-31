module.exports = {
  apps: [{
    name: 'virallinkup-studio',
    script: './dist/server.mjs',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
