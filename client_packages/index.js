/**
 * RAGE:MP Roleplay Client - Main Entry Point
 * This file loads all client-side scripts in the correct order
 */

console.log('=================================');
console.log('Loading Client-Side Scripts...');
console.log('=================================');

// Core modules (must load first)
require('./modules/auth.js');
require('./modules/hud.js');
require('./modules/banking.js');
require('./modules/inventory.js');
require('./modules/shops.js');
require('./modules/jobs.js');
require('./modules/vehicles.js');
require('./modules/animations.js');
require('./modules/markers.js');
require('./modules/interactions.js'); // Must load last!

console.log('[Client] Core modules loaded');

// New enhanced handlers
require('./auth.js');              // Modern authentication handler
require('./hud-handler.js');       // Modern live HUD
require('./inventory.js');         // Enhanced inventory handler
require('./admin-menu-handler.js'); // Admin menu (F6) - Basic
require('./admin-menu-handler-enhanced.js'); // Admin menu (F6) - Enhanced
require('./admin-utils.js');       // Admin utilities (freeze, appearance, etc.)
require('./user-menu-handler.js'); // User menu (M key)
require('./bot-cars.js');          // Bot cars system
require('./character-creation-handler.js'); // Character creation

console.log('[Client] Enhanced handlers loaded');

console.log('=================================');
console.log('All Client-Side Scripts Loaded!');
console.log('=================================');

// Configure default HUD elements
mp.game.ui.displayRadar(true);
mp.game.ui.displayHud(true);

// Player spawn event
mp.events.add('playerReady', () => {
    console.log('[Client] Player ready!');
    console.log('[Client] Press I for Inventory');
    console.log('[Client] Press M for User Menu');
    console.log('[Client] Press F5 to toggle HUD');
    console.log('[Client] Press F6 for Admin Menu (if admin)');
});

// Chat command (T key)
mp.keys.bind(0x54, false, () => { // T key
    mp.gui.execute('mp.invoke("focus", true)');
    mp.gui.chat.activate(true);
});

// Help command (F1 key)
mp.keys.bind(0x70, false, () => { // F1 key
    mp.gui.chat.push(`
    === CONTROLS ===
    I - Inventory
    M - User Menu
    F - Enter Vehicle
    CTRL - Start Engine / Toggle Engine
    L - Lock/Unlock Vehicle
    F5 - Toggle HUD
    F6 - Admin Menu (admins)
    T - Chat
    F1 - This help
    `);
});
