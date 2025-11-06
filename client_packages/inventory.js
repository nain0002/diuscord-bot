// Enhanced Inventory Handler
let inventoryBrowser = null;
let inventoryOpen = false;

// Create inventory browser
function createInventory() {
    if (!inventoryBrowser) {
        inventoryBrowser = mp.browsers.new('package://CEF/enhanced-inventory.html');
    }
}

// Toggle inventory with I key
mp.keys.bind(0x49, false, () => { // I key
    if (!inventoryBrowser) {
        createInventory();
    }
    
    inventoryOpen = !inventoryOpen;
    
    if (inventoryOpen) {
        // Request inventory data from server
        mp.events.callRemote('requestInventory');
        mp.gui.cursor.visible = true;
        mp.gui.chat.show(false);
    } else {
        inventoryBrowser.execute('closeInventory()');
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
    }
});

// Update inventory data from server
mp.events.add('updateInventory', (dataJson) => {
    if (inventoryBrowser) {
        inventoryBrowser.execute('openInventory()');
        inventoryBrowser.execute(`updateInventory(${dataJson})`);
    }
});

// Use inventory item
mp.events.add('useInventoryItem', (index) => {
    mp.events.callRemote('useItem', index);
    mp.events.call('showNotification', 'Using item...', 'info');
});

// Give inventory item
mp.events.add('giveInventoryItem', (index) => {
    // Find nearest player
    mp.events.callRemote('giveItemToNearest', index);
});

// Split inventory item
mp.events.add('splitInventoryItem', (index) => {
    mp.events.callRemote('splitItem', index);
});

// Drop inventory item
mp.events.add('dropInventoryItem', (index) => {
    mp.events.callRemote('dropItem', index);
    mp.events.call('showNotification', 'Item dropped', 'info');
});

// Drop all items
mp.events.add('dropAllItems', () => {
    mp.events.callRemote('dropAllItems');
    mp.events.call('showNotification', 'All items dropped', 'warning');
});

// Close inventory
mp.events.add('inventoryClosed', () => {
    inventoryOpen = false;
    mp.gui.cursor.visible = false;
    mp.gui.chat.show(true);
});

// Cursor state management
mp.events.add('setCursorState', (state) => {
    mp.gui.cursor.visible = state;
});

// ESC key to close
mp.keys.bind(0x1B, false, () => { // ESC
    if (inventoryOpen) {
        inventoryBrowser.execute('closeInventory()');
        inventoryOpen = false;
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
    }
});
