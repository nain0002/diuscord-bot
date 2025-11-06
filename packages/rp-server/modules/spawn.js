/**
 * Spawn Module
 * Handles player spawning and basic commands
 */

const playerModule = require('./player');

// Chat command
mp.events.addCommand('me', (player, fullText, ...text) => {
    if (text.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /me [action]');
        return;
    }

    const message = text.join(' ');
    const nearbyPlayers = mp.players.toArray().filter(p => 
        p.dimension === player.dimension && 
        p.dist(player.position) <= 20
    );

    nearbyPlayers.forEach(p => {
        p.outputChatBox(`!{#C2A2DA}* ${player.name} ${message}`);
    });
});

// Do command
mp.events.addCommand('do', (player, fullText, ...text) => {
    if (text.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /do [description]');
        return;
    }

    const message = text.join(' ');
    const nearbyPlayers = mp.players.toArray().filter(p => 
        p.dimension === player.dimension && 
        p.dist(player.position) <= 20
    );

    nearbyPlayers.forEach(p => {
        p.outputChatBox(`!{#91C090}* ${message} (( ${player.name} ))`);
    });
});

// Try command
mp.events.addCommand('try', (player, fullText, ...text) => {
    if (text.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /try [action]');
        return;
    }

    const message = text.join(' ');
    const success = Math.random() >= 0.5;
    const result = success ? 'succeeds' : 'fails';

    const nearbyPlayers = mp.players.toArray().filter(p => 
        p.dimension === player.dimension && 
        p.dist(player.position) <= 20
    );

    nearbyPlayers.forEach(p => {
        p.outputChatBox(`!{#C2A2DA}* ${player.name} tries to ${message} and ${result}`);
    });
});

// B command (local OOC chat)
mp.events.addCommand('b', (player, fullText, ...text) => {
    if (text.length === 0) {
        player.outputChatBox('!{#FFFF00}Usage: /b [message]');
        return;
    }

    const message = text.join(' ');
    const nearbyPlayers = mp.players.toArray().filter(p => 
        p.dimension === player.dimension && 
        p.dist(player.position) <= 20
    );

    nearbyPlayers.forEach(p => {
        p.outputChatBox(`!{#AAAAAA}(( ${player.name}: ${message} ))`);
    });
});

// Help command
mp.events.addCommand('help', (player) => {
    player.outputChatBox('!{#00FF00}========== HELP ==========');
    player.outputChatBox('!{#FFFF00}Chat Commands:');
    player.outputChatBox('/me [action] - Roleplay action');
    player.outputChatBox('/do [description] - Describe environment');
    player.outputChatBox('/try [action] - Try an action (50% chance)');
    player.outputChatBox('/b [message] - Local OOC chat');
    player.outputChatBox('!{#FFFF00}Player Commands:');
    player.outputChatBox('/stats - View your stats');
    player.outputChatBox('/job - View current job info');
    player.outputChatBox('/quitjob - Quit current job');
    player.outputChatBox('!{#FFFF00}Vehicle Commands:');
    player.outputChatBox('/engine - Toggle engine');
    player.outputChatBox('/lock - Lock/unlock vehicle');
    player.outputChatBox('!{#00FF00}=========================');
});

// Stats command
mp.events.addCommand('stats', (player) => {
    const data = playerModule.getPlayerData(player);
    
    if (!data || !data.characterData) {
        player.outputChatBox('!{#FF0000}Character data not loaded!');
        return;
    }

    const char = data.characterData;
    player.outputChatBox('!{#00FF00}========== STATS ==========');
    player.outputChatBox(`!{#FFFFFF}Name: ${char.name}`);
    player.outputChatBox(`!{#FFFFFF}Age: ${char.age}`);
    player.outputChatBox(`!{#FFFFFF}Gender: ${char.gender}`);
    player.outputChatBox(`!{#00FF00}Money: $${char.money.toLocaleString()}`);
    player.outputChatBox(`!{#00FF00}Bank: $${char.bankBalance.toLocaleString()}`);
    player.outputChatBox(`!{#FFFF00}Job: ${char.job} (Rank ${char.jobRank})`);
    player.outputChatBox(`!{#FF0000}Health: ${player.health}`);
    player.outputChatBox(`!{#0088FF}Armor: ${player.armour}`);
    player.outputChatBox('!{#00FF00}==========================');
});

// Animation commands
mp.events.addCommand('sit', (player) => {
    player.call('client:playAnimation', ['anim@heists@prison_heiststation@cop_reactions', 'cop_b_idle', 1]);
});

mp.events.addCommand('dance', (player) => {
    player.call('client:playAnimation', ['anim@mp_player_intcelebrationmale@salsa_roll', 'salsa_roll', 1]);
});

mp.events.addCommand('handsup', (player) => {
    player.call('client:playAnimation', ['missminuteman_1ig_2', 'handsup_base', 1]);
});

mp.events.addCommand('stopanim', (player) => {
    player.call('client:stopAnimation');
});

console.log('[Spawn] Module loaded');

module.exports = {};
