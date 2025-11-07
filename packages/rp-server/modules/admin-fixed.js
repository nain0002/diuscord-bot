/**
 * Admin Module - FIXED
 * Uses database admin_level system
 */

const database = require('./database');
const playerModule = require('./player');

// Check if player is admin using database admin_level
function isAdmin(player, minLevel = 1) {
    if (!player || !mp.players.exists(player)) return false;
    
    const adminLevel = player.getVariable('admin_level') || 0;
    return adminLevel >= minLevel;
}

// Get admin level
function getAdminLevel(player) {
    if (!player || !mp.players.exists(player)) return 0;
    return player.getVariable('admin_level') || 0;
}

// Give money command
mp.events.addCommand('givemoney', async (player, fullText, targetId, amount) => {
    if (!isAdmin(player, 2)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 2 or higher!');
        return;
    }

    if (!targetId || !amount) {
        player.outputChatBox('!{#FFFF00}Usage: /givemoney [playerID] [amount]');
        return;
    }

    const parsedAmount = parseInt(amount);
    const parsedId = parseInt(targetId);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        player.outputChatBox('!{#FF0000}Invalid amount!');
        return;
    }

    const target = mp.players.at(parsedId);
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    if (playerModule.giveMoney(target, parsedAmount)) {
        player.outputChatBox(`!{#00FF00}Gave $${parsedAmount.toLocaleString()} to ${target.name}`);
        target.outputChatBox(`!{#00FF00}Admin gave you $${parsedAmount.toLocaleString()}`);
        
        // Log to database
        try {
            await database.query(
                'INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_name, reason) VALUES (?, ?, ?, ?, ?, ?)',
                [player.getVariable('user_id'), player.name, 'givemoney', parsedId, target.name, `Gave $${parsedAmount}`]
            );
        } catch (e) {
            console.error('[Admin] Log error:', e.message);
        }
    }
});

// Set money command
mp.events.addCommand('setmoney', async (player, fullText, targetId, amount) => {
    if (!isAdmin(player, 3)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 3 or higher!');
        return;
    }

    if (!targetId || !amount) {
        player.outputChatBox('!{#FFFF00}Usage: /setmoney [playerID] [amount]');
        return;
    }

    const parsedAmount = parseInt(amount);
    const parsedId = parseInt(targetId);
    
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        player.outputChatBox('!{#FF0000}Invalid amount!');
        return;
    }

    const target = mp.players.at(parsedId);
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    const data = playerModule.getPlayerData(target);
    if (data && data.characterData) {
        data.characterData.money = parsedAmount;
        target.call('client:updateMoney', [parsedAmount]);
        target.setVariable('money', parsedAmount);
        
        player.outputChatBox(`!{#00FF00}Set ${target.name}'s money to $${parsedAmount.toLocaleString()}`);
        target.outputChatBox(`!{#00FF00}Admin set your money to $${parsedAmount.toLocaleString()}`);
        
        // Log
        try {
            await database.query(
                'INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_name, reason) VALUES (?, ?, ?, ?, ?, ?)',
                [player.getVariable('user_id'), player.name, 'setmoney', parsedId, target.name, `Set money to $${parsedAmount}`]
            );
        } catch (e) {
            console.error('[Admin] Log error:', e.message);
        }
    }
});

// Teleport command
mp.events.addCommand('tp', async (player, fullText, x, y, z) => {
    if (!isAdmin(player, 1)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 1 or higher!');
        return;
    }

    if (!x || !y || !z) {
        player.outputChatBox('!{#FFFF00}Usage: /tp [x] [y] [z]');
        return;
    }

    const px = parseFloat(x);
    const py = parseFloat(y);
    const pz = parseFloat(z);

    if (isNaN(px) || isNaN(py) || isNaN(pz)) {
        player.outputChatBox('!{#FF0000}Invalid coordinates!');
        return;
    }

    player.position = new mp.Vector3(px, py, pz);
    player.outputChatBox(`!{#00FF00}Teleported to ${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)}`);
});

// Teleport to player
mp.events.addCommand('tpto', async (player, fullText, targetId) => {
    if (!isAdmin(player, 1)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 1 or higher!');
        return;
    }

    if (!targetId) {
        player.outputChatBox('!{#FFFF00}Usage: /tpto [playerID]');
        return;
    }

    const parsedId = parseInt(targetId);
    const target = mp.players.at(parsedId);
    
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    player.position = target.position;
    player.dimension = target.dimension;
    player.outputChatBox(`!{#00FF00}Teleported to ${target.name}`);
});

// Bring player
mp.events.addCommand('bring', async (player, fullText, targetId) => {
    if (!isAdmin(player, 2)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 2 or higher!');
        return;
    }

    if (!targetId) {
        player.outputChatBox('!{#FFFF00}Usage: /bring [playerID]');
        return;
    }

    const parsedId = parseInt(targetId);
    const target = mp.players.at(parsedId);
    
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    target.position = player.position;
    target.dimension = player.dimension;
    
    player.outputChatBox(`!{#00FF00}Brought ${target.name} to you`);
    target.outputChatBox(`!{#FFFF00}Admin teleported you to them`);
});

