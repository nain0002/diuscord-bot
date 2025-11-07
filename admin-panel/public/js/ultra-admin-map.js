/**
 * ULTRA ADMIN PANEL - 3D Live Map
 * Real-time player tracking with interactive 3D canvas
 */

// ============================================================================
// MAP STATE
// ============================================================================

const MapState = {
    canvas: null,
    ctx: null,
    players: [],
    vehicles: [],
    zones: [],
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    mapWidth: 8000,
    mapHeight: 8000,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    selectedPlayer: null,
    hoveredPlayer: null,
    showVehicles: true,
    showZones: true,
    showNames: true,
    animationFrame: null
};

// Los Santos map coordinates (GTAV)
const MAP_BOUNDS = {
    minX: -4000,
    maxX: 4000,
    minY: -4000,
    maxY: 8000
};

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

function initializeMap() {
    const canvas = document.getElementById('liveMap');
    if (!canvas) {
        console.warn('[Map] Canvas not found');
        return;
    }
    
    MapState.canvas = canvas;
    MapState.ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listeners
    canvas.addEventListener('wheel', handleMapZoom);
    canvas.addEventListener('mousedown', handleMapMouseDown);
    canvas.addEventListener('mousemove', handleMapMouseMove);
    canvas.addEventListener('mouseup', handleMapMouseUp);
    canvas.addEventListener('mouseleave', handleMapMouseUp);
    canvas.addEventListener('click', handleMapClick);
    
    // Start rendering
    startMapRendering();
    
    // Load map data
    loadMapData();
    
    // Real-time updates
    if (AdminState.socket) {
        AdminState.socket.on('playerPositionUpdate', updatePlayerPosition);
        AdminState.socket.on('vehiclePositionUpdate', updateVehiclePosition);
    }
    
    console.log('[Map] Initialized successfully');
}

function resizeCanvas() {
    if (!MapState.canvas) return;
    
    const container = MapState.canvas.parentElement;
    MapState.canvas.width = container.clientWidth;
    MapState.canvas.height = container.clientHeight;
}

// ============================================================================
// MAP RENDERING
// ============================================================================

function startMapRendering() {
    function render() {
        clearCanvas();
        drawGrid();
        drawZones();
        drawVehicles();
        drawPlayers();
        drawMiniInfo();
        
        MapState.animationFrame = requestAnimationFrame(render);
    }
    
    render();
}

function stopMapRendering() {
    if (MapState.animationFrame) {
        cancelAnimationFrame(MapState.animationFrame);
        MapState.animationFrame = null;
    }
}

function clearCanvas() {
    const { ctx, canvas } = MapState;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    const { ctx, canvas, scale, offsetX, offsetY } = MapState;
    
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 500 * scale;
    const startX = (offsetX % gridSize);
    const startY = (offsetY % gridSize);
    
    // Vertical lines
    for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawZones() {
    if (!MapState.showZones) return;
    
    const { ctx } = MapState;
    
    // Example zones (can be loaded from server)
    const zones = [
        { name: 'Los Santos', x: 0, y: 0, radius: 2000, color: 'rgba(0, 255, 100, 0.1)' },
        { name: 'Sandy Shores', x: 1500, y: 3000, radius: 800, color: 'rgba(255, 200, 0, 0.1)' },
        { name: 'Paleto Bay', x: -500, y: 6000, radius: 600, color: 'rgba(100, 150, 255, 0.1)' }
    ];
    
    zones.forEach(zone => {
        const screenPos = worldToScreen(zone.x, zone.y);
        
        ctx.fillStyle = zone.color;
        ctx.strokeStyle = zone.color.replace('0.1', '0.5');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, zone.radius * MapState.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Zone name
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone.name, screenPos.x, screenPos.y);
    });
}

function drawVehicles() {
    if (!MapState.showVehicles) return;
    
    const { ctx } = MapState;
    
    MapState.vehicles.forEach(vehicle => {
        const screenPos = worldToScreen(vehicle.x, vehicle.y);
        
        // Vehicle icon
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate((vehicle.heading || 0) * Math.PI / 180);
        
        // Draw car shape
        ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.fillRect(-8, -4, 16, 8);
        
        ctx.restore();
    });
}

