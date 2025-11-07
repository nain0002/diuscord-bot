/**
 * RAGE:MP Elite HUD - Server-Side System
 * Version: 3.0.0
 * Manages HUD data and communication with clients
 */

const database = require('./database');

// ============================================
// HUD DATA MANAGEMENT
// ============================================

/**
 * Get complete HUD data for a player
 * @param {Player} player - The player object
 * @returns {Object} HUD data object
 */
async function getPlayerHUDData(player) {
    try {
        if (!player || !mp.players.exists(player)) {
            return null;
        }

        const characterId = player.getVariable('character_id');
        if (!characterId) {
            return null;
        }

        // Get character data from database
        const [rows] = await database.query(
            `SELECT 
                c.name,
                c.level,
                c.money,
                c.bank_balance,
                c.xp,
                c.hunger,
                c.thirst,
                u.username
            FROM characters c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`,
            [characterId]
        );

        if (rows.length === 0) {
            return null;
        }

        const char = rows[0];

        // Get player health and armor from RAGE:MP
        const health = player.health || 100;
        const armor = player.armour || 0;

        // Calculate XP max based on level
        const xpMax = calculateXPRequired(char.level);

        const hudData = {
            name: char.name || char.username,
            level: char.level || 1,
            health: Math.min(100, Math.max(0, health)),
            armor: Math.min(100, Math.max(0, armor)),
            hunger: Math.min(100, Math.max(0, char.hunger || 100)),
            thirst: Math.min(100, Math.max(0, char.thirst || 100)),
            xp: char.xp || 0,
            xpMax: xpMax,
            cash: char.money || 0,
            bank: char.bank_balance || 0
        };

        return hudData;

    } catch (error) {
        console.error('[HUD System] Error getting player HUD data:', error);
        return null;
    }
}

/**
 * Calculate XP required for next level
 * @param {number} level - Current level
 * @returns {number} XP required
 */
function calculateXPRequired(level) {
    return Math.floor(1000 * Math.pow(1.15, level - 1));
}

/**
 * Send full HUD data to player
 * @param {Player} player - The player object
 */
async function sendHUDData(player) {
    try {
        if (!player || !mp.players.exists(player)) {
            return;
        }

        const hudData = await getPlayerHUDData(player);
        if (hudData) {
            const jsonData = JSON.stringify(hudData);
            player.call('updateHUDData', [jsonData]);
        }
    } catch (error) {
        console.error('[HUD System] Error sending HUD data:', error);
    }
}

/**
 * Update specific HUD element for player
 * @param {Player} player - The player object
 * @param {string} element - Element to update
 * @param {any} data - Data to send
 */
function updateHUDElement(player, element, data) {
    try {
        if (!player || !mp.players.exists(player)) {
            return;
        }

        switch (element) {
            case 'money':
                player.call('updateHUDMoney', [data.cash, data.bank]);
                break;

            case 'xp':
                const xpMax = calculateXPRequired(data.level || 1);
                player.call('updateHUDXP', [data.xp, xpMax]);
                break;

            case 'hunger':
                player.call('updateHUDHunger', [data.value]);
                break;

            case 'thirst':
                player.call('updateHUDThirst', [data.value]);
                break;

            case 'weather':
                player.call('updateHUDWeather', [data.type, data.icon]);
                break;

            case 'mission':
                const objectives = JSON.stringify(data.objectives || []);
                player.call('updateHUDMission', [
                    data.active,
                    data.title,
                    objectives,
                    data.distance
                ]);
                break;

            case 'notification':
                player.call('showHUDNotification', [
                    data.title,
                    data.message,
                    data.type || 'info',
                    data.icon || 'ℹ️'
                ]);
                break;
        }
    } catch (error) {
        console.error('[HUD System] Error updating HUD element:', error);
    }
}

// ============================================
// HUNGER & THIRST SYSTEM
// ============================================

