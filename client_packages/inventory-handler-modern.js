/**
 * Modern Inventory Handler - Client Side
 * Handles communication between CEF and RAGE:MP server
 */

let inventoryBrowser = null;
let inventoryOpen = false;
let playerData = {};

// ========================================
// Initialize Browser
// ========================================

function createInventoryBrowser() {
    if (!inventoryBrowser) {
        inventoryBrowser = mp.browsers.new('package://CEF/inventory-modern.html');
        console.log('[Inventory] Browser created');
    }
    return inventoryBrowser;
}

// ========================================
// Toggle Inventory (I Key)
// ========================================

mp.keys.bind(0x49, false, () => { // I key
    try {
        // Check if player is logged in
        const characterId = mp.players.local.getVariable('character_id');
        if (!characterId) {
            mp.gui.chat.push('!{#FF0000}[Inventory] You must be logged in!');
            return;
        }
        
        if (!inventoryBrowser) {
            createInventoryBrowser();
            // Small delay for browser to initialize
            setTimeout(() => {
                inventoryOpen = true;
                mp.events.callRemote('requestInventory');
                mp.gui.cursor.visible = true;
                mp.gui.chat.show(false);
            }, 100);
            return;
        }
        
        inventoryOpen = !inventoryOpen;
        
        if (inventoryOpen) {
            // Request inventory data from server
            mp.events.callRemote('requestInventory');
            mp.gui.cursor.visible = true;
            mp.gui.chat.show(false);
        } else {
            if (inventoryBrowser) {
                inventoryBrowser.execute('closeInventory()');
            }
            mp.gui.cursor.visible = false;
            mp.gui.chat.show(true);
        }
    } catch (error) {
        console.error('[Inventory] Toggle error:', error);
        mp.gui.chat.push('!{#FF0000}[Inventory] Error opening inventory');
    }
});

// ========================================
// Receive Inventory Data from Server
// ========================================

mp.events.add('updateInventory', (dataJson) => {
    try {
        if (!inventoryBrowser) {
            createInventoryBrowser();
            // Wait for browser to load, then update
            setTimeout(() => {
                updateInventoryData(dataJson);
            }, 200);
            return;
        }
        
        updateInventoryData(dataJson);
        
    } catch (error) {
        console.error('[Inventory] Update error:', error);
        mp.gui.chat.push('!{#FF0000}[Inventory] Failed to load inventory data');
    }
});

function updateInventoryData(dataJson) {
    try {
        console.log('[Inventory] Received data:', typeof dataJson === 'string' ? dataJson.substring(0, 100) : 'object');
        
        // Parse data if it's a string
        let data;
        if (typeof dataJson === 'string') {
            try {
                data = JSON.parse(dataJson);
            } catch (parseError) {
                console.error('[Inventory] JSON parse error:', parseError);
                mp.gui.chat.push('!{#FF0000}[Inventory] Invalid data format');
                return;
            }
        } else {
            data = dataJson;
        }
        
        if (!data || !data.items) {
            console.error('[Inventory] Invalid data structure:', data);
            mp.gui.chat.push('!{#FF0000}[Inventory] Invalid inventory data');
            return;
        }
        
        // Open inventory
        inventoryBrowser.execute('openInventory()');
        
        // Update inventory data with proper escaping
        const safeData = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/'/g, "\\'" );
        inventoryBrowser.execute(`updateInventory(${safeData})`);
        
        console.log('[Inventory] Data updated successfully');
        
    } catch (error) {
        console.error('[Inventory] Update data error:', error);
    }
}

// ========================================
// Update Player Stats (Real-time)
// ========================================

mp.events.add('updatePlayerStats', (statsJson) => {
    try {
        if (!inventoryBrowser) return;
        
        const stats = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
        playerData = { ...playerData, ...stats };
        
        // Update stats in inventory if open
        if (inventoryOpen) {
            inventoryBrowser.execute(`updateInventory({ playerData: ${JSON.stringify(stats)} })`);
        }
        
    } catch (error) {
        console.error('[Inventory] Stats update error:', error);
    }
});

// ========================================
// Item Actions from CEF
// ========================================

// Use Item
mp.events.add('useInventoryItem', (index) => {
    try {
        mp.events.callRemote('useItem', parseInt(index));
        console.log('[Inventory] Using item at index:', index);
    } catch (error) {
        console.error('[Inventory] Use item error:', error);
    }
});

// Equip Weapon
mp.events.add('equipWeapon', (dataJson) => {
    try {
        const data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
        mp.events.callRemote('equipWeapon', data.slot, data.item.name);
        console.log('[Inventory] Equipping weapon:', data);
    } catch (error) {
        console.error('[Inventory] Equip weapon error:', error);
    }
});

// Equip Item
mp.events.add('equipItem', (index) => {
    try {
        mp.events.callRemote('equipItem', parseInt(index));
        console.log('[Inventory] Equipping item at index:', index);
    } catch (error) {
        console.error('[Inventory] Equip item error:', error);
    }
});

// Drop Item
mp.events.add('dropItem', (index) => {
    try {
        mp.events.callRemote('dropItem', parseInt(index));
        console.log('[Inventory] Dropping item at index:', index);
        
        // Show notification
        mp.gui.chat.push('!{#FFA500}Item dropped');
    } catch (error) {
        console.error('[Inventory] Drop item error:', error);
    }
});

// Split Item Stack
mp.events.add('splitItem', (index) => {
    try {
        mp.events.callRemote('splitItem', parseInt(index));
        console.log('[Inventory] Splitting item at index:', index);
    } catch (error) {
        console.error('[Inventory] Split item error:', error);
    }
});

