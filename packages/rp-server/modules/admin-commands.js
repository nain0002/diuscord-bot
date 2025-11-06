// Admin Commands Module
const db = require('./database');

// Admin command handlers
const adminCommands = {
    // Get server statistics
    async getStatistics() {
        try {
            const stats = {
                players: mp.players.length,
                vehicles: mp.vehicles.length,
                uptime: getUptime()
            };
            return stats;
        } catch (error) {
            console.error('[Admin] Error getting statistics:', error);
            return { players: 0, vehicles: 0, uptime: '0h 0m' };
        }
    },

    // Get online player list
    getOnlinePlayers() {
        const players = [];
        mp.players.forEach(player => {
            if (player && player.socialClub) {
                players.push({
                    id: player.id,
                    name: player.getVariable('characterName') || player.name,
                    level: player.getVariable('level') || 1,
                    job: player.getVariable('job') || 'Unemployed'
                });
            }
        });
        return players;
    },

    // Heal all players
    healAll() {
        mp.players.forEach(player => {
            if (player) {
                player.health = 100;
                player.armour = 0;
            }
        });
    },

    // Give armor to all players
    armorAll() {
        mp.players.forEach(player => {
            if (player) {
                player.armour = 100;
            }
        });
    },

    // Server announcement
    announce(player, message) {
        mp.players.broadcast(`[ADMIN] ${message}`);
    },

    // Clear all vehicles
    clearVehicles() {
        let count = 0;
        mp.vehicles.forEach(vehicle => {
            if (vehicle) {
                vehicle.destroy();
                count++;
            }
        });
        return count;
    },

    // Spawn vehicle for admin
    spawnVehicle(player, model) {
        try {
            const pos = player.position;
            const heading = player.heading;
            
            const vehicle = mp.vehicles.new(mp.joaat(model), 
                new mp.Vector3(pos.x + 3, pos.y, pos.z),
                {
                    heading: heading,
                    numberPlate: 'ADMIN',
                    color: [[255, 0, 0], [255, 0, 0]]
                }
            );
            
            return vehicle !== null;
        } catch (error) {
            console.error('[Admin] Error spawning vehicle:', error);
            return false;
        }
    },

    // Spawn item for admin
    async spawnItem(player, itemName) {
        try {
            let itemId, itemCount = 1;
            
            // Map item names to database items
            const itemMap = {
                'weapon_pistol': { name: 'Pistol', category: 'weapon', weight: 1.5 },
                'weapon_assaultrifle': { name: 'Assault Rifle', category: 'weapon', weight: 3.5 },
                'money': { name: 'Cash', category: 'misc', weight: 0, count: 10000 },
                'medkit': { name: 'Medkit', category: 'medical', weight: 0.5 }
            };
            
            const itemData = itemMap[itemName];
            if (!itemData) return false;
            
            // Add to player's inventory
            const characterId = player.getVariable('characterId');
            if (!characterId) return false;
            
            await db.execute(
                'INSERT INTO inventory (character_id, item_name, category, quantity, weight) VALUES (?, ?, ?, ?, ?)',
                [characterId, itemData.name, itemData.category, itemData.count || 1, itemData.weight]
            );
            
            return true;
        } catch (error) {
            console.error('[Admin] Error spawning item:', error);
            return false;
        }
    },

    // Set weather
    setWeather(weatherType) {
        const weatherMap = {
            'clear': 'CLEAR',
            'rain': 'RAIN',
            'thunder': 'THUNDER',
            'fog': 'FOGGY'
        };
        
        const weather = weatherMap[weatherType] || 'CLEAR';
        mp.world.weather = weather;
        
        mp.players.broadcast(`[SERVER] Weather changed to ${weatherType}`);
    },

    // Set time
    setTime(hour) {
        if (hour < 0 || hour > 23) return false;
        
        mp.world.time.set(hour, 0, 0);
        mp.players.broadcast(`[SERVER] Time set to ${hour}:00`);
        return true;
    },

    // Kick player
    kickPlayer(targetId, reason = 'No reason provided') {
        const target = mp.players.at(targetId);
        if (!target) return false;
        
        target.kick(reason);
        mp.players.broadcast(`[ADMIN] ${target.name} was kicked: ${reason}`);
        return true;
    },

    // Ban player
    async banPlayer(targetId, adminName, reason = 'No reason provided') {
        try {
            const target = mp.players.at(targetId);
            if (!target) return false;
            
            const socialClub = target.socialClub;
            const characterId = target.getVariable('characterId');
            
            // Add to ban list
            await db.execute(
                'INSERT INTO bans (social_club, character_id, reason, admin_name, banned_at) VALUES (?, ?, ?, ?, NOW())',
                [socialClub, characterId, reason, adminName]
            );
            
            target.kick(`Banned: ${reason}`);
            mp.players.broadcast(`[ADMIN] ${target.name} was banned: ${reason}`);
            return true;
        } catch (error) {
            console.error('[Admin] Error banning player:', error);
            return false;
        }
    },

    // Freeze player
    freezePlayer(targetId) {
        const target = mp.players.at(targetId);
        if (!target) return false;
        
        const isFrozen = target.getVariable('frozen') || false;
        target.setVariable('frozen', !isFrozen);
        target.call('setPlayerFrozen', [!isFrozen]);
        
        return true;
    },

    // Heal player
    healPlayer(targetId) {
        const target = mp.players.at(targetId);
        if (!target) return false;
        
        target.health = 100;
        target.armour = 100;
        return true;
    },

    // Teleport to player
    teleportToPlayer(admin, targetId) {
        const target = mp.players.at(targetId);
        if (!target) return false;
        
        admin.position = target.position;
        return true;
    }
};

