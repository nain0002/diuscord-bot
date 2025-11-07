// RAGE:MP Client-side Entry Point - FIXED VERSION
mp.gui.cursor.show(false, false);

// FIXED: Load banking client integration
require('./banking-client.js');

// Client-side variables
let loginBrowser = null;
let characterBrowser = null;
let shopBrowser = null;
let inventoryBrowser = null;
let isFrozen = false;

// Freeze player
mp.events.add('client:freezePlayer', (freeze) => {
    isFrozen = freeze;
    mp.players.local.freezePosition(freeze);
    
    if (freeze) {
        mp.game.ui.displayRadar(false);
    } else {
        mp.game.ui.displayRadar(true);
    }
});

// Show login screen
mp.events.add('client:showLoginScreen', () => {
    if (loginBrowser) {
        loginBrowser.destroy();
    }
    
    loginBrowser = mp.browsers.new('package://client/ui/login.html');
    mp.gui.cursor.show(true, true);
    mp.gui.chat.show(false);
});

// Show character selection
mp.events.add('client:showCharacterSelection', (charactersJSON) => {
    if (loginBrowser) {
        loginBrowser.destroy();
        loginBrowser = null;
    }
    
    if (characterBrowser) {
        characterBrowser.destroy();
    }
    
    characterBrowser = mp.browsers.new('package://client/ui/character-selection.html');
    
    setTimeout(() => {
        characterBrowser.execute(`setCharacters('${charactersJSON}');`);
    }, 500);
    
    mp.gui.cursor.show(true, true);
});

// Show character creator
mp.events.add('client:showCharacterCreator', (characterId) => {
    if (characterBrowser) {
        characterBrowser.destroy();
        characterBrowser = null;
    }
    
    characterBrowser = mp.browsers.new('package://client/ui/character-creator.html');
    
    setTimeout(() => {
        characterBrowser.execute(`setCharacterId(${characterId});`);
    }, 500);
    
    mp.gui.cursor.show(true, true);
});

// Apply character appearance
mp.events.add('client:applyAppearance', (appearanceJSON) => {
    const appearance = JSON.parse(appearanceJSON);
    const player = mp.players.local;
    
    // Set player model based on gender
    const model = appearance.gender === 0 ? mp.game.joaat('mp_m_freemode_01') : mp.game.joaat('mp_f_freemode_01');
    player.model = model;
    
    // Apply head blend
    mp.game.invoke('0x9414E18B9434C2FE', player.handle, 
        appearance.mother, appearance.father, 0,
        appearance.mother, appearance.father, 0,
        appearance.similarity, appearance.skin_similarity, 0.0, false);
    
    // Apply face features
    const features = [
        appearance.nose_width, appearance.nose_height, appearance.nose_length,
        appearance.nose_bridge, appearance.nose_tip, appearance.nose_shift,
        appearance.brow_height, appearance.brow_width, appearance.cheekbone_height,
        appearance.cheekbone_width, appearance.cheeks_width, appearance.eyes,
        appearance.lips, appearance.jaw_width, appearance.jaw_height,
        appearance.chin_length, appearance.chin_position, appearance.chin_width,
        appearance.chin_shape, appearance.neck_width
    ];
    
    for (let i = 0; i < features.length; i++) {
        mp.game.invoke('0x71A5C1DBA060049E', player.handle, i, features[i]);
    }
    
    // Apply hair
    mp.game.invoke('0xD710A5007C2AC539', player.handle, 2, appearance.hair, 0);
    mp.game.invoke('0x4CFFC65454C93A49', player.handle, 2, appearance.haircolor, appearance.highlightcolor);
    
    // Apply eye color
    mp.game.invoke('0x50B56988B170AFDF', player.handle, appearance.eyecolor);
});

// Close all UIs
mp.events.add('client:closeAllUIs', () => {
    if (loginBrowser) {
        loginBrowser.destroy();
        loginBrowser = null;
    }
    if (characterBrowser) {
        characterBrowser.destroy();
        characterBrowser = null;
    }
    if (shopBrowser) {
        shopBrowser.destroy();
        shopBrowser = null;
    }
    if (inventoryBrowser) {
        inventoryBrowser.destroy();
        inventoryBrowser = null;
    }
    
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(true);
});

