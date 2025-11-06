// Admin Menu Handler
let adminBrowser = null;
let adminMenuOpen = false;

// Create admin menu browser
function createAdminMenu() {
    if (!adminBrowser) {
        adminBrowser = mp.browsers.new('package://CEF/admin-menu.html');
    }
}

// Open admin menu (F6 for admins)
mp.keys.bind(0x75, false, () => { // F6 key
    const isAdmin = mp.players.local.getVariable('isAdmin');
    
    if (isAdmin) {
        if (!adminBrowser) {
            createAdminMenu();
        }
        
        adminMenuOpen = !adminMenuOpen;
        
        if (adminMenuOpen) {
            adminBrowser.execute('openAdmin()');
            mp.gui.cursor.visible = true;
        } else {
            adminBrowser.execute('closeAdmin()');
            mp.gui.cursor.visible = false;
        }
    } else {
        mp.events.call('showNotification', 'You are not an admin!', 'error');
    }
});

// Get admin stats
mp.events.add('getAdminStats', () => {
    mp.events.callRemote('getAdminStatistics');
});

// Receive admin stats from server
mp.events.add('updateAdminStats', (data) => {
    if (adminBrowser) {
        adminBrowser.execute(`updateStats(${JSON.stringify(data)})`);
    }
});

// Get online players
mp.events.add('getOnlinePlayers', () => {
    mp.events.callRemote('getOnlinePlayerList');
});

// Receive player list from server
mp.events.add('updatePlayerList', (playersJson) => {
    if (adminBrowser) {
        adminBrowser.execute(`updatePlayerList(${playersJson})`);
    }
});

// Admin actions
mp.events.add('adminAction', (action) => {
    mp.events.callRemote('adminCommand', action);
});

// Spawn vehicle
mp.events.add('adminSpawnVehicle', (model) => {
    mp.events.callRemote('adminSpawnVehicle', model);
});

// Teleport
mp.events.add('adminTeleport', (location) => {
    const locations = {
        ls: new mp.Vector3(0, 0, 71),
        airport: new mp.Vector3(-1037, -2737, 20),
        beach: new mp.Vector3(-1392, -1511, 4),
        military: new mp.Vector3(-2360, 3249, 33)
    };
    
    if (locations[location]) {
        mp.players.local.position = locations[location];
        mp.events.call('showNotification', 'Teleported!', 'success');
    }
});

// Spawn item
mp.events.add('adminSpawnItem', (item) => {
    mp.events.callRemote('adminSpawnItem', item);
});

// Set weather
mp.events.add('adminSetWeather', (weather) => {
    mp.events.callRemote('adminSetWeather', weather);
});

// Set time
mp.events.add('adminSetTime', (hour) => {
    mp.events.callRemote('adminSetTime', hour);
});

// Moderation
mp.events.add('adminModerate', (action, playerId) => {
    mp.events.callRemote('adminModerate', action, playerId);
});

// Player action
mp.events.add('adminPlayerAction', (playerId, action) => {
    mp.events.callRemote('adminPlayerAction', playerId, action);
});

// Close event
mp.events.add('adminMenuClosed', () => {
    adminMenuOpen = false;
    mp.gui.cursor.visible = false;
});
