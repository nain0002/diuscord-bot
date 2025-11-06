// Player Event Handlers
const auth = require('../modules/player/authentication');
const characterManager = require('../modules/character/character');
const helpers = require('../utils/helpers');

// Player join
mp.events.add('playerJoin', (player) => {
    console.log(`[Server] ${player.socialClub} joined the server`);
    
    // Initialize player data
    player.loggedIn = false;
    player.playerId = null;
    player.characterId = null;
    player.characterData = null;
    
    // Freeze player
    player.call('client:freezePlayer', [true]);
    
    // Show login screen
    setTimeout(() => {
        player.call('client:showLoginScreen');
    }, 1000);
});

// Player quit
mp.events.add('playerQuit', async (player, exitType, reason) => {
    console.log(`[Server] ${player.socialClub} left the server`);
    
    // Save character data if logged in
    if (player.loggedIn && player.characterId) {
        await characterManager.savePosition(player);
        console.log(`[Server] Saved character data for ${player.name}`);
    }
});

// Player death
mp.events.add('playerDeath', (player, reason, killer) => {
    console.log(`[Server] ${player.name} died`);
    
    // Respawn after 10 seconds
    setTimeout(() => {
        if (mp.players.exists(player)) {
            player.spawn(new mp.Vector3(-425.517, 1123.620, 325.8544));
            player.health = 100;
            helpers.sendNotification(player, 'You have been respawned', 'info');
        }
    }, 10000);
});

// Player chat
mp.events.add('playerChat', (player, message) => {
    if (!player.loggedIn || !player.characterId) {
        helpers.sendError(player, 'You must be logged in to chat');
        return;
    }
    
    // Broadcast message to nearby players
    const players = mp.players.toArray();
    const chatRange = 20; // meters
    
    players.forEach(p => {
        if (p !== player && helpers.getDistance(player.position, p.position) <= chatRange) {
            p.outputChatBox(`${player.name}: ${message}`);
        }
    });
    
    player.outputChatBox(`${player.name}: ${message}`);
});

// Registration
mp.events.add('server:register', async (player, username, password, email) => {
    const result = await auth.register(player, username, password, email);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.playerId = result.playerId;
        player.loggedIn = true;
        
        // Show character selection
        setTimeout(() => {
            player.call('client:showCharacterSelection', [JSON.stringify([])]);
        }, 1000);
    } else {
        helpers.sendError(player, result.message);
        player.call('client:registrationFailed', [result.message]);
    }
});

// Login
mp.events.add('server:login', async (player, username, password) => {
    const result = await auth.login(player, username, password);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.playerId = result.playerId;
        player.loggedIn = true;
        
        // Get player's characters
        const characters = await characterManager.getCharacters(result.playerId);
        
        setTimeout(() => {
            player.call('client:showCharacterSelection', [JSON.stringify(characters)]);
        }, 1000);
    } else {
        helpers.sendError(player, result.message);
        player.call('client:loginFailed', [result.message]);
    }
});

// Create character
mp.events.add('server:createCharacter', async (player, firstName, lastName, age, gender) => {
    if (!player.loggedIn) {
        helpers.sendError(player, 'You must be logged in');
        return;
    }
    
    const result = await characterManager.createCharacter(player.playerId, {
        firstName: firstName,
        lastName: lastName,
        age: parseInt(age),
        gender: gender
    });
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        
        // Show character creator
        player.call('client:showCharacterCreator', [result.characterId]);
    } else {
        helpers.sendError(player, result.message);
    }
});

// Save character appearance
mp.events.add('server:saveAppearance', async (player, characterId, appearanceJSON) => {
    const appearance = JSON.parse(appearanceJSON);
    const result = await characterManager.saveAppearance(characterId, appearance);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        
        // Load character
        const loadResult = await characterManager.loadCharacter(player, characterId);
        if (loadResult.success) {
            player.call('client:freezePlayer', [false]);
            player.call('client:closeAllUIs');
        }
    } else {
        helpers.sendError(player, result.message);
    }
});

// Select character
mp.events.add('server:selectCharacter', async (player, characterId) => {
    const result = await characterManager.loadCharacter(player, characterId);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.call('client:freezePlayer', [false]);
        player.call('client:closeAllUIs');
    } else {
        helpers.sendError(player, result.message);
    }
});

// Enter colshape (for shops, jobs, etc.)
mp.events.add('playerEnterColshape', (player, shape) => {
    // Shop colshape
    if (shape.shopId) {
        player.call('client:showShopPrompt', [shape.shopData.name, shape.shopId]);
    }
    
    // Job colshape
    if (shape.isJobPoint) {
        player.call('client:showJobPrompt', [shape.jobName]);
    }
});

// Exit colshape
mp.events.add('playerExitColshape', (player, shape) => {
    if (shape.shopId || shape.isJobPoint) {
        player.call('client:hidePrompts');
    }
});

console.log('[Events] Player events loaded');
