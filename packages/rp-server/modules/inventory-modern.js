/**
 * Modern Inventory System - Server Side
 * Enhanced with gun slots, hotbar, split, and more
 */

const database = require('./database');

// ========================================
// Configuration
// ========================================

const CONFIG = {
    maxWeight: 100, // kg
    maxSlots: 50,
    stackableItems: ['burger', 'pizza', 'water', 'soda', 'bandage', 'cigarette', 'lockpick'],
    maxStackSize: 99
};

// Item database with full stats
const ITEM_DATA = {
    // Weapons
    pistol: { weight: 1.2, type: 'weapon', stackable: false, usable: false, value: 500, rarity: 'uncommon' },
    rifle: { weight: 3.5, type: 'weapon', stackable: false, usable: false, value: 2000, rarity: 'rare' },
    shotgun: { weight: 4.0, type: 'weapon', stackable: false, usable: false, value: 1500, rarity: 'rare' },
    knife: { weight: 0.5, type: 'weapon', stackable: false, usable: false, value: 100, rarity: 'common' },
    bat: { weight: 1.5, type: 'weapon', stackable: false, usable: false, value: 50, rarity: 'common' },
    
    // Consumables
    burger: { weight: 0.3, type: 'consumable', stackable: true, usable: true, value: 10, rarity: 'common', hunger: 25 },
    pizza: { weight: 0.4, type: 'consumable', stackable: true, usable: true, value: 15, rarity: 'common', hunger: 35 },
    water: { weight: 0.5, type: 'consumable', stackable: true, usable: true, value: 5, rarity: 'common', thirst: 50 },
    soda: { weight: 0.3, type: 'consumable', stackable: true, usable: true, value: 8, rarity: 'common', thirst: 30 },
    medkit: { weight: 1.0, type: 'consumable', stackable: true, usable: true, value: 100, rarity: 'uncommon', health: 50 },
    bandage: { weight: 0.1, type: 'consumable', stackable: true, usable: true, value: 20, rarity: 'common', health: 15 },
    
    // Misc Items
    phone: { weight: 0.2, type: 'misc', stackable: false, usable: true, value: 300, rarity: 'common' },
    lockpick: { weight: 0.1, type: 'misc', stackable: true, usable: true, value: 50, rarity: 'uncommon' },
    rope: { weight: 1.5, type: 'misc', stackable: true, usable: false, value: 25, rarity: 'common' },
    flashlight: { weight: 0.5, type: 'misc', stackable: false, usable: true, value: 30, rarity: 'common' },
    radio: { weight: 0.8, type: 'misc', stackable: false, usable: true, value: 200, rarity: 'uncommon' },
    cigarette: { weight: 0.05, type: 'misc', stackable: true, usable: true, value: 10, rarity: 'common' },
    wallet: { weight: 0.1, type: 'misc', stackable: false, usable: false, value: 50, rarity: 'common' },
    watch: { weight: 0.15, type: 'misc', stackable: false, usable: false, value: 1000, rarity: 'rare' }
};

// ========================================
// Get Player Inventory
// ========================================

async function getInventory(characterId) {
    try {
        const items = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? ORDER BY id',
            [characterId]
        );
        
        return items || [];
    } catch (error) {
        console.error('[Inventory] Get error:', error);
        return [];
    }
}

// ========================================
// Get Full Inventory Data (with stats)
// ========================================

async function getFullInventoryData(player) {
    try {
        const characterId = player.getVariable('character_id');
        if (!characterId) {
            return null;
        }
        
        // Get inventory items
        const items = await getInventory(characterId);
        
        // Get character data
        const charData = await database.query(
            'SELECT * FROM characters WHERE id = ?',
            [characterId]
        );
        
        if (!charData || charData.length === 0) {
            return null;
        }
        
        const char = charData[0];
        
        // Get gun slots (stored as JSON in character data)
        let gunSlots = { primary: null, secondary: null, melee: null };
        if (char.gun_slots) {
            try {
                gunSlots = typeof char.gun_slots === 'string' 
                    ? JSON.parse(char.gun_slots) 
                    : char.gun_slots;
            } catch (e) {
                console.error('[Inventory] Gun slots parse error:', e);
            }
        }
        
        // Get hotbar
        let hotbar = [null, null, null, null, null];
        if (char.hotbar) {
            try {
                hotbar = typeof char.hotbar === 'string' 
                    ? JSON.parse(char.hotbar) 
                    : char.hotbar;
            } catch (e) {
                console.error('[Inventory] Hotbar parse error:', e);
            }
        }
        
        // Format items with originalIndex
        const formattedItems = items.map((item, index) => ({
            ...item,
            originalIndex: index,
            name: item.item_name,
            type: item.item_type
        }));
        
        return {
            items: formattedItems,
            playerData: {
                name: `${char.first_name} ${char.last_name}`,
                level: char.level || 1,
                health: player.health || 100,
                armor: player.armour || 0,
                money: char.money || 0,
                hunger: char.hunger || 100,
                thirst: char.thirst || 100,
                job: char.job || 'Unemployed'
            },
            maxWeight: CONFIG.maxWeight,
            currentWeight: calculateWeight(items),
            gunSlots: gunSlots,
            hotbar: hotbar
        };
    } catch (error) {
        console.error('[Inventory] Get full data error:', error);
        return null;
    }
}

