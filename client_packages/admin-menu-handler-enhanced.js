// Enhanced Admin Menu Handler
let adminMenuBrowser = null;
let adminMenuOpen = false;
let spectating = false;
let noClipEnabled = false;
let noClipCamera = null;
let noClipSpeed = 0.5;

// Create admin menu browser
mp.events.add('browserCreated', (browser) => {
    if (browser && browser.url && browser.url.includes('admin-menu-enhanced.html')) {
        adminMenuBrowser = browser;
    }
});

// Initialize admin menu browser
function initAdminMenu() {
    if (!adminMenuBrowser) {
        adminMenuBrowser = mp.browsers.new('package://CEF/admin-menu-enhanced.html');
        adminMenuBrowser.active = false;
    }
}

// Toggle admin menu (F6 key)
mp.keys.bind(0x75, false, function() { // F6
    try {
        const player = mp.players.local;
        if (!player) return;
        
        // Check BOTH isAdmin and admin_level for compatibility
        const isAdmin = player.getVariable('isAdmin');
        const adminLevel = player.getVariable('admin_level') || 0;
        
        if (!isAdmin && adminLevel === 0) {
            mp.gui.chat.push('!{#FF0000}You must be an admin to use this menu!');
            return;
        }
        
        if (!adminMenuBrowser) {
            initAdminMenu();
        }
        
        if (!adminMenuBrowser) {
            console.error('[Admin Menu] Failed to initialize browser');
            return;
        }
        
        adminMenuOpen = !adminMenuOpen;
        adminMenuBrowser.active = adminMenuOpen;
        mp.gui.cursor.visible = adminMenuOpen;
        
        if (adminMenuOpen) {
            mp.events.callRemote('getAdminStatistics');
            mp.events.callRemote('getOnlinePlayerList');
        }
    } catch (error) {
        console.error('[Admin Menu] Error toggling menu:', error);
    }
});

// Close admin menu
mp.events.add('closeAdminMenu', () => {
    adminMenuOpen = false;
    if (adminMenuBrowser) {
        adminMenuBrowser.active = false;
    }
    mp.gui.cursor.visible = false;
});

// Request admin data
mp.events.add('requestAdminData', () => {
    mp.events.callRemote('getAdminStatistics');
});

// Request player list
mp.events.add('requestPlayerList', () => {
    mp.events.callRemote('getOnlinePlayerList');
});

// Request chat logs
mp.events.add('requestChatLogs', () => {
    mp.events.callRemote('getChatLogs');
});

// Request reports
mp.events.add('requestReports', () => {
    mp.events.callRemote('getReports');
});

// Update stats
mp.events.add('updateAdminStats', (data) => {
    try {
        if (adminMenuBrowser && typeof data === 'object') {
            adminMenuBrowser.execute(`updateStats(${JSON.stringify(data)})`);
        }
    } catch (error) {
        console.error('[Admin Menu] Error updating stats:', error);
    }
});

// Update player list
mp.events.add('updateAdminPlayerList', (data) => {
    try {
        if (adminMenuBrowser && Array.isArray(data)) {
            adminMenuBrowser.execute(`updatePlayerList(${JSON.stringify(data)})`);
        }
    } catch (error) {
        console.error('[Admin Menu] Error updating player list:', error);
    }
});

// Update chat logs
mp.events.add('updateChatLogs', (data) => {
    try {
        if (adminMenuBrowser && Array.isArray(data)) {
            adminMenuBrowser.execute(`updateChatLogs(${JSON.stringify(data)})`);
        }
    } catch (error) {
        console.error('[Admin Menu] Error updating chat logs:', error);
    }
});

// Update reports
mp.events.add('updateReports', (data) => {
    try {
        if (adminMenuBrowser && Array.isArray(data)) {
            adminMenuBrowser.execute(`updateReports(${JSON.stringify(data)})`);
        }
    } catch (error) {
        console.error('[Admin Menu] Error updating reports:', error);
    }
});

