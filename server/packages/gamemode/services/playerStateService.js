const buildPlayerStateService = () => {
  const players = new Map();

  const attach = (player, account) => {
    const state = {
      account,
      inventory: [],
      data: {}
    };
    players.set(player.id, state);
    return state;
  };

  const detach = (player) => {
    players.delete(player.id);
  };

  const setInventory = (player, items) => {
    const state = players.get(player.id);
    if (state) {
      state.inventory = items;
    }
  };

  const getInventory = (player) => {
    const state = players.get(player.id);
    return state ? state.inventory : [];
  };

  const getAccount = (player) => {
    const state = players.get(player.id);
    return state ? state.account : null;
  };

  const updateAccount = (player, account) => {
    const state = players.get(player.id);
    if (state) {
      state.account = { ...state.account, ...account };
      return state.account;
    }
    return null;
  };

  const getState = (player) => players.get(player.id);

  const updateData = (player, patch) => {
    const state = players.get(player.id);
    if (state) {
      state.data = { ...state.data, ...patch };
      return state.data;
    }
    return null;
  };

  return {
    attach,
    detach,
    setInventory,
    getInventory,
    getAccount,
    updateAccount,
    getState,
    updateData
  };
};

module.exports = { buildPlayerStateService };
