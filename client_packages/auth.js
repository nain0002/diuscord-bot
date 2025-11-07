// Modern Authentication Handler
let authBrowser = null;

// Create auth browser
mp.events.add('showLoginScreen', () => {
    if (!authBrowser) {
        authBrowser = mp.browsers.new('package://CEF/modern-auth.html');
    }
    
    mp.gui.cursor.visible = true;
    mp.gui.chat.show(false);
    
    // Freeze player
    mp.players.local.freezePosition(true);
});

// Handle player login
mp.events.add('playerLogin', (username, password) => {
    mp.events.callRemote('attemptLogin', username, password);
});

// Handle player registration
mp.events.add('playerRegister', (username, password, email) => {
    mp.events.callRemote('attemptRegister', username, password, email);
});

// Login success - close auth screen
mp.events.add('loginSuccess', () => {
    if (authBrowser) {
        authBrowser.destroy();
        authBrowser = null;
    }
    
    mp.gui.cursor.visible = false;
    mp.gui.chat.show(true);
    mp.players.local.freezePosition(false);
    
    mp.events.call('showNotification', 'Welcome to the server!', 'success');
});

// Login failed
mp.events.add('loginFailed', (reason) => {
    if (authBrowser) {
        authBrowser.execute(`showError("${reason}")`);
    }
});

// Registration success
mp.events.add('registerSuccess', () => {
    if (authBrowser) {
        authBrowser.execute(`showSuccess("Registration successful! You can now login.")`);
        authBrowser.execute(`switchTab('login')`);
    }
});

// Registration failed
mp.events.add('registerFailed', (reason) => {
    if (authBrowser) {
        authBrowser.execute(`showError("${reason}")`);
    }
});

// After successful login, show character creation if no character exists
mp.events.add('showCharacterCreation', () => {
    if (authBrowser) {
        authBrowser.destroy();
        authBrowser = null;
    }
    
    mp.events.call('openCharacterCreation');
});

// Character creation complete - spawn player
mp.events.add('characterCreationComplete', () => {
    mp.gui.cursor.visible = false;
    mp.gui.chat.show(true);
    mp.players.local.freezePosition(false);
    
    mp.events.call('showNotification', 'Character created successfully!', 'success');
    mp.events.call('playerReady');
});
