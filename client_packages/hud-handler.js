// HUD Handler - Modern Live HUD
let hudBrowser = null;
let hudVisible = true;

// Create HUD on player spawn
mp.events.add('playerReady', () => {
    if (!hudBrowser) {
        hudBrowser = mp.browsers.new('package://CEF/modern-hud.html');
    }
});

// Update HUD data periodically
setInterval(() => {
    if (hudBrowser && mp.players.local) {
        const player = mp.players.local;
        
        const hudData = {
            health: player.getHealth(),
            armor: player.getArmour(),
            money: player.getVariable('money') || 0,
            bank: player.getVariable('bank') || 0,
            playerName: player.getVariable('characterName') || mp.players.local.name,
            job: player.getVariable('job') || 'Unemployed',
            level: player.getVariable('level') || 1,
            location: getZoneName(player.position),
            coords: {
                x: player.position.x,
                y: player.position.y
            }
        };
        
        hudBrowser.execute(`updateHUD(${JSON.stringify(hudData)})`);
        
        // Update vehicle HUD if in vehicle
        if (player.vehicle) {
            const vehicle = player.vehicle;
            const speed = vehicle.getSpeed() * 3.6; // Convert to KM/H
            
            const vehicleData = {
                inVehicle: true,
                speed: speed,
                fuel: vehicle.getVariable('fuel') || 100,
                engine: vehicle.getVariable('engine') || 100,
                vehicleName: getVehicleName(vehicle.model)
            };
            
            hudBrowser.execute(`updateVehicle(${JSON.stringify(vehicleData)})`);
        } else {
            hudBrowser.execute(`updateVehicle({ inVehicle: false })`);
        }
    }
}, 100);

// Show notification
mp.events.add('showNotification', (message, type = 'info') => {
    if (hudBrowser) {
        hudBrowser.execute(`showNotification("${message}", "${type}")`);
    }
});

// Toggle HUD visibility
mp.keys.bind(0x74, false, () => { // F5 key
    hudVisible = !hudVisible;
    if (hudBrowser) {
        hudBrowser.execute(`document.querySelector('.hud-container').style.display = '${hudVisible ? 'block' : 'none'}'`);
    }
});

// Helper: Get zone name from position
function getZoneName(position) {
    // Simple zone detection - can be expanded
    const zones = [
        { name: 'Downtown Los Santos', x: 0, y: 0, radius: 500 },
        { name: 'Vespucci Beach', x: -1500, y: -1000, radius: 400 },
        { name: 'Vinewood Hills', x: 500, y: 500, radius: 600 },
        { name: 'Los Santos Airport', x: -1000, y: -2500, radius: 500 }
    ];
    
    for (const zone of zones) {
        const dist = Math.sqrt(
            Math.pow(position.x - zone.x, 2) + 
            Math.pow(position.y - zone.y, 2)
        );
        if (dist < zone.radius) {
            return zone.name;
        }
    }
    
    return 'Los Santos';
}

// Helper: Get vehicle name from model
function getVehicleName(model) {
    const names = {
        [mp.game.joaat('adder')]: 'Adder',
        [mp.game.joaat('infernus')]: 'Infernus',
        [mp.game.joaat('t20')]: 'T20',
        [mp.game.joaat('zentorno')]: 'Zentorno',
        [mp.game.joaat('turismor')]: 'Turismo R'
    };
    return names[model] || 'Vehicle';
}

mp.events.add('playerDeath', () => {
    if (hudBrowser) {
        hudBrowser.execute(`showNotification("You died! Respawning...", "error")`);
    }
});
