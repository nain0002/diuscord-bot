const { getMp } = require('../utils/mp');
const logger = require('../utils/logger');

const buildFreeroamService = ({ config }) => {
  const mp = getMp();
  const spawnPoints = config.spawnPoints || [];

  const getSpawnPoint = () => {
    if (!spawnPoints.length) {
      return { x: -425.517, y: 1123.62, z: 325.854, heading: 0 };
    }
    return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  };

  const spawnPlayer = (player, forcedPosition) => {
    const point = forcedPosition || getSpawnPoint();

    player.spawn(new mp.Vector3(point.x, point.y, point.z));
    player.position = new mp.Vector3(point.x, point.y, point.z);
    if (point.heading != null) {
      player.heading = point.heading;
    }
    logger.info('Player spawned', { player: player.name, position: point });
  };

  const handleRespawn = (player) => {
    setTimeout(() => {
      spawnPlayer(player);
      player.health = 100;
      player.armour = 0;
    }, 5000);
  };

  return {
    spawnPlayer,
    handleRespawn
  };
};

module.exports = { buildFreeroamService };
