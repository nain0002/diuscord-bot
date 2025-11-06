/**
 * Interactions Module
 * Unified interaction handler for E key press
 */

// Render loop for showing interaction prompts
setInterval(() => {
    if (!mp.players.local) return;
    
    const playerPos = mp.players.local.position;
    
    // Check banking
    if (global.bankingInteraction && global.bankingInteraction.isNear()) {
        mp.game.graphics.drawText('Press ~g~E~w~ to access Banking', [0.5, 0.9],
            {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.4, 0.4],
                outline: true
            }
        );
    }
    // Check shops
    else if (global.shopInteraction && global.shopInteraction.isNear()) {
        mp.game.graphics.drawText('Press ~g~E~w~ to open Shop', [0.5, 0.9],
            {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.4, 0.4],
                outline: true
            }
        );
    }
    // Check vehicle shops
    else if (global.vehicleInteraction && global.vehicleInteraction.isNear()) {
        mp.game.graphics.drawText('Press ~g~E~w~ to browse Vehicles', [0.5, 0.9],
            {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.4, 0.4],
                outline: true
            }
        );
    }
    // Check jobs
    else if (global.jobInteraction && global.jobInteraction.isNear()) {
        mp.game.graphics.drawText('Press ~g~E~w~ to start Job', [0.5, 0.9],
            {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.4, 0.4],
                outline: true
            }
        );
    }
}, 0);

// E key handler - unified for all interactions
mp.keys.bind(0x45, false, () => { // E key
    if (!mp.players.local) return;
    
    // Priority order: Banking > Shops > Vehicles > Jobs
    if (global.bankingInteraction && global.bankingInteraction.isNear()) {
        global.bankingInteraction.activate();
    }
    else if (global.shopInteraction) {
        const shopType = global.shopInteraction.isNear();
        if (shopType) {
            global.shopInteraction.activate(shopType);
        }
    }
    else if (global.vehicleInteraction && global.vehicleInteraction.isNear()) {
        global.vehicleInteraction.activate();
    }
    else if (global.jobInteraction) {
        const jobId = global.jobInteraction.isNear();
        if (jobId) {
            global.jobInteraction.activate(jobId);
        }
    }
});

console.log('[Client] Interactions module loaded');