// Player actions
mp.events.add('adminPlayerAction', (action, playerId) => {
    mp.events.callRemote('adminPlayerAction', action, playerId);
});

// Admin commands
mp.events.add('adminCommand', (action, param) => {
    mp.events.callRemote('adminCommand', action, param || '');
});

// Spawn vehicle
mp.events.add('adminSpawnVehicle', (model, color) => {
    mp.events.callRemote('adminSpawnVehicle', model, JSON.stringify(color));
});

// Spawn object
mp.events.add('adminSpawnObject', (model) => {
    mp.events.callRemote('adminSpawnObject', model);
});

// Give weapon
mp.events.add('adminGiveWeapon', (weapon) => {
    mp.events.callRemote('adminGiveWeapon', weapon);
});

// Teleport
mp.events.add('adminTeleport', (x, y, z) => {
    try {
        const player = mp.players.local;
        if (player && typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            player.position = new mp.Vector3(x, y, z);
            mp.game.ui.displayRadar(true);
            mp.gui.chat.push(`!{#00FF00}Teleported to: ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`);
        }
    } catch (error) {
        console.error('[Admin Menu] Error teleporting:', error);
    }
});

// Set weather
mp.events.add('adminSetWeather', (weather) => {
    mp.events.callRemote('adminSetWeather', weather);
});

// Set time
mp.events.add('adminSetTime', (hour) => {
    mp.events.callRemote('adminSetTime', hour);
});

// Toggle world
mp.events.add('adminToggleWorld', (type) => {
    mp.events.callRemote('adminToggleWorld', type);
});

// Punishment commands
mp.events.add('adminWarn', (playerId, reason) => {
    mp.events.callRemote('adminWarn', playerId, reason);
});

mp.events.add('adminMute', (playerId, reason) => {
    mp.events.callRemote('adminMute', playerId, reason);
});

mp.events.add('adminJail', (playerId, reason) => {
    mp.events.callRemote('adminJail', playerId, reason);
});

mp.events.add('adminKick', (playerId, reason) => {
    mp.events.callRemote('adminKick', playerId, reason);
});

mp.events.add('adminBan', (playerId, reason) => {
    mp.events.callRemote('adminBan', playerId, reason);
});

// Whitelist management
mp.events.add('adminAddWhitelist', (name) => {
    mp.events.callRemote('adminAddWhitelist', name);
});

mp.events.add('adminRemoveWhitelist', (name) => {
    mp.events.callRemote('adminRemoveWhitelist', name);
});

// NoClip toggle
mp.events.add('adminToggleNoClip', (enabled) => {
    noClipEnabled = enabled;
    const player = mp.players.local;
    
    if (noClipEnabled) {
        player.freezePosition(true);
        mp.game.controls.disableAllControlActions(0);
        
        if (!noClipCamera) {
            const pos = player.position;
            const rot = player.getRotation(0);
            noClipCamera = mp.cameras.new('default', pos, rot, 60);
            noClipCamera.setActive(true);
            mp.game.cam.renderScriptCams(true, false, 0, true, false);
        }
        
        // NoClip controls
        mp.events.add('render', handleNoClip);
    } else {
        player.freezePosition(false);
        mp.game.controls.enableAllControlActions(0);
        
        if (noClipCamera) {
            mp.game.cam.renderScriptCams(false, false, 0, true, false);
            noClipCamera.destroy();
            noClipCamera = null;
        }
        
        mp.events.remove('render', handleNoClip);
    }
});

