/**
 * Vehicles Module
 * Handles vehicle spawning, ownership, and management
 */

const database = require('./database');
const playerModule = require('./player');

// Vehicle spawn locations
const vehicleShops = [
    { x: -56.5, y: -1096.5, z: 26.4, name: "Premium Deluxe Motorsport" },
    { x: -1149.5, y: -1990.5, z: 13.2, name: "Airport Parking" },
    { x: 1204.5, y: 2728.5, z: 38.0, name: "Sandy Shores Vehicle Shop" }
];

// Available vehicles for purchase
const vehicleShop = {
    compact: [
        { model: 'blista', name: 'Blista', price: 15000 },
        { model: 'brioso', name: 'Brioso R/A', price: 18000 },
        { model: 'dilettante', name: 'Dilettante', price: 12000 },
        { model: 'issi2', name: 'Issi', price: 14000 },
        { model: 'panto', name: 'Panto', price: 10000 }
    ],
    sedan: [
        { model: 'asea', name: 'Asea', price: 25000 },
        { model: 'asterope', name: 'Asterope', price: 28000 },
        { model: 'cognoscenti', name: 'Cognoscenti', price: 65000 },
        { model: 'fugitive', name: 'Fugitive', price: 35000 },
        { model: 'primo', name: 'Primo', price: 30000 }
    ],
    suv: [
        { model: 'baller', name: 'Baller', price: 75000 },
        { model: 'cavalcade', name: 'Cavalcade', price: 60000 },
        { model: 'fq2', name: 'FQ 2', price: 45000 },
        { model: 'granger', name: 'Granger', price: 55000 },
        { model: 'seminole', name: 'Seminole', price: 50000 }
    ],
    sports: [
        { model: 'alpha', name: 'Alpha', price: 150000 },
        { model: 'banshee', name: 'Banshee', price: 180000 },
        { model: 'carbonizzare', name: 'Carbonizzare', price: 195000 },
        { model: 'comet2', name: 'Comet', price: 175000 },
        { model: 'elegy2', name: 'Elegy RH8', price: 95000 }
    ],
    super: [
        { model: 'adder', name: 'Adder', price: 1000000 },
        { model: 'entityxf', name: 'Entity XF', price: 795000 },
        { model: 'infernus', name: 'Infernus', price: 440000 },
        { model: 'vacca', name: 'Vacca', price: 240000 },
        { model: 'zentorno', name: 'Zentorno', price: 725000 }
    ],
    motorcycle: [
        { model: 'akuma', name: 'Akuma', price: 35000 },
        { model: 'bagger', name: 'Bagger', price: 40000 },
        { model: 'bati', name: 'Bati 801', price: 45000 },
        { model: 'carbonrs', name: 'Carbon RS', price: 50000 },
        { model: 'hexer', name: 'Hexer', price: 38000 }
    ]
};

// Player vehicles cache
const playerVehicles = new Map();

// Send vehicle shop locations to client
mp.events.add('playerReady', (player) => {
    player.call('client:initVehicleShops', [JSON.stringify(vehicleShops)]);
});

// Open vehicle shop
mp.events.add('server:openVehicleShop', (player) => {
    const data = playerModule.getPlayerData(player);
    if (!data || !data.characterId) return;

    player.call('client:showVehicleShop', [JSON.stringify(vehicleShop)]);
});

// Buy vehicle
mp.events.add('server:buyVehicle', async (player, vehicleModel, vehicleName, price) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        if (playerModule.getMoney(player) < price) {
            player.call('client:vehicleResponse', ['error', 'Not enough money!']);
            return;
        }

        // Take money
        if (!playerModule.takeMoney(player, price)) {
            player.call('client:vehicleResponse', ['error', 'Purchase failed!']);
            return;
        }

        // Generate plate
        const plate = generatePlate();

        // Save to database
        const pos = player.position;
        await database.query(
            'INSERT INTO vehicles (character_id, model, plate, position_x, position_y, position_z) VALUES (?, ?, ?, ?, ?, ?)',
            [data.characterId, vehicleModel, plate, pos.x, pos.y, pos.z]
        );

        // Spawn vehicle
        const vehicle = mp.vehicles.new(mp.joaat(vehicleModel), pos,
            {
                numberPlate: plate,
                color: [[0, 0, 0], [0, 0, 0]],
                locked: true,
                engine: false,
                dimension: player.dimension
            }
        );

        player.call('client:vehicleResponse', ['success', `Vehicle purchased! Plate: ${plate}`]);
        player.outputChatBox(`!{#00FF00}You bought a ${vehicleName} for $${price.toLocaleString()}`);
        player.outputChatBox(`!{#FFFF00}Plate: ${plate}`);

        console.log(`[Vehicles] ${player.name} bought ${vehicleName} for $${price}`);

    } catch (error) {
        console.error('[Vehicles] Error buying vehicle:', error);
        player.call('client:vehicleResponse', ['error', 'Purchase failed!']);
    }
});

// Spawn player vehicle
mp.events.add('server:spawnVehicle', async (player, vehicleId) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        // Get vehicle from database
        const vehicles = await database.query(
            'SELECT * FROM vehicles WHERE id = ? AND character_id = ?',
            [vehicleId, data.characterId]
        );

        if (vehicles.length === 0) {
            player.outputChatBox('!{#FF0000}Vehicle not found!');
            return;
        }

        const vehicleData = vehicles[0];
        const pos = player.position;

        // Spawn vehicle
        const vehicle = mp.vehicles.new(mp.joaat(vehicleData.model), pos,
            {
                numberPlate: vehicleData.plate,
                color: [vehicleData.color1.split(','), vehicleData.color2.split(',')],
                locked: false,
                engine: false,
                dimension: player.dimension
            }
        );

        vehicle.fuel = vehicleData.fuel;
        vehicle.engineHealth = vehicleData.engine_health;
        vehicle.bodyHealth = vehicleData.body_health;

        player.outputChatBox(`!{#00FF00}Vehicle spawned! Plate: ${vehicleData.plate}`);

    } catch (error) {
        console.error('[Vehicles] Error spawning vehicle:', error);
    }
});

// Get player vehicles
mp.events.add('server:getVehicles', async (player) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        const vehicles = await database.query(
            'SELECT * FROM vehicles WHERE character_id = ?',
            [data.characterId]
        );

        player.call('client:showVehicleList', [JSON.stringify(vehicles)]);

    } catch (error) {
        console.error('[Vehicles] Error getting vehicles:', error);
    }
});

// Lock/unlock vehicle
mp.events.addCommand('lock', (player) => {
    if (!player.vehicle) {
        player.outputChatBox('!{#FF0000}You must be in a vehicle!');
        return;
    }

    const locked = player.vehicle.locked;
    player.vehicle.locked = !locked;
    
    player.outputChatBox(locked ? '!{#00FF00}Vehicle unlocked' : '!{#FF0000}Vehicle locked');
});

// Engine on/off
mp.events.addCommand('engine', (player) => {
    if (!player.vehicle) {
        player.outputChatBox('!{#FF0000}You must be in a vehicle!');
        return;
    }

    const engine = player.vehicle.engine;
    player.vehicle.engine = !engine;
    
    player.outputChatBox(engine ? '!{#FF0000}Engine off' : '!{#00FF00}Engine on');
});

// Generate random plate
function generatePlate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let plate = '';
    for (let i = 0; i < 8; i++) {
        plate += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return plate;
}

console.log('[Vehicles] Module loaded');

module.exports = {};
