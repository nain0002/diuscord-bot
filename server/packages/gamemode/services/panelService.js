const crypto = require('crypto');
const { sanitizePlayer } = require('./authService');
const logger = require('../utils/logger');

const buildPanelService = ({ repositories, services, config, eventBus }) => {
  const createToken = () => crypto.randomBytes(24).toString('hex');
  const sessionDuration = (config && config.adminPanel && config.adminPanel.sessionDurationMs)
    || 1000 * 60 * 60 * 24;

  const login = async ({ username, password }) => {
    const player = await repositories.players.getByUsername(username);
    if (!player || player.role !== 'admin') {
      throw new Error('UNAUTHORIZED');
    }

    const authResult = await services.auth.login({ username, password });
    await repositories.panel.purgeExpired();
    const token = createToken();
    const expiresAt = new Date(Date.now() + sessionDuration).toISOString();
    await repositories.panel.createSession({ playerId: player.id, token, expiresAt });
    logger.info('Admin panel login', { username });
    if (eventBus) {
      eventBus.emit('panel:login', { username });
    }
    return { token, user: authResult };
  };

  const verifyToken = async (token) => {
    if (!token) return null;
    const session = await repositories.panel.getByToken(token);
    if (!session) return null;
    if (new Date(session.expires_at) <= new Date()) {
      await repositories.panel.deleteByToken(token);
      return null;
    }
    const player = await repositories.players.getById(session.player_id);
    if (!player || player.role !== 'admin') {
      return null;
    }
    return sanitizePlayer(player);
  };

  const logout = async (token) => {
    if (token) {
      await repositories.panel.deleteByToken(token);
      if (eventBus) {
        eventBus.emit('panel:logout', { token });
      }
    }
  };

  const getDashboardData = async () => {
    const players = await services.auth.getAllPlayers();
    const recentChat = await services.chat.getRecent(20);
    const activity = await repositories.activity.list(50);
    return {
      players,
      recentChat,
      activity
    };
  };

  const listPlayers = () => services.auth.getAllPlayers();

  return {
    login,
    verifyToken,
    logout,
    getDashboardData,
    listPlayers
  };
};

module.exports = { buildPanelService };
