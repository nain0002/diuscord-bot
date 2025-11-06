/**
 * Admin Module
 * Administrative commands and functions
 */

const database = require('./database');
const playerModule = require('./player');

// Admin levels
const ADMIN_LEVELS = {
    NONE: 0,
    MODERATOR: 1,
    ADMIN: 2,
    HEAD_ADMIN: 3,
    OWNER: 4
};

// Check if player is admin (you can modify this to use database)
function isAdmin(player, minLevel = 1) {
    // TODO: Implement proper admin system with database
    // For now, all players with "Admin" in name are admins
    return player.name.includes('Admin');
}

// Give money command
mp.events.addCommand('givemoney', (player, fullText, targetName, amount) => {
    if (!isAdmin(player, ADMIN_LEVELS.ADMIN)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!targetName || !amount) {
        player.outputChatBox('!{#FFFF00}Usage: /givemoney [name] [amount]');
        return;
    }

    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        player.outputChatBox('!{#FF0000}Invalid amount!');
        return;
    }

    const target = mp.players.toArray().find(p => p.name === targetName);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    playerModule.giveMoney(target, amount);
    player.outputChatBox(`!{#00FF00}You gave $${amount.toLocaleString()} to ${targetName}`);
    target.outputChatBox(`!{#00FF00}Admin gave you $${amount.toLocaleString()}`);

    console.log(`[Admin] ${player.name} gave $${amount} to ${targetName}`);
});

// Set money command
mp.events.addCommand('setmoney', (player, fullText, targetName, amount) => {
    if (!isAdmin(player, ADMIN_LEVELS.ADMIN)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!targetName || !amount) {
        player.outputChatBox('!{#FFFF00}Usage: /setmoney [name] [amount]');
        return;
    }

    amount = parseInt(amount);
    if (isNaN(amount) || amount < 0) {
        player.outputChatBox('!{#FF0000}Invalid amount!');
        return;
    }

    const target = mp.players.toArray().find(p => p.name === targetName);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    const data = playerModule.getPlayerData(target);
    if (data && data.characterData) {
        data.characterData.money = amount;
        target.call('client:updateMoney', [amount]);
        player.outputChatBox(`!{#00FF00}Set ${targetName}'s money to $${amount.toLocaleString()}`);
        target.outputChatBox(`!{#00FF00}Admin set your money to $${amount.toLocaleString()}`);
    }

    console.log(`[Admin] ${player.name} set ${targetName}'s money to $${amount}`);
});

// Teleport command
mp.events.addCommand('tp', (player, fullText, x, y, z) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!x || !y || !z) {
        player.outputChatBox('!{#FFFF00}Usage: /tp [x] [y] [z]');
        return;
    }

    x = parseFloat(x);
    y = parseFloat(y);
    z = parseFloat(z);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        player.outputChatBox('!{#FF0000}Invalid coordinates!');
        return;
    }

    player.position = new mp.Vector3(x, y, z);
    player.outputChatBox(`!{#00FF00}Teleported to ${x}, ${y}, ${z}`);

    console.log(`[Admin] ${player.name} teleported to ${x}, ${y}, ${z}`);
});

// Teleport to player command
mp.events.addCommand('tpto', (player, fullText, targetName) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!targetName) {
        player.outputChatBox('!{#FFFF00}Usage: /tpto [name]');
        return;
    }

    const target = mp.players.toArray().find(p => p.name === targetName);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    player.position = target.position;
    player.dimension = target.dimension;
    player.outputChatBox(`!{#00FF00}Teleported to ${targetName}`);

    console.log(`[Admin] ${player.name} teleported to ${targetName}`);
});

// Spawn vehicle command
mp.events.addCommand('veh', (player, fullText, vehicleModel) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!vehicleModel) {
        player.outputChatBox('!{#FFFF00}Usage: /veh [model]');
        return;
    }

    try {
        const pos = player.position;
        const spawnPos = new mp.Vector3(pos.x + 3, pos.y, pos.z);
        const vehicle = mp.vehicles.new(mp.joaat(vehicleModel), spawnPos,
            {
                numberPlate: 'ADMIN',
                color: [[255, 255, 255], [255, 255, 255]],
                locked: false,
                engine: true,
                dimension: player.dimension
            }
        );

        player.outputChatBox(`!{#00FF00}Spawned ${vehicleModel}`);
        console.log(`[Admin] ${player.name} spawned vehicle: ${vehicleModel}`);
    } catch (error) {
        player.outputChatBox('!{#FF0000}Invalid vehicle model!');
        console.error(`[Admin] Error spawning vehicle ${vehicleModel}:`, error);
    }
});

// Heal command
mp.events.addCommand('heal', (player, fullText, targetName) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    const target = targetName ? mp.players.toArray().find(p => p.name === targetName) : player;
    
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    target.health = 100;
    target.armour = 100;
    
    if (target === player) {
        player.outputChatBox('!{#00FF00}You healed yourself');
    } else {
        player.outputChatBox(`!{#00FF00}You healed ${targetName}`);
        target.outputChatBox('!{#00FF00}Admin healed you');
    }

    console.log(`[Admin] ${player.name} healed ${target.name}`);
});

// Kick player command
mp.events.addCommand('kick', (player, fullText, targetName, ...reason) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!targetName) {
        player.outputChatBox('!{#FFFF00}Usage: /kick [name] [reason]');
        return;
    }

    const target = mp.players.toArray().find(p => p.name === targetName);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    const kickReason = reason.join(' ') || 'No reason provided';
    target.kick(kickReason);
    
    mp.players.broadcast(`!{#FF0000}${targetName} was kicked by admin. Reason: ${kickReason}`);
    console.log(`[Admin] ${player.name} kicked ${targetName}: ${kickReason}`);
});

// Announcement command
mp.events.addCommand('announce', (player, fullText, ...message) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (message.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /announce [message]');
        return;
    }

    const announcement = message.join(' ');
    mp.players.broadcast(`!{#FF0000}[ANNOUNCEMENT] !{#FFFFFF}${announcement}`);
    console.log(`[Admin] ${player.name} announced: ${announcement}`);
});

// Freeze player command
mp.events.addCommand('freeze', (player, fullText, targetName) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    if (!targetName) {
        player.outputChatBox('!{#FFFF00}Usage: /freeze [name]');
        return;
    }

    const target = mp.players.toArray().find(p => p.name === targetName);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    target.frozen = !target.frozen;
    player.outputChatBox(`!{#00FF00}${targetName} is now ${target.frozen ? 'frozen' : 'unfrozen'}`);
    target.outputChatBox(`!{#FFFF00}You have been ${target.frozen ? 'frozen' : 'unfrozen'} by admin`);

    console.log(`[Admin] ${player.name} ${target.frozen ? 'froze' : 'unfroze'} ${targetName}`);
});

// Get position command
mp.events.addCommand('getpos', (player) => {
    if (!isAdmin(player, ADMIN_LEVELS.MODERATOR)) {
        player.outputChatBox('!{#FF0000}You don\'t have permission to use this command!');
        return;
    }

    const pos = player.position;
    player.outputChatBox(`!{#00FF00}Position: X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`);
    player.outputChatBox(`!{#00FF00}Heading: ${player.heading.toFixed(2)}`);
    console.log(`[Admin] ${player.name} position: ${pos.x}, ${pos.y}, ${pos.z}, ${player.heading}`);
});

console.log('[Admin] Module loaded');

module.exports = {
    isAdmin,
    ADMIN_LEVELS
};
