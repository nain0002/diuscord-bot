/**
 * Player Module
 * Handles player data and related functions
 */

const database = require('./database');

// Player data storage
const playerData = new Map();

// Player join event
mp.events.add('playerJoin', async (player) => {
    console.log(`[Player] ${player.name} joined the server`);
    
    // Initialize player data
    playerData.set(player, {
        loggedIn: false,
        authenticated: false,
        userId: null,
        characterId: null,
        characterData: null
    });

    // Show login/registration screen
    player.dimension = player.id + 1; // Unique dimension for each player
    player.position = new mp.Vector3(-1037.8, -2738.5, 13.8);
    player.heading = 0;
    player.frozen = true;
    
    // Trigger client-side login screen
    player.call('client:showAuthScreen');
});

// Player quit event
mp.events.add('playerQuit', async (player, exitType, reason) => {
    const data = playerData.get(player);
    
    if (data && data.characterId) {
        // Save player data before they quit
        await savePlayerData(player);
    }
    
    playerData.delete(player);
    console.log(`[Player] ${player.name} left the server`);
});

// Save player data to database
async function savePlayerData(player) {
    const data = playerData.get(player);
    
    if (!data || !data.characterId) return;

    try {
        const pos = player.position;
        await database.query(
            `UPDATE characters SET 
                position_x = ?, position_y = ?, position_z = ?, heading = ?,
                health = ?, armor = ?, money = ?,
                last_played = NOW()
            WHERE id = ?`,
            [pos.x, pos.y, pos.z, player.heading, player.health, player.armour, 
             data.characterData.money, data.characterId]
        );
        
        console.log(`[Player] Saved data for ${player.name}`);
    } catch (error) {
        console.error('[Player] Error saving player data:', error);
    }
}

// Get player data
function getPlayerData(player) {
    return playerData.get(player);
}

// Set player data
function setPlayerData(player, key, value) {
    const data = playerData.get(player);
    if (data) {
        data[key] = value;
        playerData.set(player, data);
    }
}

// Give money to player
function giveMoney(player, amount) {
    const data = playerData.get(player);
    if (data && data.characterData) {
        data.characterData.money += amount;
        player.call('client:updateMoney', [data.characterData.money]);
        return true;
    }
    return false;
}

// Take money from player
function takeMoney(player, amount) {
    const data = playerData.get(player);
    if (data && data.characterData && data.characterData.money >= amount) {
        data.characterData.money -= amount;
        player.call('client:updateMoney', [data.characterData.money]);
        return true;
    }
    return false;
}

// Get player money
function getMoney(player) {
    const data = playerData.get(player);
    return data && data.characterData ? data.characterData.money : 0;
}

// Auto-save every 5 minutes
setInterval(() => {
    mp.players.forEach(async (player) => {
        const data = playerData.get(player);
        if (data && data.characterId) {
            await savePlayerData(player);
        }
    });
    console.log('[Player] Auto-save completed for all players');
}, 300000); // 5 minutes

module.exports = {
    getPlayerData,
    setPlayerData,
    savePlayerData,
    giveMoney,
    takeMoney,
    getMoney
};