function drawPlayers() {
    const { ctx } = MapState;
    
    MapState.players.forEach(player => {
        const screenPos = worldToScreen(player.x, player.y);
        const isHovered = MapState.hoveredPlayer === player.id;
        const isSelected = MapState.selectedPlayer === player.id;
        
        // Player dot
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, isHovered || isSelected ? 8 : 6, 0, Math.PI * 2);
        
        // Color based on status
        if (isSelected) {
            ctx.fillStyle = '#ff00ff';
        } else if (player.wanted) {
            ctx.fillStyle = '#ff0000';
        } else if (player.admin) {
            ctx.fillStyle = '#ffaa00';
        } else {
            ctx.fillStyle = '#00f0ff';
        }
        
        ctx.fill();
        
        // Glow effect
        if (isHovered || isSelected) {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = ctx.fillStyle.replace(')', ', 0.3)');
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Player name
        if (MapState.showNames || isHovered || isSelected) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, screenPos.x, screenPos.y - 15);
            
            // Player ID
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(`#${player.id}`, screenPos.x, screenPos.y - 3);
        }
        
        // Direction indicator
        if (player.heading !== undefined) {
            ctx.save();
            ctx.translate(screenPos.x, screenPos.y);
            ctx.rotate(player.heading * Math.PI / 180);
            
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(3, 0);
            ctx.lineTo(-3, 0);
            ctx.closePath();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            
            ctx.restore();
        }
    });
}

function drawMiniInfo() {
    const { ctx, canvas } = MapState;
    
    // Info box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 80);
    
    ctx.fillStyle = '#00f0ff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText(`Players: ${MapState.players.length}`, 20, 30);
    ctx.fillText(`Vehicles: ${MapState.vehicles.length}`, 20, 50);
    ctx.fillText(`Zoom: ${(MapState.scale * 100).toFixed(0)}%`, 20, 70);
    
    // Legend
    const legendX = canvas.width - 150;
    const legendY = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX, legendY, 140, 100);
    
    const legendItems = [
        { color: '#00f0ff', label: 'Player' },
        { color: '#ffaa00', label: 'Admin' },
        { color: '#ff0000', label: 'Wanted' },
        { color: '#ff6400', label: 'Vehicle' }
    ];
    
    legendItems.forEach((item, i) => {
        const y = legendY + 20 + (i * 20);
        
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + 20, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(item.label, legendX + 35, y + 4);
    });
}

// ============================================================================
// MAP INTERACTION
// ============================================================================

function handleMapZoom(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = MapState.scale * delta;
    
    // Limit zoom
    if (newScale < 0.3 || newScale > 3) return;
    
    // Zoom towards mouse position
    const rect = MapState.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    MapState.offsetX = mouseX - (mouseX - MapState.offsetX) * delta;
    MapState.offsetY = mouseY - (mouseY - MapState.offsetY) * delta;
    MapState.scale = newScale;
}

function handleMapMouseDown(e) {
    MapState.isDragging = true;
    MapState.lastMouseX = e.clientX;
    MapState.lastMouseY = e.clientY;
    MapState.canvas.style.cursor = 'grabbing';
}

function handleMapMouseMove(e) {
    if (MapState.isDragging) {
        const dx = e.clientX - MapState.lastMouseX;
        const dy = e.clientY - MapState.lastMouseY;
        
        MapState.offsetX += dx;
        MapState.offsetY += dy;
        
        MapState.lastMouseX = e.clientX;
        MapState.lastMouseY = e.clientY;
    } else {
        // Check hover
        const rect = MapState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        MapState.hoveredPlayer = findPlayerAtPosition(mouseX, mouseY);
        MapState.canvas.style.cursor = MapState.hoveredPlayer ? 'pointer' : 'grab';
    }
}

function handleMapMouseUp(e) {
    MapState.isDragging = false;
    MapState.canvas.style.cursor = 'grab';
}

function handleMapClick(e) {
    const rect = MapState.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const playerId = findPlayerAtPosition(mouseX, mouseY);
    
    if (playerId) {
        MapState.selectedPlayer = playerId;
        showPlayerMapInfo(playerId);
    } else {
        MapState.selectedPlayer = null;
    }
}

function findPlayerAtPosition(x, y) {
    for (const player of MapState.players) {
        const screenPos = worldToScreen(player.x, player.y);
        const distance = Math.sqrt(
            Math.pow(x - screenPos.x, 2) + Math.pow(y - screenPos.y, 2)
        );
        
        if (distance < 10) {
            return player.id;
        }
    }
    
    return null;
}

