/**
 * Inventory Admin Commands
 * Commands for admins to manage player inventories
 */

const Inventory = require('./inventory-modern');
const database = require('./database');

// Give item command: /giveitem [playerID] [itemName] [quantity]
mp.events.addCommand('giveitem', async (player, fullText, targetId, itemName, quantity) => {
    try {
        // Check admin level
        const adminLevel = player.getVariable('admin_level') || 0;
        if (adminLevel < 3) {
            player.outputChatBox('!{#FF0000}You need admin level 3 to use this command');
            return;
        }
        
        if (!targetId || !itemName) {
            player.outputChatBox('!{#FFA500}Usage: /giveitem [playerID] [itemName] [quantity]');
            return;
        }
        
        const amount = parseInt(quantity) || 1;
        const target = mp.players.at(parseInt(targetId));
        
        if (!target || !mp.players.exists(target)) {
            player.outputChatBox('!{#FF0000}Player not found');
            return;
        }
        
        const characterId = target.getVariable('character_id');
        if (!characterId) {
            player.outputChatBox('!{#FF0000}Target player not logged in');
            return;
        }
        
        // Normalize item name
        const normalizedName = itemName.toLowerCase();
        
        // Check if item exists
        if (!Inventory.ITEM_DATA[normalizedName]) {
            player.outputChatBox(`!{#FF0000}Unknown item: ${itemName}`);
            player.outputChatBox('!{#00D4FF}Available items: pistol, rifle, shotgun, knife, bat, burger, pizza, water, soda, medkit, bandage, phone, lockpick, rope, flashlight, radio, cigarette, wallet, watch');
            return;
        }
        
        const itemData = Inventory.ITEM_DATA[normalizedName];
        const result = await Inventory.addItem(characterId, normalizedName, itemData.type, amount);
        
        if (result.success) {
            player.outputChatBox(`!{#00FF88}[Admin] Gave ${amount}x ${normalizedName} to ${target.name}`);
            target.outputChatBox(`!{#00FF88}[Inventory] Admin gave you ${amount}x ${normalizedName}`);
            
            // Refresh target's inventory
            const data = await Inventory.getFullInventoryData(target);
            if (data) {
                target.call('updateInventory', [JSON.stringify(data)]);
            }
        } else {
            player.outputChatBox(`!{#FF0000}[Admin] ${result.message}`);
        }
        
    } catch (error) {
        console.error('[Inventory] Give item command error:', error);
        player.outputChatBox('!{#FF0000}Command error');
    }
});

// Clear inventory command: /clearinv [playerID]
mp.events.addCommand('clearinv', async (player, fullText, targetId) => {
    try {
        // Check admin level
        const adminLevel = player.getVariable('admin_level') || 0;
        if (adminLevel < 4) {
            player.outputChatBox('!{#FF0000}You need admin level 4 to use this command');
            return;
        }
        
        if (!targetId) {
            player.outputChatBox('!{#FFA500}Usage: /clearinv [playerID]');
            return;
        }
        
        const target = mp.players.at(parseInt(targetId));
        
        if (!target || !mp.players.exists(target)) {
            player.outputChatBox('!{#FF0000}Player not found');
            return;
        }
        
        const characterId = target.getVariable('character_id');
        if (!characterId) {
            player.outputChatBox('!{#FF0000}Target player not logged in');
            return;
        }
        
        await database.execute('DELETE FROM inventory WHERE character_id = ?', [characterId]);
        
        player.outputChatBox(`!{#00FF88}[Admin] Cleared inventory for ${target.name}`);
        target.outputChatBox('!{#FF006E}[Inventory] Your inventory was cleared by an admin');
        
        // Refresh target's inventory
        const data = await Inventory.getFullInventoryData(target);
        if (data) {
            target.call('updateInventory', [JSON.stringify(data)]);
        }
        
    } catch (error) {
        console.error('[Inventory] Clear inventory command error:', error);
        player.outputChatBox('!{#FF0000}Command error');
    }
});

