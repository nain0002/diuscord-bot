/**
 * RAGE:MP Elite HUD - Client-Side Handler
 * Version: 3.0.0
 * Handles communication between RAGE:MP and CEF HUD
 */

// ============================================
// GLOBAL VARIABLES
// ============================================

let hudBrowser = null;
let isHUDReady = false;
let updateInterval = null;
let lastHealth = 100;
let lastArmor = 0;
let lastWeapon = null;
let lastVehicle = null;

// Settings
let hudSettings = {
    showPlayerStatus: true,
    showMoney: true,
    showLocation: true,
    showWeapon: true,
    showVehicle: true,
    showCompass: true,
    showMission: true,
    showWeatherEffects: true,
    theme: 'blue'
};

// ============================================
// INITIALIZATION
// ============================================

function initializeHUD() {
    try {
        mp.gui.chat.push('[Elite HUD] Initializing...');
        
        // Create CEF browser
        hudBrowser = mp.browsers.new('package://CEF/hud-modern.html');
        
        // Wait for browser to load
        setTimeout(() => {
            isHUDReady = true;
            mp.gui.chat.push('[Elite HUD] Initialized successfully');
            
            // Load saved settings
            loadHUDSettings();
            
            // Request initial player data from server
            mp.events.callRemote('requestHUDData');
            
            // Start update loop
            startUpdateLoop();
        }, 1000);
        
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Initialization error: ${error.message}`);
    }
}

// ============================================
// UPDATE LOOP
// ============================================

function startUpdateLoop() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        if (!isHUDReady || !hudBrowser) return;
        
        const player = mp.players.local;
        if (!player || !mp.players.exists(player)) return;
        
        try {
            // Update player stats
            updatePlayerStats();
            
            // Update weapon
            updateWeaponInfo();
            
            // Update vehicle
            updateVehicleInfo();
            
            // Update location
            updateLocationInfo();
            
            // Update time
            updateTimeInfo();
            
        } catch (error) {
            mp.gui.chat.push(`!{#FF0000}[Elite HUD] Update error: ${error.message}`);
        }
    }, 100); // Update every 100ms for smooth animations
}

// ============================================
// PLAYER STATS UPDATE
// ============================================

function updatePlayerStats() {
    const player = mp.players.local;
    const characterId = player.getVariable('character_id');
    
    if (!characterId) return;
    
    const health = player.getHealth();
    const armor = player.getArmour();
    
    // Only update if values changed
    if (health !== lastHealth || armor !== lastArmor) {
        lastHealth = health;
        lastArmor = armor;
        
        // Trigger damage effect if health decreased
        if (health < lastHealth) {
            hudBrowser.execute('window.HUD.triggerDamageFlash()');
        }
        
        // Note: Cash, bank, hunger, thirst, XP come from server
        hudBrowser.execute(`window.HUD.updateHealth(${health})`);
        hudBrowser.execute(`window.HUD.updateArmor(${armor})`);
    }
}

// ============================================
// WEAPON INFO UPDATE
// ============================================

const WEAPON_NAMES = {
    0: 'Unarmed',
    1569615261: 'Unarmed',
    -1569615261: 'Unarmed',
    453432689: 'Pistol',
    1593441988: 'Combat Pistol',
    584646201: 'AP Pistol',
    -1716189206: 'Knife',
    -1074790547: 'Assault Rifle',
    -2084633992: 'Carbine Rifle',
    487013001: 'Pump Shotgun',
    2578377531: 'Flashlight',
    1737195953: 'Nightstick',
    2578778090: 'Knife',
    -1569615261: 'Fist'
};

const WEAPON_ICONS = {
    0: '✊',
    1569615261: '✊',
    -1569615261: '✊',
    453432689: '🔫',
    1593441988: '🔫',
    584646201: '🔫',
    -1716189206: '🔪',
    -1074790547: '⚔️',
    -2084633992: '⚔️',
    487013001: '💥',
    2578377531: '🔦',
    1737195953: '🏏',
    2578778090: '🔪'
};

