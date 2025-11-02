const logger = require('../utils/logger');

const buildInventoryService = ({ repositories, state, eventBus }) => {
  const ensureInventory = async (playerId) => {
    let inventory = await repositories.inventories.getByPlayerId(playerId);
    if (!inventory) {
      inventory = await repositories.inventories.createForPlayer(playerId);
    }
    return inventory;
  };

  const getInventory = async (player) => {
    const account = state.getAccount(player);
    if (!account) return [];
    const inventory = await ensureInventory(account.id);
    const items = await repositories.inventories.listItems(inventory.id);
    state.setInventory(player, items);
    return items;
  };

  const canAddItem = (inventoryRecord, stackable, items, itemCode) => {
    if (stackable) {
      const existing = items.find((item) => item.item_code === itemCode && item.stackable);
      if (existing) {
        return true;
      }
    }
    return items.length < inventoryRecord.capacity;
  };

  const addItem = async ({ player, itemCode, label, quantity = 1, stackable = true, metadata }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = await ensureInventory(account.id);
    const items = await repositories.inventories.listItems(inventory.id);
    if (!canAddItem(inventory, stackable, items, itemCode)) {
      throw new Error('INVENTORY_FULL');
    }
    const item = await repositories.inventories.addItem({
      inventoryId: inventory.id,
      itemCode,
      label,
      quantity,
      stackable,
      metadata
    });
    logger.info('Item added to inventory', { player: account.username, itemCode });
    const updatedItems = await repositories.inventories.listItems(inventory.id);
    state.setInventory(player, updatedItems);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId: account.id, items: updatedItems });
    }
    return item;
  };

  const addItemByPlayerId = async ({ playerId, itemCode, label, quantity = 1, stackable = true, metadata }) => {
    const inventory = await ensureInventory(playerId);
    const items = await repositories.inventories.listItems(inventory.id);
    if (!canAddItem(inventory, stackable, items, itemCode)) {
      throw new Error('INVENTORY_FULL');
    }
    const item = await repositories.inventories.addItem({
      inventoryId: inventory.id,
      itemCode,
      label,
      quantity,
      stackable,
      metadata
    });
    const updatedItems = await repositories.inventories.listItems(inventory.id);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId, items: updatedItems });
    }
    return item;
  };

  const getInventoryByPlayerId = async (playerId) => {
    const inventory = await ensureInventory(playerId);
    const items = await repositories.inventories.listItems(inventory.id);
    return items;
  };

  const removeItem = async ({ player, itemId }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = await ensureInventory(account.id);
    await repositories.inventories.removeItem(itemId);
    const items = await repositories.inventories.listItems(inventory.id);
    state.setInventory(player, items);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId: account.id, items });
    }
    return items;
  };

  const updateQuantity = async ({ player, itemId, quantity }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = await ensureInventory(account.id);
    if (quantity <= 0) {
      await repositories.inventories.removeItem(itemId);
    } else {
      await repositories.inventories.updateItemQuantity(itemId, quantity);
    }
    const items = await repositories.inventories.listItems(inventory.id);
    state.setInventory(player, items);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId: account.id, items });
    }
    return items;
  };

  return {
    getInventory,
    addItem,
    removeItem,
    updateQuantity,
    addItemByPlayerId,
    getInventoryByPlayerId
  };
};

module.exports = { buildInventoryService };
