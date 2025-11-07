/**
 * ULTRA ADMIN PANEL - AI Assistant
 * Smart detection and automated admin suggestions
 */

// ============================================================================
// AI STATE
// ============================================================================

const AIState = {
    active: true,
    detectionMode: 'automatic',
    suspiciousPlayers: new Map(),
    suggestions: [],
    alerts: [],
    chatHistory: [],
    lastScan: Date.now()
};

// Detection thresholds
const THRESHOLDS = {
    speedHack: 300, // km/h
    teleportDistance: 500, // meters in < 1 second
    godmodeHits: 10, // damage hits without health loss
    rapidFire: 10, // shots per second
    moneyGain: 1000000, // money gained in < 1 minute
    suspicionScore: 75 // 0-100, trigger at 75
};

// ============================================================================
// AI DETECTION SYSTEM
// ============================================================================

class AIDetector {
    constructor() {
        this.playerHistory = new Map();
        this.detectionInterval = null;
    }
    
    start() {
        console.log('[AI] Starting detection system...');
        this.detectionInterval = setInterval(() => this.scanPlayers(), 2000);
    }
    
    stop() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
    
    async scanPlayers() {
        if (!AIState.active) return;
        
        try {
            const response = await fetch('/api/players/detailed', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            
            if (!response.ok) return;
            
            const data = await response.json();
            const players = data.players || [];
            
            players.forEach(player => this.analyzePlayer(player));
            
            AIState.lastScan = Date.now();
            
        } catch (error) {
            console.error('[AI] Scan error:', error);
        }
    }
    
    analyzePlayer(player) {
        const playerId = player.id;
        const history = this.getPlayerHistory(playerId);
        
        let suspicionScore = 0;
        const alerts = [];
        
        // Speed hack detection
        if (player.speed && player.speed > THRESHOLDS.speedHack) {
            suspicionScore += 30;
            alerts.push({
                type: 'speed_hack',
                severity: 'high',
                message: `Speed: ${player.speed} km/h (max: ${THRESHOLDS.speedHack})`,
                suggestion: 'Freeze player and inspect'
            });
        }
        
        // Teleport detection
        if (history.lastPosition) {
            const distance = this.calculateDistance(
                history.lastPosition,
                { x: player.x, y: player.y, z: player.z }
            );
            
            const timeDiff = (Date.now() - history.lastUpdate) / 1000;
            
            if (distance > THRESHOLDS.teleportDistance && timeDiff < 1) {
                suspicionScore += 40;
                alerts.push({
                    type: 'teleport',
                    severity: 'critical',
                    message: `Moved ${Math.round(distance)}m in ${timeDiff.toFixed(1)}s`,
                    suggestion: 'Ban immediately - likely teleport hack'
                });
            }
        }
        
        // Godmode detection
        if (player.health === 100 && history.damageReceived > THRESHOLDS.godmodeHits) {
            suspicionScore += 50;
            alerts.push({
                type: 'godmode',
                severity: 'critical',
                message: `Received ${history.damageReceived} hits without damage`,
                suggestion: 'Ban - godmode detected'
            });
        }
        
        // Money exploit detection
        if (history.lastMoney && player.money - history.lastMoney > THRESHOLDS.moneyGain) {
            const timeDiff = (Date.now() - history.lastMoneyCheck) / 1000 / 60;
            if (timeDiff < 1) {
                suspicionScore += 35;
                alerts.push({
                    type: 'money_exploit',
                    severity: 'high',
                    message: `Gained $${formatNumber(player.money - history.lastMoney)} in ${timeDiff.toFixed(1)}m`,
                    suggestion: 'Investigate and possibly ban'
                });
            }
        }
        
        // Update history
        this.updatePlayerHistory(playerId, player);
        
        // Handle suspicious activity
        if (suspicionScore >= THRESHOLDS.suspicionScore) {
            this.handleSuspiciousPlayer(player, suspicionScore, alerts);
        }
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    getPlayerHistory(playerId) {
        if (!this.playerHistory.has(playerId)) {
            this.playerHistory.set(playerId, {
                lastPosition: null,
                lastUpdate: Date.now(),
                lastMoney: 0,
                lastMoneyCheck: Date.now(),
                damageReceived: 0,
                violations: []
            });
        }
        return this.playerHistory.get(playerId);
    }
    
    updatePlayerHistory(playerId, player) {
        const history = this.getPlayerHistory(playerId);
        
        history.lastPosition = { x: player.x, y: player.y, z: player.z };
        history.lastUpdate = Date.now();
        
        if (player.money !== history.lastMoney) {
            history.lastMoney = player.money;
            history.lastMoneyCheck = Date.now();
        }
    }
    
    handleSuspiciousPlayer(player, score, alerts) {
        AIState.suspiciousPlayers.set(player.id, {
            player,
            score,
            alerts,
            timestamp: Date.now()
        });
        
        // Add to AI alerts panel
        addAIAlert({
            playerId: player.id,
            playerName: player.name,
            score,
            alerts,
            timestamp: Date.now()
        });
        
        // Auto-actions based on severity
        if (score >= 90) {
            // Critical - auto-freeze
            this.autoFreezePlayer(player.id);
        } else if (score >= 75) {
            // High - suggest action
            addAISuggestion({
                type: 'action_required',
                playerId: player.id,
                playerName: player.name,
                message: 'Suspicious activity detected',
                actions: ['freeze', 'kick', 'inspect']
            });
        }
        
        // Notify admins
        showNotification(`⚠️ Suspicious: ${player.name} (Score: ${score})`, 'warning');
    }
    
    async autoFreezePlayer(playerId) {
        try {
            const response = await fetch('/api/admin/freeze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    playerId,
                    reason: 'AI Auto-Freeze: Critical suspicious activity',
                    automated: true
                })
            });
            
            if (response.ok) {
                console.log(`[AI] Auto-froze player ${playerId}`);
                showNotification('AI auto-froze suspicious player', 'info');
            }
        } catch (error) {
            console.error('[AI] Auto-freeze error:', error);
        }
    }
}