// Check inventory command: /checkinv [playerID]
mp.events.addCommand('checkinv', async (player, fullText, targetId) => {
    try {
        // Check admin level
        const adminLevel = player.getVariable('admin_level') || 0;
        if (adminLevel < 2) {
            player.outputChatBox('!{#FF0000}You need admin level 2 to use this command');
            return;
        }
        
        if (!targetId) {
            player.outputChatBox('!{#FFA500}Usage: /checkinv [playerID]');
            return;
        }
        
        const target = mp.players.at(parseInt(targetId));
        
        if (!target || !mp.players.exists(target)) {
            player.outputChatBox('!{#FF0000}Player not found');
            return;
        }
        
        const characterId = target.getVariable('character_id');
        if (!characterId) {
            player.outputChatBox('!{#FF0000}Target player not logged in');
            return;
        }
        
        const items = await Inventory.getInventory(characterId);
        const weight = Inventory.calculateWeight(items);
        
        player.outputChatBox(`!{#00D4FF}=== ${target.name}'s Inventory ===`);
        player.outputChatBox(`!{#00D4FF}Weight: ${weight}/${Inventory.CONFIG.maxWeight} kg`);
        player.outputChatBox(`!{#00D4FF}Items: ${items.length}`);
        
        if (items.length > 0) {
            player.outputChatBox('!{#FFFFFF}Items:');
            items.forEach((item, index) => {
                player.outputChatBox(`!{#FFFFFF}${index + 1}. ${item.item_name} x${item.quantity}`);
            });
        } else {
            player.outputChatBox('!{#FFA500}Inventory is empty');
        }
        
    } catch (error) {
        console.error('[Inventory] Check inventory command error:', error);
        player.outputChatBox('!{#FF0000}Command error');
    }
});

// Set max weight command: /setmaxweight [playerID] [weight]
mp.events.addCommand('setmaxweight', async (player, fullText, targetId, weight) => {
    try {
        // Check admin level
        const adminLevel = player.getVariable('admin_level') || 0;
        if (adminLevel < 5) {
            player.outputChatBox('!{#FF0000}You need admin level 5 to use this command');
            return;
        }
        
        if (!targetId || !weight) {
            player.outputChatBox('!{#FFA500}Usage: /setmaxweight [playerID] [weight]');
            return;
        }
        
        const target = mp.players.at(parseInt(targetId));
        const newWeight = parseInt(weight);
        
        if (!target || !mp.players.exists(target)) {
            player.outputChatBox('!{#FF0000}Player not found');
            return;
        }
        
        if (isNaN(newWeight) || newWeight < 10 || newWeight > 500) {
            player.outputChatBox('!{#FF0000}Weight must be between 10 and 500 kg');
            return;
        }
        
        // Store custom max weight (you can save this to database if needed)
        target.setVariable('max_inventory_weight', newWeight);
        
        player.outputChatBox(`!{#00FF88}[Admin] Set ${target.name}'s max weight to ${newWeight} kg`);
        target.outputChatBox(`!{#00D4FF}[Inventory] Your max carry weight is now ${newWeight} kg`);
        
        // Refresh target's inventory
        const data = await Inventory.getFullInventoryData(target);
        if (data) {
            data.maxWeight = newWeight;
            target.call('updateInventory', [JSON.stringify(data)]);
        }
        
    } catch (error) {
        console.error('[Inventory] Set max weight command error:', error);
        player.outputChatBox('!{#FF0000}Command error');
    }
});

// List all items command: /items
mp.events.addCommand('items', (player) => {
    try {
        const adminLevel = player.getVariable('admin_level') || 0;
        if (adminLevel < 1) {
            player.outputChatBox('!{#FF0000}You need to be admin to use this command');
            return;
        }
        
        player.outputChatBox('!{#00D4FF}=== Available Items ===');
        player.outputChatBox('!{#FFFFFF}Weapons: pistol, rifle, shotgun, knife, bat');
        player.outputChatBox('!{#FFFFFF}Consumables: burger, pizza, water, soda, medkit, bandage');
        player.outputChatBox('!{#FFFFFF}Misc: phone, lockpick, rope, flashlight, radio, cigarette, wallet, watch');
        
    } catch (error) {
        console.error('[Inventory] Items command error:', error);
    }
});

console.log('[Inventory] Admin commands loaded!');

module.exports = {};