// ========================================
// Calculate Total Weight
// ========================================

function calculateWeight(items) {
    let total = 0;
    items.forEach(item => {
        const itemName = item.item_name || item.name;
        const itemData = ITEM_DATA[itemName.toLowerCase()];
        const weight = itemData ? itemData.weight : 0.5;
        total += weight * (item.quantity || 1);
    });
    return parseFloat(total.toFixed(2));
}

// ========================================
// Check if can carry item
// ========================================

async function canCarryItem(characterId, itemName, quantity = 1) {
    try {
        const items = await getInventory(characterId);
        const currentWeight = calculateWeight(items);
        
        const itemData = ITEM_DATA[itemName.toLowerCase()] || { weight: 0.5 };
        const addWeight = itemData.weight * quantity;
        
        return (currentWeight + addWeight) <= CONFIG.maxWeight;
    } catch (error) {
        console.error('[Inventory] Can carry check error:', error);
        return false;
    }
}

// ========================================
// Add Item
// ========================================

async function addItem(characterId, itemName, itemType, quantity = 1) {
    try {
        // Check weight
        if (!await canCarryItem(characterId, itemName, quantity)) {
            return { success: false, message: 'Inventory too heavy!' };
        }
        
        const itemData = ITEM_DATA[itemName.toLowerCase()];
        const isStackable = itemData && itemData.stackable;
        
        if (isStackable) {
            // Try to stack with existing item
            const existing = await database.query(
                'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
                [characterId, itemName]
            );
            
            if (existing && existing.length > 0) {
                const newQuantity = existing[0].quantity + quantity;
                
                // Check max stack size
                if (newQuantity <= CONFIG.maxStackSize) {
                    await database.execute(
                        'UPDATE inventory SET quantity = ? WHERE id = ?',
                        [newQuantity, existing[0].id]
                    );
                    return { success: true, message: `Added ${quantity}x ${itemName}` };
                }
            }
        }
        
        // Add as new item
        await database.execute(
            'INSERT INTO inventory (character_id, item_name, item_type, quantity) VALUES (?, ?, ?, ?)',
            [characterId, itemName, itemType, quantity]
        );
        
        return { success: true, message: `Added ${quantity}x ${itemName}` };
    } catch (error) {
        console.error('[Inventory] Add item error:', error);
        return { success: false, message: 'Failed to add item' };
    }
}

// ========================================
// Remove Item
// ========================================

async function removeItem(characterId, itemName, quantity = 1) {
    try {
        const items = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
            [characterId, itemName]
        );
        
        if (!items || items.length === 0) {
            return { success: false, message: 'Item not found' };
        }
        
        const item = items[0];
        
        if (item.quantity > quantity) {
            // Decrease quantity
            await database.execute(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
                [quantity, item.id]
            );
        } else {
            // Remove item completely
            await database.execute(
                'DELETE FROM inventory WHERE id = ?',
                [item.id]
            );
        }
        
        return { success: true, message: `Removed ${quantity}x ${itemName}` };
    } catch (error) {
        console.error('[Inventory] Remove item error:', error);
        return { success: false, message: 'Failed to remove item' };
    }
}

// ========================================
// Use Item
// ========================================

