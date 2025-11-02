const playerRepositoryFactory = require('./playerRepository');
const inventoryRepositoryFactory = require('./inventoryRepository');
const chatRepositoryFactory = require('./chatRepository');
const activityRepositoryFactory = require('./activityRepository');
const panelRepositoryFactory = require('./panelRepository');
const territoryRepositoryFactory = require('./territoryRepository');
const jobRepositoryFactory = require('./jobRepository');
const shopRepositoryFactory = require('./shopRepository');

const buildRepositories = (pool) => ({
  players: playerRepositoryFactory(pool),
  inventories: inventoryRepositoryFactory(pool),
  chat: chatRepositoryFactory(pool),
  activity: activityRepositoryFactory(pool),
  panel: panelRepositoryFactory(pool),
  territories: territoryRepositoryFactory(pool),
  jobs: jobRepositoryFactory(pool),
  shops: shopRepositoryFactory(pool)
});

module.exports = { buildRepositories };
