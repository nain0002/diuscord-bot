const { EventEmitter } = require('events');
const { buildAuthService } = require('./authService');
const { buildInventoryService } = require('./inventoryService');
const { buildChatService } = require('./chatService');
const { buildPanelService } = require('./panelService');
const { buildPlayerStateService } = require('./playerStateService');
const { buildFreeroamService } = require('./freeroamService');
const { buildTerritoryService } = require('./territoryService');
const { buildJobService } = require('./jobService');
const { buildShopService } = require('./shopService');
const { buildBlipService } = require('./blipService');
const gameplayConfig = require('../config/gameplay');

const buildServices = ({ config, repositories }) => {
  const state = buildPlayerStateService();
  const eventBus = new EventEmitter();

  const services = {
    state,
    eventBus,
    gameplay: gameplayConfig
  };

  services.auth = buildAuthService({ repositories });
  services.chat = buildChatService({ repositories, state, eventBus });
  services.inventory = buildInventoryService({ repositories, state, eventBus });
  services.panel = buildPanelService({ repositories, services, config, eventBus });
  services.freeroam = buildFreeroamService({ config: gameplayConfig });
  services.territories = buildTerritoryService({
    config: gameplayConfig,
    repositories,
    services,
    eventBus
  });
  services.jobs = buildJobService({
    config: gameplayConfig,
    repositories,
    eventBus,
    state
  });
  services.shops = buildShopService({
    config: gameplayConfig,
    repositories,
    services
  });
  services.blips = buildBlipService({ config: gameplayConfig });

  return services;
};

module.exports = { buildServices };
