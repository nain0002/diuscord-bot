/**
 * HUD Client Module
 * Handles the heads-up display
 */

let hudBrowser = null;
let isHudVisible = true;

// Create HUD
mp.events.add('playerReady', () => {
    if (!hudBrowser) {
        hudBrowser = mp.browsers.new('package://CEF/hud.html');
    }
});

// Update all HUD elements
mp.events.add('hud:updateAll', (characterData) => {
    if (hudBrowser) {
        hudBrowser.execute(`updateMoney(${characterData.money})`);
        hudBrowser.execute(`updateBank(${characterData.bankBalance})`);
        hudBrowser.execute(`updateJob('${characterData.job}')`);
    }
});

// Update money display
mp.events.add('client:updateMoney', (money) => {
    if (hudBrowser) {
        hudBrowser.execute(`updateMoney(${money})`);
    }
});

// Update bank balance display
mp.events.add('client:updateBankBalance', (balance) => {
    if (hudBrowser) {
        hudBrowser.execute(`updateBank(${balance})`);
    }
});

// Toggle HUD visibility
mp.keys.bind(0x55, false, () => { // U key
    isHudVisible = !isHudVisible;
    if (hudBrowser) {
        hudBrowser.execute(`toggleHud(${isHudVisible})`);
    }
});

// Update health and armor
setInterval(() => {
    if (hudBrowser && mp.players.local) {
        const health = mp.players.local.getHealth();
        const armor = mp.players.local.getArmour();
        hudBrowser.execute(`updateHealth(${health})`);
        hudBrowser.execute(`updateArmor(${armor})`);
    }
}, 100);

console.log('[Client] HUD module loaded');
