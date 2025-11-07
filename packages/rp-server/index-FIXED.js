// RAGE:MP Roleplay Server - FIXED VERSION
// Main Entry Point with Banking Integration

console.log('========================================');
console.log('  RAGE:MP Roleplay Server Starting...  ');
console.log('========================================');

const db = require('./database/db');
const shops = require('./modules/shops/shops');
const jobs = require('./modules/jobs/jobs');
const enhancedBanking = require('./modules/banking/enhanced-banking');

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
        
        // Load bank locations - FIXED: Added bank loading
        await loadBankLocations();
        
        // Load ATM locations - FIXED: Added ATM loading
        await loadATMLocations();
        
        // Load event handlers
        require('./events/playerEvents');
        
        // FIXED: Load banking events
        require('./events/banking-events');
        
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
        
        // FIXED: Apply interest monthly
        setInterval(async () => {
            await enhancedBanking.applyInterest();
            console.log('[Server] Monthly interest applied');
        }, 30 * 24 * 60 * 60 * 1000); // 30 days
        
        console.log('========================================');
        console.log('  Server Started Successfully!         ');
        console.log('  Players can now connect              ');
        console.log('========================================');
        
    } catch (error) {
        console.error('[Server] Initialization error:', error);
        process.exit(1);
    }
}

// FIXED: Load bank locations function
async function loadBankLocations() {
    try {
        const banks = await db.query('SELECT * FROM bank_locations');
        
        banks.forEach(bank => {
            // Create colshape for interaction
            const colshape = mp.colshapes.newSphere(
                bank.position_x,
                bank.position_y,
                bank.position_z,
                5.0,
                bank.dimension
            );
            colshape.bankId = bank.id;
            colshape.bankData = bank;
            colshape.isBank = true;
            
            // Create blip on map
            const blip = mp.blips.new(
                bank.blip_sprite || 108,
                new mp.Vector3(bank.position_x, bank.position_y, bank.position_z),
                {
                    name: bank.name,
                    color: bank.blip_color || 2,
                    shortRange: true,
                    dimension: bank.dimension
                }
            );
            
            // Create marker
            const marker = mp.markers.new(
                1,
                new mp.Vector3(bank.position_x, bank.position_y, bank.position_z - 1),
                1.5,
                {
                    color: [0, 255, 0, 100],
                    dimension: bank.dimension,
                    visible: true
                }
            );
        });
        
        console.log(`[Banking] Loaded ${banks.length} bank locations with colshapes`);
    } catch (error) {
        console.error('[Banking] Error loading bank locations:', error);
    }
}

// FIXED: Load ATM locations function
async function loadATMLocations() {
    try {
        const atms = await db.query('SELECT * FROM atm_locations WHERE status = \'Active\'');
        
        atms.forEach(atm => {
            // Create colshape for interaction
            const colshape = mp.colshapes.newSphere(
                atm.position_x,
                atm.position_y,
                atm.position_z,
                2.0
            );
            colshape.atmId = atm.id;
            colshape.atmData = atm;
            colshape.isATM = true;
            
            // Create marker
            const marker = mp.markers.new(
                1,
                new mp.Vector3(atm.position_x, atm.position_y, atm.position_z - 1),
                0.8,
                {
                    color: [0, 255, 255, 100],
                    visible: true
                }
            );
        });
        
        console.log(`[Banking] Loaded ${atms.length} ATM locations`);
    } catch (error) {
        console.error('[Banking] Error loading ATM locations:', error);
    }
}

// Start server
init();

// Handle server events
mp.events.add('serverShutdown', async () => {
    console.log('[Server] Server shutting down...');
    
    // Save all player data before shutdown
    const characterManager = require('./modules/character/character');
    const players = mp.players.toArray();
    
    // FIXED: Use Promise.all for faster shutdown
    await Promise.all(players.map(async (player) => {
        if (player.loggedIn && player.characterId) {
            await characterManager.savePosition(player);
            await enhancedBanking.endSession(player);
        }
    }));
    
    console.log('[Server] All player data saved');
});

// Shop interaction
mp.events.add('server:openShop', async (player, shopId) => {
    const items = await shops.getShopItems(shopId);
    player.call('client:openShopMenu', [JSON.stringify(items)]);
});

mp.events.add('server:buyItem', async (player, shopId, itemId, quantity) => {
    const result = await shops.purchaseItem(player, shopId, itemId, quantity);
    
    const helpers = require('./utils/helpers');
    if (result.success) {
        helpers.sendSuccess(player, result.message);
    } else {
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

// FIXED: Add colshape enter/exit handlers
mp.events.add('playerEnterColshape', (player, shape) => {
    if (shape.isBank) {
        player.currentBankId = shape.bankId;
        player.call('client:showBankPrompt', [shape.bankData.name]);
    }
    
    if (shape.isATM) {
        player.currentATMId = shape.atmId;
        player.call('client:showATMPrompt');
    }
    
    // Existing shop/job code
    if (shape.shopId) {
        player.call('client:showShopPrompt', [shape.shopData.name, shape.shopId]);
    }
    
    if (shape.isJobPoint) {
        player.call('client:showJobPrompt', [shape.jobName]);
    }
});

mp.events.add('playerExitColshape', (player, shape) => {
    if (shape.isBank) {
        player.currentBankId = null;
        player.call('client:hidePrompts');
    }
    
    if (shape.isATM) {
        player.currentATMId = null;
        player.call('client:hidePrompts');
    }
    
    if (shape.shopId || shape.isJobPoint) {
        player.call('client:hidePrompts');
    }
});
