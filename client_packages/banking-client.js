// Banking System Client-Side Integration
// Handles communication between game and banking UI

let bankingBrowser = null;
let isATMOpen = false;

// ==================== BANK INTERACTION ====================

// Detect when player is near bank
mp.events.add('playerEnterColshape', (shape) => {
    if (shape.bankId) {
        // Show prompt
        mp.game.ui.displayHelpTextThisFrame('Press ~INPUT_CONTEXT~ to access the bank');
    }
    
    if (shape.atmId) {
        mp.game.ui.displayHelpTextThisFrame('Press ~INPUT_CONTEXT~ to use ATM');
    }
});

// Open bank interface
mp.keys.bind(0x45, true, () => { // E key
    // Check if near bank colshape
    const nearBank = isNearBank();
    if (nearBank) {
        openBank();
    }
    
    const nearATM = isNearATM();
    if (nearATM) {
        openATM();
    }
});

function openBank() {
    if (bankingBrowser) return;

    // Create browser
    bankingBrowser = mp.browsers.new('package://banking/ui/bank.html');
    
    // Show cursor
    mp.gui.cursor.show(true, true);
    mp.gui.chat.show(false);
    
    // Disable controls
    mp.game.ui.displayRadar(false);
    
    // Request data from server
    mp.events.callRemote('bank:open');
    
    console.log('[Banking Client] Bank opened');
}

function closeBank() {
    if (!bankingBrowser) return;

    bankingBrowser.destroy();
    bankingBrowser = null;
    
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(true);
    mp.game.ui.displayRadar(true);
    
    mp.events.callRemote('bank:close');
    
    console.log('[Banking Client] Bank closed');
}

// ==================== BANK UI EVENTS ====================

// These events are triggered by the banking UI (bank.js)
mp.events.add('bank:deposit', (amount) => {
    mp.events.callRemote('bank:deposit', amount);
});

mp.events.add('bank:withdraw', (amount) => {
    mp.events.callRemote('bank:withdraw', amount);
});

mp.events.add('bank:transfer', (recipient, amount, note) => {
    mp.events.callRemote('bank:transfer', recipient, amount, note);
});

mp.events.add('bank:verifyPIN', (pin) => {
    mp.events.callRemote('bank:verifyPIN', pin);
});

mp.events.add('bank:refreshBalance', () => {
    mp.events.callRemote('bank:refreshBalance');
});

mp.events.add('bank:getTransactions', () => {
    mp.events.callRemote('bank:getTransactions');
});

mp.events.add('bank:filterTransactions', (type, date) => {
    mp.events.callRemote('bank:filterTransactions', type, date);
});

mp.events.add('bank:applyLoan', (amount, term) => {
    mp.events.callRemote('bank:applyLoan', amount, term);
});

mp.events.add('bank:getLoans', () => {
    mp.events.callRemote('bank:getLoans');
});

mp.events.add('bank:requestCard', () => {
    mp.events.callRemote('bank:requestCard');
});

mp.events.add('bank:getCards', () => {
    mp.events.callRemote('bank:getCards');
});

mp.events.add('bank:lookupPlayer', (identifier) => {
    mp.events.callRemote('bank:lookupPlayer', identifier);
});

mp.events.add('bank:close', () => {
    closeBank();
});

// Manager events
mp.events.add('bank:manager:getData', () => {
    mp.events.callRemote('bank:manager:getData');
});

mp.events.add('bank:manager:viewAccounts', () => {
    mp.events.callRemote('bank:manager:viewAccounts');
});

mp.events.add('bank:manager:viewLoans', () => {
    mp.events.callRemote('bank:manager:viewLoans');
});

mp.events.add('bank:manager:security', () => {
    mp.events.callRemote('bank:manager:security');
});

mp.events.add('bank:manager:lockdown', () => {
    mp.events.callRemote('bank:manager:lockdown');
});

mp.events.add('bank:callPolice', () => {
    mp.events.callRemote('bank:callPolice');
});

// ==================== SERVER RESPONSES ====================

mp.events.add('updatePlayerData', (data) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.updatePlayerData(${data});`);
    }
});

mp.events.add('updateAccountData', (data) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.updateAccountData(${data});`);
    }
});

mp.events.add('updateTransactions', (transactions) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.renderTransactions(${transactions});`);
    }
});

mp.events.add('updateLoans', (loans) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.renderLoans(${loans});`);
    }
});

mp.events.add('updateCards', (cards) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.renderCards(${cards});`);
    }
});

mp.events.add('updateManagerData', (data) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.updateManagerData(${data});`);
    }
});

mp.events.add('showRecipientInfo', (name, status) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.showRecipientInfo('${name}', '${status}');`);
    }
});

mp.events.add('showNotification', (message, type) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.showNotification('${message}', '${type}');`);
    }
});

mp.events.add('requestPIN', () => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.showModal('pinModal');`);
    }
});

mp.events.add('pinVerified', (success) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.pinVerified(${success});`);
    }
});

// ==================== ROBBERY ALERTS ====================

mp.events.add('robbery:policeAlert', (bankName, timeLeft) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`BankingUI.showRobberyAlert('${bankName}', ${timeLeft});`);
    }
    
    // Also show game notification
    showNotification('🚨 BANK ROBBERY IN PROGRESS', bankName, 'error');
});

mp.events.add('robbery:started', (duration, loot) => {
    // Show robbery progress UI
    showRobberyProgressUI(duration);
});

mp.events.add('robbery:updateProgress', (progress, stage) => {
    // Update robbery progress
    updateRobberyProgress(progress, stage);
});

mp.events.add('robbery:complete', (success, amount) => {
    hideRobberyProgressUI();
    
    if (success) {
        showNotification('Robbery Successful!', `You got $${amount.toLocaleString()}`, 'success');
    } else {
        showNotification('Robbery Failed!', 'Better luck next time', 'error');
    }
});

mp.events.add('robbery:failed', (reason) => {
    hideRobberyProgressUI();
    showNotification('Robbery Failed!', reason, 'error');
});

mp.events.add('atm:robberyStarted', (duration) => {
    showATMRobberyUI(duration);
});

// ==================== UTILITY FUNCTIONS ====================

function isNearBank() {
    // Check if player is near any bank colshape
    // This would be set up in the main script when creating bank colshapes
    return false; // Placeholder
}

function isNearATM() {
    // Check if player is near any ATM
    return false; // Placeholder
}

function showNotification(title, message, type) {
    mp.game.ui.setNotificationTextEntry('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(`~b~${title}~s~\n${message}`);
    mp.game.ui.drawNotification(false, true);
}

function showRobberyProgressUI(duration) {
    // Create or show robbery progress HUD
    console.log(`[Banking Client] Robbery started: ${duration}s`);
}

function updateRobberyProgress(progress, stage) {
    console.log(`[Banking Client] Robbery progress: ${progress}% - ${stage}`);
}

function hideRobberyProgressUI() {
    console.log('[Banking Client] Robbery UI hidden');
}

function showATMRobberyUI(duration) {
    console.log(`[Banking Client] ATM robbery started: ${duration}s`);
}

function openATM() {
    console.log('[Banking Client] ATM opened');
    // Similar to bank but simplified UI
}

// ==================== SOUNDS ====================

mp.events.add('client:playSound', (soundName) => {
    // Play sound effect
    console.log(`[Banking Client] Playing sound: ${soundName}`);
});

console.log('[Banking Client] Banking client scripts loaded');
