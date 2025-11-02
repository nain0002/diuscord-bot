const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const createDatabaseConnection = async (config) => {
  const { host, port, user, password, name, connectionLimit } = config;

  const resolvedHost = host || 'localhost';

  const baseConfig = {
    host: resolvedHost,
    port,
    user,
    password,
    multipleStatements: true,
    timezone: 'Z',
    dateStrings: true
  };

  const connection = await mysql.createConnection(baseConfig);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();

  const pool = mysql.createPool({
    ...baseConfig,
    database: name,
    waitForConnections: true,
    connectionLimit: connectionLimit || 10,
    namedPlaceholders: true
  });

  logger.info('MySQL connection pool established', { host, database: name });
  return pool;
};

module.exports = { createDatabaseConnection };
