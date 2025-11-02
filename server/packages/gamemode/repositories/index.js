const playerRepositoryFactory = require('./playerRepository');
const inventoryRepositoryFactory = require('./inventoryRepository');
const chatRepositoryFactory = require('./chatRepository');
const activityRepositoryFactory = require('./activityRepository');
const panelRepositoryFactory = require('./panelRepository');

const buildRepositories = (db) => ({
  players: playerRepositoryFactory(db),
  inventories: inventoryRepositoryFactory(db),
  chat: chatRepositoryFactory(db),
  activity: activityRepositoryFactory(db),
  panel: panelRepositoryFactory(db)
});

module.exports = { buildRepositories };
