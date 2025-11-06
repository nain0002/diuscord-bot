// Bot Cars System - NPC vehicles that can be entered with CTRL
let botVehicles = [];
let nearbyBotVehicle = null;
let engineStarting = false;

// Spawn bot cars around the map
function spawnBotCars() {
    const spawnPoints = [
        // Downtown
        { pos: new mp.Vector3(228.0, -791.5, 30.7), heading: 90, model: 'blista' },
        { pos: new mp.Vector3(215.0, -805.5, 30.8), heading: 180, model: 'Buffalo' },
        { pos: new mp.Vector3(-340.0, -874.5, 31.3), heading: 270, model: 'futo' },
        
        // Beach
        { pos: new mp.Vector3(-1392.0, -1511.0, 4.4), heading: 0, model: 'faggio' },
        { pos: new mp.Vector3(-1520.0, -430.0, 35.5), heading: 45, model: 'oracle' },
        
        // Vinewood
        { pos: new mp.Vector3(400.0, 250.0, 103.0), heading: 90, model: 'sentinel' },
        { pos: new mp.Vector3(850.0, -230.0, 70.0), heading: 180, model: 'dominator' },
        
        // Airport
        { pos: new mp.Vector3(-1037.0, -2737.0, 20.2), heading: 330, model: 'taxi' },
        { pos: new mp.Vector3(-980.0, -2700.0, 13.9), heading: 90, model: 'bus' },
        
        // Sandy Shores
        { pos: new mp.Vector3(1737.0, 3710.0, 34.2), heading: 20, model: 'rebel' },
        { pos: new mp.Vector3(1988.0, 3053.0, 47.2), heading: 240, model: 'bison' },
        
        // Paleto Bay
        { pos: new mp.Vector3(-140.0, 6350.0, 31.5), heading: 315, model: 'bobcatxl' },
        { pos: new mp.Vector3(108.0, 6611.0, 31.9), heading: 45, model: 'surfer' },
        
        // More vehicles
        { pos: new mp.Vector3(-50.0, -1110.0, 26.4), heading: 0, model: 'primo' },
        { pos: new mp.Vector3(310.0, -200.0, 54.2), heading: 250, model: 'radi' },
        { pos: new mp.Vector3(-525.0, -260.0, 35.5), heading: 210, model: 'felon' },
        { pos: new mp.Vector3(290.0, -1070.0, 29.4), heading: 270, model: 'washington' },
        { pos: new mp.Vector3(-1155.0, -1520.0, 4.4), heading: 125, model: 'blazer' },
        { pos: new mp.Vector3(975.0, -1828.0, 31.2), heading: 80, model: 'rumpo' },
        { pos: new mp.Vector3(-3030.0, 105.0, 11.6), heading: 240, model: 'baller' }
    ];
    
    spawnPoints.forEach(point => {
        try {
            const vehicleHash = mp.game.joaat(point.model);
            const vehicle = mp.vehicles.new(vehicleHash, point.pos, {
                heading: point.heading,
                numberPlate: 'BOT' + Math.floor(Math.random() * 1000),
                locked: true,
                engine: false,
                dimension: 0
            });
            
            if (vehicle) {
                vehicle.botCar = true;
                vehicle.isLocked = true;
                botVehicles.push(vehicle);
            }
        } catch (err) {
            console.error(`[Bot Cars] Failed to spawn: ${point.model}`);
        }
    });
    
    console.log(`[Bot Cars] Spawned ${botVehicles.length} bot vehicles`);
}

// Initialize bot cars after player ready
mp.events.add('playerReady', () => {
    console.log('[Bot Cars] Player ready, spawning bot cars in 3 seconds...');
    setTimeout(() => {
        spawnBotCars();
    }, 3000);
});

// Alternative: Spawn on character loaded
mp.events.add('characterLoaded', () => {
    console.log('[Bot Cars] Character loaded, spawning bot cars in 2 seconds...');
    setTimeout(() => {
        if (botVehicles.length === 0) {
            spawnBotCars();
        }
    }, 2000);
});

