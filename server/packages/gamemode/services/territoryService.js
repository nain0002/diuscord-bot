const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const { getMp } = require('../utils/mp');
const logger = require('../utils/logger');

const buildTerritoryService = ({ config, repositories, services, eventBus }) => {
  const mp = getMp();
  const state = {
    definitions: config.territories || [],
    activeCaptures: new Map()
  };

  const syncDefinitions = async () => {
    await repositories.territories.syncDefinitions(state.definitions);
  };

  const getTerritories = async () => repositories.territories.getAll();

  const startCapture = async ({ territoryCode, player, account }) => {
    if (!territoryCode || !player) return { error: 'INVALID_TERRITORY' };

    if (state.activeCaptures.has(territoryCode)) {
      return { error: 'CAPTURE_IN_PROGRESS' };
    }

    const territory = await repositories.territories.getByCode(territoryCode);
    if (!territory) {
      return { error: 'TERRITORY_NOT_FOUND' };
    }

    const definition = state.definitions.find((def) => def.code === territoryCode);
    if (!definition) {
      return { error: 'TERRITORY_NOT_DEFINED' };
    }

    const playerPos = player.position;
    const distance = Math.sqrt(
      (playerPos.x - definition.position.x) ** 2 +
        (playerPos.y - definition.position.y) ** 2 +
        (playerPos.z - definition.position.z) ** 2
    );
    if (distance > definition.radius) {
      return { error: 'NOT_IN_TERRITORY' };
    }

    const captureId = nanoid();
    const duration = (definition.captureTime || 120) * 1000;

    logger.info('Territory capture started', {
      territory: territory.code,
      player: account?.username || player.name,
      duration
    });

    state.activeCaptures.set(territoryCode, {
      id: captureId,
      territory,
      definition,
      playerId: account?.id || null,
      playerName: account?.username || player.name,
      startedAt: Date.now()
    });

    const timeout = setTimeout(async () => {
      try {
        const updated = await repositories.territories.updateOwner({
          code: territoryCode,
          playerId: account?.id || null,
          playerName: account?.username || player.name
        });

        if (account) {
          const newCash = (account.cash || 0) + (definition.rewardCash || 0);
          await repositories.players.updateFinancials(account.id, {
            cash: newCash,
            bank: account.bank || 0
          });
          services.state.updateAccount(player, { ...account, cash: newCash });
        }

        mp.players.broadcast(
          `!{#FFA500}[TERRITORY] ${updated.name} taken by ${account?.username || player.name}!`
        );

        if (eventBus) {
          eventBus.emit('territory:capture', { territory: updated, player: account });
        }

        mp.players.forEach((plr) => {
          plr.call('territory:capture', [JSON.stringify({ territory: updated })]);
        });
      } catch (error) {
        logger.error('Failed to finalize territory capture', { error: error.message });
      } finally {
        state.activeCaptures.delete(territoryCode);
      }
    }, duration);

    state.activeCaptures.get(territoryCode).timeout = timeout;

    if (eventBus) {
      eventBus.emit('territory:capture:start', {
        territoryCode,
        player: account,
        duration,
        captureId
      });
    }

    return { success: true, captureId, duration };
  };

  const cancelCapture = (territoryCode) => {
    const capture = state.activeCaptures.get(territoryCode);
    if (!capture) return false;
    clearTimeout(capture.timeout);
    state.activeCaptures.delete(territoryCode);
    if (eventBus) {
      eventBus.emit('territory:capture:cancelled', { territoryCode });
    }
    return true;
  };

  const cancelCapturesByPlayer = (playerId) => {
    if (!playerId) return;
    Array.from(state.activeCaptures.entries()).forEach(([code, capture]) => {
      if (capture.playerId === playerId) {
        cancelCapture(code);
      }
    });
  };

  return {
    syncDefinitions,
    getTerritories,
    startCapture,
    cancelCapture,
    cancelCapturesByPlayer
  };
};

module.exports = { buildTerritoryService };
