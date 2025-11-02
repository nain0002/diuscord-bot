const { getMp } = require('../utils/mp');

const registerInventoryCommands = ({ services }) => {
  const mp = getMp();

  mp.events.addCommand('inv', (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      player.outputChatBox('!{#ff4444}You must be logged in to view your inventory.');
      return;
    }
    const items = services.inventory.getInventory(player);
    if (!items || items.length === 0) {
      player.outputChatBox('!{#cccccc}Your inventory is empty.');
      return;
    }
    player.outputChatBox('!{#44ff44}Inventory:');
    items.forEach((item) => {
      player.outputChatBox(` - ${item.label} x${item.quantity}`);
    });
  });

  mp.events.addCommand('giveitem', (player, fullText) => {
    const account = services.state.getAccount(player);
    if (!account || account.role !== 'admin') {
      player.outputChatBox('!{#ff4444}You do not have permission to use this command.');
      return;
    }

    const [targetId, itemCode, quantityText] = fullText.trim().split(/\s+/);
    if (!targetId || !itemCode) {
      player.outputChatBox('!{#ff4444}Usage: /giveitem [playerId] [itemCode] [quantity?]');
      return;
    }
    const quantity = quantityText ? Number(quantityText) : 1;
    const targetIndex = Number(targetId);
    if (Number.isNaN(targetIndex)) {
      player.outputChatBox('!{#ff4444}Invalid player id.');
      return;
    }
    const target = mp.players.at(targetIndex);
    if (!target) {
      player.outputChatBox('!{#ff4444}Target player not found.');
      return;
    }
    try {
      const item = services.inventory.addItem({
        player: target,
        itemCode,
        label: itemCode,
        quantity,
        stackable: true
      });
      target.outputChatBox(`!{#44ff44}You received ${item.label} x${item.quantity}.`);
      player.outputChatBox('!{#44ff44}Item granted.');
    } catch (error) {
      player.outputChatBox(`!{#ff4444}Failed: ${error.message}`);
    }
  });
};

module.exports = { registerInventoryCommands };
