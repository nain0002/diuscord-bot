const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const runMigrations = async (pool, config) => {
  const schemaPath = path.resolve(__dirname, '../../../database.sql');
  if (!fs.existsSync(schemaPath)) {
    logger.warn('database.sql not found; skipping migration step');
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const databaseName = config?.database?.name || config?.databaseName;

  try {
    if (databaseName) {
      await pool.query(`USE \`${databaseName}\``);
    }
    await pool.query(schema);
    logger.info('MySQL schema applied from database.sql');
  } catch (error) {
    logger.error('Failed to run database migrations', { error: error.message });
    throw error;
  }
};

module.exports = { runMigrations };
