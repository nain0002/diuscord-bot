// RAGE:MP Roleplay Server
// Main Entry Point

console.log('========================================');
console.log('  RAGE:MP Roleplay Server Starting...  ');
console.log('========================================');

const db = require('./database/db');
const shops = require('./modules/shops/shops');
const jobs = require('./modules/jobs/jobs');

// Initialize database
async function init() {
    try {
        // Connect to database
        const connected = await db.connect();
        
        if (!connected) {
            console.error('[Server] Failed to connect to database. Server stopping...');
            process.exit(1);
        }
        
        // Load shops
        await shops.loadShops();
        
        // Load jobs
        await jobs.loadJobs();
        
        // Load event handlers
        require('./events/playerEvents');
        
        // Load commands
        require('./commands/commands');
        
        // Salary timer (every 30 minutes)
        setInterval(async () => {
            const players = mp.players.toArray();
            for (const player of players) {
                if (player.loggedIn && player.characterId) {
                    await jobs.paySalary(player);
                }
            }
            console.log('[Server] Salaries paid to all players');
        }, 30 * 60 * 1000); // 30 minutes
        
        // Save all players timer (every 5 minutes)
        const characterManager = require('./modules/character/character');
        setInterval(async () => {
            const players = mp.players.toArray();
            for (const player of players) {
                if (player.loggedIn && player.characterId) {
                    await characterManager.savePosition(player);
                }
            }
            console.log('[Server] All player data saved');
        }, 5 * 60 * 1000); // 5 minutes
        
        console.log('========================================');
        console.log('  Server Started Successfully!         ');
        console.log('  Players can now connect              ');
        console.log('========================================');
        
    } catch (error) {
        console.error('[Server] Initialization error:', error);
        process.exit(1);
    }
}

// Start server
init();

// Handle server events
mp.events.add('serverShutdown', () => {
    console.log('[Server] Server shutting down...');
    // Save all player data before shutdown
    const characterManager = require('./modules/character/character');
    const players = mp.players.toArray();
    players.forEach(async (player) => {
        if (player.loggedIn && player.characterId) {
            await characterManager.savePosition(player);
        }
    });
});

// Shop interaction
mp.events.add('server:openShop', async (player, shopId) => {
    const items = await shops.getShopItems(shopId);
    player.call('client:openShopMenu', [JSON.stringify(items)]);
});

mp.events.add('server:buyItem', async (player, shopId, itemId, quantity) => {
    const result = await shops.purchaseItem(player, shopId, itemId, quantity);
    
    if (result.success) {
        const helpers = require('./utils/helpers');
        helpers.sendSuccess(player, result.message);
    } else {
        const helpers = require('./utils/helpers');
        helpers.sendError(player, result.message);
    }
});

// Job interaction
mp.events.add('server:acceptJob', async (player, jobName) => {
    const result = await jobs.setJob(player, jobName);
    
    const helpers = require('./utils/helpers');
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});

mp.events.add('server:completeJobTask', async (player) => {
    const result = await jobs.completeJob(player);
    
    const helpers = require('./utils/helpers');
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
        helpers.sendError(player, result.message);
    }
});
