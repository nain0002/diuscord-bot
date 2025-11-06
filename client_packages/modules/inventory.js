/**
 * Inventory Client Module
 * Handles inventory UI and interactions
 */

let inventoryBrowser = null;
let isInventoryOpen = false;

// Show inventory UI
mp.events.add('client:showInventoryUI', (inventoryJson) => {
    if (inventoryBrowser) {
        // Update existing browser
        inventoryBrowser.execute(`showInventory(${inventoryJson})`);
        return;
    }
    
    // Create new browser
    mp.gui.cursor.show(true, true);
    mp.gui.chat.show(false);
    
    inventoryBrowser = mp.browsers.new('package://CEF/inventory.html');
    isInventoryOpen = true;
    
    // Wait for browser to load, then show inventory
    setTimeout(() => {
        if (inventoryBrowser) {
            inventoryBrowser.execute(`showInventory(${inventoryJson})`);
        }
    }, 500);
});

// Close inventory
function closeInventory() {
    if (inventoryBrowser) {
        inventoryBrowser.destroy();
        inventoryBrowser = null;
    }
    
    isInventoryOpen = false;
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(true);
}

// Handle inventory actions from CEF
mp.events.add('inventory:useItem', (itemId, itemName) => {
    mp.events.callRemote('server:useItem', parseInt(itemId), itemName);
});

mp.events.add('inventory:dropItem', (itemId, itemName) => {
    mp.events.callRemote('server:dropItem', parseInt(itemId), itemName);
});

mp.events.add('inventory:giveItem', (itemId, itemName) => {
    mp.events.callRemote('server:giveItem', parseInt(itemId), itemName);
});

mp.events.add('inventory:close', () => {
    closeInventory();
});

// Inventory key - I key (0x49)
mp.keys.bind(0x49, false, () => {
    if (!isInventoryOpen) {
        mp.events.callRemote('server:getInventory');
    } else {
        closeInventory();
    }
});

// Close inventory on ESC
mp.keys.bind(0x1B, false, () => {
    if (isInventoryOpen) {
        closeInventory();
    }
});

console.log('[Client] Inventory module loaded');

// Export for other modules
global.inventoryModule = {
    isOpen: () => isInventoryOpen,
    close: closeInventory
};
