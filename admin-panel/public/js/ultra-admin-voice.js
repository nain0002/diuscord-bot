/**
 * ULTRA ADMIN PANEL - Voice Commands
 * Voice-activated admin controls using Web Speech API
 */

// ============================================================================
// VOICE STATE
// ============================================================================

const VoiceState = {
    recognition: null,
    isListening: false,
    commands: new Map(),
    lastCommand: null,
    confidence: 0
};

// ============================================================================
// VOICE RECOGNITION SETUP
// ============================================================================

function initializeVoiceRecognition() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('[Voice] Speech recognition not supported in this browser');
        showNotification('Voice commands not supported in this browser', 'warning');
        return false;
    }
    
    VoiceState.recognition = new SpeechRecognition();
    VoiceState.recognition.continuous = true;
    VoiceState.recognition.interimResults = false;
    VoiceState.recognition.lang = 'en-US';
    
    // Event handlers
    VoiceState.recognition.onstart = () => {
        console.log('[Voice] Listening started');
        VoiceState.isListening = true;
        updateVoiceIndicator(true);
    };
    
    VoiceState.recognition.onend = () => {
        console.log('[Voice] Listening stopped');
        VoiceState.isListening = false;
        updateVoiceIndicator(false);
        
        // Restart if still active
        if (AdminState.voiceActive) {
            setTimeout(() => {
                if (AdminState.voiceActive) {
                    VoiceState.recognition.start();
                }
            }, 100);
        }
    };
    
    VoiceState.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence;
        
        console.log('[Voice] Heard:', transcript, '(confidence:', confidence, ')');
        
        if (confidence > 0.6) {
            processVoiceCommand(transcript, confidence);
        }
    };
    
    VoiceState.recognition.onerror = (event) => {
        console.error('[Voice] Error:', event.error);
        
        if (event.error === 'no-speech') {
            // Ignore no-speech errors
            return;
        }
        
        if (event.error === 'not-allowed') {
            showNotification('Microphone access denied', 'error');
            AdminState.voiceActive = false;
            updateVoiceIndicator(false);
        }
    };
    
    // Register commands
    registerVoiceCommands();
    
    return true;
}

// ============================================================================
// VOICE COMMANDS
// ============================================================================

function registerVoiceCommands() {
    // Navigation
    registerCommand(['dashboard', 'go to dashboard', 'show dashboard'], () => {
        switchPage('dashboard');
        speak('Opening dashboard');
    });
    
    registerCommand(['players', 'show players', 'player list'], () => {
        switchPage('players');
        speak('Opening player list');
    });
    
    registerCommand(['map', 'show map', 'open map'], () => {
        switchPage('map');
        speak('Opening map');
    });
    
    registerCommand(['reports', 'show reports'], () => {
        switchPage('reports');
        speak('Opening reports');
    });
    
    registerCommand(['logs', 'show logs', 'admin logs'], () => {
        switchPage('logs');
        speak('Opening logs');
    });
    
    // Player actions (with ID)
    registerCommand(['kick player *', 'kick *'], (args) => {
        const playerId = extractPlayerId(args);
        if (playerId) {
            kickPlayer(playerId);
            speak(`Kicking player ${playerId}`);
        }
    });
    
    registerCommand(['ban player *', 'ban *'], (args) => {
        const playerId = extractPlayerId(args);
        if (playerId) {
            banPlayer(playerId);
            speak(`Banning player ${playerId}`);
        }
    });
    
    registerCommand(['freeze player *', 'freeze *'], (args) => {
        const playerId = extractPlayerId(args);
        if (playerId) {
            freezePlayer(playerId);
            speak(`Freezing player ${playerId}`);
        }
    });
    
    registerCommand(['heal player *', 'heal *'], (args) => {
        const playerId = extractPlayerId(args);
        if (playerId) {
            healPlayer(playerId);
            speak(`Healing player ${playerId}`);
        }
    });
    
    registerCommand(['teleport to player *', 'teleport to *', 'go to player *'], (args) => {
        const playerId = extractPlayerId(args);
        if (playerId) {
            teleportToPlayer(playerId);
            speak(`Teleporting to player ${playerId}`);
        }
    });
    
    // General actions
    registerCommand(['refresh', 'reload', 'update'], () => {
        refreshCurrentPage();
        speak('Refreshing');
    });
    
    registerCommand(['how many players', 'player count', 'how many online'], () => {
        speak(`There are ${AdminState.stats.totalPlayers} players online`);
    });
    
    registerCommand(['server status', 'status'], () => {
        const status = document.getElementById('serverStatus')?.textContent || 'unknown';
        speak(`Server is ${status}`);
    });
    
    // AI Assistant
    registerCommand(['open ai', 'show ai', 'ai assistant'], () => {
        toggleAIAssistant();
        speak('Opening AI assistant');
    });
    
    registerCommand(['suspicious players', 'show suspicious', 'any hackers'], () => {
        const count = AIState.suspiciousPlayers.size;
        if (count > 0) {
            speak(`${count} suspicious player${count > 1 ? 's' : ''} detected`);
            switchPage('players');
        } else {
            speak('No suspicious activity');
        }
    });
    
    // Search
    registerCommand(['search for *', 'find *'], (args) => {
        const query = args.replace(/^(search for|find)\s+/i, '');
        performVoiceSearch(query);
    });
    
    // Help
    registerCommand(['help', 'what can you do', 'commands'], () => {
        speak('You can say things like: kick player 5, show players, go to dashboard, how many online, or search for John');
    });
    
    // Stop listening
    registerCommand(['stop listening', 'stop', 'cancel'], () => {
        AdminState.voiceActive = false;
        stopVoiceRecognition();
        speak('Voice commands disabled');
    });
}

