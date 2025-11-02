const { bootstrap } = require('./bootstrap');
const logger = require('./utils/logger');

bootstrap()
  .then(() => {
    logger.info('Server initialized and ready.');
  })
  .catch((error) => {
    logger.error('Failed to bootstrap server', { error: error.stack || error.message });
  });