// Destroy Item
mp.events.add('destroyItem', (index) => {
    try {
        mp.events.callRemote('destroyItem', parseInt(index));
        console.log('[Inventory] Destroying item at index:', index);
        
        // Show notification
        mp.gui.chat.push('!{#FF0000}Item destroyed');
    } catch (error) {
        console.error('[Inventory] Destroy item error:', error);
    }
});

// Give Item to Nearest Player
mp.events.add('giveItem', (index) => {
    try {
        mp.events.callRemote('giveItemToNearest', parseInt(index));
        console.log('[Inventory] Giving item at index:', index);
    } catch (error) {
        console.error('[Inventory] Give item error:', error);
    }
});

// ========================================
// Hotbar Management
// ========================================

// Update Hotbar
mp.events.add('updateHotbar', (hotbarJson) => {
    try {
        const hotbar = typeof hotbarJson === 'string' ? JSON.parse(hotbarJson) : hotbarJson;
        mp.events.callRemote('saveHotbar', JSON.stringify(hotbar));
        console.log('[Inventory] Hotbar updated');
    } catch (error) {
        console.error('[Inventory] Hotbar update error:', error);
    }
});

// Use Hotbar Item
mp.events.add('useHotbarItem', (slot) => {
    try {
        mp.events.callRemote('useHotbarItem', parseInt(slot));
        console.log('[Inventory] Using hotbar slot:', slot);
    } catch (error) {
        console.error('[Inventory] Hotbar use error:', error);
    }
});

// Hotbar Keybinds (1-5)
for (let i = 1; i <= 5; i++) {
    const keyCode = 0x30 + i; // 0x31 = 1, 0x32 = 2, etc.
    mp.keys.bind(keyCode, false, () => {
        if (!inventoryOpen) {
            try {
                const characterId = mp.players.local.getVariable('character_id');
                if (!characterId) return;
                
                mp.events.callRemote('useHotbarItem', i - 1);
                console.log('[Inventory] Hotbar key pressed:', i);
            } catch (error) {
                console.error('[Inventory] Hotbar key error:', error);
            }
        }
    });
}

// ========================================
// Close Inventory
// ========================================

mp.events.add('inventoryClosed', () => {
    try {
        inventoryOpen = false;
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
        console.log('[Inventory] Closed');
    } catch (error) {
        console.error('[Inventory] Close error:', error);
    }
});

// ESC Key to Close
mp.keys.bind(0x1B, false, () => { // ESC
    if (inventoryOpen && inventoryBrowser) {
        try {
            inventoryBrowser.execute('closeInventory()');
            inventoryOpen = false;
            mp.gui.cursor.visible = false;
            mp.gui.chat.show(true);
        } catch (error) {
            console.error('[Inventory] ESC close error:', error);
        }
    }
});

// ========================================
// Notifications from Server
// ========================================

mp.events.add('inventoryNotification', (message, type) => {
    try {
        if (inventoryBrowser && inventoryOpen) {
            inventoryBrowser.execute(`showNotification('${message}', '${type || 'info'}')`);
        }
        
        // Also show in chat
        const colorMap = {
            success: '#00FF88',
            error: '#FF006E',
            warning: '#FFBA08',
            info: '#00D4FF'
        };
        const color = colorMap[type] || '#FFFFFF';
        mp.gui.chat.push(`!{${color}}[Inventory] ${message}`);
        
    } catch (error) {
        console.error('[Inventory] Notification error:', error);
    }
});

// ========================================
// Item Added/Removed Feedback
// ========================================

mp.events.add('itemAdded', (itemName, quantity) => {
    try {
        mp.gui.chat.push(`!{#00FF88}+${quantity}x ${itemName}`);
        
        if (inventoryOpen && inventoryBrowser) {
            inventoryBrowser.execute(`showNotification('+${quantity}x ${itemName}', 'success')`);
        }
    } catch (error) {
        console.error('[Inventory] Item added notification error:', error);
    }
});

mp.events.add('itemRemoved', (itemName, quantity) => {
    try {
        mp.gui.chat.push(`!{#FF006E}-${quantity}x ${itemName}`);
        
        if (inventoryOpen && inventoryBrowser) {
            inventoryBrowser.execute(`showNotification('-${quantity}x ${itemName}', 'error')`);
        }
    } catch (error) {
        console.error('[Inventory] Item removed notification error:', error);
    }
});

// ========================================
// Update Weight Display (Real-time)
// ========================================

mp.events.add('updateWeight', (current, max) => {
    try {
        if (inventoryBrowser && inventoryOpen) {
            inventoryBrowser.execute(`updateInventory({ currentWeight: ${current}, maxWeight: ${max} })`);
        }
    } catch (error) {
        console.error('[Inventory] Weight update error:', error);
    }
});

// ========================================
// Debug Commands
// ========================================

mp.events.add('debugInventory', () => {
    console.log('[Inventory] Debug Info:');
    console.log('- Browser:', inventoryBrowser ? 'Created' : 'Null');
    console.log('- Open:', inventoryOpen);
    console.log('- Player Data:', playerData);
});

// ========================================
// Cleanup on Resource Stop
// ========================================

mp.events.add('playerQuit', () => {
    if (inventoryBrowser) {
        try {
            inventoryBrowser.destroy();
            inventoryBrowser = null;
        } catch (error) {
            console.error('[Inventory] Cleanup error:', error);
        }
    }
});

console.log('[Inventory] Modern handler loaded successfully!');
