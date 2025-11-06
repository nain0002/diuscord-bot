/**
 * Banking Client Module
 * Handles banking UI and interactions
 */

let bankingBrowser = null;
let atmMarkers = [];
let bankMarkers = [];

// Initialize banking locations
mp.events.add('client:initBankingLocations', (atmJson, bankJson) => {
    const atms = JSON.parse(atmJson);
    const banks = JSON.parse(bankJson);
    
    // Create ATM markers
    atms.forEach(atm => {
        const marker = mp.markers.new(1, new mp.Vector3(atm.x, atm.y, atm.z - 1),
            1.0,
            {
                direction: new mp.Vector3(0, 0, 0),
                rotation: new mp.Vector3(0, 0, 0),
                color: [0, 255, 0, 100],
                visible: true,
                dimension: 0
            }
        );
        atmMarkers.push(marker);
    });
    
    // Create bank markers and blips
    banks.forEach(bank => {
        const marker = mp.markers.new(1, new mp.Vector3(bank.x, bank.y, bank.z - 1),
            2.0,
            {
                direction: new mp.Vector3(0, 0, 0),
                rotation: new mp.Vector3(0, 0, 0),
                color: [0, 100, 255, 100],
                visible: true,
                dimension: 0
            }
        );
        bankMarkers.push(marker);
        
        const blip = mp.blips.new(108, new mp.Vector3(bank.x, bank.y, bank.z),
            {
                name: bank.name,
                scale: 0.8,
                color: 2,
                alpha: 255,
                drawDistance: 100.0,
                shortRange: true,
                dimension: 0
            }
        );
    });
});

// Open banking menu
function openBankingMenu() {
    if (bankingBrowser) return;
    
    mp.gui.cursor.show(true, true);
    bankingBrowser = mp.browsers.new('package://CEF/banking.html');
}

// Close banking menu
function closeBankingMenu() {
    if (bankingBrowser) {
        bankingBrowser.destroy();
        bankingBrowser = null;
    }
    mp.gui.cursor.show(false, false);
}

// Banking response
mp.events.add('client:bankingResponse', (type, message) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`showMessage('${type}', '${message}')`);
    }
});

// Show bank balance
mp.events.add('client:showBankBalance', (bankBalance, cash, accountNumber) => {
    if (bankingBrowser) {
        bankingBrowser.execute(`updateBalance(${bankBalance}, ${cash}, '${accountNumber}')`);
    }
});

// Banking actions (called from CEF)
mp.events.add('banking:deposit', (amount) => {
    mp.events.callRemote('server:depositMoney', amount);
});

mp.events.add('banking:withdraw', (amount) => {
    mp.events.callRemote('server:withdrawMoney', amount);
});

mp.events.add('banking:transfer', (targetName, amount) => {
    mp.events.callRemote('server:transferMoney', targetName, amount);
});

mp.events.add('banking:checkBalance', () => {
    mp.events.callRemote('server:checkBalance');
});

mp.events.add('banking:close', () => {
    closeBankingMenu();
});

// Check if near banking location
function isNearBanking() {
    if (!mp.players.local) return false;
    
    const playerPos = mp.players.local.position;
    
    for (const marker of [...atmMarkers, ...bankMarkers]) {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            return true;
        }
    }
    return false;
}

// Export for use in interaction handler
global.bankingInteraction = {
    isNear: isNearBanking,
    activate: () => {
        openBankingMenu();
        mp.events.callRemote('server:checkBalance');
    }
};

console.log('[Client] Banking module loaded');
