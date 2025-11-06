/**
 * Modern Admin Dashboard JavaScript
 * Handles real-time updates, player management, and server controls
 */

// Initialize Socket.IO
const socket = io();

// State Management
const state = {
    currentPage: 'dashboard',
    onlinePlayers: [],
    chatHistory: [],
    events: [],
    serverStats: {},
    isConnected: false
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initNavigation();
    initSocket();
    loadDashboard();
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = '/';
            return;
        }

        const username = data.user.username;
        document.getElementById('adminUsername').textContent = username;
        document.querySelector('.user-avatar').textContent = username.charAt(0).toUpperCase();
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/';
    }
}

// Initialize navigation
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

// Switch page
function switchPage(page) {
    state.currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        players: 'Live Players',
        chat: 'Live Chat Monitor',
        users: 'User Database',
        vehicles: 'Vehicle Management',
        economy: 'Economy Management',
        bans: 'Bans & Reports',
        analytics: 'Server Analytics',
        leaderboards: 'Leaderboards',
        'server-control': 'Server Control',
        database: 'Database Management',
        server: 'Server Configuration',
        logs: 'Server Logs',
        events: 'Server Events'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Load page data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'players':
            loadLivePlayers();
            break;
        case 'chat':
            renderChatHistory();
            break;
        case 'users':
            loadUsers();
            break;
        case 'vehicles':
            loadVehicles();
            break;
        case 'economy':
            loadEconomy();
            break;
        case 'bans':
            loadBans();
            loadReports();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'leaderboards':
            loadLeaderboards();
            break;
        case 'server-control':
            // No auto-load needed
            break;
        case 'database':
            loadDatabase();
            break;
        case 'server':
            loadServer();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'events':
            renderEvents();
            break;
    }
}

// Initialize Socket.IO
function initSocket() {
    socket.on('connect', () => {
        console.log('[Admin Panel] Connected to server');
        state.isConnected = true;
        updateServerStatus(true);
        socket.emit('subscribe', { authenticated: true });
    });

    socket.on('disconnect', () => {
        console.log('[Admin Panel] Disconnected from server');
        state.isConnected = false;
        updateServerStatus(false);
    });

    // Game server events
    socket.on('serverState', (data) => {
        handleServerState(data);
    });

    socket.on('serverStats', (data) => {
        handleServerStats(data);
    });

    socket.on('playerJoin', (data) => {
        handlePlayerJoin(data);
    });

    socket.on('playerQuit', (data) => {
        handlePlayerQuit(data);
    });

    socket.on('playerChat', (data) => {
        handlePlayerChat(data);
    });

    socket.on('onlinePlayers', (data) => {
        state.onlinePlayers = data;
        if (state.currentPage === 'players') {
            renderOnlinePlayers();
        }
    });

    socket.on('initialData', (data) => {
        console.log('[Admin Panel] Received initial data', data);
        state.onlinePlayers = data.players || [];
        state.chatHistory = data.chatHistory || [];
        state.events = data.events || [];
        state.serverStats = data.stats || {};
        
        updateDashboardStats();
        renderChatHistory();
        renderEvents();
    });
}

// Update server status indicator
function updateServerStatus(isOnline) {
    const dot = document.getElementById('serverStatusDot');
    const text = document.getElementById('serverStatusText');
    
    if (isOnline) {
        dot.classList.remove('offline');
        dot.classList.add('online');
        text.textContent = 'Server Online';
    } else {
        dot.classList.remove('online');
        dot.classList.add('offline');
        text.textContent = 'Server Offline';
    }
}

// Handle server state update
function handleServerState(data) {
    state.onlinePlayers = data.players || [];
    state.serverStats = {
        playerCount: data.playerCount,
        maxPlayers: data.maxPlayers,
        uptime: data.uptime
    };
    
    updateDashboardStats();
    document.getElementById('online-count').textContent = data.playerCount || 0;
}

// Handle server stats update
function handleServerStats(data) {
    state.serverStats = data;
    updateDashboardStats();
}