function updateWeaponInfo() {
    const player = mp.players.local;
    const currentWeapon = player.weapon;
    
    if (currentWeapon !== lastWeapon) {
        lastWeapon = currentWeapon;
        
        const weaponName = WEAPON_NAMES[currentWeapon] || 'Unknown';
        const weaponIcon = WEAPON_ICONS[currentWeapon] || '❓';
        
        const ammo = player.getAmmoInClip();
        const ammoMax = player.getAmmo(currentWeapon);
        
        hudBrowser.execute(
            `window.HUD.updateWeapon("${weaponName}", ${ammo}, ${ammoMax}, "${weaponIcon}")`
        );
    } else {
        // Update ammo count even if weapon didn't change
        const ammo = player.getAmmoInClip();
        const ammoMax = player.getAmmo(currentWeapon);
        const weaponName = WEAPON_NAMES[currentWeapon] || 'Unknown';
        const weaponIcon = WEAPON_ICONS[currentWeapon] || '❓';
        
        hudBrowser.execute(
            `window.HUD.updateWeapon("${weaponName}", ${ammo}, ${ammoMax}, "${weaponIcon}")`
        );
    }
}

// ============================================
// VEHICLE INFO UPDATE
// ============================================

function updateVehicleInfo() {
    const player = mp.players.local;
    const vehicle = player.vehicle;
    
    // Check if player is in vehicle
    if (vehicle && mp.vehicles.exists(vehicle)) {
        if (lastVehicle !== vehicle) {
            lastVehicle = vehicle;
            hudBrowser.execute('window.HUD.updateVehicleStatus(true)');
        }
        
        // Get vehicle data
        const speed = vehicle.getSpeed() * 2.23694; // Convert to MPH
        const fuel = vehicle.getVariable('fuel') || 100;
        const engine = vehicle.getVariable('engine') || false;
        
        // Get vehicle lights and lock status
        const lightsOn = vehicle.getVariable('lights') || false;
        const locked = vehicle.getVariable('locked') || false;
        
        hudBrowser.execute(
            `window.HUD.updateVehicleData(${speed.toFixed(0)}, ${fuel}, ${engine}, ${lightsOn}, ${locked})`
        );
        
    } else {
        if (lastVehicle !== null) {
            lastVehicle = null;
            hudBrowser.execute('window.HUD.updateVehicleStatus(false)');
        }
    }
}

// ============================================
// LOCATION INFO UPDATE
// ============================================

function updateLocationInfo() {
    const player = mp.players.local;
    const position = player.position;
    
    // Get street and zone (you may need to implement proper zone detection)
    const street = getStreetName(position) || 'Unknown Street';
    const zone = getZoneName(position) || 'Los Santos';
    
    // Get player heading (0-360 degrees)
    const heading = player.getHeading();
    
    hudBrowser.execute(
        `window.HUD.updateLocation("${street}", "${zone}", ${heading})`
    );
}

// Simple street name detection (you can enhance this)
function getStreetName(position) {
    // This is a placeholder - implement proper street detection
    return 'Street';
}

// Simple zone name detection
function getZoneName(position) {
    // This is a placeholder - implement proper zone detection
    const zones = ['Los Santos', 'Blaine County', 'Paleto Bay', 'Sandy Shores'];
    return zones[Math.floor(Math.random() * zones.length)];
}

// ============================================
// TIME INFO UPDATE
// ============================================

function updateTimeInfo() {
    const time = mp.game.time;
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    const gameTime = `${hour}:${minute}`;
    
    const date = new Date();
    const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    hudBrowser.execute(
        `window.HUD.updateTime("${gameTime}", undefined, "${dateString}")`
    );
}

// ============================================
// SERVER EVENT HANDLERS
// ============================================

