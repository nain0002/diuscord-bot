/**
 * Vehicles Client Module
 * Handles vehicle UI and interactions
 */

let vehicleBrowser = null;
let vehicleShopMarkers = [];

// Initialize vehicle shops
mp.events.add('client:initVehicleShops', (shopsJson) => {
    const shops = JSON.parse(shopsJson);
    
    shops.forEach(shop => {
        // Create marker
        const marker = mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 1),
            2.0,
            {
                direction: new mp.Vector3(0, 0, 0),
                rotation: new mp.Vector3(0, 0, 0),
                color: [0, 150, 255, 100],
                visible: true,
                dimension: 0
            }
        );
        vehicleShopMarkers.push(marker);
        
        // Create blip
        const blip = mp.blips.new(225, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: shop.name,
                scale: 0.8,
                color: 4,
                alpha: 255,
                drawDistance: 100.0,
                shortRange: true,
                dimension: 0
            }
        );
    });
});

// Show vehicle shop
mp.events.add('client:showVehicleShop', (vehiclesJson) => {
    if (vehicleBrowser) return;
    
    mp.gui.cursor.show(true, true);
    vehicleBrowser = mp.browsers.new('package://CEF/vehicle_shop.html');
    
    setTimeout(() => {
        vehicleBrowser.execute(`showVehicles(${vehiclesJson})`);
    }, 500);
});

// Close vehicle shop
function closeVehicleShop() {
    if (vehicleBrowser) {
        vehicleBrowser.destroy();
        vehicleBrowser = null;
    }
    mp.gui.cursor.show(false, false);
}

// Vehicle response
mp.events.add('client:vehicleResponse', (type, message) => {
    mp.gui.chat.push(message);
    if (type === 'success') {
        closeVehicleShop();
    }
});

// Buy vehicle (called from CEF)
mp.events.add('vehicle:buy', (model, name, price) => {
    mp.events.callRemote('server:buyVehicle', model, name, price);
});

mp.events.add('vehicle:close', () => {
    closeVehicleShop();
});

// Check if near vehicle shop
setInterval(() => {
    if (!mp.players.local) return;
    
    const playerPos = mp.players.local.position;
    
    vehicleShopMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.game.graphics.drawText('Press ~g~E~w~ to browse Vehicles', [0.5, 0.9],
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

// E key to open vehicle shop
mp.keys.bind(0x45, false, () => {
    if (!mp.players.local) return;
    
    const playerPos = mp.players.local.position;
    
    vehicleShopMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.events.callRemote('server:openVehicleShop');
        }
    });
});

console.log('[Client] Vehicles module loaded');
