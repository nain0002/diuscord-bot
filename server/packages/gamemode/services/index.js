const { EventEmitter } = require('events');
const { buildAuthService } = require('./authService');
const { buildInventoryService } = require('./inventoryService');
const { buildChatService } = require('./chatService');
const { buildPanelService } = require('./panelService');
const { buildPlayerStateService } = require('./playerStateService');

const buildServices = ({ config, repositories }) => {
  const state = buildPlayerStateService();
  const eventBus = new EventEmitter();

  const services = {
    state,
    eventBus
  };

  services.auth = buildAuthService({ repositories });
  services.chat = buildChatService({ repositories, state, eventBus });
  services.inventory = buildInventoryService({ repositories, state, eventBus });
  services.panel = buildPanelService({ repositories, services, config, eventBus });

  return services;
};

module.exports = { buildServices };
