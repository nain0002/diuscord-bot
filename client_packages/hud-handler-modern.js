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
let isInitializing = false;
let updateInterval = null;
let lastHealth = 100;
let lastArmor = 0;
let lastWeapon = null;
let lastVehicle = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

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
        // Guard against double initialization
        if (isHUDReady || isInitializing) {
            mp.gui.chat.push('[Elite HUD] Already initialized or initializing...');
            return;
        }
        
        // Guard against too many attempts
        if (initAttempts >= MAX_INIT_ATTEMPTS) {
            mp.gui.chat.push('!{#FF0000}[Elite HUD] Max initialization attempts reached');
            return;
        }
        
        isInitializing = true;
        initAttempts++;
        mp.gui.chat.push(`[Elite HUD] Initializing... (Attempt ${initAttempts}/${MAX_INIT_ATTEMPTS})`);
        
        // Cleanup any existing browser
        if (hudBrowser) {
            try {
                hudBrowser.destroy();
            } catch (e) {
                // Already destroyed
            }
            hudBrowser = null;
        }
        
        // Create CEF browser
        hudBrowser = mp.browsers.new('package://CEF/hud-modern.html');
        
        if (!hudBrowser) {
            throw new Error('Failed to create browser');
        }
        
        // Wait for browser to load
        setTimeout(() => {
            if (!hudBrowser) {
                mp.gui.chat.push('!{#FF0000}[Elite HUD] Browser was destroyed during initialization');
                isInitializing = false;
                return;
            }
            
            isHUDReady = true;
            isInitializing = false;
            mp.gui.chat.push('!{#00FF88}[Elite HUD] Initialized successfully');
            
            // Load saved settings
            loadHUDSettings();
            
            // Request initial player data from server
            mp.events.callRemote('requestHUDData');
            
            // Start update loop
            startUpdateLoop();
        }, 1000);
        
    } catch (error) {
        isInitializing = false;
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Initialization error: ${error.message}`);
        
        // Cleanup on error
        if (hudBrowser) {
            try {
                hudBrowser.destroy();
            } catch (e) {
                // Ignore
            }
            hudBrowser = null;
        }
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
    
    // Trigger damage effect BEFORE updating lastHealth
    if (health < lastHealth && lastHealth > 0) {
        if (hudBrowser && isHUDReady) {
            hudBrowser.execute('if(window.HUD) window.HUD.triggerDamageFlash()');
        }
    }
    
    // Only update if values changed
    if (health !== lastHealth || armor !== lastArmor) {
        lastHealth = health;
        lastArmor = armor;
        
        // Note: Cash, bank, hunger, thirst, XP come from server
        if (hudBrowser && isHUDReady) {
            hudBrowser.execute(`if(window.HUD) window.HUD.updateHealth(${Math.max(0, Math.min(100, health))})`);
            hudBrowser.execute(`if(window.HUD) window.HUD.updateArmor(${Math.max(0, Math.min(100, armor))})`);
        }
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
    2578778090: 'Knife'
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
    if (!hudBrowser || !isHUDReady) return;
    
    const player = mp.players.local;
    const currentWeapon = player.weapon;
    
    const weaponName = WEAPON_NAMES[currentWeapon] || 'Unknown';
    const weaponIcon = WEAPON_ICONS[currentWeapon] || '❓';
    
    // Safe ammo retrieval
    let ammo = 0;
    let ammoMax = 0;
    
    try {
        if (typeof player.getAmmoInClip === 'function') {
            ammo = player.getAmmoInClip() || 0;
        }
        if (typeof player.getAmmo === 'function') {
            ammoMax = player.getAmmo(currentWeapon) || 0;
        }
    } catch (e) {
        // Ammo functions might not be available
    }
    
    // Escape special characters for JS execution
    const safeName = weaponName.replace(/"/g, '\\"').replace(/'/g, "\\'");
    const safeIcon = weaponIcon.replace(/"/g, '\\"');
    
    hudBrowser.execute(
        `if(window.HUD) window.HUD.updateWeapon("${safeName}", ${ammo}, ${ammoMax}, "${safeIcon}")`
    );
    
    lastWeapon = currentWeapon;
}

// ============================================
// VEHICLE INFO UPDATE
// ============================================

function updateVehicleInfo() {
    if (!hudBrowser || !isHUDReady) return;
    
    const player = mp.players.local;
    const vehicle = player.vehicle;
    
    // Check if player is in vehicle
    if (vehicle && mp.vehicles.exists(vehicle)) {
        if (lastVehicle !== vehicle) {
            lastVehicle = vehicle;
            hudBrowser.execute('if(window.HUD) window.HUD.updateVehicleStatus(true)');
        }
        
        // Get vehicle data with safety checks
        let speed = 0;
        try {
            if (typeof vehicle.getSpeed === 'function') {
                speed = vehicle.getSpeed() * 2.23694; // Convert to MPH
            }
        } catch (e) {
            speed = 0;
        }
        
        const fuel = vehicle.getVariable('fuel');
        const engine = vehicle.getVariable('engine');
        const lightsOn = vehicle.getVariable('lights');
        const locked = vehicle.getVariable('locked');
        
        // Use default values if variables are undefined
        const safeFuel = (fuel !== undefined && fuel !== null) ? fuel : 100;
        const safeEngine = (engine !== undefined && engine !== null) ? engine : false;
        const safeLights = (lightsOn !== undefined && lightsOn !== null) ? lightsOn : false;
        const safeLocked = (locked !== undefined && locked !== null) ? locked : false;
        
        hudBrowser.execute(
            `if(window.HUD) window.HUD.updateVehicleData(${Math.round(speed)}, ${safeFuel}, ${safeEngine}, ${safeLights}, ${safeLocked})`
        );
        
    } else {
        if (lastVehicle !== null) {
            lastVehicle = null;
            hudBrowser.execute('if(window.HUD) window.HUD.updateVehicleStatus(false)');
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

// Zone name detection (basic implementation)
function getZoneName(position) {
    // Basic zone detection based on coordinates
    const x = position.x;
    const y = position.y;
    
    // Los Santos downtown area
    if (x >= -1000 && x <= 1000 && y >= -1000 && y <= 1000) {
        return 'Los Santos';
    }
    // Sandy Shores area
    else if (x >= 1000 && x <= 2000 && y >= 2000 && y <= 4000) {
        return 'Sandy Shores';
    }
    // Paleto Bay area
    else if (x >= -500 && x <= 500 && y >= 6000 && y <= 7000) {
        return 'Paleto Bay';
    }
    // Default to Blaine County for everything else
    else {
        return 'Blaine County';
    }
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
    
    // Escape special characters to prevent JS injection
    const safeTitle = String(title).replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ');
    const safeMessage = String(message).replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ');
    const safeType = String(type).replace(/[^a-z]/g, '');
    const safeIcon = String(icon).replace(/"/g, '\\"');
    
    hudBrowser.execute(
        `if(window.HUD) window.HUD.showNotification("${safeTitle}", "${safeMessage}", "${safeType}", "${safeIcon}")`
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
        // Escape JSON string for safe execution
        const safeJson = settingsJson.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
        hudBrowser.execute(`if(window.HUD && mp && mp.events) mp.events.call('loadHUDSettings', '${safeJson}')`);
    } catch (error) {
        mp.gui.chat.push(`!{#FF0000}[Elite HUD] Settings receive error: ${error.message}`);
    }
});