// ============================================================================
// AI ASSISTANT UI
// ============================================================================

function loadAISuggestions() {
    const container = document.querySelector('#aiSuggestions .suggestion-list');
    if (!container) return;
    
    if (AIState.suggestions.length === 0) {
        container.innerHTML = '<div class="no-data">No suggestions at this time</div>';
        return;
    }
    
    container.innerHTML = AIState.suggestions.map((suggestion, index) => `
        <div class="ai-suggestion glass-panel">
            <div class="suggestion-header">
                <i class="fas fa-lightbulb"></i>
                <strong>${suggestion.message}</strong>
            </div>
            <div class="suggestion-body">
                <span>Player: ${suggestion.playerName}</span>
                ${suggestion.actions ? `
                    <div class="suggestion-actions">
                        ${suggestion.actions.map(action => `
                            <button class="btn-sm" onclick="executeSuggestedAction('${action}', ${suggestion.playerId})">
                                ${action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <button class="dismiss-btn" onclick="dismissSuggestion(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addAISuggestion(suggestion) {
    AIState.suggestions.unshift(suggestion);
    
    // Keep only last 10 suggestions
    if (AIState.suggestions.length > 10) {
        AIState.suggestions = AIState.suggestions.slice(0, 10);
    }
    
    loadAISuggestions();
}

function dismissSuggestion(index) {
    AIState.suggestions.splice(index, 1);
    loadAISuggestions();
}

function addAIAlert(alert) {
    AIState.alerts.unshift(alert);
    
    // Keep only last 20 alerts
    if (AIState.alerts.length > 20) {
        AIState.alerts = AIState.alerts.slice(0, 20);
    }
    
    updateAIAlerts();
}

function updateAIAlerts() {
    const container = document.querySelector('#aiAlerts .alert-list');
    if (!container) return;
    
    if (AIState.alerts.length === 0) {
        container.innerHTML = '<div class="no-data">No alerts</div>';
        return;
    }
    
    container.innerHTML = AIState.alerts.map(alert => `
        <div class="ai-alert ${getSeverityClass(alert.score)} glass-panel">
            <div class="alert-header">
                <span class="alert-score">${alert.score}</span>
                <strong>${alert.playerName}</strong>
                <span class="alert-time">${formatTime(alert.timestamp)}</span>
            </div>
            <div class="alert-body">
                ${alert.alerts.map(a => `
                    <div class="alert-item ${a.severity}">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${a.message}</span>
                    </div>
                `).join('')}
            </div>
            <div class="alert-suggestion">
                <i class="fas fa-robot"></i>
                <span>AI Suggests: ${alert.alerts[0]?.suggestion || 'Review activity'}</span>
            </div>
        </div>
    `).join('');
}

function getSeverityClass(score) {
    if (score >= 90) return 'critical';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

// ============================================================================
// AI CHAT
// ============================================================================

async function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    input.value = '';
    
    // Add user message
    addChatMessage('user', message);
    
    // Get AI response
    const response = await getAIResponse(message);
    addChatMessage('ai', response);
}

function addChatMessage(sender, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-text">${text}</div>
    `;
    
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
    
    AIState.chatHistory.push({ sender, text, timestamp: Date.now() });
}

async function getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Simple AI responses (can be enhanced with real AI API)
    if (lowerMsg.includes('how many') && lowerMsg.includes('player')) {
        return `There are currently ${AdminState.stats.totalPlayers} players online.`;
    }
    
    if (lowerMsg.includes('suspicious') || lowerMsg.includes('hack')) {
        const count = AIState.suspiciousPlayers.size;
        return count > 0
            ? `I've detected ${count} suspicious player${count > 1 ? 's' : ''}. Check the alerts panel for details.`
            : 'No suspicious activity detected at the moment.';
    }
    
    if (lowerMsg.includes('ban') || lowerMsg.includes('kick')) {
        return 'I can help you with player moderation. Use voice commands like "kick player ID" or click on a player in the list.';
    }
    
    if (lowerMsg.includes('help')) {
        return 'I can help you monitor the server, detect cheaters, and manage players. Ask me about player counts, suspicious activity, or server stats.';
    }
    
    // Default response
    return "I'm here to assist you. I can monitor suspicious activity, provide player information, and help with server management. What would you like to know?";
}

function executeSuggestedAction(action, playerId) {
    switch(action) {
        case 'freeze':
            freezePlayer(playerId);
            break;
        case 'kick':
            kickPlayer(playerId);
            break;
        case 'ban':
            banPlayer(playerId);
            break;
        case 'inspect':
            viewPlayer(playerId);
            break;
        case 'teleport':
            teleportToPlayer(playerId);
            break;
    }
}

async function freezePlayer(playerId) {
    try {
        const response = await fetch('/api/admin/freeze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ playerId })
        });
        
        if (response.ok) {
            showNotification('Player frozen', 'success');
        }
    } catch (error) {
        console.error('[Freeze] Error:', error);
    }
}

// ============================================================================
// INITIALIZE AI
// ============================================================================

let aiDetector = null;

function initializeAI() {
    aiDetector = new AIDetector();
    aiDetector.start();
    
    console.log('[AI] Assistant initialized');
}

// Auto-start AI when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAI);
} else {
    initializeAI();
}

console.log('[AI] Assistant script loaded!');