const hungerThirstTimers = new Map();

/**
 * Start hunger/thirst decrease for player
 * @param {Player} player - The player object
 */
function startHungerThirstSystem(player) {
    try {
        if (!player || !mp.players.exists(player)) {
            return;
        }

        const characterId = player.getVariable('character_id');
        if (!characterId) {
            return;
        }

        // Clear existing timer if any
        if (hungerThirstTimers.has(characterId)) {
            clearInterval(hungerThirstTimers.get(characterId));
        }

        // Decrease hunger/thirst every 5 minutes
        const timer = setInterval(async () => {
            if (!mp.players.exists(player)) {
                clearInterval(timer);
                hungerThirstTimers.delete(characterId);
                return;
            }

            try {
                const [rows] = await database.query(
                    'SELECT hunger, thirst FROM characters WHERE id = ?',
                    [characterId]
                );

                if (rows.length === 0) {
                    clearInterval(timer);
                    hungerThirstTimers.delete(characterId);
                    return;
                }

                let hunger = Math.max(0, (rows[0].hunger || 100) - 2);
                let thirst = Math.max(0, (rows[0].thirst || 100) - 3); // Thirst decreases faster

                // Update database
                await database.query(
                    'UPDATE characters SET hunger = ?, thirst = ? WHERE id = ?',
                    [hunger, thirst, characterId]
                );

                // Update HUD
                updateHUDElement(player, 'hunger', { value: hunger });
                updateHUDElement(player, 'thirst', { value: thirst });

                // Apply health penalties if too low
                if (hunger <= 0 || thirst <= 0) {
                    const currentHealth = player.health;
                    player.health = Math.max(0, currentHealth - 5);
                    
                    updateHUDElement(player, 'notification', {
                        title: hunger <= 0 ? 'Starving!' : 'Dehydrated!',
                        message: 'You are losing health!',
                        type: 'error',
                        icon: hunger <= 0 ? '🍔' : '💧'
                    });
                }

            } catch (error) {
                console.error('[HUD System] Hunger/Thirst update error:', error);
            }
        }, 300000); // 5 minutes = 300000ms

        hungerThirstTimers.set(characterId, timer);

    } catch (error) {
        console.error('[HUD System] Error starting hunger/thirst system:', error);
    }
}

/**
 * Stop hunger/thirst system for player
 * @param {Player} player - The player object
 */
