require('dotenv').config();

module.exports = {
  apps: [{
    name: 'virallinkup-studio',
    script: './dist/server.mjs',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 4000,
      DATABASE_URL: process.env.DATABASE_URL,
      STUDIO_JWT_SECRET: process.env.STUDIO_JWT_SECRET,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      GITHUB_USERNAME: process.env.GITHUB_USERNAME,
      PROJECTS_DIR: process.env.PROJECTS_DIR
    }
  }]
};
