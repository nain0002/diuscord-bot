// Server Commands
const banking = require('../modules/banking/banking');
const shops = require('../modules/shops/shops');
const jobs = require('../modules/jobs/jobs');
const characterManager = require('../modules/character/character');
const helpers = require('../utils/helpers');

// Money command
mp.events.addCommand('balance', async (player) => {
    if (!player.characterId) {
        helpers.sendError(player, 'You must have a character loaded');
        return;
    }
    
    player.outputChatBox(`Cash: ${helpers.formatCurrency(player.characterData.money)}`);
    player.outputChatBox(`Bank: ${helpers.formatCurrency(player.characterData.bank_balance)}`);
});

// ATM commands
mp.events.addCommand('deposit', async (player, amount) => {
    if (!amount || isNaN(amount)) {
        helpers.sendError(player, 'Usage: /deposit [amount]');
        return;
    }
    
    const result = await banking.deposit(player, parseInt(amount));
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

mp.events.addCommand('withdraw', async (player, amount) => {
    if (!amount || isNaN(amount)) {
        helpers.sendError(player, 'Usage: /withdraw [amount]');
        return;
    }
    
    const result = await banking.withdraw(player, parseInt(amount));
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

mp.events.addCommand('transfer', async (player, targetId, amount) => {
    if (!targetId || !amount || isNaN(targetId) || isNaN(amount)) {
        helpers.sendError(player, 'Usage: /transfer [character_id] [amount]');
        return;
    }
    
    const result = await banking.transfer(player, parseInt(targetId), parseInt(amount));
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

// Inventory command
mp.events.addCommand('inventory', async (player) => {
    if (!player.characterId) {
        helpers.sendError(player, 'You must have a character loaded');
        return;
    }
    
    const inventory = await shops.getInventory(player.characterId);
    
    if (inventory.length === 0) {
        helpers.sendNotification(player, 'Your inventory is empty', 'info');
    } else {
        player.call('client:showInventory', [JSON.stringify(inventory)]);
    }
});

// Job commands
mp.events.addCommand('job', (player) => {
    if (!player.characterId) {
        helpers.sendError(player, 'You must have a character loaded');
        return;
    }
    
    player.outputChatBox(`Current Job: ${player.characterData.job}`);
    player.outputChatBox(`Job Rank: ${player.characterData.job_rank}`);
});

mp.events.addCommand('quitjob', async (player) => {
    const result = await jobs.quitJob(player);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

mp.events.addCommand('startwork', async (player) => {
    const result = await jobs.startJob(player);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

mp.events.addCommand('mine', async (player) => {
    if (!jobs.activeJobs.has(player.id)) {
        helpers.sendError(player, 'You are not working');
        return;
    }
    
    const jobData = jobs.activeJobs.get(player.id);
    
    if (jobData.type !== 'mining') {
        helpers.sendError(player, 'You are not a miner');
        return;
    }
    
    jobData.ores++;
    helpers.sendNotification(player, `Mined ore (${jobData.ores}/${jobData.maxOres})`, 'success');
    
    if (jobData.ores >= jobData.maxOres) {
        const payment = jobData.maxOres * jobData.payment;
        jobData.payment = payment;
        await jobs.completeJob(player);
    }
});

mp.events.addCommand('fish', async (player) => {
    if (!jobs.activeJobs.has(player.id)) {
        helpers.sendError(player, 'You are not working');
        return;
    }
    
    const jobData = jobs.activeJobs.get(player.id);
    
    if (jobData.type !== 'fishing') {
        helpers.sendError(player, 'You are not a fisher');
        return;
    }
    
    jobData.fish++;
    helpers.sendNotification(player, `Caught fish (${jobData.fish}/${jobData.maxFish})`, 'success');
    
    if (jobData.fish >= jobData.maxFish) {
        const payment = jobData.maxFish * jobData.payment;
        jobData.payment = payment;
        await jobs.completeJob(player);
    }
});

// Give money (admin)
mp.events.addCommand('givemoney', async (player, targetIdOrName, amount) => {
    if (player.characterData && player.characterData.admin_level < 1) {
        helpers.sendError(player, 'Insufficient permissions');
        return;
    }
    
    if (!targetIdOrName || !amount || isNaN(amount)) {
        helpers.sendError(player, 'Usage: /givemoney [player_id/name] [amount]');
        return;
    }
    
    const target = mp.players.at(parseInt(targetIdOrName));
    
    if (!target || !target.characterId) {
        helpers.sendError(player, 'Player not found');
        return;
    }
    
    await characterManager.updateMoney(target.characterId, parseInt(amount));
    target.characterData.money += parseInt(amount);
    
    helpers.sendSuccess(player, `Gave ${helpers.formatCurrency(amount)} to ${target.name}`);
    helpers.sendSuccess(target, `Admin gave you ${helpers.formatCurrency(amount)}`);
});

// Teleport (admin)
mp.events.addCommand('tp', (player, x, y, z) => {
    if (player.characterData && player.characterData.admin_level < 1) {
        helpers.sendError(player, 'Insufficient permissions');
        return;
    }
    
    if (!x || !y || !z || isNaN(x) || isNaN(y) || isNaN(z)) {
        helpers.sendError(player, 'Usage: /tp [x] [y] [z]');
        return;
    }
    
    player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    helpers.sendSuccess(player, 'Teleported!');
});

// Heal
mp.events.addCommand('heal', (player, targetId) => {
    if (player.characterData && player.characterData.job !== 'Paramedic') {
        helpers.sendError(player, 'You must be a paramedic');
        return;
    }
    
    if (!targetId) {
        helpers.sendError(player, 'Usage: /heal [player_id]');
        return;
    }
    
    const target = mp.players.at(parseInt(targetId));
    
    if (!target) {
        helpers.sendError(player, 'Player not found');
        return;
    }
    
    if (helpers.getDistance(player.position, target.position) > 5) {
        helpers.sendError(player, 'Player is too far away');
        return;
    }
    
    target.health = 100;
    helpers.sendSuccess(player, `Healed ${target.name}`);
    helpers.sendSuccess(target, `${player.name} healed you`);
});

// Repair vehicle
mp.events.addCommand('repair', (player) => {
    if (player.characterData && player.characterData.job !== 'Mechanic') {
        helpers.sendError(player, 'You must be a mechanic');
        return;
    }
    
    if (!player.vehicle) {
        helpers.sendError(player, 'You must be in a vehicle');
        return;
    }
    
    player.vehicle.repair();
    helpers.sendSuccess(player, 'Vehicle repaired!');
});

// Help command
mp.events.addCommand('help', (player) => {
    player.outputChatBox('=== COMMANDS ===');
    player.outputChatBox('/balance - Check your money');
    player.outputChatBox('/deposit [amount] - Deposit money to bank');
    player.outputChatBox('/withdraw [amount] - Withdraw money from bank');
    player.outputChatBox('/inventory - Open inventory');
    player.outputChatBox('/job - Check your job');
    player.outputChatBox('/quitjob - Quit your job');
    player.outputChatBox('/startwork - Start working');
    player.outputChatBox('/help - Show this help menu');
});

console.log('[Commands] Commands loaded');
