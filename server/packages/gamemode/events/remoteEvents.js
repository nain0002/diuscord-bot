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
  const distanceBetween = (a, b) => {
    if (!a || !b) return Infinity;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  mp.events.add('gameplay:requestData', async (player) => {
    try {
      const territoriesState = await services.territories.getTerritories();
      const blips = services.blips.getBlipPayload();
      const jobs = services.jobs.getDefinitions();
      const shops = services.shops.getDefinitions();
      const territories = (services.gameplay.territories || []).map((definition) => {
        const state = territoriesState.find((entry) => entry.code === definition.code) || {};
        return {
          ...definition,
          owner_player_id: state.owner_player_id || null,
          owner_name: state.owner_name || null,
          reward_cash: state.reward_cash != null ? Number(state.reward_cash) : definition.rewardCash,
          capture_time: state.capture_time != null ? Number(state.capture_time) : definition.captureTime,
          last_capture_at: state.last_capture_at || null
        };
      });
      send(player, 'gameplay:data', { blips, territories, jobs, shops });
    } catch (error) {
      logger.error('Failed to send gameplay data', { error: error.message });
      send(player, 'gameplay:data:error', { message: error.message });
    }
  });

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
      await services.inventory.getInventory(player);
      await repositories.activity.log({
        type: 'registration',
        actorId: account.id,
        payload: { username: account.username }
      });
      send(player, 'auth:register:success', { account });
      mp.events.call('gameplay:requestData', player);
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
      const items = await services.inventory.getInventory(player);
      await repositories.activity.log({
        type: 'login',
        actorId: account.id,
        payload: { username: account.username }
      });
      send(player, 'auth:login:success', { account, inventory: items });
      mp.events.call('gameplay:requestData', player);
    } catch (error) {
      send(player, 'auth:login:error', { message: error.message });
    }
  });

  mp.events.add('inventory:request', async (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'inventory:update', { items: [] });
      return;
    }
    try {
      const items = await services.inventory.getInventory(player);
      send(player, 'inventory:update', { items });
    } catch (error) {
      logger.error('Failed to load inventory', { error: error.message });
      send(player, 'inventory:update', { items: [] });
    }
  });

  mp.events.add('inventory:useItem', async (player, payload) => {
    const data = parsePayload(payload);
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'inventory:update', { items: [] });
      return;
    }
    if (!data || !data.itemId) {
      return;
    }
    try {
      const items = await services.inventory.updateQuantity({
        player,
        itemId: data.itemId,
        quantity: data.quantity || 0
      });
      await repositories.activity.log({
        type: 'inventory.use',
        actorId: account.id,
        payload: { itemId: data.itemId }
      });
      send(player, 'inventory:update', { items });
    } catch (error) {
      logger.error('Failed to use inventory item', { error: error.message });
      send(player, 'inventory:update', { items: [] });
    }
  });

  mp.events.add('chat:sendMessage', (player, payload) => {
    const data = parsePayload(payload);
    if (!data.message) return;
    services.chat
      .handlePlayerMessage(player, data.message)
      .catch((error) => logger.error('Failed to handle remote chat', { error: error.message }));
  });

  mp.events.add('territory:capture', async (player, payload) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'territory:capture:error', { message: 'LOGIN_REQUIRED' });
      return;
    }
    const data = parsePayload(payload);
    try {
      const definition = services.gameplay.territories?.find((territory) => territory.code === data.code);
      if (!definition) {
        send(player, 'territory:capture:error', { message: 'TERRITORY_NOT_FOUND' });
        return;
      }
      const distance = distanceBetween(player.position, definition.position);
      if (distance > definition.radius) {
        send(player, 'territory:capture:error', { message: 'NOT_IN_TERRITORY' });
        return;
      }
      const result = await services.territories.startCapture({
        territoryCode: data.code,
        player,
        account
      });
      if (result.error) {
        send(player, 'territory:capture:error', { message: result.error });
      } else {
        send(player, 'territory:capture:started', result);
      }
    } catch (error) {
      logger.error('Territory capture failed', { error: error.message });
      send(player, 'territory:capture:error', { message: error.message });
    }
  });

  mp.events.add('job:start', async (player, payload) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'job:error', { message: 'LOGIN_REQUIRED' });
      return;
    }
    const data = parsePayload(payload);
    try {
      const definition = services.jobs.getJobByCode(data.jobCode);
      if (!definition) {
        send(player, 'job:error', { message: 'JOB_NOT_FOUND' });
        return;
      }
      const distance = distanceBetween(player.position, definition.startPosition);
      if (distance > 5) {
        send(player, 'job:error', { message: 'MOVE_CLOSER_TO_JOB_START' });
        return;
      }
      const response = await services.jobs.assignJob({ player, account, jobCode: data.jobCode });
      if (response.error) {
        send(player, 'job:error', { message: response.error });
      } else {
        send(player, 'job:started', {
          job: response.job,
          definition: response.definition
        });
      }
    } catch (error) {
      logger.error('Failed to start job', { error: error.message });
      send(player, 'job:error', { message: error.message });
    }
  });

  mp.events.add('job:progress', async (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'job:error', { message: 'LOGIN_REQUIRED' });
      return;
    }
    try {
      const response = await services.jobs.completeStage({ player, account });
      if (response.error) {
        send(player, 'job:error', { message: response.error });
      } else if (response.completed) {
        send(player, 'job:completed', response);
      } else {
        send(player, 'job:progress', response);
      }
    } catch (error) {
      logger.error('Failed to progress job', { error: error.message });
      send(player, 'job:error', { message: error.message });
    }
  });

  mp.events.add('job:abandon', async (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      return;
    }
    await services.jobs.abandonJob({ account });
    send(player, 'job:abandoned', {});
  });

  mp.events.add('shop:purchase', async (player, payload) => {
    const account = services.state.getAccount(player);
    if (!account) {
      send(player, 'shop:purchase:error', { message: 'LOGIN_REQUIRED' });
      return;
    }
    const data = parsePayload(payload);
    try {
      const shop = services.shops.findShop(data.shopCode);
      if (!shop) {
        send(player, 'shop:purchase:error', { message: 'SHOP_NOT_FOUND' });
        return;
      }
      const distance = distanceBetween(player.position, shop.position);
      if (distance > 5) {
        send(player, 'shop:purchase:error', { message: 'MOVE_CLOSER_TO_SHOP' });
        return;
      }
      const result = await services.shops.purchaseItem({
        shopCode: data.shopCode,
        itemCode: data.itemCode,
        player,
        account
      });
      if (result.error) {
        send(player, 'shop:purchase:error', { message: result.error });
      } else {
        send(player, 'shop:purchase:success', result);
      }
    } catch (error) {
      logger.error('Shop purchase failed', { error: error.message });
      send(player, 'shop:purchase:error', { message: error.message });
    }
  });

  mp.events.add('shop:list', async (player, payload) => {
    const data = parsePayload(payload);
    const shop = services.shops.findShop(data.shopCode);
    if (!shop) {
      send(player, 'shop:purchase:error', { message: 'SHOP_NOT_FOUND' });
      return;
    }
    const distance = distanceBetween(player.position, shop.position);
    if (distance > 5) {
      send(player, 'shop:purchase:error', { message: 'MOVE_CLOSER_TO_SHOP' });
      return;
    }
    send(player, 'shop:list', { shop, items: shop.items });
  });
};

module.exports = { registerRemoteEvents };
