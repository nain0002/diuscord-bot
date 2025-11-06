/**
 * ULTRA ADMIN PANEL - Main JavaScript
 * Real-time admin control center with Socket.IO
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

const AdminState = {
    currentPage: 'dashboard',
    socket: null,
    theme: 'dark',
    sidebarCollapsed: false,
    aiAssistantOpen: false,
    voiceActive: false,
    searchResults: [],
    players: [],
    stats: {
        totalPlayers: 0,
        totalVehicles: 0,
        pendingReports: 0,
        serverPing: 0
    },
    notifications: [],
    selectedPlayer: null
};

// Charts
let charts = {
    players: null,
    vehicles: null,
    reports: null,
    ping: null,
    performance: null
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Ultra Admin] Initializing...');
    
    initializeSocket();
    initializeCharts();
    initializeEventListeners();
    initializeParticles();
    loadDashboard();
    
    // Auto-refresh every 5 seconds
    setInterval(refreshDashboard, 5000);
    
    console.log('[Ultra Admin] Ready!');
});

// ============================================================================
// SOCKET.IO CONNECTION
// ============================================================================

function initializeSocket() {
    AdminState.socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling']
    });
    
    AdminState.socket.on('connect', () => {
        console.log('[Socket] Connected to server');
        updateServerStatus('online');
        showNotification('Connected to server', 'success');
    });
    
    AdminState.socket.on('disconnect', () => {
        console.log('[Socket] Disconnected from server');
        updateServerStatus('offline');
        showNotification('Disconnected from server', 'error');
    });
    
    // Real-time stats updates
    AdminState.socket.on('statsUpdate', (data) => {
        updateStats(data);
    });
    
    // Player updates
    AdminState.socket.on('playerUpdate', (data) => {
        updatePlayerList(data);
    });
    
    // New report alert
    AdminState.socket.on('newReport', (report) => {
        handleNewReport(report);
    });
    
    // AI alerts
    AdminState.socket.on('aiAlert', (alert) => {
        handleAIAlert(alert);
    });
}

// ============================================================================
// CHART INITIALIZATION
// ============================================================================

function initializeCharts() {
    // Mini stat charts
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 },
                point: { radius: 0 }
            }
        }
    };
    
    // Players chart
    const playersCtx = document.getElementById('playersChart');
    if (playersCtx) {
        charts.players = new Chart(playersCtx, {
            ...chartConfig,
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    data: Array(10).fill(0).map(() => Math.random() * 100),
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)'
                }]
            }
        });
    }
    
    // Performance chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        charts.performance = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: Array(24).fill('').map((_, i) => `${i}:00`),
                datasets: [
                    {
                        label: 'Players',
                        data: Array(24).fill(0).map(() => Math.random() * 100),
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'CPU',
                        data: Array(24).fill(0).map(() => Math.random() * 100),
                        borderColor: '#ff00ff',
                        backgroundColor: 'rgba(255, 0, 255, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners() {
    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleGlobalSearch, 300));
    }
    
    // Player search
    const playerSearch = document.getElementById('playerSearch');
    if (playerSearch) {
        playerSearch.addEventListener('input', debounce(handlePlayerSearch, 300));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + K = Search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
        
        // V = Toggle voice
        if (e.key === 'v' || e.key === 'V') {
            toggleVoiceCommands();
        }
        
        // Esc = Close modals/menus
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-results') && !e.target.closest('.global-search')) {
            hideSearchResults();
        }
        if (!e.target.closest('.context-menu') && !e.target.closest('.player-row')) {
            hideContextMenu();
        }
    });
}

// ============================================================================
// PARTICLE BACKGROUND
// ============================================================================

function initializeParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================================================
// PAGE NAVIGATION
// ============================================================================

function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = document.querySelector(`[data-page="${pageName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    AdminState.currentPage = pageName;
    
    // Load page data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'players':
            loadPlayers();
            break;
        case 'map':
            loadMap();
            break;
        case 'reports':
            loadReports();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ============================================================================
// DASHBOARD
// ============================================================================

async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) throw new Error('Failed to load dashboard');
        
        const data = await response.json();
        
        // Update stat cards
        document.getElementById('totalPlayers').textContent = data.totalPlayers || 0;
        document.getElementById('totalVehicles').textContent = data.totalVehicles || 0;
        document.getElementById('pendingReports').textContent = data.pendingReports || 0;
        document.getElementById('serverPing').textContent = `${data.avgPing || 0}ms`;
        
        // Update activity feed
        loadRecentActivity();
        
    } catch (error) {
        console.error('[Dashboard] Load error:', error);
        showNotification('Failed to load dashboard', 'error');
    }
}

function refreshDashboard() {
    if (AdminState.currentPage === 'dashboard') {
        loadDashboard();
    }
}

async function loadRecentActivity() {
    try {
        const response = await fetch('/api/logs/recent?limit=10', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await response.json();
        const activityList = document.getElementById('recentActivity');
        
        if (activityList && data.logs) {
            activityList.innerHTML = data.logs.map(log => `
                <div class="activity-item">
                    <div class="activity-icon ${log.action}">
                        <i class="fas fa-${getActivityIcon(log.action)}"></i>
                    </div>
                    <div class="activity-content">
                        <strong>${log.admin_name}</strong> ${log.action} ${log.target_name || ''}
                        <span class="activity-time">${formatTime(log.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('[Activity] Load error:', error);
    }
}

// ============================================================================
// PLAYERS
// ============================================================================

async function loadPlayers() {
    try {
        const response = await fetch('/api/players', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) throw new Error('Failed to load players');
        
        const data = await response.json();
        AdminState.players = data.players || [];
        
        renderPlayersTable(AdminState.players);
        
    } catch (error) {
        console.error('[Players] Load error:', error);
        showNotification('Failed to load players', 'error');
    }
}

function renderPlayersTable(players) {
    const tableContainer = document.getElementById('playersTable');
    if (!tableContainer) return;
    
    if (players.length === 0) {
        tableContainer.innerHTML = '<div class="no-data">No players online</div>';
        return;
    }
    
    tableContainer.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Money</th>
                    <th>Ping</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${players.map(player => `
                    <tr class="player-row" data-player-id="${player.id}" oncontextmenu="showPlayerContextMenu(event, ${player.id})">
                        <td>${player.id}</td>
                        <td>
                            <div class="player-info">
                                <div class="player-avatar"></div>
                                <span>${player.name}</span>
                            </div>
                        </td>
                        <td>${player.level || 1}</td>
                        <td>$${formatNumber(player.money || 0)}</td>
                        <td><span class="ping-badge ${getPingClass(player.ping)}">${player.ping || 0}ms</span></td>
                        <td><span class="status-badge ${player.online ? 'online' : 'offline'}">${player.online ? 'Online' : 'Offline'}</span></td>
                        <td>
                            <button class="btn-icon" onclick="viewPlayer(${player.id})" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="kickPlayer(${player.id})" title="Kick">
                                <i class="fas fa-shoe-prints"></i>
                            </button>
                            <button class="btn-icon danger" onclick="banPlayer(${player.id})" title="Ban">
                                <i class="fas fa-ban"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function refreshPlayers() {
    loadPlayers();
}

function filterPlayers() {
    const status = document.getElementById('playerStatusFilter')?.value || 'all';
    const sort = document.getElementById('playerSortFilter')?.value || 'name';
    
    let filtered = [...AdminState.players];
    
    // Filter by status
    if (status !== 'all') {
        filtered = filtered.filter(p => p.online === (status === 'online'));
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch(sort) {
            case 'level': return (b.level || 0) - (a.level || 0);
            case 'money': return (b.money || 0) - (a.money || 0);
            case 'playtime': return (b.playtime || 0) - (a.playtime || 0);
            default: return (a.name || '').localeCompare(b.name || '');
        }
    });
    
    renderPlayersTable(filtered);
}

// ============================================================================
// PLAYER ACTIONS
// ============================================================================

async function kickPlayer(playerId) {
    const reason = prompt('Kick reason:');
    if (!reason) return;
    
    try {
        const response = await fetch('/api/admin/kick', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ playerId, reason })
        });
        
        if (!response.ok) throw new Error('Kick failed');
        
        showNotification('Player kicked successfully', 'success');
        loadPlayers();
        
    } catch (error) {
        console.error('[Kick] Error:', error);
        showNotification('Failed to kick player', 'error');
    }
}

async function banPlayer(playerId) {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    
    if (!confirm('Are you sure you want to ban this player?')) return;
    
    try {
        const response = await fetch('/api/admin/ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ playerId, reason })
        });
        
        if (!response.ok) throw new Error('Ban failed');
        
        showNotification('Player banned successfully', 'success');
        loadPlayers();
        
    } catch (error) {
        console.error('[Ban] Error:', error);
        showNotification('Failed to ban player', 'error');
    }
}

function viewPlayer(playerId) {
    const player = AdminState.players.find(p => p.id === playerId);
    if (!player) return;
    
    AdminState.selectedPlayer = player;
    
    const modal = document.getElementById('playerModal');
    const modalBody = document.getElementById('playerModalBody');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <div class="player-details">
                <div class="detail-section">
                    <h3>Basic Info</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${player.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Level:</label>
                            <span>${player.level || 1}</span>
                        </div>
                        <div class="detail-item">
                            <label>Money:</label>
                            <span>$${formatNumber(player.money || 0)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Ping:</label>
                            <span>${player.ping || 0}ms</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Stats</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Playtime:</label>
                            <span>${formatPlaytime(player.playtime || 0)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Job:</label>
                            <span>${player.job || 'Unemployed'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

// ============================================================================
// SEARCH
// ============================================================================

async function handleGlobalSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await response.json();
        displaySearchResults(data.results || []);
        
    } catch (error) {
        console.error('[Search] Error:', error);
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No results found</div>';
    } else {
        container.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="handleSearchClick('${result.type}', ${result.id})">
                <i class="fas fa-${getResultIcon(result.type)}"></i>
                <div>
                    <strong>${result.title}</strong>
                    <span>${result.subtitle}</span>
                </div>
            </div>
        `).join('');
    }
    
    container.classList.add('show');
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.classList.remove('show');
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        AdminState.sidebarCollapsed = !AdminState.sidebarCollapsed;
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    AdminState.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = AdminState.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    localStorage.setItem('admin-theme', AdminState.theme);
}

function toggleVoiceCommands() {
    AdminState.voiceActive = !AdminState.voiceActive;
    const indicator = document.getElementById('voiceIndicator');
    
    if (AdminState.voiceActive) {
        indicator?.classList.add('active');
        if (typeof startVoiceRecognition === 'function') {
            startVoiceRecognition();
        }
    } else {
        indicator?.classList.remove('active');
        if (typeof stopVoiceRecognition === 'function') {
            stopVoiceRecognition();
        }
    }
}

function toggleAIAssistant() {
    const panel = document.getElementById('aiAssistant');
    if (panel) {
        AdminState.aiAssistantOpen = !AdminState.aiAssistantOpen;
        panel.style.display = AdminState.aiAssistantOpen ? 'flex' : 'none';
        
        if (AdminState.aiAssistantOpen && typeof loadAISuggestions === 'function') {
            loadAISuggestions();
        }
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = `notification ${type} glass-panel`;
    notif.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function updateServerStatus(status) {
    const statusDot = document.querySelector('.server-status .status-dot');
    const statusText = document.getElementById('serverStatus');
    
    if (statusDot) {
        statusDot.className = `status-dot ${status}`;
    }
    
    if (statusText) {
        statusText.textContent = status === 'online' ? 'Online' : 'Offline';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

function formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function getPingClass(ping) {
    if (ping < 50) return 'good';
    if (ping < 100) return 'medium';
    return 'bad';
}

function getActivityIcon(action) {
    const icons = {
        'kick': 'shoe-prints',
        'ban': 'ban',
        'warn': 'exclamation-triangle',
        'heal': 'heart',
        'teleport': 'location-dot',
        'freeze': 'snowflake'
    };
    return icons[action] || 'circle';
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'times-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getResultIcon(type) {
    const icons = {
        'player': 'user',
        'report': 'flag',
        'log': 'list',
        'ban': 'ban'
    };
    return icons[type] || 'circle';
}

function getToken() {
    return localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token') || '';
}

console.log('[Ultra Admin] Main script loaded successfully!');
