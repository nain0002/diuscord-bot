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
    const existing = repositories.players.getByUsername(username);
    if (existing) {
      throw new Error('USERNAME_TAKEN');
    }

    const passwordHash = await hashPassword(password);
    const player = repositories.players.create({
      username,
      passwordHash,
      email,
      socialClub,
      role: 'player'
    });
    repositories.inventories.createForPlayer(player.id);
    logger.info('New player registered', { username });
    return sanitizePlayer(player);
  };

  const login = async ({ username, password }) => {
    const player = repositories.players.getByUsername(username);
    if (!player) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const isValid = await verifyPassword(password, player.password_hash);
    if (!isValid) {
      throw new Error('INVALID_PASSWORD');
    }

    repositories.players.updateLastLogin(player.id);

    const inventory = repositories.inventories.getByPlayerId(player.id);
    if (!inventory) {
      repositories.inventories.createForPlayer(player.id);
    }

    logger.info('Player logged in', { username });
    return sanitizePlayer({ ...player, last_login: new Date().toISOString() });
  };

  const getAllPlayers = () => repositories.players.getAll().map(sanitizePlayer);

  return {
    register,
    login,
    getAllPlayers,
    sanitizePlayer
  };
};

module.exports = { buildAuthService, sanitizePlayer };