// Notifications
mp.events.add('client:showNotification', (message, type) => {
    mp.game.ui.setNotificationTextEntry('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(message);
    
    // Set notification color based on type
    switch (type) {
        case 'error':
            mp.game.ui.setNotificationColorNext(6); // Red
            break;
        case 'success':
            mp.game.ui.setNotificationColorNext(2); // Green
            break;
        default:
            mp.game.ui.setNotificationColorNext(0); // Default
    }
    
    mp.game.ui.drawNotification(false, true);
});

// FIXED: Add bank and ATM prompts
mp.events.add('client:showBankPrompt', (bankName) => {
    // Show help text
    mp.game.ui.setTextComponentFormat('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to access ${bankName}`);
    mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
});

mp.events.add('client:showATMPrompt', () => {
    mp.game.ui.setTextComponentFormat('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName('Press ~INPUT_CONTEXT~ to use ATM');
    mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
});

mp.events.add('client:hidePrompts', () => {
    // Prompts auto-hide
});

// Shop prompts
mp.events.add('client:showShopPrompt', (shopName, shopId) => {
    mp.game.ui.setTextComponentFormat('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to open ${shopName}`);
    mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
    
    // Store shop ID for interaction
    mp.game.graphics.setScriptGfxDrawOrder(1);
    currentShopId = shopId;
});

// Job prompts
mp.events.add('client:showJobPrompt', (jobName) => {
    mp.game.ui.setTextComponentFormat('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to apply for ${jobName} job`);
    mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
    
    currentJobName = jobName;
});

// Shop menu
mp.events.add('client:openShopMenu', (itemsJSON) => {
    if (shopBrowser) {
        shopBrowser.destroy();
    }
    
    shopBrowser = mp.browsers.new('package://client/ui/shop.html');
    
    setTimeout(() => {
        shopBrowser.execute(`setItems('${itemsJSON}');`);
    }, 500);
    
    mp.gui.cursor.show(true, true);
});

// Inventory
mp.events.add('client:showInventory', (inventoryJSON) => {
    if (inventoryBrowser) {
        inventoryBrowser.destroy();
    }
    
    inventoryBrowser = mp.browsers.new('package://client/ui/inventory.html');
    
    setTimeout(() => {
        inventoryBrowser.execute(`setInventory('${inventoryJSON}');`);
    }, 500);
    
    mp.gui.cursor.show(true, true);
});

// Job waypoints
let currentJobWaypoint = null;

mp.events.add('client:startTaxiJob', (jobDataJSON) => {
    const jobData = JSON.parse(jobDataJSON);
    
    // Create waypoint for pickup
    if (currentJobWaypoint) {
        mp.game.ui.setNewWaypoint(jobData.pickup.x, jobData.pickup.y);
    }
});

mp.events.add('client:startTruckerJob', (jobDataJSON) => {
    const jobData = JSON.parse(jobDataJSON);
    
    // Create waypoint for delivery
    mp.game.ui.setNewWaypoint(jobData.delivery.x, jobData.delivery.y);
});

mp.events.add('client:startBusJob', (jobDataJSON) => {
    const jobData = JSON.parse(jobDataJSON);
    
    // Create waypoint for first stop
    if (jobData.stops.length > 0) {
        mp.game.ui.setNewWaypoint(jobData.stops[0].x, jobData.stops[0].y);
    }
});

// FIXED: Key bindings - removed duplicate currentShopId/currentJobName declarations
let currentShopId = null;
let currentJobName = null;

mp.keys.bind(0x45, true, () => { // E key
    if (isFrozen) return;
    
    if (currentShopId) {
        mp.events.callRemote('server:openShop', currentShopId);
    }
    
    if (currentJobName) {
        mp.events.callRemote('server:acceptJob', currentJobName);
    }
});

mp.keys.bind(0x49, true, () => { // I key
    if (isFrozen) return;
    mp.events.callRemote('server:getInventory');
});

console.log('[Client] Client scripts loaded successfully');
