const playerRepositoryFactory = require('./playerRepository');
const inventoryRepositoryFactory = require('./inventoryRepository');
const chatRepositoryFactory = require('./chatRepository');
const activityRepositoryFactory = require('./activityRepository');
const panelRepositoryFactory = require('./panelRepository');

const buildRepositories = (pool) => ({
  players: playerRepositoryFactory(pool),
  inventories: inventoryRepositoryFactory(pool),
  chat: chatRepositoryFactory(pool),
  activity: activityRepositoryFactory(pool),
  panel: panelRepositoryFactory(pool)
});

module.exports = { buildRepositories };
