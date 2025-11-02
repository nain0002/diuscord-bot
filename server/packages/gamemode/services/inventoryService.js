const logger = require('../utils/logger');

const buildInventoryService = ({ repositories, state, eventBus }) => {
  const ensureInventory = (playerId) => {
    let inventory = repositories.inventories.getByPlayerId(playerId);
    if (!inventory) {
      inventory = repositories.inventories.createForPlayer(playerId);
    }
    return inventory;
  };

  const getInventory = (player) => {
    const account = state.getAccount(player);
    if (!account) return [];
    const inventory = ensureInventory(account.id);
    const items = repositories.inventories.listItems(inventory.id);
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

  const addItem = ({ player, itemCode, label, quantity = 1, stackable = true, metadata }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = ensureInventory(account.id);
    const items = repositories.inventories.listItems(inventory.id);
    if (!canAddItem(inventory, stackable, items, itemCode)) {
      throw new Error('INVENTORY_FULL');
    }
    const item = repositories.inventories.addItem({
      inventoryId: inventory.id,
      itemCode,
      label,
      quantity,
      stackable,
      metadata
    });
    logger.info('Item added to inventory', { player: account.username, itemCode });
    const updatedItems = repositories.inventories.listItems(inventory.id);
    state.setInventory(player, updatedItems);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId: account.id, items: updatedItems });
    }
    return item;
  };

  const addItemByPlayerId = ({ playerId, itemCode, label, quantity = 1, stackable = true, metadata }) => {
    const inventory = ensureInventory(playerId);
    const items = repositories.inventories.listItems(inventory.id);
    if (!canAddItem(inventory, stackable, items, itemCode)) {
      throw new Error('INVENTORY_FULL');
    }
    const item = repositories.inventories.addItem({
      inventoryId: inventory.id,
      itemCode,
      label,
      quantity,
      stackable,
      metadata
    });
    const updatedItems = repositories.inventories.listItems(inventory.id);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId, items: updatedItems });
    }
    return item;
  };

  const getInventoryByPlayerId = (playerId) => {
    const inventory = ensureInventory(playerId);
    return repositories.inventories.listItems(inventory.id);
  };

  const removeItem = ({ player, itemId }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = ensureInventory(account.id);
    repositories.inventories.removeItem(itemId);
    const items = repositories.inventories.listItems(inventory.id);
    state.setInventory(player, items);
    if (eventBus) {
      eventBus.emit('inventory:update', { playerId: account.id, items });
    }
    return items;
  };

  const updateQuantity = ({ player, itemId, quantity }) => {
    const account = state.getAccount(player);
    if (!account) {
      throw new Error('PLAYER_NOT_AUTHENTICATED');
    }
    const inventory = ensureInventory(account.id);
    if (quantity <= 0) {
      repositories.inventories.removeItem(itemId);
    } else {
      repositories.inventories.updateItemQuantity(itemId, quantity);
    }
    const items = repositories.inventories.listItems(inventory.id);
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