function showPlayerMapInfo(playerId) {
    const player = MapState.players.find(p => p.id === playerId);
    if (!player) return;
    
    const info = `
        <strong>${player.name}</strong> (#${player.id})<br>
        Position: ${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)}<br>
        ${player.vehicle ? `In vehicle: ${player.vehicle}` : 'On foot'}
    `;
    
    showNotification(info, 'info');
    
    // Show quick actions
    const actions = document.createElement('div');
    actions.className = 'map-player-actions glass-panel';
    actions.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        padding: 20px;
        min-width: 200px;
    `;
    
    actions.innerHTML = `
        <h3>${player.name}</h3>
        <button class="btn-primary" onclick="teleportToPlayer(${player.id})">Teleport</button>
        <button class="btn-primary" onclick="viewPlayer(${player.id})">View Details</button>
        <button class="btn-danger" onclick="kickPlayer(${player.id})">Kick</button>
        <button class="btn-danger" onclick="banPlayer(${player.id})">Ban</button>
    `;
    
    // Remove previous actions
    document.querySelectorAll('.map-player-actions').forEach(el => el.remove());
    
    document.body.appendChild(actions);
    
    // Auto-remove after 10 seconds
    setTimeout(() => actions.remove(), 10000);
}

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

function worldToScreen(worldX, worldY) {
    // Convert world coordinates to screen coordinates
    const normalizedX = (worldX - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX);
    const normalizedY = (worldY - MAP_BOUNDS.minY) / (MAP_BOUNDS.maxY - MAP_BOUNDS.minY);
    
    const screenX = normalizedX * MapState.mapWidth * MapState.scale + MapState.offsetX;
    const screenY = normalizedY * MapState.mapHeight * MapState.scale + MapState.offsetY;
    
    return { x: screenX, y: screenY };
}

function screenToWorld(screenX, screenY) {
    const normalizedX = (screenX - MapState.offsetX) / (MapState.mapWidth * MapState.scale);
    const normalizedY = (screenY - MapState.offsetY) / (MapState.mapHeight * MapState.scale);
    
    const worldX = normalizedX * (MAP_BOUNDS.maxX - MAP_BOUNDS.minX) + MAP_BOUNDS.minX;
    const worldY = normalizedY * (MAP_BOUNDS.maxY - MAP_BOUNDS.minY) + MAP_BOUNDS.minY;
    
    return { x: worldX, y: worldY };
}

// ============================================================================
// DATA LOADING & UPDATES
// ============================================================================

async function loadMapData() {
    try {
        const response = await fetch('/api/players/positions', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        MapState.players = data.players || [];
        
    } catch (error) {
        console.error('[Map] Load error:', error);
    }
}

function updatePlayerPosition(data) {
    const index = MapState.players.findIndex(p => p.id === data.id);
    
    if (index !== -1) {
        MapState.players[index] = { ...MapState.players[index], ...data };
    } else {
        MapState.players.push(data);
    }
}

function updateVehiclePosition(data) {
    const index = MapState.vehicles.findIndex(v => v.id === data.id);
    
    if (index !== -1) {
        MapState.vehicles[index] = { ...MapState.vehicles[index], ...data };
    } else {
        MapState.vehicles.push(data);
    }
}

function toggleMapLayer(layer) {
    switch(layer) {
        case 'vehicles':
            MapState.showVehicles = !MapState.showVehicles;
            break;
        case 'zones':
            MapState.showZones = !MapState.showZones;
            break;
        case 'names':
            MapState.showNames = !MapState.showNames;
            break;
    }
}

function centerMapOnPlayer(playerId) {
    const player = MapState.players.find(p => p.id === playerId);
    if (!player) return;
    
    const screenPos = worldToScreen(player.x, player.y);
    
    MapState.offsetX = MapState.canvas.width / 2 - screenPos.x + MapState.offsetX;
    MapState.offsetY = MapState.canvas.height / 2 - screenPos.y + MapState.offsetY;
    
    MapState.selectedPlayer = playerId;
}

function resetMapView() {
    MapState.scale = 1;
    MapState.offsetX = 0;
    MapState.offsetY = 0;
    MapState.selectedPlayer = null;
}

// ============================================================================
// LOAD MAP
// ============================================================================

function loadMap() {
    if (!MapState.canvas) {
        initializeMap();
    }
    loadMapData();
}

console.log('[Map] 3D Map script loaded!');