async function useItem(player, itemIndex) {
    try {
        const characterId = player.getVariable('character_id');
        const items = await getInventory(characterId);
        
        if (itemIndex < 0 || itemIndex >= items.length) {
            return { success: false, message: 'Invalid item' };
        }
        
        const item = items[itemIndex];
        const itemData = ITEM_DATA[item.item_name.toLowerCase()];
        
        if (!itemData || !itemData.usable) {
            return { success: false, message: 'Item cannot be used' };
        }
        
        // Apply item effects
        if (itemData.health) {
            const newHealth = Math.min(100, player.health + itemData.health);
            player.health = newHealth;
        }
        
        if (itemData.hunger) {
            await database.execute(
                'UPDATE characters SET hunger = LEAST(100, hunger + ?) WHERE id = ?',
                [itemData.hunger, characterId]
            );
        }
        
        if (itemData.thirst) {
            await database.execute(
                'UPDATE characters SET thirst = LEAST(100, thirst + ?) WHERE id = ?',
                [itemData.thirst, characterId]
            );
        }
        
        // Remove one from inventory
        await removeItem(characterId, item.item_name, 1);
        
        // Notify player
        player.call('inventoryNotification', [`Used ${item.item_name}`, 'success']);
        
        return { success: true, message: `Used ${item.item_name}` };
    } catch (error) {
        console.error('[Inventory] Use item error:', error);
        return { success: false, message: 'Failed to use item' };
    }
}

// ========================================
// Drop Item
// ========================================

async function dropItem(player, itemIndex) {
    try {
        const characterId = player.getVariable('character_id');
        const items = await getInventory(characterId);
        
        if (itemIndex < 0 || itemIndex >= items.length) {
            return { success: false, message: 'Invalid item' };
        }
        
        const item = items[itemIndex];
        
        // Remove from inventory
        await database.execute(
            'DELETE FROM inventory WHERE id = ?',
            [item.id]
        );
        
        // TODO: Create physical item in world
        // For now, just remove it
        
        player.call('inventoryNotification', [`Dropped ${item.quantity}x ${item.item_name}`, 'warning']);
        
        return { success: true, message: `Dropped ${item.item_name}` };
    } catch (error) {
        console.error('[Inventory] Drop item error:', error);
        return { success: false, message: 'Failed to drop item' };
    }
}

// ========================================
// Split Item Stack
// ========================================

async function splitItem(player, itemIndex) {
    try {
        const characterId = player.getVariable('character_id');
        const items = await getInventory(characterId);
        
        if (itemIndex < 0 || itemIndex >= items.length) {
            return { success: false, message: 'Invalid item' };
        }
        
        const item = items[itemIndex];
        
        if (item.quantity < 2) {
            return { success: false, message: 'Cannot split single item' };
        }
        
        const splitAmount = Math.floor(item.quantity / 2);
        const remainAmount = item.quantity - splitAmount;
        
        // Update original item
        await database.execute(
            'UPDATE inventory SET quantity = ? WHERE id = ?',
            [remainAmount, item.id]
        );
        
        // Create new stack
        await database.execute(
            'INSERT INTO inventory (character_id, item_name, item_type, quantity) VALUES (?, ?, ?, ?)',
            [characterId, item.item_name, item.item_type, splitAmount]
        );
        
        player.call('inventoryNotification', [`Split ${item.item_name} stack`, 'info']);
        
        return { success: true, message: 'Item split successfully' };
    } catch (error) {
        console.error('[Inventory] Split item error:', error);
        return { success: false, message: 'Failed to split item' };
    }
}

// ========================================
// Destroy Item
// ========================================

async function destroyItem(player, itemIndex) {
    try {
        const characterId = player.getVariable('character_id');
        const items = await getInventory(characterId);
        
        if (itemIndex < 0 || itemIndex >= items.length) {
            return { success: false, message: 'Invalid item' };
        }
        
        const item = items[itemIndex];
        
        await database.execute(
            'DELETE FROM inventory WHERE id = ?',
            [item.id]
        );
        
        player.call('inventoryNotification', [`Destroyed ${item.quantity}x ${item.item_name}`, 'error']);
        
        return { success: true, message: 'Item destroyed' };
    } catch (error) {
        console.error('[Inventory] Destroy item error:', error);
        return { success: false, message: 'Failed to destroy item' };
    }
}

// ========================================
// Equip Weapon (Gun Slots)
// ========================================

async function equipWeapon(player, slot, weaponName) {
    try {
        const characterId = player.getVariable('character_id');
        
        // Get current gun slots
        const charData = await database.query(
            'SELECT gun_slots FROM characters WHERE id = ?',
            [characterId]
        );
        
        let gunSlots = { primary: null, secondary: null, melee: null };
        if (charData && charData[0] && charData[0].gun_slots) {
            try {
                gunSlots = JSON.parse(charData[0].gun_slots);
            } catch (e) {}
        }
        
        // Update slot
        gunSlots[slot] = { name: weaponName };
        
        // Save to database
        await database.execute(
            'UPDATE characters SET gun_slots = ? WHERE id = ?',
            [JSON.stringify(gunSlots), characterId]
        );
        
        // TODO: Give weapon in-game
        // player.giveWeapon(mp.joaat(weaponName), 100);
        
        player.call('inventoryNotification', [`Equipped ${weaponName}`, 'success']);
        
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Equip weapon error:', error);
        return { success: false, message: 'Failed to equip weapon' };
    }
}