// Spawn vehicle
mp.events.addCommand('veh', (player, fullText, vehicleModel) => {
    if (!isAdmin(player, 1)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 1 or higher!');
        return;
    }

    if (!vehicleModel) {
        player.outputChatBox('!{#FFFF00}Usage: /veh [model]');
        return;
    }

    try {
        const vehicleHash = mp.joaat(vehicleModel);
        const vehicle = mp.vehicles.new(vehicleHash, player.position, {
            heading: player.heading,
            numberPlate: 'ADMIN',
            color: [[255, 255, 255], [0, 0, 0]],
            locked: false,
            engine: true
        });

        player.outputChatBox(`!{#00FF00}Spawned ${vehicleModel}`);
        
        // Put player in vehicle
        setTimeout(() => {
            player.putIntoVehicle(vehicle, -1);
        }, 500);
        
    } catch (error) {
        player.outputChatBox('!{#FF0000}Invalid vehicle model!');
    }
});

// Kick command
mp.events.addCommand('kick', async (player, fullText, targetId, ...reasonArray) => {
    if (!isAdmin(player, 2)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 2 or higher!');
        return;
    }

    if (!targetId) {
        player.outputChatBox('!{#FFFF00}Usage: /kick [playerID] [reason]');
        return;
    }

    const parsedId = parseInt(targetId);
    const target = mp.players.at(parsedId);
    
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    const reason = reasonArray.join(' ') || 'No reason provided';
    
    // Log
    try {
        await database.query(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_name, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [player.getVariable('user_id'), player.name, 'kick', parsedId, target.name, reason]
        );
    } catch (e) {
        console.error('[Admin] Log error:', e.message);
    }
    
    mp.players.broadcast(`!{#FF6666}${target.name} was kicked by admin. Reason: ${reason}`);
    target.kick(reason);
});

// Ban command
mp.events.addCommand('ban', async (player, fullText, targetId, ...reasonArray) => {
    if (!isAdmin(player, 3)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 3 or higher!');
        return;
    }

    if (!targetId) {
        player.outputChatBox('!{#FFFF00}Usage: /ban [playerID] [reason]');
        return;
    }

    const parsedId = parseInt(targetId);
    const target = mp.players.at(parsedId);
    
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    const reason = reasonArray.join(' ') || 'No reason provided';
    const targetUserId = target.getVariable('user_id');
    
    if (targetUserId) {
        try {
            // Add to bans table
            await database.query(
                'INSERT INTO bans (user_id, username, social_club, reason, banned_by, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [targetUserId, target.name, target.socialClub || '', reason, player.name, true]
            );
            
            // Log
            await database.query(
                'INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_name, reason) VALUES (?, ?, ?, ?, ?, ?)',
                [player.getVariable('user_id'), player.name, 'ban', parsedId, target.name, reason]
            );
        } catch (e) {
            console.error('[Admin] Ban error:', e.message);
        }
    }
    
    mp.players.broadcast(`!{#FF0000}${target.name} was banned by admin. Reason: ${reason}`);
    target.ban(reason);
});

// Heal command
mp.events.addCommand('heal', (player, fullText, targetId) => {
    if (!isAdmin(player, 1)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 1 or higher!');
        return;
    }

    if (!targetId) {
        player.health = 100;
        player.armour = 100;
        player.outputChatBox('!{#00FF00}You healed yourself!');
        return;
    }

    const parsedId = parseInt(targetId);
    const target = mp.players.at(parsedId);
    
    if (!target || !mp.players.exists(target)) {
        player.outputChatBox('!{#FF0000}Player not found!');
        return;
    }

    target.health = 100;
    target.armour = 100;
    
    player.outputChatBox(`!{#00FF00}Healed ${target.name}`);
    target.outputChatBox('!{#00FF00}Admin healed you!');
});

// Announce command
mp.events.addCommand('announce', (player, fullText, ...messageArray) => {
    if (!isAdmin(player, 2)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 2 or higher!');
        return;
    }

    if (messageArray.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /announce [message]');
        return;
    }

    const message = messageArray.join(' ');
    mp.players.broadcast(`!{#FF6600}[ANNOUNCEMENT] ${message}`);
});

// List players command
mp.events.addCommand('players', (player) => {
    if (!isAdmin(player, 1)) {
        player.outputChatBox('!{#FF0000}You need Admin Level 1 or higher!');
        return;
    }

    player.outputChatBox('!{#00FF00}===== ONLINE PLAYERS =====');
    mp.players.forEach((p, id) => {
        const adminLvl = p.getVariable('admin_level') || 0;
        const adminTag = adminLvl > 0 ? `!{#FF9900}[A${adminLvl}]` : '';
        player.outputChatBox(`!{#FFFFFF}[${id}] ${adminTag} ${p.name}`);
    });
    player.outputChatBox(`!{#00FF00}Total: ${mp.players.length} players`);
});

console.log('[Admin] Fixed admin module loaded');

module.exports = {
    isAdmin,
    getAdminLevel
};
