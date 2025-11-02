const { registerPlayerEvents } = require('./playerEvents');
const { registerRemoteEvents } = require('./remoteEvents');

const registerEvents = (context) => {
  registerPlayerEvents(context);
  registerRemoteEvents(context);
};

module.exports = { registerEvents };
