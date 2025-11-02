const { registerAuthCommands } = require('./playerCommands');
const { registerInventoryCommands } = require('./inventoryCommands');

const registerCommands = (context) => {
  registerAuthCommands(context);
  registerInventoryCommands(context);
};

module.exports = { registerCommands };
