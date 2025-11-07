// Enhanced Admin Commands Module
const db = require('./database');
const AdminPermissions = require('./admin-permissions');

// Chat logs storage
const chatLogs = [];
const MAX_CHAT_LOGS = 500;

// Reports storage
const reports = [];
let reportIdCounter = 1;

// Whitelist
const whitelist = new Set();

// World settings
let trafficEnabled = true;
let pedsEnabled = true;
let policeEnabled = true;

// Admin command handlers
const adminCommands = {
    // Get server statistics
    async getStatistics() {
        try {
            const stats = {
                players: mp.players.length,
                vehicles: mp.vehicles.length,
                uptime: getUptime(),
                memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
            };
            return stats;
        } catch (error) {
            console.error('[Admin] Error getting statistics:', error);
            return { players: 0, vehicles: 0, uptime: '0h 0m', memory: '0 MB' };
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
        let count = 0;
        mp.players.forEach(player => {
            if (player) {
                player.health = 100;
                player.armour = 100;
                count++;
            }
        });
        return count;
    },

    // Repair all vehicles
    repairAll() {
        let count = 0;
        mp.vehicles.forEach(vehicle => {
            if (vehicle) {
                vehicle.repair();
                count++;
            }
        });
        return count;
    },

    // Refuel all vehicles
    refuelAll() {
        let count = 0;
        mp.vehicles.forEach(vehicle => {
            if (vehicle) {
                vehicle.setVariable('fuel', 100);
                count++;
            }
        });
        return count;
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

    // Clear all objects
    clearObjects() {
        let count = 0;
        mp.objects.forEach(object => {
            if (object) {
                object.destroy();
                count++;
            }
        });
        return count;
    },

    // Server announcement
    announce(message) {
        mp.players.broadcast(`[SERVER ANNOUNCEMENT] ${message}`);
    },

    // Heal player
    healPlayer(player) {
        if (player) {
            player.health = 100;
            player.armour = 100;
        }
    },

    // Freeze player
    freezePlayer(player, freeze = true) {
        if (player) {
            player.call('setPlayerFrozen', [freeze]);
        }
    },

    // Kick player
    async kickPlayer(player, reason) {
        if (player) {
            player.outputChatBox(`!{#FF0000}You have been kicked. Reason: ${reason}`);
            
            // Log to database
            try {
                await db.execute(
                    'INSERT INTO admin_logs (action, admin_name, target_name, reason, timestamp) VALUES (?, ?, ?, ?, NOW())',
                    ['kick', 'System', player.name, reason]
                );
            } catch (error) {
                console.error('[Admin] Error logging kick:', error);
            }
            
            setTimeout(() => {
                player.kick(reason);
            }, 1000);
        }
    },

    // Ban player
    async banPlayer(player, reason, adminName) {
        if (player) {
            const socialClub = player.socialClub;
            const ip = player.ip;
            
            try {
                // Add to ban table (adjust columns to match actual table structure)
                await db.execute(
                    'INSERT INTO bans (social_club, reason, admin_name, banned_at) VALUES (?, ?, ?, NOW())',
                    [socialClub, reason, adminName]
                );
                
                // Log action
                await db.execute(
                    'INSERT INTO admin_logs (action, admin_name, target_name, reason, timestamp) VALUES (?, ?, ?, ?, NOW())',
                    ['ban', adminName, player.name, reason]
                );
                
                player.outputChatBox(`!{#FF0000}You have been BANNED. Reason: ${reason}`);
                
                setTimeout(() => {
                    player.kick('BANNED: ' + reason);
                }, 1000);
            } catch (error) {
                console.error('[Admin] Error banning player:', error);
            }
        }
    },

    // Warn player
    async warnPlayer(player, reason, adminName) {
        if (player) {
            const characterId = player.getVariable('character_id');
            
            try {
                // Increment warnings
                await db.execute(
                    'UPDATE characters SET warnings = warnings + 1 WHERE id = ?',
                    [characterId]
                );
                
                // Log warning
                await db.execute(
                    'INSERT INTO admin_logs (action, admin_name, target_name, reason, timestamp) VALUES (?, ?, ?, ?, NOW())',
                    ['warn', adminName, player.name, reason]
                );
                
                const warnings = await db.query('SELECT warnings FROM characters WHERE id = ?', [characterId]);
                const warnCount = warnings[0]?.warnings || 1;
                
                player.outputChatBox(`!{#FFA500}[WARNING] You have been warned by an admin. Reason: ${reason}`);
                player.outputChatBox(`!{#FFA500}Total warnings: ${warnCount}/3`);
                
                if (warnCount >= 3) {
                    await this.kickPlayer(player, 'Too many warnings');
                }
            } catch (error) {
                console.error('[Admin] Error warning player:', error);
            }
        }
    },

    // Mute player
    async mutePlayer(player, reason) {
        if (player) {
            player.setVariable('muted', true);
            player.outputChatBox(`!{#FF0000}You have been muted. Reason: ${reason}`);
            
            setTimeout(() => {
                player.setVariable('muted', false);
                player.outputChatBox('!{#00FF00}You have been unmuted.');
            }, 300000); // 5 minutes
        }
    },

    // Jail player
    jailPlayer(player, reason) {
        if (player) {
            player.position = new mp.Vector3(1641.4, 2570.2, 45.5); // Prison coords
            player.setVariable('jailed', true);
            player.outputChatBox(`!{#FF0000}You have been jailed. Reason: ${reason}`);
            
            setTimeout(() => {
                player.setVariable('jailed', false);
                player.position = new mp.Vector3(-275.0, -956.0, 31.2); // Los Santos
                player.outputChatBox('!{#00FF00}You have been released from jail.');
            }, 600000); // 10 minutes
        }
    },

    // Teleport to player
    teleportToPlayer(admin, targetPlayer) {
        if (admin && targetPlayer) {
            admin.position = targetPlayer.position;
            return true;
        }
        return false;
    },

    // Spawn vehicle
    spawnVehicle(player, model, color) {
        try {
            const pos = player.position;
            const heading = player.heading;
            
            const vehicle = mp.vehicles.new(mp.joaat(model), 
                new mp.Vector3(pos.x + 3, pos.y, pos.z),
                {
                    heading: heading,
                    numberPlate: "ADMIN",
                    color: [[color[0], color[1], color[2]], [color[0], color[1], color[2]]],
                    dimension: player.dimension
                }
            );
            
            if (vehicle) {
                vehicle.setVariable('adminSpawned', true);
                return true;
            }
        } catch (error) {
            console.error('[Admin] Error spawning vehicle:', error);
        }
        return false;
    },

    // Spawn object
    spawnObject(player, model) {
        try {
            const pos = player.position;
            const heading = player.heading;
            
            const object = mp.objects.new(mp.joaat(model),
                new mp.Vector3(pos.x + 2, pos.y, pos.z),
                {
                    rotation: new mp.Vector3(0, 0, heading),
                    dimension: player.dimension
                }
            );
            
            if (object) {
                object.setVariable('adminSpawned', true);
                return true;
            }
        } catch (error) {
            console.error('[Admin] Error spawning object:', error);
        }
        return false;
    },

    // Give weapon
    giveWeapon(player, weapon) {
        if (player) {
            const weaponHash = mp.joaat(weapon);
            player.giveWeapon(weaponHash, 9999);
            return true;
        }
        return false;
    },

    // Remove all weapons
    removeAllWeapons(player) {
        if (player) {
            player.removeAllWeapons();
            return true;
        }
        return false;
    },

    // Set weather
    setWeather(weather) {
        const weatherTypes = {
            'clear': 'CLEAR',
            'clouds': 'CLOUDS',
            'rain': 'RAIN',
            'thunder': 'THUNDER',
            'fog': 'FOGGY',
            'snow': 'XMAS'
        };
        
        const weatherType = weatherTypes[weather] || 'CLEAR';
        mp.world.weather = weatherType;
        mp.players.broadcast(`!{#00AAFF}[SERVER] Weather changed to: ${weather}`);
    },

    // Set time
    setTime(hour) {
        mp.world.time.hour = hour;
        mp.world.time.minute = 0;
        mp.players.broadcast(`!{#00AAFF}[SERVER] Time set to: ${hour}:00`);
    },

    // Toggle world settings
    toggleWorld(type) {
        switch(type) {
            case 'traffic':
                trafficEnabled = !trafficEnabled;
                mp.players.forEach(p => {
                    p.call('setTrafficEnabled', [trafficEnabled]);
                });
                return trafficEnabled;
            case 'peds':
                pedsEnabled = !pedsEnabled;
                mp.players.forEach(p => {
                    p.call('setPedsEnabled', [pedsEnabled]);
                });
                return pedsEnabled;
            case 'police':
                policeEnabled = !policeEnabled;
                mp.players.forEach(p => {
                    p.call('setPoliceEnabled', [policeEnabled]);
                });
                return policeEnabled;
        }
        return false;
    },

    // Add chat log
    addChatLog(playerName, message) {
        const log = {
            player: playerName,
            message: message,
            time: new Date().toLocaleTimeString()
        };
        
        chatLogs.unshift(log);
        
        if (chatLogs.length > MAX_CHAT_LOGS) {
            chatLogs.pop();
        }
    },

    // Get chat logs
    getChatLogs() {
        return chatLogs.slice(0, 100); // Return last 100 logs
    },

    // Add report
    addReport(reporter, reported, reason) {
        const report = {
            id: reportIdCounter++,
            reporter: reporter,
            reported: reported,
            reason: reason,
            time: new Date().toLocaleTimeString()
        };
        
        reports.push(report);
    },

    // Get reports
    getReports() {
        return reports;
    },

    // Handle report
    handleReport(reportId, action) {
        const index = reports.findIndex(r => r.id === reportId);
        if (index !== -1) {
            reports.splice(index, 1);
        }
    },

    // Whitelist management
    addWhitelist(name) {
        whitelist.add(name.toLowerCase());
    },

    removeWhitelist(name) {
        whitelist.delete(name.toLowerCase());
    },

    isWhitelisted(name) {
        return whitelist.has(name.toLowerCase());
    }
};

// Helper function to calculate uptime
function getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// Event handlers
mp.events.add('getAdminStatistics', async (player) => {
    try {
        if (!player || !player.getVariable('isAdmin')) return;
        
        const stats = await adminCommands.getStatistics();
        player.call('updateAdminStats', [stats]);
    } catch (error) {
        console.error('[Admin] Error in getAdminStatistics:', error);
    }
});

mp.events.add('getOnlinePlayerList', (player) => {
    try {
        if (!player || !player.getVariable('isAdmin')) return;
        
        const players = adminCommands.getOnlinePlayers();
        player.call('updateAdminPlayerList', [players]);
    } catch (error) {
        console.error('[Admin] Error in getOnlinePlayerList:', error);
    }
});

mp.events.add('adminPlayerAction', async (player, action, targetId) => {
    // Check basic admin status
    if (!AdminPermissions.isAdmin(player)) {
        player.outputChatBox('!{#FF0000}You are not an admin!');
        return;
    }
    
    // Permission checks per action
    const permissionMap = {
        'heal': null, // All admins can heal
        'freeze': 'freeze',
        'teleport': 'teleport',
        'spectate': null, // All admins can spectate
        'kick': 'kick'
    };
    
    const requiredPerm = permissionMap[action];
    if (requiredPerm && !AdminPermissions.hasPermission(player, requiredPerm)) {
        AdminPermissions.sendPermissionDenied(player, action);
        return;
    }
    
    const target = mp.players.at(targetId);
    if (!target) {
        player.outputChatBox('!{#FF0000}Player not found.');
        return;
    }
    
    const adminName = player.getVariable('characterName') || player.name;
    const adminLevel = AdminPermissions.getPlayerAdminLevel(player);
    const adminLevelName = AdminPermissions.getLevelName(adminLevel);
    
    switch(action) {
        case 'heal':
            adminCommands.healPlayer(target);
            player.outputChatBox(`!{#00FF00}[${adminLevelName}] Player ${target.name} healed.`);
            target.outputChatBox(`!{#00FF00}You have been healed by admin ${adminName}.`);
            break;
        case 'freeze':
            const frozen = target.getVariable('frozen') || false;
            adminCommands.freezePlayer(target, !frozen);
            target.setVariable('frozen', !frozen);
            player.outputChatBox(`!{#00FF00}[${adminLevelName}] Player ${target.name} ${!frozen ? 'frozen' : 'unfrozen'}.`);
            target.outputChatBox(`!{#FFA500}You have been ${!frozen ? 'frozen' : 'unfrozen'} by admin ${adminName}.`);
            break;
        case 'teleport':
            adminCommands.teleportToPlayer(player, target);
            player.outputChatBox(`!{#00FF00}[${adminLevelName}] Teleported to ${target.name}.`);
            break;
        case 'spectate':
            player.call('spectatePlayer', [target.position, target.heading]);
            player.setVariable('spectating', targetId);
            player.outputChatBox(`!{#00FF00}[${adminLevelName}] Now spectating ${target.name}.`);
            break;
        case 'kick':
            const reason = 'Kicked by admin';
            await adminCommands.kickPlayer(target, reason);
            player.outputChatBox(`!{#00FF00}[${adminLevelName}] Player ${target.name} kicked.`);
            mp.players.broadcast(`!{#FFA500}[ADMIN] Player ${target.name} has been kicked by ${adminName}.`);
            break;
    }
});

mp.events.add('adminCommand', async (player, action, param) => {
    if (!player.getVariable('isAdmin')) return;
    
    switch(action) {
        case 'healAll':
            const healed = adminCommands.healAll();
            player.outputChatBox(`!{#00FF00}Healed ${healed} players.`);
            mp.players.broadcast('!{#00FF00}[ADMIN] All players healed!');
            break;
        case 'repairAll':
            const repaired = adminCommands.repairAll();
            player.outputChatBox(`!{#00FF00}Repaired ${repaired} vehicles.`);
            break;
        case 'refuelAll':
            const refueled = adminCommands.refuelAll();
            player.outputChatBox(`!{#00FF00}Refueled ${refueled} vehicles.`);
            break;
        case 'clearVehicles':
            const cleared = adminCommands.clearVehicles();
            player.outputChatBox(`!{#00FF00}Cleared ${cleared} vehicles.`);
            break;
        case 'clearObjects':
            const clearedObjs = adminCommands.clearObjects();
            player.outputChatBox(`!{#00FF00}Cleared ${clearedObjs} objects.`);
            break;
        case 'announce':
            adminCommands.announce(param);
            break;
        case 'repairMyVehicle':
            if (player.vehicle) {
                player.vehicle.repair();
                player.outputChatBox('!{#00FF00}Vehicle repaired.');
            }
            break;
        case 'refuelMyVehicle':
            if (player.vehicle) {
                player.vehicle.setVariable('fuel', 100);
                player.outputChatBox('!{#00FF00}Vehicle refueled.');
            }
            break;
        case 'tuneMyVehicle':
            if (player.vehicle) {
                // Max tune vehicle
                for (let i = 0; i < 50; i++) {
                    player.vehicle.setMod(i, player.vehicle.getNumMods(i) - 1);
                }
                player.outputChatBox('!{#00FF00}Vehicle fully tuned.');
            }
            break;
        case 'deleteMyVehicle':
            if (player.vehicle) {
                player.vehicle.destroy();
                player.outputChatBox('!{#00FF00}Vehicle deleted.');
            }
            break;
        case 'removeAllWeapons':
            adminCommands.removeAllWeapons(player);
            player.outputChatBox('!{#00FF00}All weapons removed.');
            break;
        case 'freezeWorld':
            mp.players.forEach(p => {
                if (p !== player) {
                    adminCommands.freezePlayer(p, true);
                }
            });
            player.outputChatBox('!{#00FF00}World frozen.');
            break;
    }
});

mp.events.add('adminSpawnVehicle', (player, model, colorJson) => {
    if (!AdminPermissions.hasPermission(player, 'spawn_vehicle')) {
        AdminPermissions.sendPermissionDenied(player, 'spawn vehicles');
        return;
    }
    
    try {
        const color = JSON.parse(colorJson);
        const success = adminCommands.spawnVehicle(player, model, color);
        
        const levelName = AdminPermissions.getLevelName(AdminPermissions.getPlayerAdminLevel(player));
        
        if (success) {
            player.outputChatBox(`!{#00FF00}[${levelName}] Vehicle ${model} spawned.`);
        } else {
            player.outputChatBox('!{#FF0000}Failed to spawn vehicle. Check model name.');
        }
    } catch (error) {
        console.error('[Admin] Error in adminSpawnVehicle:', error);
        player.outputChatBox('!{#FF0000}Error spawning vehicle.');
    }
});

mp.events.add('adminSpawnObject', (player, model) => {
    if (!player.getVariable('isAdmin')) return;
    
    const success = adminCommands.spawnObject(player, model);
    
    if (success) {
        player.outputChatBox(`!{#00FF00}Object ${model} spawned.`);
    } else {
        player.outputChatBox('!{#FF0000}Failed to spawn object.');
    }
});

mp.events.add('adminGiveWeapon', (player, weapon) => {
    if (!player.getVariable('isAdmin')) return;
    
    const success = adminCommands.giveWeapon(player, weapon);
    
    if (success) {
        player.outputChatBox(`!{#00FF00}Weapon ${weapon} given.`);
    } else {
        player.outputChatBox('!{#FF0000}Failed to give weapon.');
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

mp.events.add('adminToggleWorld', (player, type) => {
    if (!player.getVariable('isAdmin')) return;
    const newState = adminCommands.toggleWorld(type);
    player.outputChatBox(`!{#00FF00}${type.charAt(0).toUpperCase() + type.slice(1)} ${newState ? 'enabled' : 'disabled'}.`);
});

mp.events.add('adminWarn', async (player, targetId, reason) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        const adminName = player.getVariable('characterName') || player.name;
        await adminCommands.warnPlayer(target, reason, adminName);
        player.outputChatBox(`!{#00FF00}Player ${target.name} warned.`);
    }
});

mp.events.add('adminMute', async (player, targetId, reason) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        await adminCommands.mutePlayer(target, reason);
        player.outputChatBox(`!{#00FF00}Player ${target.name} muted for 5 minutes.`);
    }
});

mp.events.add('adminJail', (player, targetId, reason) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        adminCommands.jailPlayer(target, reason);
        player.outputChatBox(`!{#00FF00}Player ${target.name} jailed for 10 minutes.`);
    }
});

