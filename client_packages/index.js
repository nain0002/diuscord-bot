/**
 * RAGE:MP Roleplay Client - Main Entry Point
 */

require('./modules/auth.js');
require('./modules/hud.js');
require('./modules/banking.js');
require('./modules/shops.js');
require('./modules/jobs.js');
require('./modules/vehicles.js');
require('./modules/animations.js');
require('./modules/markers.js');

console.log('=================================');
console.log('Client-side scripts loaded!');
console.log('=================================');

// Disable default HUD elements
mp.game.ui.displayRadar(true);
mp.game.ui.displayHud(true);

// Player spawn event
mp.events.add('playerReady', () => {
    console.log('Player ready!');
});

// Chat command
mp.keys.bind(0x54, false, () => { // T key
    mp.gui.execute('mp.invoke("focus", true)');
    mp.gui.chat.activate(true);
});
