const path = require('path');

const loadConfig = () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const dbPath = process.env.DB_PATH
    ? path.resolve(rootDir, process.env.DB_PATH)
    : path.resolve(__dirname, '../database/rage.db');

  const origins = (process.env.ADMIN_PANEL_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    rootDir,
    database: {
      path: dbPath
    },
    adminPanel: {
      port: Number(process.env.ADMIN_PANEL_PORT || 3001),
      secret: process.env.ADMIN_PANEL_SECRET || 'changeme',
      allowedOrigins: origins.length > 0 ? origins : ['http://localhost:3001']
    }
  };
};

module.exports = { loadConfig };
