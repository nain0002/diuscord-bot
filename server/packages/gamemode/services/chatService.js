const logger = require('../utils/logger');
const { getMp } = require('../utils/mp');

const buildChatService = ({ repositories, state, eventBus }) => {
  const broadcast = (message, options = {}) => {
    const mp = getMp();
    const formatted = options.prefix ? `${options.prefix} ${message}` : message;
    mp.players.broadcast(formatted);
  };

  const handlePlayerMessage = (player, message) => {
    const account = state.getAccount(player);
    const playerName = account ? account.username : player.name;

    const payload = repositories.chat.logMessage({
      playerId: account ? account.id : null,
      message,
      channel: 'global'
    });
    logger.info('Chat message', { player: playerName, message });
    broadcast(`${playerName}: ${message}`);
    if (eventBus) {
      eventBus.emit('chat:new', payload);
    }
    return payload;
  };

  const getRecent = (limit = 50) => repositories.chat.getRecent(limit);

  return {
    broadcast,
    handlePlayerMessage,
    getRecent
  };
};

module.exports = { buildChatService };
