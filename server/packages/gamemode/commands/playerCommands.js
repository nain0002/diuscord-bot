const { getMp } = require('../utils/mp');

const registerAuthCommands = ({ services }) => {
  const mp = getMp();

  mp.events.addCommand('register', async (player, fullText) => {
    try {
      const [username, password] = fullText.trim().split(/\s+/);
      if (!username || !password) {
        player.outputChatBox('!{#ff4444}Usage: /register [username] [password]');
        return;
      }
      const account = await services.auth.register({ username, password, socialClub: player.socialClubName });
      services.state.attach(player, account);
      services.chat.broadcast(`${username} joined the city for the first time!`, { prefix: '!{#44ff44}[SYSTEM]' });
      player.outputChatBox('!{#44ff44}Registration successful. Please use /login to continue.');
    } catch (error) {
      if (error.message === 'USERNAME_TAKEN') {
        player.outputChatBox('!{#ff4444}Username already taken. Choose another.');
        return;
      }
      player.outputChatBox(`!{#ff4444}Registration failed: ${error.message}`);
    }
  });

  mp.events.addCommand('login', async (player, fullText) => {
    try {
      const [username, password] = fullText.trim().split(/\s+/);
      if (!username || !password) {
        player.outputChatBox('!{#ff4444}Usage: /login [username] [password]');
        return;
      }
      const account = await services.auth.login({ username, password });
      services.state.attach(player, account);
      await services.inventory.getInventory(player);
      player.outputChatBox(`!{#44ff44}Welcome back ${account.username}!`);
    } catch (error) {
      player.outputChatBox(`!{#ff4444}Login failed: ${error.message}`);
    }
  });
};

module.exports = { registerAuthCommands };
