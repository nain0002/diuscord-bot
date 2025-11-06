/**
 * WebSocket Bridge Server
 * Receives data from RAGE:MP game server and broadcasts to admin panel clients
 */

const WebSocket = require('ws');

class WebSocketBridge {
    constructor(port = 3001) {
        this.port = port;
        this.wss = null;
        this.gameServerConnection = null;
        this.adminClients = new Set();
        this.serverData = {
            players: [],
            stats: {},
            chatHistory: [],
            events: []
        };
    }

    start() {
        // Create WebSocket server
        this.wss = new WebSocket.Server({ port: this.port });

        this.wss.on('connection', (ws, req) => {
            const isGameServer = req.url === '/gameserver';
            
            if (isGameServer) {
                this.handleGameServerConnection(ws);
            } else {
                this.handleAdminClientConnection(ws);
            }
        });

        console.log(`[WS Bridge] Server started on port ${this.port}`);
    }

    handleGameServerConnection(ws) {
        console.log('[WS Bridge] Game server connected');
        this.gameServerConnection = ws;

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleGameServerMessage(message);
            } catch (error) {
                console.error('[WS Bridge] Parse error:', error);
            }
        });

        ws.on('close', () => {
            console.log('[WS Bridge] Game server disconnected');
            this.gameServerConnection = null;
        });

        ws.on('error', (error) => {
            console.error('[WS Bridge] Game server error:', error);
        });
    }

    handleAdminClientConnection(ws) {
        console.log('[WS Bridge] Admin client connected');
        this.adminClients.add(ws);

        // Send current server data to new admin client
        ws.send(JSON.stringify({
            type: 'initialData',
            data: this.serverData
        }));

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleAdminClientMessage(message);
            } catch (error) {
                console.error('[WS Bridge] Admin parse error:', error);
            }
        });

        ws.on('close', () => {
            console.log('[WS Bridge] Admin client disconnected');
            this.adminClients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('[WS Bridge] Admin client error:', error);
        });
    }

    handleGameServerMessage(message) {
        const { type, data } = message;

        // Update local data
        switch (type) {
            case 'serverState':
                this.serverData.players = data.players;
                this.serverData.stats = {
                    playerCount: data.playerCount,
                    maxPlayers: data.maxPlayers,
                    uptime: data.uptime
                };
                break;

            case 'playerJoin':
                this.serverData.events.unshift({
                    type: 'join',
                    data: data,
                    timestamp: data.timestamp
                });
                // Keep only last 100 events
                if (this.serverData.events.length > 100) {
                    this.serverData.events.pop();
                }
                break;

            case 'playerQuit':
                this.serverData.events.unshift({
                    type: 'quit',
                    data: data,
                    timestamp: data.timestamp
                });
                if (this.serverData.events.length > 100) {
                    this.serverData.events.pop();
                }
                break;

            case 'playerChat':
                this.serverData.chatHistory.unshift(data);
                // Keep only last 200 messages
                if (this.serverData.chatHistory.length > 200) {
                    this.serverData.chatHistory.pop();
                }
                break;

            case 'serverStats':
                this.serverData.stats = data;
                break;

            case 'onlinePlayers':
                this.serverData.players = data;
                break;
        }

        // Broadcast to all admin clients
        this.broadcastToAdmins(message);
    }

    handleAdminClientMessage(message) {
        // Forward admin commands to game server
        if (this.gameServerConnection && this.gameServerConnection.readyState === WebSocket.OPEN) {
            this.gameServerConnection.send(JSON.stringify(message));
        } else {
            console.log('[WS Bridge] Game server not connected, command ignored');
        }
    }

    broadcastToAdmins(message) {
        const payload = JSON.stringify(message);
        this.adminClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }

    getServerData() {
        return this.serverData;
    }
}

module.exports = WebSocketBridge;
