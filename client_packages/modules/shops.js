/**
 * Shops Client Module
 * Handles shop UI and interactions
 */

let shopBrowser = null;
let shopMarkers = [];
let shopBlips = [];

// Initialize shop locations
mp.events.add('client:initShopLocations', (shopsJson) => {
    const shops = JSON.parse(shopsJson);
    
    shops.forEach(shop => {
        // Create marker
        const marker = mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 1),
            1.5,
            {
                direction: new mp.Vector3(0, 0, 0),
                rotation: new mp.Vector3(0, 0, 0),
                color: [255, 200, 0, 100],
                visible: true,
                dimension: 0
            }
        );
        marker.shopType = shop.type;
        shopMarkers.push(marker);
        
        // Create blip
        const blip = mp.blips.new(shop.blipSprite, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: shop.name,
                scale: 0.8,
                color: shop.blipColor,
                alpha: 255,
                drawDistance: 100.0,
                shortRange: true,
                dimension: 0
            }
        );
        shopBlips.push(blip);
    });
});

// Open shop menu
mp.events.add('client:openShopMenu', (shopType, itemsJson) => {
    if (shopBrowser) return;
    
    mp.gui.cursor.show(true, true);
    shopBrowser = mp.browsers.new('package://CEF/shop.html');
    
    setTimeout(() => {
        shopBrowser.execute(`showShop('${shopType}', ${itemsJson})`);
    }, 500);
});

// Close shop menu
function closeShopMenu() {
    if (shopBrowser) {
        shopBrowser.destroy();
        shopBrowser = null;
    }
    mp.gui.cursor.show(false, false);
}

// Shop response
mp.events.add('client:shopResponse', (type, message) => {
    mp.gui.chat.push(message);
});

// Buy item (called from CEF)
mp.events.add('shop:buyItem', (itemName, itemType, price, quantity) => {
    mp.events.callRemote('server:buyItem', itemName, itemType, price, quantity);
});

mp.events.add('shop:close', () => {
    closeShopMenu();
});

// Check if near shop
setInterval(() => {
    if (!mp.players.local) return;
    
    const playerPos = mp.players.local.position;
    
    shopMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.game.graphics.drawText('Press ~g~E~w~ to open Shop', [0.5, 0.9],
                {
                    font: 4,
                    color: [255, 255, 255, 255],
                    scale: [0.4, 0.4],
                    outline: true
                }
            );
        }
    });
}, 0);

// E key to open shop (handled in combination with other E key checks)
mp.keys.bind(0x45, false, () => {
    if (!mp.players.local) return;
    
    const playerPos = mp.players.local.position;
    
    shopMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.events.callRemote('server:openShop', marker.shopType);
        }
    });
});

// Show inventory
mp.events.add('client:showInventory', (inventoryJson) => {
    const inventory = JSON.parse(inventoryJson);
    mp.gui.chat.push('=== INVENTORY ===');
    inventory.forEach(item => {
        mp.gui.chat.push(`${item.item_name} x${item.quantity}`);
    });
});

// Inventory command
mp.events.add('render', () => {
    // I key for inventory
    if (mp.keys.isDown(0x49) && !inventoryKeyPressed) {
        inventoryKeyPressed = true;
        mp.events.callRemote('server:getInventory');
    } else if (!mp.keys.isDown(0x49)) {
        inventoryKeyPressed = false;
    }
});

let inventoryKeyPressed = false;

console.log('[Client] Shops module loaded');
