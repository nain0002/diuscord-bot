const { getMp } = require('../utils/mp');
const logger = require('../utils/logger');

const toSerializablePosition = (position) => {
  if (!position) return null;
  return {
    x: position.x,
    y: position.y,
    z: position.z,
    heading: position.heading || 0
  };
};

const registerPlayerEvents = ({ repositories, services }) => {
  const mp = getMp();

  mp.events.add('playerJoin', (player) => {
    logger.info('Player connected', { name: player.name, socialClub: player.socialClubName });
    player.spawn(new mp.Vector3(-425.517, 1123.620, 325.854));
    player.call('ui:showAuth', [player.name]);
    player.outputChatBox('!{#44ff44}Welcome to the Advanced Rage Multiplayer server!');
  });

  mp.events.add('playerQuit', (player, exitType, reason) => {
    const account = services.state.getAccount(player);
    if (account) {
      repositories.players.updatePosition(account.id, toSerializablePosition(player.position));
      services.state.detach(player);
    }
    logger.info('Player disconnected', { name: player.name, exitType, reason });
  });

  mp.events.add('playerReady', (player) => {
    player.call('ui:syncSkin');
  });

  mp.events.add('playerChat', (player, message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('/')) {
      return;
    }
    services.chat.handlePlayerMessage(player, trimmed);
  });
};

module.exports = { registerPlayerEvents };
