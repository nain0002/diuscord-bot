// Admin Menu Enhanced JavaScript

let currentSection = 'dashboard';
let noClipEnabled = false;
let godModeEnabled = false;
let invisibleEnabled = false;

// Show/hide admin menu
function toggleAdmin() {
    const container = document.getElementById('adminContainer');
    container.classList.toggle('active');
    
    if (container.classList.contains('active')) {
        mp.trigger('requestAdminData');
    }
}

function closeAdmin() {
    document.getElementById('adminContainer').classList.remove('active');
    mp.trigger('closeAdminMenu');
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    
    // Update header title
    const titles = {
        'dashboard': 'Dashboard',
        'players': 'Player Management',
        'reports': 'Player Reports',
        'vehicles': 'Vehicle Manager',
        'objects': 'Object Spawner',
        'weapons': 'Weapon Manager',
        'teleport': 'Teleportation',
        'weather': 'Weather & Time',
        'world': 'World Options',
        'punishments': 'Punishments',
        'whitelist': 'Whitelist',
        'noclip': 'Personal Tools',
        'spectate': 'Spectate Mode',
        'screenshot': 'Screenshot Tool',
        'logs': 'Chat Logs'
    };
    
    document.getElementById('headerTitle').textContent = titles[section] || section;
    currentSection = section;
    
    // Load section-specific data
    if (section === 'players') {
        mp.trigger('requestPlayerList');
    } else if (section === 'logs') {
        mp.trigger('requestChatLogs');
    } else if (section === 'reports') {
        mp.trigger('requestReports');
    }
}

// Update stats
function updateStats(data) {
    document.getElementById('totalPlayers').textContent = data.players || 0;
    document.getElementById('totalVehicles').textContent = data.vehicles || 0;
    document.getElementById('serverUptime').textContent = data.uptime || '0h 0m';
    document.getElementById('serverMemory').textContent = data.memory || '0 MB';
}

// Update player list
function updatePlayerList(players) {
    const list = document.getElementById('playerList');
    document.getElementById('playerCount').textContent = players.length;
    
    if (players.length === 0) {
        list.innerHTML = '<div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">No players online</div>';
        return;
    }
    
    list.innerHTML = players.map(p => `
        <div class="player-item">
            <div class="player-info">
                <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
                <div class="player-details">
                    <div class="player-name">${p.name}</div>
                    <div class="player-meta">
                        <span>ID: ${p.id}</span>
                        <span>Level: ${p.level || 1}</span>
                        <span>${p.job || 'Unemployed'}</span>
                    </div>
                </div>
            </div>
            <div class="player-actions">
                <button class="action-icon-btn" onclick="playerAction('heal', ${p.id})" title="Heal">❤️</button>
                <button class="action-icon-btn" onclick="playerAction('freeze', ${p.id})" title="Freeze">❄️</button>
                <button class="action-icon-btn" onclick="playerAction('teleport', ${p.id})" title="Teleport To">📍</button>
                <button class="action-icon-btn" onclick="playerAction('spectate', ${p.id})" title="Spectate">👁️</button>
                <button class="action-icon-btn danger" onclick="playerAction('kick', ${p.id})" title="Kick">⚠️</button>
            </div>
        </div>
    `).join('');
}

// Filter players
function filterPlayers() {
    const search = document.getElementById('playerSearch').value.toLowerCase();
    const items = document.querySelectorAll('#playerList .player-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'flex' : 'none';
    });
}

// Player actions
function playerAction(action, playerId) {
    mp.trigger('adminPlayerAction', action, playerId);
}

// Admin actions
function adminAction(action) {
    if (action === 'announce') {
        const message = prompt('Enter announcement message:');
        if (message) {
            mp.trigger('adminCommand', action, message);
        }
    } else {
        mp.trigger('adminCommand', action);
    }
}

// Vehicle tab switching
function switchVehicleTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Spawn custom vehicle
function spawnCustomVehicle() {
    const model = document.getElementById('vehicleModel').value;
    const r = document.getElementById('colorR').value;
    const g = document.getElementById('colorG').value;
    const b = document.getElementById('colorB').value;
    
    if (model) {
        mp.trigger('adminSpawnVehicle', model, [parseInt(r), parseInt(g), parseInt(b)]);
    }
}

// Quick spawn vehicle
function quickSpawn(model) {
    mp.trigger('adminSpawnVehicle', model, [255, 255, 255]);
}

// Spawn object
function spawnObject() {
    const model = document.getElementById('objectModel').value;
    if (model) {
        mp.trigger('adminSpawnObject', model);
    }
}

// Give weapon
function giveWeapon(weapon) {
    mp.trigger('adminGiveWeapon', weapon);
}

// Teleport functions
function teleportTo(location) {
    const locations = {
        'ls': [-275.0, -956.0, 31.2],
        'airport': [-1037.0, -2738.0, 13.8],
        'beach': [-1395.0, -988.0, 7.2],
        'military': [-2361.0, 3249.0, 32.8],
        'vinewood': [119.0, -1305.0, 29.3],
        'paleto': [121.0, 6606.0, 31.9]
    };
    
    const coords = locations[location];
    if (coords) {
        mp.trigger('adminTeleport', coords[0], coords[1], coords[2]);
    }
}

