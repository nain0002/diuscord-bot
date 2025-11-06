/**
 * Animations Client Module
 * Handles player animations
 */

// Play animation
mp.events.add('client:playAnimation', (dict, name, flag) => {
    const player = mp.players.local;
    if (!player) return;
    
    mp.game.streaming.requestAnimDict(dict);
    
    const interval = setInterval(() => {
        if (mp.game.streaming.hasAnimDictLoaded(dict)) {
            clearInterval(interval);
            player.taskPlayAnim(dict, name, 8.0, 1.0, -1, flag, 0.0, false, false, false);
        }
    }, 10);
});

// Stop animation
mp.events.add('client:stopAnimation', () => {
    const player = mp.players.local;
    if (!player) return;
    
    player.clearTasksImmediately();
});

console.log('[Client] Animations module loaded');