mp.events.add('adminKick', async (player, targetId, reason) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        await adminCommands.kickPlayer(target, reason);
        player.outputChatBox(`!{#00FF00}Player ${target.name} kicked.`);
    }
});

mp.events.add('adminBan', async (player, targetId, reason) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        const adminName = player.getVariable('characterName') || player.name;
        await adminCommands.banPlayer(target, reason, adminName);
        player.outputChatBox(`!{#00FF00}Player ${target.name} banned.`);
    }
});

mp.events.add('adminAddWhitelist', (player, name) => {
    if (!player.getVariable('isAdmin')) return;
    adminCommands.addWhitelist(name);
    player.outputChatBox(`!{#00FF00}${name} added to whitelist.`);
});

mp.events.add('adminRemoveWhitelist', (player, name) => {
    if (!player.getVariable('isAdmin')) return;
    adminCommands.removeWhitelist(name);
    player.outputChatBox(`!{#00FF00}${name} removed from whitelist.`);
});

mp.events.add('getChatLogs', (player) => {
    if (!player.getVariable('isAdmin')) return;
    
    const logs = adminCommands.getChatLogs();
    player.call('updateChatLogs', [logs]);
});

mp.events.add('getReports', (player) => {
    if (!player.getVariable('isAdmin')) return;
    
    const reports = adminCommands.getReports();
    player.call('updateReports', [reports]);
});

