/**
 * RAGE:MP Roleplay Server - Main Entry Point
 * This is the main server-side entry point that initializes all modules
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

// Initialize database connection
database.connect();

// Load all modules
require('./modules/player');
require('./modules/registration');
require('./modules/character');
require('./modules/banking');
require('./modules/inventory');
require('./modules/shops');
require('./modules/jobs');
require('./modules/vehicles');
require('./modules/admin');
require('./modules/spawn');
require('./modules/admin-bridge');

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