function teleportToCoords() {
    const x = parseFloat(document.getElementById('teleportX').value);
    const y = parseFloat(document.getElementById('teleportY').value);
    const z = parseFloat(document.getElementById('teleportZ').value);
    
    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        mp.trigger('adminTeleport', x, y, z);
    }
}

// Weather control
function setWeather(weather) {
    mp.trigger('adminSetWeather', weather);
}

// Time control
function setTime() {
    const hour = parseInt(document.getElementById('timeHour').value);
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        mp.trigger('adminSetTime', hour);
    }
}

// World toggles
function toggleWorld(type) {
    mp.trigger('adminToggleWorld', type);
}

// Punishment functions
function warnPlayer() {
    const playerId = parseInt(document.getElementById('punishPlayerId').value);
    const reason = document.getElementById('punishReason').value;
    
    if (!isNaN(playerId) && reason) {
        mp.trigger('adminWarn', playerId, reason);
    }
}

function mutePlayer() {
    const playerId = parseInt(document.getElementById('punishPlayerId').value);
    const reason = document.getElementById('punishReason').value;
    
    if (!isNaN(playerId) && reason) {
        mp.trigger('adminMute', playerId, reason);
    }
}

function jailPlayer() {
    const playerId = parseInt(document.getElementById('punishPlayerId').value);
    const reason = document.getElementById('punishReason').value;
    
    if (!isNaN(playerId) && reason) {
        mp.trigger('adminJail', playerId, reason);
    }
}

function kickPlayer() {
    const playerId = parseInt(document.getElementById('punishPlayerId').value);
    const reason = document.getElementById('punishReason').value;
    
    if (!isNaN(playerId) && reason) {
        if (confirm(`Are you sure you want to kick player #${playerId}?`)) {
            mp.trigger('adminKick', playerId, reason);
        }
    }
}

function banPlayer() {
    const playerId = parseInt(document.getElementById('punishPlayerId').value);
    const reason = document.getElementById('punishReason').value;
    
    if (!isNaN(playerId) && reason) {
        if (confirm(`Are you sure you want to BAN player #${playerId}?`)) {
            mp.trigger('adminBan', playerId, reason);
        }
    }
}

// Whitelist functions
function addWhitelist() {
    const name = document.getElementById('whitelistName').value;
    if (name) {
        mp.trigger('adminAddWhitelist', name);
    }
}

function removeWhitelist() {
    const name = document.getElementById('whitelistName').value;
    if (name) {
        mp.trigger('adminRemoveWhitelist', name);
    }
}

// Personal tools
function toggleNoClip() {
    noClipEnabled = !noClipEnabled;
    mp.trigger('adminToggleNoClip', noClipEnabled);
}

function toggleGodMode() {
    godModeEnabled = !godModeEnabled;
    mp.trigger('adminToggleGodMode', godModeEnabled);
}

function toggleInvisible() {
    invisibleEnabled = !invisibleEnabled;
    mp.trigger('adminToggleInvisible', invisibleEnabled);
}

// Spectate functions
function startSpectate() {
    const playerId = parseInt(document.getElementById('spectatePlayerId').value);
    if (!isNaN(playerId)) {
        mp.trigger('adminStartSpectate', playerId);
    }
}

function stopSpectate() {
    mp.trigger('adminStopSpectate');
}

// Screenshot function
function takeScreenshot() {
    const playerId = parseInt(document.getElementById('screenshotPlayerId').value);
    if (!isNaN(playerId)) {
        mp.trigger('adminTakeScreenshot', playerId);
    }
}

// Update chat logs
function updateChatLogs(logs) {
    const logList = document.getElementById('chatLogs');
    
    if (logs.length === 0) {
        logList.innerHTML = '<div style="padding: 20px; color: rgba(255,255,255,0.5); font-size: 13px;">No chat logs available</div>';
        return;
    }
    
    logList.innerHTML = logs.map(log => `
        <div class="player-item">
            <div style="flex: 1;">
                <div style="color: #fff; font-weight: 600; margin-bottom: 5px;">
                    ${log.player} <span style="color: rgba(255,255,255,0.4); font-weight: 400; font-size: 12px;">${log.time}</span>
                </div>
                <div style="color: rgba(255,255,255,0.7); font-size: 13px;">${log.message}</div>
            </div>
        </div>
    `).join('');
}

// Update reports
function updateReports(reports) {
    const reportList = document.getElementById('reportsList');
    
    if (reports.length === 0) {
        reportList.innerHTML = '<div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">No active reports</div>';
        return;
    }
    
    reportList.innerHTML = reports.map(report => `
        <div class="player-item">
            <div style="flex: 1;">
                <div style="color: #fff; font-weight: 600; margin-bottom: 5px;">
                    ${report.reporter} reported ${report.reported}
                    <span style="color: rgba(255,255,255,0.4); font-weight: 400; font-size: 12px; margin-left: 10px;">${report.time}</span>
                </div>
                <div style="color: rgba(255,255,255,0.7); font-size: 13px; margin-bottom: 8px;">${report.reason}</div>
            </div>
            <div class="player-actions">
                <button class="btn" onclick="handleReport(${report.id}, 'accept')" style="padding: 8px 16px;">Accept</button>
                <button class="btn danger" onclick="handleReport(${report.id}, 'reject')" style="padding: 8px 16px;">Reject</button>
            </div>
        </div>
    `).join('');
}

function handleReport(reportId, action) {
    mp.trigger('adminHandleReport', reportId, action);
}