mp.events.add('handleReport', (player, reportId, action) => {
    if (!player.getVariable('isAdmin')) return;
    
    adminCommands.handleReport(reportId, action);
    player.outputChatBox(`!{#00FF00}Report ${action === 'accept' ? 'accepted' : 'rejected'}.`);
});

// Log chat messages
mp.events.add('playerChat', (player, message) => {
    const playerName = player.getVariable('characterName') || player.name;
    adminCommands.addChatLog(playerName, message);
});

// Spectate handlers
mp.events.add('startSpectate', (player, targetId) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        player.setVariable('spectating', targetId);
        player.call('spectatePlayer', [target.position, target.heading]);
        player.outputChatBox(`!{#00FF00}Now spectating ${target.name}`);
    }
});

mp.events.add('stopSpectate', (player) => {
    if (!player.getVariable('isAdmin')) return;
    
    player.setVariable('spectating', null);
    player.call('stopSpectating');
    player.outputChatBox('!{#00FF00}Stopped spectating');
});

// Screenshot handler
mp.events.add('takeScreenshot', (player, targetId) => {
    if (!player.getVariable('isAdmin')) return;
    
    const target = mp.players.at(targetId);
    if (target) {
        // Note: Screenshot functionality requires additional setup on client
        target.call('takeScreenshotRequest');
        player.outputChatBox(`!{#00FF00}Screenshot requested from ${target.name}`);
    }
});

// World toggle client-side events (send to all players)
mp.events.add('toggleTraffic', (enabled) => {
    mp.players.forEach(p => {
        p.call('setTrafficEnabled', [enabled]);
    });
});

mp.events.add('togglePeds', (enabled) => {
    mp.players.forEach(p => {
        p.call('setPedsEnabled', [enabled]);
    });
});

mp.events.add('togglePolice', (enabled) => {
    mp.players.forEach(p => {
        p.call('setPoliceEnabled', [enabled]);
    });
});

console.log('[Admin Commands Enhanced] Loaded successfully');

module.exports = adminCommands;
