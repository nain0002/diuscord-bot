/**
 * Inventory Module
 * Handles player inventory management
 */

const database = require('./database');
const playerModule = require('./player');

// Maximum inventory weight
const MAX_INVENTORY_WEIGHT = 100; // kg

// Item weights
const ITEM_WEIGHTS = {
    'Burger': 0.3,
    'Water': 0.5,
    'Pizza': 0.4,
    'Soda': 0.3,
    'Phone': 0.2,
    'Lockpick': 0.1,
    'Rope': 1.5,
    'Bandage': 0.1,
    'Medkit': 1.0,
    'Pistol': 1.2,
    'Rifle': 3.5
};

// Get player inventory
async function getInventory(characterId) {
    try {
        const inventory = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? ORDER BY item_type, item_name',
            [characterId]
        );
        return inventory;
    } catch (error) {
        console.error('[Inventory] Error getting inventory:', error);
        return [];
    }
}

// Calculate total weight
function calculateWeight(inventory) {
    let totalWeight = 0;
    inventory.forEach(item => {
        const weight = ITEM_WEIGHTS[item.item_name] || 0.5;
        totalWeight += weight * item.quantity;
    });
    return totalWeight;
}

// Check if player can carry item
async function canCarryItem(characterId, itemName, quantity = 1) {
    try {
        const inventory = await getInventory(characterId);
        const currentWeight = calculateWeight(inventory);
        const itemWeight = (ITEM_WEIGHTS[itemName] || 0.5) * quantity;
        
        return (currentWeight + itemWeight) <= MAX_INVENTORY_WEIGHT;
    } catch (error) {
        console.error('[Inventory] Error checking weight:', error);
        return false;
    }
}

// Add item to inventory
async function addItem(characterId, itemName, itemType, quantity = 1, data = null) {
    try {
        // Check weight
        const canCarry = await canCarryItem(characterId, itemName, quantity);
        if (!canCarry) {
            return { success: false, message: 'Inventory is too heavy!' };
        }
        
        // Check if item already exists
        const existing = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
            [characterId, itemName]
        );
        
        if (existing.length > 0) {
            // Update quantity
            await database.query(
                'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            // Insert new item
            await database.query(
                'INSERT INTO inventory (character_id, item_name, item_type, quantity, data) VALUES (?, ?, ?, ?, ?)',
                [characterId, itemName, itemType, quantity, data]
            );
        }
        
        return { success: true, message: `Added ${quantity}x ${itemName}` };
    } catch (error) {
        console.error('[Inventory] Error adding item:', error);
        return { success: false, message: 'Failed to add item' };
    }
}

// Remove item from inventory
async function removeItem(characterId, itemName, quantity = 1) {
    try {
        const existing = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
            [characterId, itemName]
        );
        
        if (existing.length === 0) {
            return { success: false, message: 'Item not found in inventory' };
        }
        
        const item = existing[0];
        
        if (item.quantity < quantity) {
            return { success: false, message: 'Not enough items' };
        }
        
        if (item.quantity === quantity) {
            // Delete item
            await database.query(
                'DELETE FROM inventory WHERE id = ?',
                [item.id]
            );
        } else {
            // Update quantity
            await database.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
                [quantity, item.id]
            );
        }
        
        return { success: true, message: `Removed ${quantity}x ${itemName}` };
    } catch (error) {
        console.error('[Inventory] Error removing item:', error);
        return { success: false, message: 'Failed to remove item' };
    }
}

// Use item
async function useItem(player, itemId, itemName) {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;
        
        // Get item
        const items = await database.query(
            'SELECT * FROM inventory WHERE id = ? AND character_id = ?',
            [itemId, data.characterId]
        );
        
        if (items.length === 0) {
            player.outputChatBox('Item not found!');
            return;
        }
        
        const item = items[0];
        
        // Handle different item types
        switch (item.item_type) {
            case 'food':
                // Heal player
                const currentHealth = player.health;
                const healAmount = itemName === 'Burger' ? 20 : itemName === 'Pizza' ? 30 : 10;
                player.health = Math.min(100, currentHealth + healAmount);
                player.outputChatBox(`~g~Used ${itemName} (+${healAmount} HP)`);
                break;
                
            case 'weapon':
                player.outputChatBox('~y~Weapon equipped!');
                // TODO: Implement weapon system
                break;
                
            case 'item':
                if (itemName === 'Medkit') {
                    player.health = 100;
                    player.outputChatBox('~g~Health fully restored!');
                } else if (itemName === 'Bandage') {
                    player.health = Math.min(100, player.health + 15);
                    player.outputChatBox('~g~Applied bandage (+15 HP)');
                } else {
                    player.outputChatBox(`~y~Used ${itemName}`);
                }
                break;
                
            default:
                player.outputChatBox(`~y~Used ${itemName}`);
        }
        
        // Remove one item
        await removeItem(data.characterId, itemName, 1);
        
        // Refresh inventory
        const inventory = await getInventory(data.characterId);
        player.call('client:showInventoryUI', [JSON.stringify(inventory)]);
        
    } catch (error) {
        console.error('[Inventory] Error using item:', error);
        player.outputChatBox('Failed to use item!');
    }
}

