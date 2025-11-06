// User Menu Handler - M key menu
let userMenuBrowser = null;
let userMenuOpen = false;

// Create user menu browser
function createUserMenu() {
    if (!userMenuBrowser) {
        userMenuBrowser = mp.browsers.new('package://CEF/user-menu.html');
    }
}

// Toggle user menu with M key
mp.keys.bind(0x4D, false, () => { // M key
    if (!userMenuBrowser) {
        createUserMenu();
    }
    
    userMenuOpen = !userMenuOpen;
    
    if (userMenuOpen) {
        userMenuBrowser.execute('openMenu()');
        mp.gui.cursor.visible = true;
        mp.gui.chat.show(false);
    } else {
        userMenuBrowser.execute('closeMenu()');
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
    }
});

// Get user menu data
mp.events.add('getUserMenuData', () => {
    mp.events.callRemote('requestUserMenuData');
});

// Update menu with data from server
mp.events.add('updateUserMenuData', (dataJson) => {
    if (userMenuBrowser) {
        userMenuBrowser.execute(`updateMenuData(${dataJson})`);
    }
});

// Handle menu actions
mp.events.add('userMenuAction', (action) => {
    switch (action) {
        case 'phone':
            mp.events.call('showNotification', 'Phone feature coming soon!', 'info');
            break;
        case 'animations':
            mp.events.callRemote('openAnimationMenu');
            break;
        case 'walkstyle':
            mp.events.callRemote('openWalkStyleMenu');
            break;
        case 'accessories':
            mp.events.callRemote('openAccessoriesMenu');
            break;
        case 'vehicle':
            openVehicleMenu();
            break;
        case 'gps':
            mp.events.call('showNotification', 'Set waypoint on map', 'info');
            break;
        case 'id':
            mp.events.callRemote('showIDCard');
            break;
        case 'help':
            showHelpMenu();
            break;
        case 'bank':
            mp.events.callRemote('openBankMenu');
            break;
        case 'shop':
            mp.events.callRemote('openShopMenu');
            break;
        case 'jobs':
            mp.events.callRemote('openJobsMenu');
            break;
        case 'garage':
            mp.events.callRemote('openGarageMenu');
            break;
        default:
            mp.events.callRemote('userMenuAction', action);
    }
});

// Toggle settings
mp.events.add('userMenuToggleSetting', (setting, isActive) => {
    switch (setting) {
        case 'hud':
            mp.events.call('toggleHUD', isActive);
            break;
        case 'notifications':
            mp.events.call('toggleNotifications', isActive);
            break;
        case 'voice':
            mp.events.call('toggleVoiceChat', isActive);
            break;
    }
});

// Vehicle menu actions
function openVehicleMenu() {
    const player = mp.players.local;
    
    if (player.vehicle) {
        mp.events.call('showNotification', 'Vehicle controls: L - Lock/Unlock, E - Engine', 'info');
    } else {
        // Check for nearby vehicle
        mp.events.callRemote('getNearbyVehicle');
    }
}

// Help menu
function showHelpMenu() {
    const helpText = `
    === COMMANDS ===
    /help - Show help
    /me [action] - Roleplay action
    /do [action] - Describe action
    /b [message] - OOC chat
    /pm [id] [msg] - Private message
    
    === HOTKEYS ===
    M - User Menu
    I - Inventory
    F - Interact
    L - Lock Vehicle
    E - Engine On/Off
    `;
    
    mp.events.call('showNotification', helpText, 'info');
}

// Close event
mp.events.add('userMenuClosed', () => {
    userMenuOpen = false;
    mp.gui.cursor.visible = false;
    mp.gui.chat.show(true);
});

// ESC key to close menu
mp.keys.bind(0x1B, false, () => { // ESC
    if (userMenuOpen) {
        userMenuBrowser.execute('closeMenu()');
        userMenuOpen = false;
        mp.gui.cursor.visible = false;
        mp.gui.chat.show(true);
    }
});