// Receive full HUD data from server
mp.events.add('updateHUDData', (data) => {
    if (!isHUDReady || !hudBrowser) return;
    
    try {
        hudBrowser.execute(`window.HUD.updatePlayerInfo(${data})`);
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Data update error: ${error.message}`);
    }
});

// Update specific HUD elements from server
mp.events.add('updateHUDMoney', (cash, bank) => {
    if (!isHUDReady || !hudBrowser) return;
    hudBrowser.execute(`window.HUD.updateMoney(${cash}, ${bank})`);
});

mp.events.add('updateHUDXP', (current, max) => {
    if (!isHUDReady || !hudBrowser) return;
    hudBrowser.execute(`window.HUD.updateXP(${current}, ${max})`);
});

mp.events.add('updateHUDHunger', (value) => {
    if (!isHUDReady || !hudBrowser) return;
    hudBrowser.execute(`window.HUD.updateHunger(${value})`);
});

mp.events.add('updateHUDThirst', (value) => {
    if (!isHUDReady || !hudBrowser) return;
    hudBrowser.execute(`window.HUD.updateThirst(${value})`);
});

mp.events.add('updateHUDWeather', (type, icon) => {
    if (!isHUDReady || !hudBrowser) return;
    hudBrowser.execute(`window.HUD.updateWeather("${type}", "${icon}")`);
});

mp.events.add('updateHUDMission', (active, title, objectives, distance) => {
    if (!isHUDReady || !hudBrowser) return;
    const objStr = JSON.stringify(objectives || []);
    hudBrowser.execute(
        `window.HUD.updateMission(${active}, "${title || ''}", '${objStr}', ${distance || 0})`
    );
});

mp.events.add('showHUDNotification', (title, message, type, icon) => {
    if (!isHUDReady || !hudBrowser) return;
    type = type || 'info';
    icon = icon || 'ℹ️';
    hudBrowser.execute(
        `window.HUD.showNotification("${title}", "${message}", "${type}", "${icon}")`
    );
});

// Voice chat indicator
mp.events.add('playerStartTalking', (player) => {
    if (player === mp.players.local && isHUDReady && hudBrowser) {
        hudBrowser.execute('window.HUD.updateVoiceStatus(true)');
    }
});

mp.events.add('playerStopTalking', (player) => {
    if (player === mp.players.local && isHUDReady && hudBrowser) {
        hudBrowser.execute('window.HUD.updateVoiceStatus(false)');
    }
});

// ============================================
// SETTINGS MANAGEMENT
// ============================================

mp.events.add('saveHUDSettings', (settingsJson) => {
    try {
        hudSettings = JSON.parse(settingsJson);
        
        // Save to local storage (if available)
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('hudSettings', settingsJson);
        }
        
        // Send to server to save in database
        mp.events.callRemote('saveHUDSettings', settingsJson);
        
        mp.gui.chat.push('!{#00FF88}[Elite HUD] Settings saved successfully');
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Settings save error: ${error.message}`);
    }
});

function loadHUDSettings() {
    try {
        // Try to load from local storage first
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('hudSettings');
            if (saved) {
                hudSettings = JSON.parse(saved);
            }
        }
        
        // Request settings from server
        mp.events.callRemote('loadHUDSettings');
        
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Settings load error: ${error.message}`);
    }
}

mp.events.add('receiveHUDSettings', (settingsJson) => {
    if (!isHUDReady || !hudBrowser) return;
    
    try {
        hudSettings = JSON.parse(settingsJson);
        hudBrowser.execute(`mp.events.call('loadHUDSettings', '${settingsJson}')`);
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Settings receive error: ${error.message}`);
    }
});

// ============================================
// KEYBINDS
// ============================================

// F5 - Toggle HUD settings
mp.keys.bind(0x74, true, () => {
    if (isHUDReady && hudBrowser) {
        hudBrowser.execute('document.getElementById("hudSettingsBtn").click()');
    }
});

// ============================================
// PLAYER EVENTS
// ============================================

// Player ready event
mp.events.add('playerReady', () => {
    mp.gui.chat.push('[Elite HUD] Player ready, initializing HUD...');
    initializeHUD();
});

// Character loaded event
mp.events.add('characterLoaded', () => {
    if (isHUDReady) {
        mp.events.callRemote('requestHUDData');
    }
});

// Player spawn event
mp.events.add('playerSpawn', () => {
    if (isHUDReady) {
        mp.events.callRemote('requestHUDData');
    }
});

// Player death event
mp.events.add('playerDeath', () => {
    if (isHUDReady && hudBrowser) {
        hudBrowser.execute('window.HUD.showNotification("Wasted!", "You died", "error", "💀")');
    }
});

// ============================================
// CLEANUP
// ============================================

mp.events.add('playerQuit', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (hudBrowser) {
        hudBrowser.destroy();
    }
});

// ============================================
// INITIALIZATION ON LOAD
// ============================================

// Check if player is already spawned
setTimeout(() => {
    const player = mp.players.local;
    const characterId = player.getVariable('character_id');
    
    if (characterId && !isHUDReady) {
        mp.gui.chat.push('[Elite HUD] Auto-initializing...');
        initializeHUD();
    }
}, 2000);

mp.gui.chat.push('[Elite HUD] Handler loaded successfully');