// Check for nearby bot vehicles
setInterval(() => {
    const player = mp.players.local;
    
    if (!player || player.vehicle) {
        nearbyBotVehicle = null;
        return;
    }
    
    nearbyBotVehicle = null;
    let closestDistance = 3.0;
    
    botVehicles.forEach(vehicle => {
        if (vehicle && vehicle.handle) {
            const distance = mp.game.system.vdist(
                player.position.x, player.position.y, player.position.z,
                vehicle.position.x, vehicle.position.y, vehicle.position.z
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                nearbyBotVehicle = vehicle;
            }
        }
    });
    
    // Show hint if near bot vehicle
    if (nearbyBotVehicle) {
        mp.game.graphics.drawText(
            'Press ~g~F~w~ to enter vehicle\nPress ~y~CTRL + F~w~ to start engine and enter',
            [0.5, 0.85],
            {
                font: 4,
                color: [255, 255, 255, 200],
                scale: [0.4, 0.4],
                outline: true
            }
        );
    }
}, 100);

// F key to enter vehicle (normal)
mp.keys.bind(0x46, false, () => { // F key
    if (nearbyBotVehicle && !mp.players.local.vehicle) {
        // Unlock and enter
        nearbyBotVehicle.isLocked = false;
        mp.game.invoke('0xA59650BCC59FD0E1', nearbyBotVehicle.handle, false); // SET_VEHICLE_DOORS_LOCKED
        
        mp.players.local.taskEnterVehicle(nearbyBotVehicle.handle, 5000, -1, 1.0, 1, 0);
        
        setTimeout(() => {
            nearbyBotVehicle.isLocked = true;
            mp.game.invoke('0xA59650BCC59FD0E1', nearbyBotVehicle.handle, true);
        }, 3000);
        
        mp.events.call('showNotification', 'Entered vehicle. Press CTRL to start engine.', 'info');
    }
});

// CTRL key to start engine and enter
mp.keys.bind(0x11, false, () => { // CTRL key
    const player = mp.players.local;
    
    // If near bot vehicle and not in vehicle - enter with engine start
    if (nearbyBotVehicle && !player.vehicle && !engineStarting) {
        engineStarting = true;
        
        // Unlock vehicle
        nearbyBotVehicle.isLocked = false;
        mp.game.invoke('0xA59650BCC59FD0E1', nearbyBotVehicle.handle, false);
        
        // Enter vehicle
        player.taskEnterVehicle(nearbyBotVehicle.handle, 5000, -1, 1.0, 1, 0);
        
        mp.events.call('showNotification', 'Starting engine...', 'info');
        
        // Start engine after 2 seconds
        setTimeout(() => {
            if (player.vehicle === nearbyBotVehicle) {
                mp.game.invoke('0x2497C4717C8B881E', nearbyBotVehicle.handle, true, true); // SET_VEHICLE_ENGINE_ON
                mp.events.call('showNotification', 'Engine started!', 'success');
            }
            
            // Lock vehicle
            setTimeout(() => {
                nearbyBotVehicle.isLocked = true;
                mp.game.invoke('0xA59650BCC59FD0E1', nearbyBotVehicle.handle, true);
            }, 1000);
            
            engineStarting = false;
        }, 2000);
    }
    
    // If in vehicle - toggle engine
    else if (player.vehicle && player.vehicle.botCar) {
        const isEngineOn = mp.game.invoke('0xAE31E7DF9B5B132E', player.vehicle.handle); // GET_IS_VEHICLE_ENGINE_RUNNING
        
        if (isEngineOn) {
            mp.game.invoke('0x2497C4717C8B881E', player.vehicle.handle, false, false);
            mp.events.call('showNotification', 'Engine stopped', 'info');
        } else {
            mp.game.invoke('0x2497C4717C8B881E', player.vehicle.handle, true, true);
            mp.events.call('showNotification', 'Engine started', 'success');
        }
    }
});

// L key to lock/unlock vehicle
mp.keys.bind(0x4C, false, () => { // L key
    const player = mp.players.local;
    
    if (player.vehicle && player.vehicle.botCar) {
        const isLocked = player.vehicle.isLocked;
        
        player.vehicle.isLocked = !isLocked;
        mp.game.invoke('0xA59650BCC59FD0E1', player.vehicle.handle, !isLocked);
        
        // Play lock sound
        mp.game.audio.playSoundFrontend(-1, isLocked ? 'VEHICLE_LOCKS_DISARMED' : 'VEHICLE_LOCKS_ARMED', 'DLC_HEIST_FLEECA_SOUNDSET', true);
        
        mp.events.call('showNotification', isLocked ? 'Vehicle unlocked' : 'Vehicle locked', 'info');
    }
});

// Clean up on resource stop
mp.events.add('resourceStop', () => {
    botVehicles.forEach(vehicle => {
        if (vehicle && vehicle.handle) {
            vehicle.destroy();
        }
    });
    botVehicles = [];
});