// Drop item
async function dropItem(player, itemId, itemName) {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;
        
        // Remove one item
        const result = await removeItem(data.characterId, itemName, 1);
        
        if (result.success) {
            player.outputChatBox(`~y~Dropped ${itemName}`);
            
            // TODO: Create dropped item in world
            
            // Refresh inventory
            const inventory = await getInventory(data.characterId);
            player.call('client:showInventoryUI', [JSON.stringify(inventory)]);
        } else {
            player.outputChatBox(`~r~${result.message}`);
        }
        
    } catch (error) {
        console.error('[Inventory] Error dropping item:', error);
        player.outputChatBox('Failed to drop item!');
    }
}

// Give item to nearby player
async function giveItem(player, itemId, itemName) {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;
        
        // Find nearest player
        let nearestPlayer = null;
        let nearestDist = 3.0;
        
        mp.players.forEach(p => {
            if (p !== player && p.dimension === player.dimension) {
                const dist = player.dist(p.position);
                if (dist < nearestDist) {
                    nearestPlayer = p;
                    nearestDist = dist;
                }
            }
        });
        
        if (!nearestPlayer) {
            player.outputChatBox('~r~No player nearby!');
            return;
        }
        
        const targetData = playerModule.getPlayerData(nearestPlayer);
        if (!targetData || !targetData.characterId) {
            player.outputChatBox('~r~Player not ready!');
            return;
        }
        
        // Get item details
        const items = await database.query(
            'SELECT * FROM inventory WHERE id = ? AND character_id = ?',
            [itemId, data.characterId]
        );
        
        if (items.length === 0) {
            player.outputChatBox('~r~Item not found!');
            return;
        }
        
        const item = items[0];
        
        // Check if target can carry
        const canCarry = await canCarryItem(targetData.characterId, itemName, 1);
        if (!canCarry) {
            player.outputChatBox('~r~Target inventory is full!');
            return;
        }
        
        // Remove from sender
        await removeItem(data.characterId, itemName, 1);
        
        // Add to receiver
        await addItem(targetData.characterId, itemName, item.item_type, 1, item.data);
        
        player.outputChatBox(`~g~Gave ${itemName} to ${nearestPlayer.name}`);
        nearestPlayer.outputChatBox(`~g~Received ${itemName} from ${player.name}`);
        
        // Refresh both inventories
        const senderInventory = await getInventory(data.characterId);
        player.call('client:showInventoryUI', [JSON.stringify(senderInventory)]);
        
        const receiverInventory = await getInventory(targetData.characterId);
        nearestPlayer.call('client:showInventoryUI', [JSON.stringify(receiverInventory)]);
        
    } catch (error) {
        console.error('[Inventory] Error giving item:', error);
        player.outputChatBox('~r~Failed to give item!');
    }
}

// Event: Get inventory
mp.events.add('server:getInventory', async (player) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;
        
        const inventory = await getInventory(data.characterId);
        player.call('client:showInventoryUI', [JSON.stringify(inventory)]);
        
    } catch (error) {
        console.error('[Inventory] Error getting inventory:', error);
    }
});

// Event: Use item
mp.events.add('server:useItem', (player, itemId, itemName) => {
    useItem(player, itemId, itemName);
});

// Event: Drop item
mp.events.add('server:dropItem', (player, itemId, itemName) => {
    dropItem(player, itemId, itemName);
});

// Event: Give item
mp.events.add('server:giveItem', (player, itemId, itemName) => {
    giveItem(player, itemId, itemName);
});

console.log('[Inventory] Module loaded');

module.exports = {
    getInventory,
    addItem,
    removeItem,
    calculateWeight,
    canCarryItem,
    MAX_INVENTORY_WEIGHT
};
