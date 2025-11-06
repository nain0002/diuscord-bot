/**
 * Admin Bridge Module
 * Connects RAGE:MP game server to web admin panel via WebSocket
 */

const WebSocket = require('ws');
const playerModule = require('./player');

let ws = null;
let reconnectInterval = null;
let isConnected = false;

// Admin panel WebSocket URL (add /gameserver path)
const ADMIN_WS_URL = process.env.ADMIN_WS_URL || 'ws://localhost:3001/gameserver';

// Initialize bridge
function initBridge() {
    connectToAdminPanel();
    setupGameEvents();
    
    console.log('[Admin Bridge] Initializing connection to admin panel...');
}

// Connect to admin panel
function connectToAdminPanel() {
    try {
        ws = new WebSocket(ADMIN_WS_URL);

        ws.on('open', () => {
            isConnected = true;
            console.log('[Admin Bridge] Connected to admin panel');
            
            // Send initial server state
            sendServerState();
            
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleAdminCommand(message);
            } catch (error) {
                console.error('[Admin Bridge] Message parse error:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('[Admin Bridge] WebSocket error:', error.message);
        });

        ws.on('close', () => {
            isConnected = false;
            console.log('[Admin Bridge] Disconnected from admin panel. Reconnecting...');
            
            // Attempt reconnection every 5 seconds
            if (!reconnectInterval) {
                reconnectInterval = setInterval(() => {
                    console.log('[Admin Bridge] Attempting reconnection...');
                    connectToAdminPanel();
                }, 5000);
            }
        });

    } catch (error) {
        console.error('[Admin Bridge] Connection error:', error);
    }
}

// Setup game events to send to admin panel
function setupGameEvents() {
    // Player join
    mp.events.add('playerJoin', (player) => {
        sendToAdmin({
            type: 'playerJoin',
            data: {
                id: player.id,
                name: player.name,
                socialClub: player.socialClub || 'Unknown',
                ip: player.ip,
                timestamp: new Date().toISOString()
            }
        });
    });

    // Player quit
    mp.events.add('playerQuit', (player, exitType, reason) => {
        sendToAdmin({
            type: 'playerQuit',
            data: {
                id: player.id,
                name: player.name,
                reason: reason,
                timestamp: new Date().toISOString()
            }
        });
    });

    // Player chat
    mp.events.add('playerChat', (player, text) => {
        sendToAdmin({
            type: 'playerChat',
            data: {
                playerId: player.id,
                playerName: player.name,
                message: text,
                timestamp: new Date().toISOString()
            }
        });
    });

    // Player death
    mp.events.add('playerDeath', (player, reason, killer) => {
        sendToAdmin({
            type: 'playerDeath',
            data: {
                playerId: player.id,
                playerName: player.name,
                killer: killer ? killer.name : 'Unknown',
                timestamp: new Date().toISOString()
            }
        });
    });
}

// Handle commands from admin panel
function handleAdminCommand(message) {
    const { type, data } = message;

    switch (type) {
        case 'getPlayers':
            sendOnlinePlayers();
            break;

        case 'kickPlayer':
            kickPlayer(data.playerId, data.reason);
            break;

        case 'sendMessage':
            sendMessageToPlayer(data.playerId, data.message);
            break;

        case 'broadcastMessage':
            broadcastMessage(data.message);
            break;

        case 'teleportPlayer':
            teleportPlayer(data.playerId, data.x, data.y, data.z);
            break;

        case 'freezePlayer':
            freezePlayer(data.playerId, data.freeze);
            break;

        case 'giveMoneyPlayer':
            giveMoneyToPlayer(data.playerId, data.amount);
            break;

        case 'healPlayer':
            healPlayer(data.playerId);
            break;

        case 'getServerStats':
            sendServerStats();
            break;

        case 'executeCommand':
            executeServerCommand(data.command);
            break;

        default:
            console.log(`[Admin Bridge] Unknown command: ${type}`);
    }
}

// Send message to admin panel
function sendToAdmin(message) {
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
        try {
            ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('[Admin Bridge] Send error:', error);
        }
    }
}

