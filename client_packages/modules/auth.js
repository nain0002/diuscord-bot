/**
 * Authentication Client Module
 * Handles login/registration UI
 */

let authBrowser = null;

// Show authentication screen
mp.events.add('client:showAuthScreen', () => {
    if (authBrowser) return;

    mp.gui.cursor.show(true, true);
    
    authBrowser = mp.browsers.new('package://CEF/auth.html');
    
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
});

// Close authentication screen
function closeAuthScreen() {
    if (authBrowser) {
        authBrowser.destroy();
        authBrowser = null;
    }
    
    mp.gui.cursor.show(false, false);
    mp.game.ui.displayHud(true);
    mp.game.ui.displayRadar(true);
}

// Handle auth response from server
mp.events.add('client:authResponse', (type, message) => {
    if (authBrowser) {
        authBrowser.execute(`showMessage('${type}', '${message}')`);
    }
});

// Register button clicked (called from CEF)
mp.events.add('auth:register', (username, password, email) => {
    mp.events.callRemote('server:register', username, password, email);
});

// Login button clicked (called from CEF)
mp.events.add('auth:login', (username, password) => {
    mp.events.callRemote('server:login', username, password);
});

let characterBrowser = null;

// Show character selection
mp.events.add('client:showCharacterSelection', (charactersJson) => {
    closeAuthScreen();
    
    if (characterBrowser) {
        characterBrowser.destroy();
    }
    
    mp.gui.cursor.show(true, true);
    
    characterBrowser = mp.browsers.new('package://CEF/character_selection.html');
    setTimeout(() => {
        characterBrowser.execute(`showCharacters(${charactersJson})`);
    }, 500);
});

let creatorBrowser = null;

// Show character creator
mp.events.add('client:showCharacterCreator', () => {
    closeAuthScreen();
    
    if (characterBrowser) {
        characterBrowser.destroy();
        characterBrowser = null;
    }
    
    if (creatorBrowser) {
        creatorBrowser.destroy();
    }
    
    mp.gui.cursor.show(true, true);
    
    creatorBrowser = mp.browsers.new('package://CEF/character_creator.html');
});

// Handle showCreator event from character selection
mp.events.add('character:showCreator', () => {
    if (characterBrowser) {
        characterBrowser.destroy();
        characterBrowser = null;
    }
    
    mp.events.call('client:showCharacterCreator');
});

// Character response
mp.events.add('client:characterResponse', (type, message) => {
    mp.gui.chat.push(`${message}`);
});

// Character loaded
mp.events.add('client:characterLoaded', (characterDataJson) => {
    // Close all auth/character browsers
    if (characterBrowser) {
        characterBrowser.destroy();
        characterBrowser = null;
    }
    if (creatorBrowser) {
        creatorBrowser.destroy();
        creatorBrowser = null;
    }
    
    mp.gui.cursor.show(false, false);
    mp.game.ui.displayHud(true);
    mp.game.ui.displayRadar(true);
    
    const characterData = JSON.parse(characterDataJson);
    mp.gui.chat.push(`Welcome back, ${characterData.name}!`);
    
    // Initialize HUD with character data
    mp.events.call('hud:updateAll', characterData);
});

// Create character (called from CEF)
mp.events.add('character:create', (firstName, lastName, age, gender, skinData) => {
    mp.events.callRemote('server:createCharacter', firstName, lastName, age, gender, skinData);
});

// Select character (called from CEF)
mp.events.add('character:select', (characterId) => {
    mp.events.callRemote('server:selectCharacter', characterId);
});

// Delete character (called from CEF)
mp.events.add('character:delete', (characterId) => {
    mp.events.callRemote('server:deleteCharacter', characterId);
});

console.log('[Client] Auth module loaded');
