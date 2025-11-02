let cachedMp = null;

const buildMockMp = () => {
  const players = new Map();
  return {
    Vector3: function Vector3(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
    players: {
      broadcast: (message) => {
        // eslint-disable-next-line no-console
        console.log(`[MOCK BROADCAST] ${message}`);
      },
      forEach: (callback) => {
        Array.from(players.values()).forEach(callback);
      },
      at: (id) => players.get(id),
      addMockPlayer: (player) => {
        players.set(player.id, player);
      }
    },
    events: {
      add: () => {},
      addCommand: () => {},
      callRemote: () => {}
    }
  };
};

const getMp = () => {
  if (cachedMp) return cachedMp;
  if (typeof mp !== 'undefined') {
    cachedMp = mp;
    return cachedMp;
  }
  if (process.env.MP_MOCK === 'true') {
    cachedMp = buildMockMp();
    return cachedMp;
  }
  throw new Error('mp global is not available. Set MP_MOCK=true to use mock implementation.');
};

module.exports = { getMp };
