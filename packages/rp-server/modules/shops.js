/**
 * Shops Module
 * Handles shop system (24/7, clothing, gun stores, etc.)
 */

const database = require('./database');
const playerModule = require('./player');

// Shop types and their items
const shopData = {
    '24/7': {
        items: [
            { name: 'Water', type: 'consumable', price: 5 },
            { name: 'Sandwich', type: 'consumable', price: 10 },
            { name: 'Pizza', type: 'consumable', price: 15 },
            { name: 'Burger', type: 'consumable', price: 12 },
            { name: 'Coffee', type: 'consumable', price: 7 },
            { name: 'Energy Drink', type: 'consumable', price: 8 },
            { name: 'Chips', type: 'consumable', price: 6 },
            { name: 'Phone', type: 'item', price: 500 },
            { name: 'Cigarettes', type: 'consumable', price: 15 },
            { name: 'Lighter', type: 'item', price: 5 }
        ]
    },
    'clothing': {
        items: [
            { name: 'T-Shirt', type: 'clothing', price: 50 },
            { name: 'Jeans', type: 'clothing', price: 75 },
            { name: 'Jacket', type: 'clothing', price: 150 },
            { name: 'Shoes', type: 'clothing', price: 100 },
            { name: 'Hat', type: 'clothing', price: 35 },
            { name: 'Glasses', type: 'clothing', price: 45 },
            { name: 'Watch', type: 'clothing', price: 200 },
            { name: 'Backpack', type: 'clothing', price: 80 }
        ]
    },
    'gunstore': {
        items: [
            { name: 'Pistol', type: 'weapon', price: 5000 },
            { name: 'Pistol Ammo (50)', type: 'ammo', price: 250 },
            { name: 'Flashlight', type: 'weapon', price: 150 },
            { name: 'Knife', type: 'weapon', price: 300 },
            { name: 'Baseball Bat', type: 'weapon', price: 250 },
            { name: 'Body Armor', type: 'item', price: 500 }
        ]
    },
    'hardware': {
        items: [
            { name: 'Lockpick', type: 'tool', price: 150 },
            { name: 'Rope', type: 'item', price: 25 },
            { name: 'Toolbox', type: 'tool', price: 500 },
            { name: 'Fishing Rod', type: 'tool', price: 350 },
            { name: 'Shovel', type: 'tool', price: 200 },
            { name: 'Flashlight', type: 'item', price: 50 }
        ]
    }
};

// Shop locations
const shopLocations = [
    // 24/7 Stores
    { type: '24/7', x: 25.7, y: -1347.3, z: 29.5, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    { type: '24/7', x: -48.5, y: -1757.5, z: 29.4, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    { type: '24/7', x: 1163.3, y: -323.8, z: 69.2, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    { type: '24/7', x: -707.5, y: -914.2, z: 19.2, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    { type: '24/7', x: -1820.5, y: 792.5, z: 138.1, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    { type: '24/7', x: 1698.3, y: 4924.4, z: 42.1, blipSprite: 52, blipColor: 2, name: "24/7 Store" },
    
    // Clothing Stores
    { type: 'clothing', x: 72.3, y: -1399.1, z: 29.4, blipSprite: 73, blipColor: 0, name: "Clothing Store" },
    { type: 'clothing', x: -703.8, y: -152.3, z: 37.4, blipSprite: 73, blipColor: 0, name: "Clothing Store" },
    { type: 'clothing', x: -1192.4, y: -772.3, z: 17.3, blipSprite: 73, blipColor: 0, name: "Clothing Store" },
    { type: 'clothing', x: 425.2, y: -806.2, z: 29.5, blipSprite: 73, blipColor: 0, name: "Clothing Store" },
    
    // Gun Stores
    { type: 'gunstore', x: -662.1, y: -935.3, z: 21.8, blipSprite: 110, blipColor: 1, name: "Ammu-Nation" },
    { type: 'gunstore', x: 810.2, y: -2157.3, z: 29.6, blipSprite: 110, blipColor: 1, name: "Ammu-Nation" },
    { type: 'gunstore', x: 1693.4, y: 3759.5, z: 34.7, blipSprite: 110, blipColor: 1, name: "Ammu-Nation" },
    { type: 'gunstore', x: 252.3, y: -50.0, z: 69.9, blipSprite: 110, blipColor: 1, name: "Ammu-Nation" },
    
    // Hardware Stores
    { type: 'hardware', x: 44.8, y: -1748.5, z: 29.6, blipSprite: 402, blipColor: 5, name: "Hardware Store" },
    { type: 'hardware', x: 2747.8, y: 3472.9, z: 55.7, blipSprite: 402, blipColor: 5, name: "Hardware Store" }
];

// Initialize shops
async function initShops() {
    try {
        // Check if shops already exist
        const existing = await database.query('SELECT COUNT(*) as count FROM shops');
        
        if (existing[0].count === 0) {
            // Insert shops
            for (const shop of shopLocations) {
                const result = await database.query(
                    'INSERT INTO shops (name, type, position_x, position_y, position_z, blip_sprite, blip_color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [shop.name, shop.type, shop.x, shop.y, shop.z, shop.blipSprite, shop.blipColor]
                );

                const shopId = result.insertId;

                // Insert shop items
                const items = shopData[shop.type].items;
                for (const item of items) {
                    await database.query(
                        'INSERT INTO shop_items (shop_id, item_name, item_type, price) VALUES (?, ?, ?, ?)',
                        [shopId, item.name, item.type, item.price]
                    );
                }
            }
            console.log('[Shops] Initialized all shop locations and items');
        }
    } catch (error) {
        console.error('[Shops] Error initializing shops:', error);
    }
}

// Send shop locations to client
mp.events.add('playerReady', (player) => {
    player.call('client:initShopLocations', [JSON.stringify(shopLocations)]);
});

// Open shop
mp.events.add('server:openShop', async (player, shopType) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        if (!shopData[shopType]) {
            player.outputChatBox('!{#FF0000}Invalid shop type!');
            return;
        }

        player.call('client:openShopMenu', [shopType, JSON.stringify(shopData[shopType].items)]);

    } catch (error) {
        console.error('[Shops] Error opening shop:', error);
    }
});

// Buy item
mp.events.add('server:buyItem', async (player, itemName, itemType, price, quantity) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        quantity = parseInt(quantity) || 1;
        const totalPrice = price * quantity;

        if (playerModule.getMoney(player) < totalPrice) {
            player.call('client:shopResponse', ['error', 'Not enough money!']);
            return;
        }

        // Use inventory module to add item (includes weight check)
        const inventoryModule = require('./inventory');
        const result = await inventoryModule.addItem(data.characterId, itemName, itemType, quantity);
        
        if (!result.success) {
            player.call('client:shopResponse', ['error', result.message]);
            return;
        }

        // Take money
        if (!playerModule.takeMoney(player, totalPrice)) {
            // Refund item if money transaction fails
            await inventoryModule.removeItem(data.characterId, itemName, quantity);
            player.call('client:shopResponse', ['error', 'Transaction failed!']);
            return;
        }

        player.call('client:shopResponse', ['success', `Bought ${quantity}x ${itemName} for $${totalPrice.toLocaleString()}`]);
        console.log(`[Shops] ${player.name} bought ${quantity}x ${itemName} for $${totalPrice}`);

    } catch (error) {
        console.error('[Shops] Error buying item:', error);
        player.call('client:shopResponse', ['error', 'Purchase failed!']);
    }
});

// Inventory is now handled by inventory.js module

// Initialize shops on server start
setTimeout(() => {
    initShops();
}, 2000);

console.log('[Shops] Module loaded');

module.exports = {};
