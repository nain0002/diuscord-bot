const logger = require('../utils/logger');

const buildShopService = ({ config, repositories, services }) => {
  const definitions = config.shops || [];

  const getDefinitions = () => definitions;

  const findShop = (code) => definitions.find((shop) => shop.code === code);

  const getShopByPosition = (position, threshold = 3) => {
    if (!position) return null;
    return definitions.find((shop) => {
      const dx = shop.position.x - position.x;
      const dy = shop.position.y - position.y;
      const dz = shop.position.z - position.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) <= threshold;
    });
  };

  const purchaseItem = async ({ shopCode, itemCode, player, account }) => {
    const shop = findShop(shopCode);
    if (!shop) {
      return { error: 'SHOP_NOT_FOUND' };
    }
    const item = shop.items.find((entry) => entry.code === itemCode);
    if (!item) {
      return { error: 'ITEM_NOT_FOUND' };
    }

    const playerPos = player.position;
    const distance = Math.sqrt(
      (playerPos.x - shop.position.x) ** 2 +
        (playerPos.y - shop.position.y) ** 2 +
        (playerPos.z - shop.position.z) ** 2
    );
    if (distance > 5) {
      return { error: 'MOVE_CLOSER_TO_SHOP' };
    }

    if ((account.cash || 0) < item.price) {
      return { error: 'INSUFFICIENT_FUNDS' };
    }

    const newCash = (account.cash || 0) - item.price;
    await repositories.players.updateFinancials(account.id, {
      cash: newCash,
      bank: account.bank || 0
    });

    services.state.updateAccount(player, { ...account, cash: newCash });

    await repositories.shops.logPurchase({
      playerId: account.id,
      shopCode,
      itemCode,
      itemLabel: item.label,
      quantity: item.quantity || 1,
      price: item.price
    });

    await services.inventory.addItemByPlayerId({
      playerId: account.id,
      itemCode: item.code,
      label: item.label,
      quantity: item.quantity || 1,
      stackable: item.stackable !== false,
      metadata: item.metadata || null
    });

    logger.info('Shop purchase complete', { player: account.username, shop: shopCode, item: itemCode });

    return { success: true, item, shop };
  };

  return {
    getDefinitions,
    findShop,
    getShopByPosition,
    purchaseItem
  };
};

module.exports = { buildShopService };