// Helper: Get server uptime
const serverStartTime = Date.now();
function getUptime() {
    const uptime = Date.now() - serverStartTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Register admin commands
mp.events.add('getAdminStatistics', async (player) => {
    if (!player.getVariable('isAdmin')) return;
    
    const stats = await adminCommands.getStatistics();
    player.call('updateAdminStats', [stats]);
});

mp.events.add('getOnlinePlayerList', (player) => {
    if (!player.getVariable('isAdmin')) return;
    
    const players = adminCommands.getOnlinePlayers();
    player.call('updatePlayerList', [JSON.stringify(players)]);
});

mp.events.add('adminCommand', async (player, action) => {
    if (!player.getVariable('isAdmin')) return;
    
    switch (action) {
        case 'heal':
            adminCommands.healAll();
            player.outputChatBox('[ADMIN] All players healed');
            break;
        case 'armor':
            adminCommands.armorAll();
            player.outputChatBox('[ADMIN] Armor given to all players');
            break;
        case 'announce':
            // Would need message input
            break;
        case 'clearVehicles':
            const count = adminCommands.clearVehicles();
            player.outputChatBox(`[ADMIN] Cleared ${count} vehicles`);
            break;
    }
});

mp.events.add('adminSpawnVehicle', (player, model) => {
    if (!player.getVariable('isAdmin')) return;
    
    const success = adminCommands.spawnVehicle(player, model);
    if (success) {
        player.outputChatBox(`[ADMIN] Spawned ${model}`);
    } else {
        player.outputChatBox('[ADMIN] Failed to spawn vehicle');
    }
});

mp.events.add('adminSpawnItem', async (player, itemName) => {
    if (!player.getVariable('isAdmin')) return;
    
    const success = await adminCommands.spawnItem(player, itemName);
    if (success) {
        player.outputChatBox('[ADMIN] Item spawned');
    } else {
        player.outputChatBox('[ADMIN] Failed to spawn item');
    }
});

mp.events.add('adminSetWeather', (player, weather) => {
    if (!player.getVariable('isAdmin')) return;
    adminCommands.setWeather(weather);
});

mp.events.add('adminSetTime', (player, hour) => {
    if (!player.getVariable('isAdmin')) return;
    adminCommands.setTime(hour);
});

mp.events.add('adminModerate', async (player, action, targetId) => {
    if (!player.getVariable('isAdmin')) return;
    
    const adminName = player.getVariable('characterName') || player.name;
    
    switch (action) {
        case 'kick':
            adminCommands.kickPlayer(targetId);
            break;
        case 'ban':
            await adminCommands.banPlayer(targetId, adminName);
            break;
        case 'freeze':
            adminCommands.freezePlayer(targetId);
            break;
        case 'spectate':
            // Would need spectate system
            break;
    }
});

mp.events.add('adminPlayerAction', (player, targetId, action) => {
    if (!player.getVariable('isAdmin')) return;
    
    switch (action) {
        case 'heal':
            adminCommands.healPlayer(targetId);
            break;
        case 'teleport':
            adminCommands.teleportToPlayer(player, targetId);
            break;
        case 'kick':
            adminCommands.kickPlayer(targetId);
            break;
    }
});

module.exports = adminCommands;