function registerCommand(patterns, callback) {
    if (Array.isArray(patterns)) {
        patterns.forEach(pattern => {
            VoiceState.commands.set(pattern.toLowerCase(), callback);
        });
    } else {
        VoiceState.commands.set(patterns.toLowerCase(), callback);
    }
}

// ============================================================================
// COMMAND PROCESSING
// ============================================================================

function processVoiceCommand(transcript, confidence) {
    VoiceState.lastCommand = transcript;
    VoiceState.confidence = confidence;
    
    // Show visual feedback
    showVoiceTranscript(transcript);
    
    // Try exact match first
    if (VoiceState.commands.has(transcript)) {
        const callback = VoiceState.commands.get(transcript);
        callback();
        return;
    }
    
    // Try pattern matching (commands with *)
    for (const [pattern, callback] of VoiceState.commands) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace('*', '(.+)') + '$', 'i');
            const match = transcript.match(regex);
            
            if (match) {
                callback(match[1]);
                return;
            }
        }
    }
    
    // Try partial match
    for (const [pattern, callback] of VoiceState.commands) {
        if (!pattern.includes('*') && transcript.includes(pattern)) {
            callback();
            return;
        }
    }
    
    // No match found
    console.log('[Voice] Unknown command:', transcript);
    speak("I didn't understand that command");
}

function extractPlayerId(text) {
    // Extract numbers from text
    const numbers = text.match(/\d+/);
    return numbers ? parseInt(numbers[0]) : null;
}

function performVoiceSearch(query) {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input'));
    }
    speak(`Searching for ${query}`);
}

function refreshCurrentPage() {
    switch(AdminState.currentPage) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'players':
            loadPlayers();
            break;
        case 'reports':
            loadReports();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

// ============================================================================
// VOICE CONTROL
// ============================================================================

function startVoiceRecognition() {
    if (!VoiceState.recognition) {
        if (!initializeVoiceRecognition()) {
            return;
        }
    }
    
    try {
        VoiceState.recognition.start();
        speak('Voice commands activated');
    } catch (error) {
        console.error('[Voice] Start error:', error);
    }
}

function stopVoiceRecognition() {
    if (VoiceState.recognition && VoiceState.isListening) {
        VoiceState.recognition.stop();
    }
}

// ============================================================================
// TEXT-TO-SPEECH
// ============================================================================

function speak(text) {
    if (!window.speechSynthesis) {
        console.warn('[Voice] Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
}

// ============================================================================
// UI FEEDBACK
// ============================================================================

function updateVoiceIndicator(active) {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
        if (active) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
}

function showVoiceTranscript(text) {
    const indicator = document.getElementById('voiceIndicator');
    if (!indicator) return;
    
    // Show transcript temporarily
    const transcriptEl = document.createElement('div');
    transcriptEl.className = 'voice-transcript';
    transcriptEl.textContent = text;
    transcriptEl.style.cssText = `
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 240, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 240, 255, 0.3);
        padding: 8px 16px;
        border-radius: 20px;
        white-space: nowrap;
        font-size: 12px;
        color: #00f0ff;
        animation: slideUp 0.3s ease;
    `;
    
    indicator.appendChild(transcriptEl);
    
    setTimeout(() => {
        transcriptEl.style.opacity = '0';
        setTimeout(() => transcriptEl.remove(), 300);
    }, 2000);
}

// ============================================================================
// PLAYER ACTIONS (Voice)
// ============================================================================

async function healPlayer(playerId) {
    try {
        const response = await fetch('/api/admin/heal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ playerId })
        });
        
        if (response.ok) {
            showNotification(`Healed player ${playerId}`, 'success');
        }
    } catch (error) {
        console.error('[Heal] Error:', error);
    }
}

async function teleportToPlayer(playerId) {
    try {
        const response = await fetch('/api/admin/teleport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ targetId: playerId })
        });
        
        if (response.ok) {
            showNotification(`Teleported to player ${playerId}`, 'success');
        }
    } catch (error) {
        console.error('[Teleport] Error:', error);
    }
}

console.log('[Voice] Commands script loaded!');
