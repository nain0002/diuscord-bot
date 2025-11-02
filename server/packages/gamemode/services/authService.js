const { hashPassword, verifyPassword } = require('../utils/password');
const logger = require('../utils/logger');

const sanitizePlayer = (player) => {
  if (!player) return null;
  const {
    password_hash: _passwordHash,
    social_club: socialClub,
    last_position: lastPosition,
    ...rest
  } = player;
  return {
    ...rest,
    socialClub,
    lastPosition: lastPosition ? JSON.parse(lastPosition) : null
  };
};

const buildAuthService = ({ repositories }) => {
  const register = async ({ username, password, email, socialClub }) => {
    const existing = await repositories.players.getByUsername(username);
    if (existing) {
      throw new Error('USERNAME_TAKEN');
    }

    const passwordHash = await hashPassword(password);
    const player = await repositories.players.create({
      username,
      passwordHash,
      email,
      socialClub,
      role: 'player'
    });
    await repositories.inventories.createForPlayer(player.id);
    logger.info('New player registered', { username });
    return sanitizePlayer(player);
  };

  const login = async ({ username, password }) => {
    const player = await repositories.players.getByUsername(username);
    if (!player) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const isValid = await verifyPassword(password, player.password_hash);
    if (!isValid) {
      throw new Error('INVALID_PASSWORD');
    }

    await repositories.players.updateLastLogin(player.id);

    const inventory = await repositories.inventories.getByPlayerId(player.id);
    if (!inventory) {
      await repositories.inventories.createForPlayer(player.id);
    }

    logger.info('Player logged in', { username });
    return sanitizePlayer({ ...player, last_login: new Date().toISOString() });
  };

  const getAllPlayers = async () => {
    const players = await repositories.players.getAll();
    return players.map(sanitizePlayer);
  };

  return {
    register,
    login,
    getAllPlayers,
    sanitizePlayer
  };
};

module.exports = { buildAuthService, sanitizePlayer };