// ============================================
// KEYBINDS
// ============================================

// F5 - Toggle HUD visibility
mp.keys.bind(0x74, true, () => {
    if (isHUDReady && hudBrowser) {
        hudBrowser.execute(`
            const hudContainer = document.getElementById('hudContainer');
            if(hudContainer) {
                hudContainer.classList.toggle('hud-hidden');
            }
        `);
    }
});

// ============================================
// PLAYER EVENTS
// ============================================

// Player ready event (primary initialization point)
mp.events.add('playerReady', () => {
    if (!isHUDReady && !isInitializing) {
        mp.gui.chat.push('[Elite HUD] Player ready, initializing HUD...');
        setTimeout(() => {
            initializeHUD();
        }, 500); // Small delay to ensure other systems ready
    }
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
// UNIVERSAL NOTIFICATION HANDLER (for compatibility)
// ============================================

/**
 * Generic notification event for backwards compatibility
 * This allows other modules to call mp.events.call('showNotification', ...)
 * and have it display in the Elite HUD
 */
mp.events.add('showNotification', (message, type = 'info', icon = null) => {
    if (!isHUDReady || !hudBrowser) {
        // Fallback to chat if HUD not ready
        mp.gui.chat.push(`[${type.toUpperCase()}] ${message}`);
        return;
    }
    
    // Map generic types to HUD notification format
    const typeMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    const mappedType = typeMap[type] || 'info';
    
    // Auto-select icon based on type if not provided
    const iconMap = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const displayIcon = icon || iconMap[mappedType] || 'ℹ️';
    
    // Escape special characters
    const safeMessage = String(message || '').replace(/\"/g, '\\\\\"').replace(/'/g, \"\\\\'\" ).replace(/\n/g, ' ');
    const safeIcon = String(displayIcon).replace(/\"/g, '\\\\\"').substring(0, 10);
    const safeType = String(mappedType).replace(/[^a-z]/g, '');
    
    // Show notification in HUD
    hudBrowser.execute(
        `if(window.HUD) window.HUD.showNotification("Notification", "${safeMessage}", "${safeType}", "${safeIcon}")`
    );
});

// ============================================
// CLEANUP
// ============================================

mp.events.add('playerQuit', () => {
    cleanupHUD();
});

function cleanupHUD() {
    // Clear update interval
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    // Destroy browser
    if (hudBrowser) {
        try {
            hudBrowser.destroy();
        } catch (e) {
            // Already destroyed
        }
        hudBrowser = null;
    }
    
    // Reset state
    isHUDReady = false;
    isInitializing = false;
    lastHealth = 100;
    lastArmor = 0;
    lastWeapon = null;
    lastVehicle = null;
}

// ============================================
// INITIALIZATION ON LOAD
// ============================================

// Auto-initialization removed to prevent conflicts
// HUD will initialize on playerReady event only

mp.gui.chat.push('[Elite HUD] Handler loaded successfully');
