const { registerAuthCommands } = require('./playerCommands');
const { registerInventoryCommands } = require('./inventoryCommands');
const { registerGameplayCommands } = require('./gameplayCommands');

const registerCommands = (context) => {
  registerAuthCommands(context);
  registerInventoryCommands(context);
  registerGameplayCommands(context);
};

module.exports = { registerCommands };
