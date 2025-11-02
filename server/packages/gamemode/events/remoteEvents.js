const { getMp } = require('../utils/mp');
const logger = require('../utils/logger');

const parsePayload = (input) => {
  if (!input) return {};
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch (error) {
      logger.error('Failed to parse payload', { input, error: error.message });
      return {};
    }
  }
  return input;
};

const send = (player, eventName, payload) => {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  player.call(eventName, [data]);
};

const registerRemoteEvents = ({ services, repositories }) => {
  const mp = getMp();

  mp.events.add('auth:register', async (player, payload) => {
    const data = parsePayload(payload);
    try {
      const account = await services.auth.register({
        username: data.username,
        password: data.password,
        email: data.email,
        socialClub: player.socialClubName
      });
      services.state.attach(player, account);
      services.inventory.getInventory(player);
      repositories.activity.log({
        type: 'registration',
        actorId: account.id,
        payload: { username: account.username }
      });
      send(player, 'auth:register:success', { account });
    } catch (error) {
      send(player, 'auth:register:error', { message: error.message });
    }
  });

  mp.events.add('auth:login', async (player, payload) => {
    const data = parsePayload(payload);
    try {
      const account = await services.auth.login({
        username: data.username,
        password: data.password
      });
      services.state.attach(player, account);
      const items = services.inventory.getInventory(player);
      repositories.activity.log({
        type: 'login',
        actorId: account.id,
        payload: { username: account.username }
      });
      send(player, 'auth:login:success', { account, inventory: items });
    } catch (error) {
      send(player, 'auth:login:error', { message: error.message });
    }
  });

  mp.events.add('inventory:request', (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'inventory:update', { items: [] });
      return;
    }
    const items = services.inventory.getInventory(player);
    send(player, 'inventory:update', { items });
  });

  mp.events.add('inventory:useItem', (player, payload) => {
    const data = parsePayload(payload);
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'inventory:update', { items: [] });
      return;
    }
    if (!data || !data.itemId) {
      return;
    }
    const items = services.inventory.updateQuantity({ player, itemId: data.itemId, quantity: data.quantity || 0 });
    repositories.activity.log({
      type: 'inventory.use',
      actorId: account.id,
      payload: { itemId: data.itemId }
    });
    send(player, 'inventory:update', { items });
  });

  mp.events.add('chat:sendMessage', (player, payload) => {
    const data = parsePayload(payload);
    if (!data.message) return;
    services.chat.handlePlayerMessage(player, data.message);
  });
};

module.exports = { registerRemoteEvents };