function stopHungerThirstSystem(player) {
    try {
        const characterId = player.getVariable('character_id');
        if (characterId && hungerThirstTimers.has(characterId)) {
            clearInterval(hungerThirstTimers.get(characterId));
            hungerThirstTimers.delete(characterId);
        }
    } catch (error) {
        console.error('[HUD System] Error stopping hunger/thirst system:', error);
    }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

/**
 * Save HUD settings for player
 * @param {Player} player - The player object
 * @param {string} settingsJson - Settings JSON string
 */
async function saveHUDSettings(player, settingsJson) {
    try {
        if (!player || !mp.players.exists(player)) {
            return;
        }

        const characterId = player.getVariable('character_id');
        if (!characterId) {
            return;
        }

        // Save settings to database
        await database.query(
            'UPDATE characters SET hud_settings = ? WHERE id = ?',
            [settingsJson, characterId]
        );

        console.log(`[HUD System] Saved settings for character ${characterId}`);

    } catch (error) {
        console.error('[HUD System] Error saving HUD settings:', error);
    }
}

/**
 * Load HUD settings for player
 * @param {Player} player - The player object
 */
async function loadHUDSettings(player) {
    try {
        if (!player || !mp.players.exists(player)) {
            return;
        }

        const characterId = player.getVariable('character_id');
        if (!characterId) {
            return;
        }

        const [rows] = await database.query(
            'SELECT hud_settings FROM characters WHERE id = ?',
            [characterId]
        );

        if (rows.length > 0 && rows[0].hud_settings) {
            player.call('receiveHUDSettings', [rows[0].hud_settings]);
        } else {
            // Send default settings
            const defaultSettings = JSON.stringify({
                showPlayerStatus: true,
                showMoney: true,
                showLocation: true,
                showWeapon: true,
                showVehicle: true,
                showCompass: true,
                showMission: true,
                showWeatherEffects: true,
                theme: 'blue'
            });
            player.call('receiveHUDSettings', [defaultSettings]);
        }

    } catch (error) {
        console.error('[HUD System] Error loading HUD settings:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Send notification to player
 * @param {Player} player - The player object
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {string} icon - Notification icon emoji
 */
function sendHUDNotification(player, title, message, type = 'info', icon = 'ℹ️') {
    updateHUDElement(player, 'notification', { title, message, type, icon });
}

/**
 * Update player money in HUD
 * @param {Player} player - The player object
 * @param {number} cash - Cash amount
 * @param {number} bank - Bank amount
 */
function updateHUDMoney(player, cash, bank) {
    updateHUDElement(player, 'money', { cash, bank });
}

/**
 * Update player XP in HUD
 * @param {Player} player - The player object
 * @param {number} xp - Current XP
 * @param {number} level - Current level
 */
function updateHUDXP(player, xp, level) {
    updateHUDElement(player, 'xp', { xp, level });
}

/**
 * Set active mission in HUD
 * @param {Player} player - The player object
 * @param {Object} mission - Mission data
 */
function setHUDMission(player, mission) {
    updateHUDElement(player, 'mission', mission);
}

/**
 * Update weather in HUD for all players
 * @param {string} weatherType - Weather type name
 * @param {string} icon - Weather icon emoji
 */
function updateWeatherForAll(weatherType, icon) {
    mp.players.forEach(player => {
        if (mp.players.exists(player)) {
            updateHUDElement(player, 'weather', { type: weatherType, icon });
        }
    });
}

// ============================================
// EVENT HANDLERS
// ============================================

// Player requests HUD data
mp.events.add('requestHUDData', async (player) => {
    try {
        await sendHUDData(player);
    } catch (error) {
        console.error('[HUD System] Error handling requestHUDData:', error);
    }
});

// Save HUD settings
mp.events.add('saveHUDSettings', (player, settingsJson) => {
    saveHUDSettings(player, settingsJson);
});

// Load HUD settings
mp.events.add('loadHUDSettings', (player) => {
    loadHUDSettings(player);
});

// Player ready - start systems
mp.events.add('playerReady', (player) => {
    setTimeout(async () => {
        if (mp.players.exists(player)) {
            await sendHUDData(player);
            startHungerThirstSystem(player);
        }
    }, 1000);
});

// Character loaded - send HUD data
mp.events.add('characterLoaded', async (player) => {
    setTimeout(async () => {
        if (mp.players.exists(player)) {
            await sendHUDData(player);
            startHungerThirstSystem(player);
        }
    }, 500);
});

// Player quit - cleanup
mp.events.add('playerQuit', (player) => {
    stopHungerThirstSystem(player);
});

// ============================================
// PERIODIC UPDATES
// ============================================

// Update all players' HUD data every 30 seconds
setInterval(() => {
    mp.players.forEach(async (player) => {
        if (mp.players.exists(player)) {
            const characterId = player.getVariable('character_id');
            if (characterId) {
                await sendHUDData(player);
            }
        }
    });
}, 30000);

// ============================================
// EXPORTS
// ============================================

module.exports = {
    getPlayerHUDData,
    sendHUDData,
    updateHUDElement,
    sendHUDNotification,
    updateHUDMoney,
    updateHUDXP,
    setHUDMission,
    updateWeatherForAll,
    startHungerThirstSystem,
    stopHungerThirstSystem,
    saveHUDSettings,
    loadHUDSettings
};

console.log('[HUD System] Module loaded successfully');
