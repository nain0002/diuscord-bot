/**
 * Dashboard JavaScript
 * Handles all admin panel functionality
 */

// Initialize Socket.IO
const socket = io();

// State
let currentPage = 'dashboard';
let currentPlayerPage = 1;
let currentTableName = null;

// On load
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

        document.getElementById('adminUsername').textContent = data.user.username;
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
    currentPage = page;

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
        players: 'Player Management',
        database: 'Database Management',
        server: 'Server Control',
        logs: 'Server Logs'
    };
    document.getElementById('pageTitle').textContent = titles[page];

    // Load page data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'players':
            loadPlayers();
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
    }
}

// Initialize Socket.IO
function initSocket() {
    socket.emit('subscribe', { authenticated: true });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('serverUpdate', (data) => {
        if (currentPage === 'dashboard') {
            loadDashboard();
        }
    });
}

// Load Dashboard
async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        if (data.success) {
            // Update stats
            document.getElementById('stat-users').textContent = data.stats.users;
            document.getElementById('stat-characters').textContent = data.stats.characters;
            document.getElementById('stat-vehicles').textContent = data.stats.vehicles;
            document.getElementById('stat-transactions').textContent = data.stats.todayTransactions;

            // Update server metrics
            const hours = Math.floor(data.server.uptime / 3600);
            const minutes = Math.floor((data.server.uptime % 3600) / 60);
            document.getElementById('server-uptime').textContent = `${hours}h ${minutes}m`;
            document.getElementById('server-memory').textContent = `${data.server.memory.used} MB / ${data.server.memory.total} MB`;
            document.getElementById('server-cpu').textContent = `${data.server.cpu}%`;

            // Update recent activity
            const activityDiv = document.getElementById('recent-activity');
            if (data.recentUsers.length > 0) {
                activityDiv.innerHTML = data.recentUsers.map(user => `
                    <div class="activity-item">
                        <strong>${user.username}</strong> registered
                        <br><small class="text-muted">${formatDate(user.created_at)}</small>
                    </div>
                `).join('');
            } else {
                activityDiv.innerHTML = '<p class="text-muted">No recent activity</p>';
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Load Players
async function loadPlayers(page = 1) {
    try {
        const search = document.getElementById('player-search')?.value || '';
        const response = await fetch(`/api/players?page=${page}&limit=20&search=${search}`);
        const data = await response.json();

        if (data.success) {
            currentPlayerPage = page;

            const tbody = document.getElementById('players-tbody');
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
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No players found</td></tr>';
            }

            // Pagination
            renderPagination('players-pagination', data.pagination, loadPlayers);
        }
    } catch (error) {
        console.error('Players load error:', error);
    }
}

// Search players
document.getElementById('player-search')?.addEventListener('input', () => {
    loadPlayers(1);
});

// Ban player
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
            alert('Player banned successfully');
            loadPlayers(currentPlayerPage);
        }
    } catch (error) {
        alert('Failed to ban player');
    }
}

// Unban player
async function unbanPlayer(playerId) {
    if (!confirm('Unban this player?')) return;

    try {
        const response = await fetch(`/api/players/${playerId}/unban`, {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            alert('Player unbanned successfully');
            loadPlayers(currentPlayerPage);
        }
    } catch (error) {
        alert('Failed to unban player');
    }
}

// View player details
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
        alert('Failed to load player details');
    }
}

// Load Database
async function loadDatabase() {
    try {
        // Load tables
        const tablesResponse = await fetch('/api/database/tables');
        const tablesData = await tablesResponse.json();

        if (tablesData.success) {
            const tablesList = document.getElementById('tables-list');
            tablesList.innerHTML = tablesData.tables.map(table => `
                <div class="list-group-item" onclick="loadTableData('${table}')">
                    ${table}
                </div>
            `).join('');
        }

        // Load stats
        const statsResponse = await fetch('/api/database/stats');
        const statsData = await statsResponse.json();

        if (statsData.success) {
            const statsDiv = document.getElementById('database-stats');
            statsDiv.innerHTML = statsData.stats.map(stat => `
                <div class="metric">
                    <label>${stat.name}</label>
                    <span>${stat.rows} rows (${stat.size} MB)</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Database load error:', error);
    }
}

// Load table data
async function loadTableData(tableName) {
    try {
        currentTableName = tableName;
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

// Load Server
async function loadServer() {
    try {
        // Load config
        const configResponse = await fetch('/api/server/config');
        const configData = await configResponse.json();

        if (configData.success) {
            const configDiv = document.getElementById('server-config');
            configDiv.innerHTML = `
                <div class="metric"><label>Max Players</label><span>${configData.config.maxplayers}</span></div>
                <div class="metric"><label>Server Name</label><span>${configData.config.name}</span></div>
                <div class="metric"><label>Gamemode</label><span>${configData.config.gamemode}</span></div>
                <div class="metric"><label>Port</label><span>${configData.config.port}</span></div>
                <div class="metric"><label>Announce</label><span>${configData.config.announce ? 'Yes' : 'No'}</span></div>
            `;
        }

        // Load resources
        const resourcesResponse = await fetch('/api/server/resources');
        const resourcesData = await resourcesResponse.json();

        if (resourcesData.success) {
            const resourcesDiv = document.getElementById('resources-list');
            resourcesDiv.innerHTML = `
                <h4>Server Resources</h4>
                <div class="list-group">
                    ${resourcesData.resources.server.map(r => `<div class="list-group-item">${r}</div>`).join('')}
                </div>
                <h4>Client Resources</h4>
                <div class="list-group">
                    ${resourcesData.resources.client.map(r => `<div class="list-group-item">${r}</div>`).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Server load error:', error);
    }
}

// Load Logs
async function loadLogs() {
    try {
        const response = await fetch('/api/logs?limit=100');
        const data = await response.json();

        if (data.success) {
            const logsDiv = document.getElementById('logs-content');
            
            if (data.logs.length > 0) {
                logsDiv.innerHTML = data.logs.map(log => `
                    <div class="log-entry log-${log.type}">
                        <span class="log-timestamp">[${formatTime(log.timestamp)}]</span>
                        ${log.message}
                    </div>
                `).join('');
            } else {
                logsDiv.innerHTML = '<p class="text-muted">No logs available</p>';
            }
        }
    } catch (error) {
        console.error('Logs load error:', error);
    }
}

// Clear logs
async function clearLogs() {
    if (!confirm('Clear all logs?')) return;

    try {
        const response = await fetch('/api/logs', { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            loadLogs();
        }
    } catch (error) {
        alert('Failed to clear logs');
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

function renderPagination(elementId, pagination, loadFunction) {
    const div = document.getElementById(elementId);
    if (!div) return;

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
        pages.push(i);
    }

    div.innerHTML = pages.map(page => `
        <button 
            class="${page === pagination.page ? 'active' : ''}"
            onclick="${loadFunction.name}(${page})"
        >
            ${page}
        </button>
    `).join('');
}

// Auto-refresh dashboard
setInterval(() => {
    if (currentPage === 'dashboard') {
        loadDashboard();
    }
}, 30000); // Refresh every 30 seconds
