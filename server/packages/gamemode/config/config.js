const path = require('path');

const loadConfig = () => {
  const rootDir = path.resolve(__dirname, '../../..');

  const origins = (process.env.ADMIN_PANEL_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    rootDir,
    database: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'rage_server',
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10)
    },
    adminPanel: {
      port: Number(process.env.ADMIN_PANEL_PORT || 3001),
      secret: process.env.ADMIN_PANEL_SECRET || 'changeme',
      allowedOrigins: origins.length > 0 ? origins : ['http://localhost:3001']
    }
  };
};

module.exports = { loadConfig };
