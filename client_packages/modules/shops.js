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
function isNearShop() {
    if (!mp.players.local) return null;
    
    const playerPos = mp.players.local.position;
    
    for (const marker of shopMarkers) {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            return marker.shopType;
        }
    }
    return null;
}

// Export for use in interaction handler
global.shopInteraction = {
    isNear: isNearShop,
    activate: (shopType) => {
        mp.events.callRemote('server:openShop', shopType);
    }
};

// Old inventory display (kept for compatibility, but replaced by inventory.js module)

console.log('[Client] Shops module loaded');