// ========================================
// Save Hotbar
// ========================================

async function saveHotbar(player, hotbarJson) {
    try {
        const characterId = player.getVariable('character_id');
        const hotbar = JSON.parse(hotbarJson);
        
        await database.execute(
            'UPDATE characters SET hotbar = ? WHERE id = ?',
            [JSON.stringify(hotbar), characterId]
        );
        
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Save hotbar error:', error);
        return { success: false };
    }
}

// ========================================
// Use Hotbar Item
// ========================================

async function useHotbarItem(player, slot) {
    try {
        const characterId = player.getVariable('character_id');
        
        // Get hotbar
        const charData = await database.query(
            'SELECT hotbar FROM characters WHERE id = ?',
            [characterId]
        );
        
        if (!charData || !charData[0] || !charData[0].hotbar) {
            return { success: false };
        }
        
        const hotbar = JSON.parse(charData[0].hotbar);
        const item = hotbar[slot];
        
        if (!item) {
            return { success: false, message: 'Empty slot' };
        }
        
        // Find item in inventory and use it
        const items = await getInventory(characterId);
        const itemIndex = items.findIndex(i => i.item_name === item.name);
        
        if (itemIndex !== -1) {
            return await useItem(player, itemIndex);
        }
        
        return { success: false, message: 'Item not found' };
    } catch (error) {
        console.error('[Inventory] Use hotbar item error:', error);
        return { success: false };
    }
}

// ========================================
// Server Events
// ========================================

// Request Inventory
mp.events.add('requestInventory', async (player) => {
    try {
        const data = await getFullInventoryData(player);
        
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        } else {
            player.outputChatBox('!{#FF0000}Failed to load inventory');
        }
    } catch (error) {
        console.error('[Inventory] Request inventory error:', error);
    }
});

// Use Item
mp.events.add('useItem', async (player, index) => {
    try {
        const result = await useItem(player, parseInt(index));
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Use item event error:', error);
    }
});

// Drop Item
mp.events.add('dropItem', async (player, index) => {
    try {
        await dropItem(player, parseInt(index));
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Drop item event error:', error);
    }
});

// Split Item
mp.events.add('splitItem', async (player, index) => {
    try {
        await splitItem(player, parseInt(index));
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Split item event error:', error);
    }
});

// Destroy Item
mp.events.add('destroyItem', async (player, index) => {
    try {
        await destroyItem(player, parseInt(index));
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Destroy item event error:', error);
    }
});

// Equip Weapon
mp.events.add('equipWeapon', async (player, slot, weaponName) => {
    try {
        await equipWeapon(player, slot, weaponName);
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Equip weapon event error:', error);
    }
});

// Save Hotbar
mp.events.add('saveHotbar', async (player, hotbarJson) => {
    try {
        await saveHotbar(player, hotbarJson);
    } catch (error) {
        console.error('[Inventory] Save hotbar event error:', error);
    }
});

// Use Hotbar Item
mp.events.add('useHotbarItem', async (player, slot) => {
    try {
        await useHotbarItem(player, parseInt(slot));
        
        // Refresh inventory
        const data = await getFullInventoryData(player);
        if (data) {
            player.call('updateInventory', [JSON.stringify(data)]);
        }
    } catch (error) {
        console.error('[Inventory] Use hotbar item event error:', error);
    }
});

// Give Item to Nearest Player
mp.events.add('giveItemToNearest', async (player, index) => {
    try {
        // TODO: Implement give to nearest player
        player.outputChatBox('!{#FFBA08}Feature coming soon: Give to nearest player');
    } catch (error) {
        console.error('[Inventory] Give item event error:', error);
    }
});

// ========================================
// Exports
// ========================================

module.exports = {
    getInventory,
    getFullInventoryData,
    addItem,
    removeItem,
    useItem,
    dropItem,
    splitItem,
    destroyItem,
    equipWeapon,
    saveHotbar,
    useHotbarItem,
    canCarryItem,
    calculateWeight,
    ITEM_DATA,
    CONFIG
};

console.log('[Inventory] Modern inventory system loaded!');
