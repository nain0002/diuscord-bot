const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const { loadConfig } = require('./config/config');
const { createDatabaseConnection } = require('./database/connection');
const { runMigrations } = require('./database/migrations');
const { buildRepositories } = require('./repositories');
const { buildServices } = require('./services');
const { registerEvents } = require('./events');
const { registerCommands } = require('./commands');
const { startHttpServer } = require('./services/httpService');

const loadEnvironment = () => {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    logger.info('Environment variables loaded from .env');
    return;
  }
  const examplePath = path.resolve(__dirname, '../../.env.example');
  if (fs.existsSync(examplePath)) {
    dotenv.config({ path: examplePath });
    logger.warn('Using .env.example values. Create a .env file for production use.');
  }
};

const bootstrap = async () => {
  loadEnvironment();

  const config = loadConfig();
  const db = createDatabaseConnection(config.database);
  runMigrations(db);
  const repositories = buildRepositories(db);
  const services = buildServices({ config, repositories });

  const context = {
    config,
    db,
    repositories,
    services
  };

  registerEvents(context);
  registerCommands(context);
  await startHttpServer(context);

  logger.info('Advanced RageMP server bootstrap complete');
  return context;
};

module.exports = { bootstrap };
