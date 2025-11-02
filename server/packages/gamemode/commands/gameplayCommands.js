const { getMp } = require('../utils/mp');

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

const registerGameplayCommands = ({ services }) => {
  const mp = getMp();

  mp.events.addCommand('jobs', (player) => {
    const jobs = services.jobs.getDefinitions();
    if (!jobs.length) {
      player.outputChatBox('!{#cccccc}No jobs available right now.');
      return;
    }
    player.outputChatBox('!{#4dd0e1}Available Jobs:');
    jobs.forEach((job) => {
      player.outputChatBox(` - !{#ffffff}${job.code}!{#cccccc}: ${job.name} (${job.description})`);
    });
    player.outputChatBox('Use !{#4dd0e1}/jobstart [code]!{#cccccc} near the job blip to accept.');
  });

  mp.events.addCommand('jobstart', (player, fullText) => {
    const account = services.state.getAccount(player);
    if (!account) {
      player.outputChatBox('!{#ff4444}You must be logged in.');
      return;
    }
    const jobCode = fullText.trim();
    if (!jobCode) {
      player.outputChatBox('!{#ffcc00}Usage: /jobstart [jobCode]');
      return;
    }
    services.jobs
      .assignJob({ player, account, jobCode })
      .then((response) => {
        if (response.error) {
          player.outputChatBox(`!{#ff4444}${response.error}`);
        } else {
          player.call('job:started', [JSON.stringify(response)]);
        }
      })
      .catch((error) => player.outputChatBox(`!{#ff4444}${error.message}`));
  });

  mp.events.addCommand('jobstop', (player) => {
    const account = services.state.getAccount(player);
    if (!account) {
      player.outputChatBox('!{#ff4444}You must be logged in.');
      return;
    }
    services.jobs
      .abandonJob({ account })
      .then(() => player.outputChatBox('!{#ffcc00}You abandoned your active job.'));
  });

  mp.events.addCommand('shops', (player) => {
    const shops = services.shops.getDefinitions();
    if (!shops.length) {
      player.outputChatBox('!{#cccccc}No shops defined.');
      return;
    }
    player.outputChatBox('!{#81c784}Shops around the map:');
    shops.forEach((shop) => {
      player.outputChatBox(` - !{#ffffff}${shop.name}!{#cccccc} (${shop.code})`);
      shop.items.forEach((item) => {
        player.outputChatBox(
          `   * ${item.label} - ${formatCurrency(item.price)} (code: ${item.code})`
        );
      });
    });
    player.outputChatBox('Use !{#81c784}/buy [shopCode] [itemCode]!{#cccccc} near the shop marker.');
  });

  mp.events.addCommand('buy', (player, fullText) => {
    const account = services.state.getAccount(player);
    if (!account) {
      player.outputChatBox('!{#ff4444}You must be logged in.');
      return;
    }
    const [shopCode, itemCode] = fullText.trim().split(/\s+/);
    if (!shopCode || !itemCode) {
      player.outputChatBox('!{#ffcc00}Usage: /buy [shopCode] [itemCode]');
      return;
    }
    const shop = services.shops.findShop(shopCode);
    if (!shop) {
      player.outputChatBox('!{#ff4444}Shop not found.');
      return;
    }
    services.shops
      .purchaseItem({ shopCode, itemCode, player, account })
      .then((result) => {
        if (result.error) {
          player.outputChatBox(`!{#ff4444}${result.error}`);
        } else {
          player.outputChatBox(
            `!{#44ff44}Purchased ${result.item.label} for ${formatCurrency(result.item.price)}.`
          );
        }
      })
      .catch((error) => player.outputChatBox(`!{#ff4444}${error.message}`));
  });

  mp.events.addCommand('territories', async (player) => {
    const territories = await services.territories.getTerritories();
    if (!territories.length) {
      player.outputChatBox('!{#cccccc}No territories configured.');
      return;
    }
    player.outputChatBox('!{#fbc02d}Territories:');
    territories.forEach((territory) => {
      player.outputChatBox(
        ` - !{#ffffff}${territory.name}!{#cccccc} (${territory.code}) owner: ${territory.owner_name || 'None'} reward: ${formatCurrency(territory.reward_cash)}`
      );
    });
    player.outputChatBox('Capture by pressing !{#fbc02d}E!{#cccccc} inside the zone.');
  });
};

module.exports = { registerGameplayCommands };