// Handle player join
function handlePlayerJoin(data) {
    // Add to events
    state.events.unshift({
        type: 'join',
        data: data,
        timestamp: data.timestamp
    });
    
    // Keep only last 100 events
    if (state.events.length > 100) {
        state.events.pop();
    }
    
    // Show notification
    showNotification(`Player ${data.name} joined the server`, 'success');
    
    // Update displays
    if (state.currentPage === 'events' || state.currentPage === 'dashboard') {
        renderEvents();
    }
}

// Handle player quit
function handlePlayerQuit(data) {
    // Add to events
    state.events.unshift({
        type: 'quit',
        data: data,
        timestamp: data.timestamp
    });
    
    if (state.events.length > 100) {
        state.events.pop();
    }
    
    showNotification(`Player ${data.name} left the server`, 'info');
    
    if (state.currentPage === 'events' || state.currentPage === 'dashboard') {
        renderEvents();
    }
}

// Handle player chat
function handlePlayerChat(data) {
    state.chatHistory.unshift(data);
    
    // Keep only last 200 messages
    if (state.chatHistory.length > 200) {
        state.chatHistory.pop();
    }
    
    if (state.currentPage === 'chat') {
        renderChatHistory();
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        // Load database stats
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (data.success) {
            document.getElementById('stat-total-users').textContent = data.stats.users || 0;
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
    
    updateDashboardStats();
}

// Update dashboard stats
function updateDashboardStats() {
    const stats = state.serverStats;
    
    // Online players
    const onlineCount = stats.playerCount || state.onlinePlayers.length || 0;
    document.getElementById('stat-online-players').textContent = onlineCount;
    document.getElementById('online-count').textContent = onlineCount;
    
    // Uptime
    if (stats.uptime) {
        const hours = Math.floor(stats.uptime / 3600);
        const minutes = Math.floor((stats.uptime % 3600) / 60);
        document.getElementById('stat-uptime').textContent = `${hours}h ${minutes}m`;
    }
    
    // Memory
    if (stats.memory) {
        document.getElementById('stat-memory').textContent = `${stats.memory.used} MB`;
        const percent = Math.round((stats.memory.used / stats.memory.total) * 100);
        document.getElementById('stat-memory-percent').textContent = `${percent}%`;
    }
    
    // Metrics
    document.getElementById('metric-players').textContent = `${onlineCount}/${stats.maxPlayers || 100}`;
    document.getElementById('metric-vehicles').textContent = stats.vehicles || 0;
    document.getElementById('metric-cpu').textContent = stats.cpu ? `${Math.round(stats.cpu.user / 1000)}%` : '0%';
    document.getElementById('metric-ram').textContent = stats.memory ? `${stats.memory.used} MB` : '0 MB';
}

// Render events
function renderEvents() {
    const container = state.currentPage === 'dashboard' 
        ? document.getElementById('recent-events')
        : document.getElementById('events-list');
    
    if (!container) return;
    
    if (state.events.length === 0) {
        container.innerHTML = '<div class="loading"><p class="text-muted">No recent events</p></div>';
        return;
    }
    
    const events = state.currentPage === 'dashboard' 
        ? state.events.slice(0, 10)
        : state.events;
    
    container.innerHTML = events.map(event => {
        const icons = { join: '➕', quit: '➖', death: '💀', chat: '💬' };
        const colors = { join: 'success', quit: 'danger', death: 'warning', chat: 'info' };
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    ${icons[event.type] || '📝'}
                </div>
                <div class="activity-details">
                    <div class="activity-title">
                        ${formatEventTitle(event)}
                    </div>
                    <div class="activity-time">${formatTime(event.timestamp)}</div>
                </div>
                <span class="badge badge-${colors[event.type] || 'info'}">${event.type}</span>
            </div>
        `;
    }).join('');
}

// Format event title
function formatEventTitle(event) {
    switch (event.type) {
        case 'join':
            return `<strong>${event.data.name}</strong> joined the server`;
        case 'quit':
            return `<strong>${event.data.name}</strong> left the server`;
        case 'death':
            return `<strong>${event.data.playerName}</strong> died`;
        default:
            return 'Unknown event';
    }
}

// Render chat history
function renderChatHistory() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    if (state.chatHistory.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No chat messages yet</p>';
        return;
    }
    
    container.innerHTML = state.chatHistory.map(msg => `
        <div class="chat-message">
            <div class="chat-message-header">
                <span class="chat-player-name">${msg.playerName}</span>
                <span class="chat-timestamp">${formatTime(msg.timestamp)}</span>
            </div>
            <div class="chat-message-text">${escapeHtml(msg.message)}</div>
        </div>
    `).join('');
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Load live players
function loadLivePlayers() {
    renderOnlinePlayers();
    // Request fresh data from server
    socket.emit('adminCommand', { type: 'getPlayers' });
}

// Render online players
function renderOnlinePlayers() {
    const container = document.getElementById('live-players-list');
    if (!container) return;
    
    if (state.onlinePlayers.length === 0) {
        container.innerHTML = '<div class="loading"><p class="text-muted">No players online</p></div>';
        return;
    }
    
    container.innerHTML = state.onlinePlayers.map(player => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-details">
                    ID: ${player.id} • Health: ${player.health} • Armor: ${player.armor}
                    ${player.characterData ? ` • Money: $${player.characterData.money.toLocaleString()}` : ''}
                </div>
            </div>
            <div class="player-actions">
                <button class="btn btn-sm btn-secondary" onclick="teleportToPlayer(${player.id})">📍</button>
                <button class="btn btn-sm btn-secondary" onclick="sendMessageToPlayer(${player.id})">💬</button>
                <button class="btn btn-sm btn-success" onclick="healPlayer(${player.id})">❤️</button>
                <button class="btn btn-sm btn-warning" onclick="freezePlayer(${player.id})">❄️</button>
                <button class="btn btn-sm btn-danger" onclick="kickPlayerLive(${player.id}, '${player.name}')">⚠️</button>
            </div>
        </div>
    `).join('');
}

// Player actions
function teleportToPlayer(playerId) {
    const x = prompt('Enter X coordinate:');
    const y = prompt('Enter Y coordinate:');
    const z = prompt('Enter Z coordinate:');
    
    if (x && y && z) {
        sendAdminCommand('teleportPlayer', { playerId, x, y, z });
        showNotification('Teleport command sent', 'success');
    }
}

function sendMessageToPlayer(playerId) {
    const message = prompt('Enter message to send:');
    if (message) {
        sendAdminCommand('sendMessage', { playerId, message });
        showNotification('Message sent', 'success');
    }
}

function healPlayer(playerId) {
    sendAdminCommand('healPlayer', { playerId });
    showNotification('Heal command sent', 'success');
}

function freezePlayer(playerId) {
    const freeze = confirm('Freeze this player?');
    sendAdminCommand('freezePlayer', { playerId, freeze });
    showNotification(freeze ? 'Player frozen' : 'Player unfrozen', 'success');
}

function kickPlayerLive(playerId, playerName) {
    const reason = prompt(`Kick ${playerName}? Enter reason:`);
    if (reason) {
        sendAdminCommand('kickPlayer', { playerId, reason });
        showNotification(`Kicked ${playerName}`, 'success');
    }
}

// Send admin command
function sendAdminCommand(type, data) {
    socket.emit('adminCommand', { type, data });
}

// Load users (database)
async function loadUsers(page = 1) {
    try {
        const search = document.getElementById('user-search')?.value || '';
        const response = await fetch(`/api/players?page=${page}&limit=20&search=${search}`);
        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('users-tbody');
            if (data.players.length > 0) {
                tbody.innerHTML = data.players.map(player => `
                    <tr>
                        <td>${player.id}</td>
                        <td>${player.username}</td>
                        <td>${player.email}</td>
                        <td>${player.character_count}</td>
                        <td>${formatDate(player.last_login)}</td>
                        <td>
                            ${player.is_banned 
                                ? '<span class="badge badge-danger">Banned</span>' 
                                : '<span class="badge badge-success">Active</span>'}
                        </td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="viewPlayer(${player.id})">View</button>
                            ${player.is_banned 
                                ? `<button class="btn btn-sm btn-success" onclick="unbanPlayer(${player.id})">Unban</button>`
                                : `<button class="btn btn-sm btn-danger" onclick="banPlayer(${player.id})">Ban</button>`}
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Users load error:', error);
    }
}

// Database management
async function loadDatabase() {
    try {
        const tablesResponse = await fetch('/api/database/tables');
        const tablesData = await tablesResponse.json();

        if (tablesData.success) {
            const tablesList = document.getElementById('tables-list');
            tablesList.innerHTML = tablesData.tables.map(table => `
                <div class="list-group-item" onclick="loadTableData('${table}')">
                    💾 ${table}
                </div>
            `).join('');
        }

        const statsResponse = await fetch('/api/database/stats');
        const statsData = await statsResponse.json();

        if (statsData.success) {
            const statsDiv = document.getElementById('database-stats');
            statsDiv.innerHTML = statsData.stats.map(stat => `
                <div class="metric-box">
                    <div class="metric-label">${stat.name}</div>
                    <div class="metric-value">${stat.rows} rows</div>
                    <div class="text-muted" style="font-size: 12px;">${stat.size} MB</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Database load error:', error);
    }
}

async function loadTableData(tableName) {
    try {
        document.getElementById('current-table').textContent = tableName;
        const response = await fetch(`/api/database/table/${tableName}`);
        const data = await response.json();

        if (data.success) {
            const tableDiv = document.getElementById('table-data');
            
            if (data.data.length > 0) {
                const headers = Object.keys(data.data[0]);
                tableDiv.innerHTML = `
                    <table class="data-table">
                        <thead>
                            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${data.data.map(row => `
                                <tr>${headers.map(h => `<td>${JSON.stringify(row[h])}</td>`).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                tableDiv.innerHTML = '<p class="text-muted">No data in this table</p>';
            }
        }
    } catch (error) {
        console.error('Table data load error:', error);
    }
}

// Server configuration
async function loadServer() {
    try {
        const configResponse = await fetch('/api/server/config');
        const configData = await configResponse.json();

        if (configData.success) {
            const configDiv = document.getElementById('server-config');
            configDiv.innerHTML = `
                <div class="metrics-grid">
                    <div class="metric-box">
                        <div class="metric-label">Max Players</div>
                        <div class="metric-value">${configData.config.maxplayers}</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Port</div>
                        <div class="metric-value">${configData.config.port}</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Gamemode</div>
                        <div class="metric-value">${configData.config.gamemode}</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Announce</div>
                        <div class="metric-value">${configData.config.announce ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                <div class="card-header" style="margin-top: 20px;">
                    <h4>Server Name</h4>
                </div>
                <p>${configData.config.name}</p>
            `;
        }
    } catch (error) {
        console.error('Server load error:', error);
    }
}

// Logs
async function loadLogs() {
    try {
        const response = await fetch('/api/logs?limit=100');
        const data = await response.json();

        if (data.success) {
            const logsDiv = document.getElementById('logs-content');
            
            if (data.logs.length > 0) {
                logsDiv.innerHTML = data.logs.map(log => `
                    <div style="margin-bottom: 8px; color: ${getLogColor(log.type)};">
                        <span style="color: #6b7280;">[${formatTime(log.timestamp)}]</span>
                        ${escapeHtml(log.message)}
                    </div>
                `).join('');
            } else {
                logsDiv.innerHTML = '<p class="text-muted">No logs available</p>';
            }
            
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
    } catch (error) {
        console.error('Logs load error:', error);
    }
}

function getLogColor(type) {
    const colors = {
        info: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
    };
    return colors[type] || '#10b981';
}

// Quick actions
function showBroadcastModal() {
    // Implement modal
    const message = prompt('Enter broadcast message:');
    if (message) {
        sendAdminCommand('broadcastMessage', { message });
        showNotification('Broadcast sent', 'success');
    }
}

function refreshAllPlayers() {
    sendAdminCommand('getPlayers', {});
    showNotification('Refreshing player list...', 'info');
}

function viewServerLogs() {
    switchPage('logs');
}

function confirmServerRestart() {
    if (confirm('⚠️ Are you sure you want to restart the server? All players will be disconnected!')) {
        alert('Server restart functionality coming soon!');
    }
}

function refreshMetrics() {
    sendAdminCommand('getServerStats', {});
    showNotification('Refreshing metrics...', 'info');
}

// Ban/Unban
async function banPlayer(playerId) {
    const reason = prompt('Ban reason:');
    if (!reason) return;

    try {
        const response = await fetch(`/api/players/${playerId}/ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Player banned successfully', 'success');
            loadUsers();
        }
    } catch (error) {
        showNotification('Failed to ban player', 'danger');
    }
}

async function unbanPlayer(playerId) {
    if (!confirm('Unban this player?')) return;

    try {
        const response = await fetch(`/api/players/${playerId}/unban`, {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Player unbanned successfully', 'success');
            loadUsers();
        }
    } catch (error) {
        showNotification('Failed to unban player', 'danger');
    }
}

async function viewPlayer(playerId) {
    try {
        const response = await fetch(`/api/players/${playerId}`);
        const data = await response.json();

        if (data.success) {
            const player = data.player;
            const chars = data.characters;

            alert(`
Player: ${player.username}
Email: ${player.email}
Characters: ${chars.length}
Created: ${formatDate(player.created_at)}
Last Login: ${formatDate(player.last_login)}
Status: ${player.is_banned ? 'Banned' : 'Active'}
${player.is_banned ? 'Ban Reason: ' + player.ban_reason : ''}
            `.trim());
        }
    } catch (error) {
        showNotification('Failed to load player details', 'danger');
    }
}

// Clear functions
function clearChatHistory() {
    if (confirm('Clear chat history?')) {
        state.chatHistory = [];
        renderChatHistory();
    }
}

async function clearLogs() {
    if (!confirm('Clear all logs?')) return;

    try {
        const response = await fetch('/api/logs', { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            loadLogs();
        }
    } catch (error) {
        showNotification('Failed to clear logs', 'danger');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a toast notification system here
}

// ═══════════════════════════════════════════════════════════════════
// RAGE:MP ESSENTIAL FEATURES
// ═══════════════════════════════════════════════════════════════════

// Vehicle Management
async function loadVehicles() {
    try {
        const response = await fetch('/api/vehicles');
        const data = await response.json();

        if (data.success) {
            const vehicles = data.vehicles || [];
            const tbody = document.getElementById('vehicles-tbody');
            
            if (vehicles.length > 0) {
                tbody.innerHTML = vehicles.map(v => `
                    <tr>
                        <td>${v.id}</td>
                        <td>${v.model}</td>
                        <td>${v.first_name || 'Unknown'} ${v.last_name || ''}</td>
                        <td>${v.plate || 'N/A'}</td>
                        <td>${v.fuel || 0}%</td>
                        <td>${v.engine_health || 0}%</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${v.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No vehicles found</td></tr>';
            }
        }

        // Load vehicle stats
        const statsResponse = await fetch('/api/vehicles/stats/summary');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            document.getElementById('total-vehicles').textContent = statsData.stats.total_vehicles || 0;
            document.getElementById('unique-models').textContent = statsData.stats.unique_models || 0;
            document.getElementById('avg-fuel').textContent = Math.round(statsData.stats.avg_fuel || 0) + '%';
        }
    } catch (error) {
        console.error('Vehicles load error:', error);
        showNotification('Failed to load vehicles', 'danger');
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('Delete this vehicle permanently?')) return;

    try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Vehicle deleted successfully', 'success');
            loadVehicles();
        }
    } catch (error) {
        showNotification('Failed to delete vehicle', 'danger');
    }
}

// Economy Management
async function loadEconomy() {
    try {
        const response = await fetch('/api/economy/stats');
        const data = await response.json();

        if (data.success) {
            const overview = data.overview || {};
            document.getElementById('total-cash').textContent = '$' + (overview.total_cash || 0).toLocaleString();
            document.getElementById('total-bank').textContent = '$' + (overview.total_bank || 0).toLocaleString();
            document.getElementById('total-dirty').textContent = '$' + (overview.total_dirty || 0).toLocaleString();
            const avgWealth = (overview.avg_cash || 0) + (overview.avg_bank || 0);
            document.getElementById('avg-wealth').textContent = '$' + Math.round(avgWealth).toLocaleString();

            // Richest players
            const richest = data.richest || [];
            const richestTbody = document.getElementById('richest-tbody');
            if (richest.length > 0) {
                richestTbody.innerHTML = richest.map((p, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${p.first_name} ${p.last_name}</td>
                        <td>$${(p.total_wealth || 0).toLocaleString()}</td>
                    </tr>
                `).join('');
            } else {
                richestTbody.innerHTML = '<tr><td colspan="3" class="text-center">No data</td></tr>';
            }

            // Recent transactions
            const transactions = data.transactions || [];
            const recentDiv = document.getElementById('recent-transactions');
            if (transactions.length > 0) {
                recentDiv.innerHTML = transactions.map(t => `
                    <div style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                        <strong>${t.transaction_type}</strong>: $${(t.total_amount || 0).toLocaleString()}
                        <br><small>${t.count} transactions</small>
                    </div>
                `).join('');
            } else {
                recentDiv.innerHTML = '<p class="text-center">No recent transactions</p>';
            }
        }

        // Load all transactions
        const transResponse = await fetch('/api/economy/transactions?limit=50');
        const transData = await transResponse.json();
        
        if (transData.success) {
            const transTbody = document.getElementById('transactions-tbody');
            const transactions = transData.transactions || [];
            
            if (transactions.length > 0) {
                transTbody.innerHTML = transactions.map(t => `
                    <tr>
                        <td>${formatTime(t.created_at)}</td>
                        <td>${t.first_name || 'Unknown'} ${t.last_name || ''}</td>
                        <td>${t.transaction_type}</td>
                        <td class="${t.transaction_type === 'earn' ? 'text-success' : 'text-danger'}">
                            ${t.transaction_type === 'earn' ? '+' : '-'}$${(t.amount || 0).toLocaleString()}
                        </td>
                        <td>${t.source || 'N/A'}</td>
                    </tr>
                `).join('');
            } else {
                transTbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions</td></tr>';
            }
        }
    } catch (error) {
        console.error('Economy load error:', error);
        showNotification('Failed to load economy data', 'danger');
    }
}

// Analytics
async function loadAnalytics() {
    try {
        // Performance stats
        const perfResponse = await fetch('/api/analytics/performance');
        const perfData = await perfResponse.json();

        if (perfData.success) {
            const stats = perfData.stats;
            const hours = Math.floor((stats.uptime || 0) / 3600);
            const minutes = Math.floor(((stats.uptime || 0) % 3600) / 60);
            document.getElementById('perf-uptime').textContent = `${hours}h ${minutes}m`;
            document.getElementById('perf-memory').textContent = Math.round((stats.memory?.heapUsed || 0) / 1024 / 1024) + ' MB';
            document.getElementById('perf-platform').textContent = stats.platform || 'Unknown';
            document.getElementById('perf-node').textContent = stats.nodeVersion || 'Unknown';
        }

        // Jobs
        const jobsResponse = await fetch('/api/analytics/jobs');
        const jobsData = await jobsResponse.json();

        if (jobsData.success) {
            const jobsList = document.getElementById('jobs-list');
            const jobs = jobsData.jobs || [];
            
            if (jobs.length > 0) {
                jobsList.innerHTML = jobs.map(j => `
                    <div style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                        <strong>${j.job}</strong>
                        <br><small>${j.player_count} players • Avg Rank: ${Math.round(j.avg_rank || 0)}</small>
                    </div>
                `).join('');
            } else {
                jobsList.innerHTML = '<p class="text-center">No job data</p>';
            }
        }

        // Activity
        const activityResponse = await fetch('/api/analytics/activity');
        const activityData = await activityResponse.json();

        if (activityData.success) {
            const activityTbody = document.getElementById('activity-tbody');
            const activity = activityData.daily || [];
            
            if (activity.length > 0) {
                activityTbody.innerHTML = activity.map(a => `
                    <tr>
                        <td>${formatDate(a.date)}</td>
                        <td>${a.unique_players || 0}</td>
                        <td>${a.total_sessions || 0}</td>
                        <td>${Math.round(a.total_playtime || 0)} min</td>
                    </tr>
                `).join('');
            } else {
                activityTbody.innerHTML = '<tr><td colspan="4" class="text-center">No activity data</td></tr>';
            }
        }
    } catch (error) {
        console.error('Analytics load error:', error);
        showNotification('Failed to load analytics', 'danger');
    }
}

// Leaderboards
async function loadLeaderboards() {
    try {
        const response = await fetch('/api/analytics/leaderboards');
        const data = await response.json();

        if (data.success) {
            // Richest
            const richestDiv = document.getElementById('lb-richest');
            const richest = data.richest || [];
            if (richest.length > 0) {
                richestDiv.innerHTML = richest.map((p, i) => `
                    <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 20px; font-weight: bold; color: gold;">#${i + 1}</span>
                        <strong>${p.first_name} ${p.last_name}</strong>
                        <br><small>$${(p.wealth || 0).toLocaleString()}</small>
                    </div>
                `).join('');
            } else {
                richestDiv.innerHTML = '<p class="text-center">No data</p>';
            }

            // Most Active
            const activeDiv = document.getElementById('lb-active');
            const active = data.mostActive || [];
            if (active.length > 0) {
                activeDiv.innerHTML = active.map((p, i) => `
                    <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 20px; font-weight: bold; color: #10b981;">#${i + 1}</span>
                        <strong>${p.first_name} ${p.last_name}</strong>
                        <br><small>${Math.round(p.playtime || 0)} minutes</small>
                    </div>
                `).join('');
            } else {
                activeDiv.innerHTML = '<p class="text-center">No data</p>';
            }

            // Top Level
            const levelDiv = document.getElementById('lb-level');
            const topLevel = data.topLevel || [];
            if (topLevel.length > 0) {
                levelDiv.innerHTML = topLevel.map((p, i) => `
                    <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 20px; font-weight: bold; color: #3b82f6;">#${i + 1}</span>
                        <strong>${p.first_name} ${p.last_name}</strong>
                        <br><small>Level ${p.level} (${p.experience} XP)</small>
                    </div>
                `).join('');
            } else {
                levelDiv.innerHTML = '<p class="text-center">No data</p>';
            }
        }

        // Achievement stats
        const achieveResponse = await fetch('/api/analytics/achievements');
        const achieveData = await achieveResponse.json();

        if (achieveData.success) {
            const achieveTbody = document.getElementById('achievements-tbody');
            const achievements = achieveData.achievements || [];
            
            if (achievements.length > 0) {
                achieveTbody.innerHTML = achievements.map(a => `
                    <tr>
                        <td>${a.name}</td>
                        <td>${a.category}</td>
                        <td>${a.points}</td>
                        <td>${a.unlocked_count || 0}</td>
                        <td>${a.unlock_percentage || 0}%</td>
                    </tr>
                `).join('');
            } else {
                achieveTbody.innerHTML = '<tr><td colspan="5" class="text-center">No achievements</td></tr>';
            }
        }
    } catch (error) {
        console.error('Leaderboards load error:', error);
        showNotification('Failed to load leaderboards', 'danger');
    }
}

// Server Control Functions
async function sendBroadcast() {
    const message = document.getElementById('broadcast-message').value;
    if (!message || message.trim() === '') {
        showNotification('Please enter a message', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/server-control/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Broadcast sent successfully', 'success');
            document.getElementById('broadcast-message').value = '';
        }
    } catch (error) {
        showNotification('Failed to send broadcast', 'danger');
    }
}

async function giveMoney() {
    const characterId = document.getElementById('money-character-id').value;
    const amount = document.getElementById('money-amount').value;

    if (!characterId || !amount) {
        showNotification('Please enter both character ID and amount', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/server-control/give-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character_id: characterId, amount: parseInt(amount), admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification(data.message, 'success');
            document.getElementById('money-character-id').value = '';
            document.getElementById('money-amount').value = '';
        } else {
            showNotification(data.error || 'Failed to give money', 'danger');
        }
    } catch (error) {
        showNotification('Failed to give money', 'danger');
    }
}

async function setPlayerLevel() {
    const characterId = document.getElementById('level-character-id').value;
    const level = document.getElementById('level-value').value;

    if (!characterId || !level) {
        showNotification('Please enter both character ID and level', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/server-control/set-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character_id: characterId, level: parseInt(level), admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification(data.message, 'success');
            document.getElementById('level-character-id').value = '';
            document.getElementById('level-value').value = '';
        } else {
            showNotification(data.error || 'Failed to set level', 'danger');
        }
    } catch (error) {
        showNotification('Failed to set level', 'danger');
    }
}

async function healAllPlayers() {
    if (!confirm('Heal all online players?')) return;

    try {
        const response = await fetch('/api/server-control/heal-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Heal all command sent', 'success');
        }
    } catch (error) {
        showNotification('Failed to heal all players', 'danger');
    }
}

async function clearVehicles() {
    if (!confirm('Clear all spawned vehicles? This cannot be undone!')) return;

    try {
        const response = await fetch('/api/server-control/clear-vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Clear vehicles command sent', 'success');
        }
    } catch (error) {
        showNotification('Failed to clear vehicles', 'danger');
    }
}

let maintenanceMode = false;
async function toggleMaintenance() {
    maintenanceMode = !maintenanceMode;

    try {
        const response = await fetch('/api/server-control/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: maintenanceMode, admin: state.username || 'Admin' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification(data.message, 'success');
        }
    } catch (error) {
        showNotification('Failed to toggle maintenance mode', 'danger');
    }
}

// Bans & Reports
async function loadBans() {
    try {
        const response = await fetch('/api/bans');
        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('bans-tbody');
            const bans = data.bans || [];
            
            if (bans.length > 0) {
                tbody.innerHTML = bans.map(b => `
                    <tr>
                        <td>${b.social_club || 'Unknown'}</td>
                        <td>${b.reason || 'No reason'}</td>
                        <td>${b.admin_name || 'System'}</td>
                        <td>${formatDate(b.banned_at)}</td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="unbanBySocialClub('${b.social_club}')">Unban</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No active bans</td></tr>';
            }
        }
    } catch (error) {
        console.error('Bans load error:', error);
        showNotification('Failed to load bans', 'danger');
    }
}

async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('reports-tbody');
            const reports = data.reports || [];
            
            if (reports.length > 0) {
                tbody.innerHTML = reports.map(r => `
                    <tr>
                        <td>${r.reporter_name || 'Unknown'}</td>
                        <td>${r.reported_name || 'Unknown'}</td>
                        <td>${r.reason || 'No reason'}</td>
                        <td>
                            <span class="badge badge-${r.status === 'pending' ? 'warning' : r.status === 'resolved' ? 'success' : 'secondary'}">
                                ${r.status}
                            </span>
                        </td>
                        <td>
                            ${r.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="resolveReport(${r.id})">Resolve</button>` : '-'}
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No reports</td></tr>';
            }
        }
    } catch (error) {
        console.error('Reports load error:', error);
        showNotification('Failed to load reports', 'danger');
    }
}

async function unbanBySocialClub(socialClub) {
    if (!confirm(`Unban ${socialClub}?`)) return;

    try {
        const response = await fetch(`/api/bans/${socialClub}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Player unbanned successfully', 'success');
            loadBans();
        }
    } catch (error) {
        showNotification('Failed to unban player', 'danger');
    }
}

async function resolveReport(reportId) {
    try {
        const response = await fetch(`/api/reports/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved' })
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Report resolved', 'success');
            loadReports();
        }
    } catch (error) {
        showNotification('Failed to resolve report', 'danger');
    }
}

// Auto-refresh
setInterval(() => {
    if (state.currentPage === 'dashboard') {
        loadDashboard();
    }
}, 30000); // Every 30 seconds
