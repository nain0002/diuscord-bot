/**
 * RAGE:MP Roleplay Server - Main Entry Point (FIXED)
 * Consolidated and optimized module loading
 */

const path = require('path');
const envPath = path.join(__dirname, '../../.env');

try {
    require('dotenv').config({ path: envPath });
    console.log('[Server] Environment variables loaded');
} catch (e) {
    console.log('[Server] .env file not found, using default values');
}

console.log('=================================');
console.log('RAGE:MP Roleplay Server Starting');
console.log('=================================');

// Initialize database connection FIRST
const database = require('./modules/database');
database.connect();

// CRITICAL: Load modules in correct order
console.log('[Server] Loading core modules...');

// 1. Core player system
require('./modules/player');

// 2. Authentication (NEW - replaces old registration/character modules for auth)
require('./modules/auth-fixed');

// 3. Banking system
require('./modules/banking');

// 4. Inventory system (modern only)
require('./modules/inventory-modern');
require('./modules/inventory-commands');

// 5. Economy systems
require('./modules/shops');
require('./modules/jobs');
require('./modules/vehicles');

// 6. Spawn and basic commands
require('./modules/spawn');

// 7. Admin systems
require('./modules/admin-fixed'); // Fixed admin module
require('./modules/admin-commands');
require('./modules/admin-commands-enhanced');
require('./modules/admin-bridge');
// admin-permissions loads automatically after database is ready

// 8. UI systems
require('./modules/user-menu');
require('./modules/character-creator');

console.log('[Server] All modules loaded successfully!');
console.log('=================================');
console.log('Server Initialization Complete!');
console.log('=================================');

// Server events
mp.events.add('playerJoin', (player) => {
    console.log(`[Server] ${player.name} is connecting...`);
});

mp.events.add('playerQuit', (player, exitType, reason) => {
    console.log(`[Server] ${player.name} left. Reason: ${reason}`);
});

module.exports = {};
