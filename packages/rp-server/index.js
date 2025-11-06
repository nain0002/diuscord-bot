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

// CRITICAL: Verify RAGE:MP 'mp' global is available
if (typeof mp === 'undefined') {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════╗');
    console.error('║                                                            ║');
    console.error('║  ❌ CRITICAL ERROR: RAGE:MP "mp" global not found!        ║');
    console.error('║                                                            ║');
    console.error('║  This means you are running this code with Node.js        ║');
    console.error('║  instead of the RAGE:MP server executable!                ║');
    console.error('║                                                            ║');
    console.error('║  HOW TO FIX:                                               ║');
    console.error('║  1. Navigate to your server-files directory                ║');
    console.error('║  2. Run: server.exe (or ragemp-server.exe)                ║');
    console.error('║  3. DO NOT run: node index.js or npm start                ║');
    console.error('║                                                            ║');
    console.error('║  Location: C:\\RAGEMP\\server-files\\                       ║');
    console.error('║  Command:  server.exe                                      ║');
    console.error('║                                                            ║');
    console.error('║  See CRITICAL_ERROR_FIX.md for detailed instructions       ║');
    console.error('║                                                            ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('');
    process.exit(1);
}

console.log('[Server] ✅ RAGE:MP environment detected');

// Initialize database connection
database.connect();

// Load all modules (these require 'mp' to be available)
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
