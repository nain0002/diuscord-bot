/**
 * Loading Screen Handler
 * Shows loading screen on join, then transitions to auth
 */

let loadingBrowser = null;
let loadingComplete = false;

// Show loading screen immediately
function showLoadingScreen() {
    if (!loadingBrowser) {
        loadingBrowser = mp.browsers.new('package://CEF/loading-screen.html');
        console.log('[Loading] Loading screen created');
    }
    
    mp.gui.cursor.visible = true;
    mp.gui.chat.show(false);
}

// Loading complete - show auth
mp.events.add('loadingComplete', () => {
    console.log('[Loading] Loading complete, showing auth');
    loadingComplete = true;
    
    if (loadingBrowser) {
        loadingBrowser.destroy();
        loadingBrowser = null;
    }
    
    // Trigger auth screen
    mp.events.call('showLoginScreen');
});

// Initialize loading screen on spawn
mp.events.add('playerReady', () => {
    if (!loadingComplete) {
        showLoadingScreen();
    }
});

// Show loading screen immediately when script loads
showLoadingScreen();

console.log('[Loading] Loading screen handler initialized');