function handleNoClip() {
    if (!noClipEnabled || !noClipCamera) return;
    
    const camera = noClipCamera;
    const pos = camera.getCoord();
    const rot = camera.getRot(0);
    
    // Movement controls
    let forward = 0;
    let right = 0;
    let up = 0;
    
    if (mp.game.controls.isControlPressed(0, 32)) forward = noClipSpeed; // W
    if (mp.game.controls.isControlPressed(0, 33)) forward = -noClipSpeed; // S
    if (mp.game.controls.isControlPressed(0, 34)) right = -noClipSpeed; // A
    if (mp.game.controls.isControlPressed(0, 35)) right = noClipSpeed; // D
    if (mp.game.controls.isControlPressed(0, 44)) up = noClipSpeed; // Q
    if (mp.game.controls.isControlPressed(0, 46)) up = -noClipSpeed; // E
    
    // Speed modifier (Shift)
    if (mp.game.controls.isControlPressed(0, 21)) {
        forward *= 3;
        right *= 3;
        up *= 3;
    }
    
    // Calculate new position
    const radZ = rot.z * Math.PI / 180;
    const newPos = new mp.Vector3(
        pos.x + (Math.sin(radZ) * forward) + (Math.cos(radZ) * right),
        pos.y + (Math.cos(radZ) * forward) + (-Math.sin(radZ) * right),
        pos.z + up
    );
    
    camera.setCoord(newPos.x, newPos.y, newPos.z);
    
    // Mouse look
    const mouseDeltaX = mp.game.controls.getDisabledControlNormal(1, 1) * 5;
    const mouseDeltaY = mp.game.controls.getDisabledControlNormal(1, 2) * 5;
    
    camera.setRot(rot.x - mouseDeltaY, 0, rot.z - mouseDeltaX, 0);
    
    // Update player position
    mp.players.local.position = newPos;
}

// God Mode toggle
mp.events.add('adminToggleGodMode', (enabled) => {
    const player = mp.players.local;
    if (enabled) {
        player.setInvincible(true);
        mp.game.player.setInvincible(true);
    } else {
        player.setInvincible(false);
        mp.game.player.setInvincible(false);
    }
});

// Invisible toggle
mp.events.add('adminToggleInvisible', (enabled) => {
    const player = mp.players.local;
    player.setAlpha(enabled ? 0 : 255, false);
});

// Spectate functions
mp.events.add('adminStartSpectate', (playerId) => {
    mp.events.callRemote('startSpectate', playerId);
});

mp.events.add('adminStopSpectate', () => {
    mp.events.callRemote('stopSpectate');
});

mp.events.add('spectatePlayer', (targetPos, targetRot) => {
    spectating = true;
    const player = mp.players.local;
    player.setInvincible(true);
    player.setAlpha(0, false);
    player.position = targetPos;
});

mp.events.add('stopSpectating', () => {
    spectating = false;
    const player = mp.players.local;
    player.setInvincible(false);
    player.setAlpha(255, false);
});

// Screenshot
mp.events.add('adminTakeScreenshot', (playerId) => {
    mp.events.callRemote('takeScreenshot', playerId);
});

// Client-side screenshot request handler
mp.events.add('takeScreenshotRequest', () => {
    // Take screenshot and save locally
    // Note: This would require additional implementation
    mp.gui.chat.push('!{#FFA500}Admin requested a screenshot');
});

// Handle report
mp.events.add('adminHandleReport', (reportId, action) => {
    mp.events.callRemote('handleReport', reportId, action);
});

// Show notifications from server
mp.events.add('showAdminNotification', (message, type) => {
    mp.gui.chat.push(`[ADMIN] ${message}`);
});

// World toggle handlers
mp.events.add('setTrafficEnabled', (enabled) => {
    mp.game.gameplay.setVehicleDensityMultiplierThisFrame(enabled ? 1.0 : 0.0);
});

mp.events.add('setPedsEnabled', (enabled) => {
    mp.game.gameplay.setPedDensityMultiplierThisFrame(enabled ? 1.0 : 0.0);
});

mp.events.add('setPoliceEnabled', (enabled) => {
    mp.game.invoke('0xDB2A4E24FACC04E7', !enabled); // SET_CREATE_RANDOM_COPS
});

console.log('[Admin Menu Enhanced] Loaded successfully');