// Send server state
function sendServerState() {
    const players = mp.players.toArray().map(p => ({
        id: p.id,
        name: p.name,
        socialClub: p.socialClub || 'Unknown',
        health: p.health,
        armor: p.armour,
        dimension: p.dimension,
        position: { x: p.position.x, y: p.position.y, z: p.position.z }
    }));

    sendToAdmin({
        type: 'serverState',
        data: {
            players: players,
            playerCount: mp.players.length,
            maxPlayers: mp.config.maxplayers || 100,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
}

// Send online players
function sendOnlinePlayers() {
    const players = mp.players.toArray().map(player => {
        const data = playerModule.getPlayerData(player);
        return {
            id: player.id,
            name: player.name,
            socialClub: player.socialClub || 'Unknown',
            health: player.health,
            armor: player.armour,
            dimension: player.dimension,
            position: { x: player.position.x, y: player.position.y, z: player.position.z },
            characterData: data && data.characterData ? {
                name: data.characterData.name,
                money: data.characterData.money,
                bankBalance: data.characterData.bankBalance,
                job: data.characterData.job
            } : null
        };
    });

    sendToAdmin({
        type: 'onlinePlayers',
        data: players
    });
}

// Send server stats
function sendServerStats() {
    const memUsage = process.memoryUsage();
    
    sendToAdmin({
        type: 'serverStats',
        data: {
            players: {
                online: mp.players.length,
                max: mp.config.maxplayers || 100
            },
            uptime: process.uptime(),
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024)
            },
            cpu: process.cpuUsage(),
            vehicles: mp.vehicles.length,
            timestamp: new Date().toISOString()
        }
    });
}

// Kick player
function kickPlayer(playerId, reason = 'Kicked by admin') {
    const player = mp.players.at(playerId);
    if (player) {
        player.kick(reason);
        console.log(`[Admin Bridge] Kicked player ${player.name}: ${reason}`);
        
        sendToAdmin({
            type: 'playerKicked',
            data: {
                playerId: playerId,
                playerName: player.name,
                reason: reason,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// Send message to player
function sendMessageToPlayer(playerId, message) {
    const player = mp.players.at(playerId);
    if (player) {
        player.outputChatBox(`!{#00FF00}[Admin] ${message}`);
        console.log(`[Admin Bridge] Message sent to ${player.name}: ${message}`);
    }
}

// Broadcast message
function broadcastMessage(message) {
    mp.players.broadcast(`!{#FFFF00}[Announcement] ${message}`);
    console.log(`[Admin Bridge] Broadcast: ${message}`);
    
    sendToAdmin({
        type: 'messageBroadcast',
        data: {
            message: message,
            timestamp: new Date().toISOString()
        }
    });
}

// Teleport player
function teleportPlayer(playerId, x, y, z) {
    const player = mp.players.at(playerId);
    if (player) {
        player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
        player.outputChatBox('!{#00FF00}You have been teleported by an admin');
        console.log(`[Admin Bridge] Teleported ${player.name} to ${x}, ${y}, ${z}`);
    }
}

// Freeze player
function freezePlayer(playerId, freeze) {
    const player = mp.players.at(playerId);
    if (player) {
        player.frozen = freeze;
        player.outputChatBox(freeze ? '!{#FF0000}You have been frozen by an admin' : '!{#00FF00}You have been unfrozen');
        console.log(`[Admin Bridge] ${freeze ? 'Froze' : 'Unfroze'} ${player.name}`);
    }
}

// Give money to player
function giveMoneyToPlayer(playerId, amount) {
    const player = mp.players.at(playerId);
    if (player) {
        playerModule.giveMoney(player, amount);
        player.outputChatBox(`!{#00FF00}Admin gave you $${amount.toLocaleString()}`);
        console.log(`[Admin Bridge] Gave ${player.name} $${amount}`);
    }
}

// Heal player
function healPlayer(playerId) {
    const player = mp.players.at(playerId);
    if (player) {
        player.health = 100;
        player.armour = 100;
        player.outputChatBox('!{#00FF00}You have been healed by an admin');
        console.log(`[Admin Bridge] Healed ${player.name}`);
    }
}

// Execute server command
function executeServerCommand(command) {
    console.log(`[Admin Bridge] Executing command: ${command}`);
    // TODO: Implement command execution
    // For security, we'll limit this to safe commands only
}

// Send updates every 5 seconds
setInterval(() => {
    if (isConnected) {
        sendServerStats();
    }
}, 5000);

// Initialize on module load
initBridge();

console.log('[Admin Bridge] Module loaded');

module.exports = {
    sendToAdmin,
    isConnected: () => isConnected
};
