/**
 * RAGE:MP Roleplay Server - Main Entry Point
 * This is the main server-side entry point that initializes all modules
 * 
 * IMPORTANT: This file must be executed by the RAGE:MP server (server.exe),
 * NOT by Node.js directly! The 'mp' global is only available when running
 * through the RAGE:MP server executable.
 */

// Load .env from RAGE:MP root folder (server-files/)
// This file is executed from packages/rp-server/, so we need to go up to root
const path = require('path');
const envPath = path.join(__dirname, '../../.env');

try {
    require('dotenv').config({ path: envPath });
    console.log('[Server] Environment variables loaded');
} catch (e) {
    console.log('[Server] .env file not found, using default values');
}

const database = require('./modules/database');

console.log('=================================');
console.log('RAGE:MP Roleplay Server Starting');
console.log('=================================');

// Note: The 'mp' global should be available when this runs
// If you see errors about 'mp is not defined', check:
// 1. conf.json has "enable-nodejs": true
// 2. You're running ragemp-server.exe (not node)
console.log('[Server] Initializing modules...');

// Initialize database connection
database.connect();

// Load all modules (these require 'mp' to be available)
require('./modules/player');
require('./modules/registration');
require('./modules/character');
require('./modules/banking');
// require('./modules/inventory'); // Old inventory - disabled
require('./modules/inventory-modern'); // Modern inventory system
require('./modules/inventory-commands'); // Inventory admin commands
require('./modules/shops');
require('./modules/jobs');
require('./modules/vehicles');
require('./modules/admin');
require('./modules/spawn');
require('./modules/admin-bridge');
// Note: admin-permissions loads automatically after database is ready
require('./modules/admin-commands');
require('./modules/admin-commands-enhanced');
require('./modules/user-menu');
require('./modules/character-creator');

console.log('=================================');
console.log('Server Initialization Complete!');
console.log('=================================');

// Server events
mp.events.add('playerJoin', (player) => {
    console.log(`${player.name} is connecting to the server...`);
});

mp.events.add('playerQuit', (player, exitType, reason) => {
    console.log(`${player.name} left the server. Reason: ${reason}`);
});
