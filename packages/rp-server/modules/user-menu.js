// User Menu Module
const db = require('./database');

// Request user menu data
mp.events.add('requestUserMenuData', async (player) => {
    try {
        const characterId = player.getVariable('characterId');
        if (!characterId) return;
        
        // Get character data
        const [characters] = await db.query(
            'SELECT * FROM characters WHERE id = ?',
            [characterId]
        );
        
        if (!characters || characters.length === 0) return;
        const character = characters[0];
        
        // Get bank data
        const [bankAccounts] = await db.query(
            'SELECT balance FROM bank_accounts WHERE character_id = ?',
            [characterId]
        );
        
        const bankBalance = bankAccounts && bankAccounts[0] ? bankAccounts[0].balance : 0;
        
        // Get vehicle count
        const [vehicles] = await db.query(
            'SELECT COUNT(*) as count FROM vehicles WHERE owner_id = ?',
            [characterId]
        );
        
        const vehicleCount = vehicles && vehicles[0] ? vehicles[0].count : 0;
        
        // Prepare data
        const menuData = {
            name: `${character.first_name} ${character.last_name}`,
            level: character.level || 1,
            job: character.job || 'Unemployed',
            money: character.money || 0,
            bank: bankBalance,
            playtime: Math.floor(character.playtime || 0),
            vehicles: vehicleCount,
            skills: {
                driving: character.skill_driving || 0,
                shooting: character.skill_shooting || 0,
                stamina: character.skill_stamina || 0
            }
        };
        
        player.call('updateUserMenuData', [JSON.stringify(menuData)]);
    } catch (error) {
        console.error('[User Menu] Error fetching data:', error);
    }
});

// Handle user menu actions
mp.events.add('userMenuAction', (player, action) => {
    const characterId = player.getVariable('characterId');
    if (!characterId) return;
    
    switch (action) {
        case 'phone':
            // Open phone system
            player.outputChatBox('[INFO] Phone system coming soon!');
            break;
        case 'animations':
            // Open animation menu
            player.outputChatBox('[INFO] Use /anim to see available animations');
            break;
        case 'walkstyle':
            // Open walk style menu
            player.outputChatBox('[INFO] Walk styles coming soon!');
            break;
        case 'accessories':
            // Open accessories menu
            player.outputChatBox('[INFO] Accessories system coming soon!');
            break;
        default:
            break;
    }
});

// Helper functions for menu features
mp.events.add('openAnimationMenu', (player) => {
    // Would open animation selection UI
    player.outputChatBox('[ANIMATIONS] Available animations: /wave, /dance, /sit, /smoke');
});

mp.events.add('openWalkStyleMenu', (player) => {
    // Would open walk style selection UI
    player.outputChatBox('[WALK STYLES] Walk style customization coming soon!');
});

mp.events.add('openAccessoriesMenu', (player) => {
    // Would open accessories selection UI
    player.outputChatBox('[ACCESSORIES] Accessories customization coming soon!');
});

mp.events.add('showIDCard', (player) => {
    const characterId = player.getVariable('characterId');
    const name = player.getVariable('characterName');
    const job = player.getVariable('job') || 'Unemployed';
    const level = player.getVariable('level') || 1;
    
    // Show to nearby players
    const playersNearby = mp.players.toArray().filter(p => 
        p !== player && 
        p.position.subtract(player.position).length() < 5.0
    );
    
    playersNearby.forEach(nearPlayer => {
        nearPlayer.outputChatBox(`[ID CARD] ${name} | Job: ${job} | Level: ${level}`);
    });
    
    player.outputChatBox('[INFO] Showed ID card to nearby players');
});

mp.events.add('openBankMenu', (player) => {
    // Would open banking UI
    mp.events.call('playerOpenBank', player);
});

mp.events.add('openShopMenu', (player) => {
    // Would open shop UI
    player.outputChatBox('[INFO] Visit a shop location to browse items');
});

mp.events.add('openJobsMenu', (player) => {
    // Would open jobs UI
    player.outputChatBox('[JOBS] Available: Trucker, Taxi Driver, Delivery, Police. Visit job centers!');
});

mp.events.add('openGarageMenu', (player) => {
    // Would open garage UI
    player.outputChatBox('[INFO] Visit a garage to manage your vehicles');
});

mp.events.add('getNearbyVehicle', (player) => {
    const vehicles = mp.vehicles.toArray().filter(v => 
        v.position.subtract(player.position).length() < 5.0
    );
    
    if (vehicles.length > 0) {
        const vehicle = vehicles[0];
        const isLocked = vehicle.getVariable('locked') || false;
        player.outputChatBox(`[VEHICLE] Press L to ${isLocked ? 'unlock' : 'lock'}`);
    } else {
        player.outputChatBox('[INFO] No vehicle nearby');
    }
});

module.exports = {};
