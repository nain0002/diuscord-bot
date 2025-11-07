/**
 * RAGE:MP Elite HUD - Client-Side UI Logic
 * Version: 3.0.0
 * Glassmorphism Design with Motion Effects
 */

// ============================================
// HUD STATE MANAGEMENT
// ============================================

const HUDState = {
    player: {
        name: 'Player',
        level: 1,
        health: 100,
        armor: 0,
        hunger: 100,
        thirst: 100,
        xp: 0,
        xpMax: 1000,
        cash: 0,
        bank: 0
    },
    weapon: {
        name: 'Unarmed',
        ammo: 0,
        ammoMax: 0,
        icon: '✊'
    },
    vehicle: {
        inVehicle: false,
        speed: 0,
        fuel: 100,
        engine: false,
        lights: false,
        locked: false
    },
    location: {
        street: 'Unknown Street',
        zone: 'Los Santos',
        heading: 0
    },
    time: {
        game: '12:00',
        real: '00:00:00',
        date: 'Jan 1, 2025'
    },
    weather: {
        type: 'Clear',
        icon: '☀️'
    },
    mission: {
        active: false,
        title: 'No Active Mission',
        objectives: [],
        distance: 0
    },
    voice: {
        active: false
    },
    settings: {
        showPlayerStatus: true,
        showMoney: true,
        showLocation: true,
        showWeapon: true,
        showVehicle: true,
        showCompass: true,
        showMission: true,
        showWeatherEffects: true,
        theme: 'blue'
    }
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const Elements = {};

function initElements() {
    try {
        Elements.playerName = document.getElementById('playerName');
        Elements.playerLevel = document.getElementById('playerLevel');
        Elements.healthFill = document.getElementById('healthFill');
        Elements.healthText = document.getElementById('healthText');
        Elements.armorFill = document.getElementById('armorFill');
        Elements.armorText = document.getElementById('armorText');
        Elements.hungerFill = document.getElementById('hungerFill');
        Elements.hungerText = document.getElementById('hungerText');
        Elements.thirstFill = document.getElementById('thirstFill');
        Elements.thirstText = document.getElementById('thirstText');
        Elements.xpFill = document.getElementById('xpFill');
        Elements.xpText = document.getElementById('xpText');
        Elements.cashValue = document.getElementById('cashValue');
        Elements.bankValue = document.getElementById('bankValue');
        Elements.gameTime = document.getElementById('gameTime');
        Elements.realTime = document.getElementById('realTime');
        Elements.dateDisplay = document.getElementById('dateDisplay');
        Elements.weatherIcon = document.getElementById('weatherIcon');
        Elements.weatherText = document.getElementById('weatherText');
        Elements.streetName = document.getElementById('streetName');
        Elements.zoneName = document.getElementById('zoneName');
        Elements.compassNeedle = document.getElementById('compassNeedle');
        Elements.weaponName = document.getElementById('weaponName');
        Elements.ammoCurrent = document.getElementById('ammoCurrent');
        Elements.ammoReserve = document.getElementById('ammoReserve');
        Elements.weaponIcon = document.getElementById('weaponIcon');
        Elements.weaponPanel = document.getElementById('weaponPanel');
        Elements.vehiclePanel = document.getElementById('vehiclePanel');
        Elements.speedValue = document.getElementById('speedValue');
        Elements.fuelFill = document.getElementById('fuelFill');
        Elements.fuelText = document.getElementById('fuelText');
        Elements.engineIndicator = document.getElementById('engineIndicator');
        Elements.lightsIndicator = document.getElementById('lightsIndicator');
        Elements.lockIndicator = document.getElementById('lockIndicator');
        Elements.missionPanel = document.getElementById('missionPanel');
        Elements.missionTitle = document.getElementById('missionTitle');
        Elements.missionObjectives = document.getElementById('missionObjectives');
        Elements.missionDistance = document.getElementById('missionDistance');
        Elements.voiceIndicator = document.getElementById('voiceIndicator');
        Elements.damageOverlay = document.getElementById('damageOverlay');
        Elements.notificationContainer = document.getElementById('notificationContainer');
        Elements.hudContainer = document.getElementById('hudContainer');
        Elements.particlesContainer = document.getElementById('particlesContainer');
        
        // Settings
        Elements.hudSettingsBtn = document.getElementById('hudSettingsBtn');
        Elements.hudSettingsMenu = document.getElementById('hudSettingsMenu');
        Elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        Elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        // Sections
        Elements.playerStatus = document.getElementById('playerStatus');
        Elements.moneyTime = document.getElementById('moneyTime');
        Elements.locationMission = document.getElementById('locationMission');
        Elements.weaponVehicle = document.getElementById('weaponVehicle');
        
        console.log('[Elite HUD] All elements initialized successfully');
    } catch (error) {
        console.error('[Elite HUD] Error initializing elements:', error);
    }
}

// ============================================
// UPDATE FUNCTIONS
// ============================================

function updatePlayerInfo(data) {
    if (data.name !== undefined) {
        HUDState.player.name = data.name;
        Elements.playerName.textContent = data.name;
    }
    if (data.level !== undefined) {
        HUDState.player.level = data.level;
        Elements.playerLevel.textContent = `Lv. ${data.level}`;
    }
}

function updateHealth(value) {
    value = Math.max(0, Math.min(100, value));
    
    // Damage flash is now triggered from client before updating state
    
    HUDState.player.health = value;
    
    if (!Elements.healthFill || !Elements.healthText) return;
    
    Elements.healthFill.style.width = value + '%';
    Elements.healthText.textContent = Math.round(value);
    
    // Critical health warning
    if (value <= 25) {
        Elements.healthFill.classList.add('critical');
    } else {
        Elements.healthFill.classList.remove('critical');
    }
}

function updateArmor(value) {
    value = Math.max(0, Math.min(100, value));
    HUDState.player.armor = value;
    
    Elements.armorFill.style.width = value + '%';
    Elements.armorText.textContent = Math.round(value);
}

function updateHunger(value) {
    value = Math.max(0, Math.min(100, value));
    HUDState.player.hunger = value;
    
    Elements.hungerFill.style.width = value + '%';
    Elements.hungerText.textContent = Math.round(value);
    
    if (value <= 20) {
        showNotification('Low Hunger!', 'You need to eat something', 'warning', '🍔');
    }
}

function updateThirst(value) {
    value = Math.max(0, Math.min(100, value));
    HUDState.player.thirst = value;
    
    Elements.thirstFill.style.width = value + '%';
    Elements.thirstText.textContent = Math.round(value);
    
    if (value <= 20) {
        showNotification('Low Thirst!', 'You need to drink something', 'warning', '💧');
    }
}

function updateXP(current, max) {
    HUDState.player.xp = current;
    HUDState.player.xpMax = max;
    
    if (!Elements.xpFill || !Elements.xpText) return;
    
    // Prevent division by zero
    const percentage = max > 0 ? (current / max) * 100 : 0;
    Elements.xpFill.style.width = Math.min(100, Math.max(0, percentage)) + '%';
    Elements.xpText.textContent = `XP: ${current} / ${max}`;
}

function updateMoney(cash, bank) {
    if (cash !== undefined) {
        HUDState.player.cash = cash;
        Elements.cashValue.textContent = formatMoney(cash);
    }
    if (bank !== undefined) {
        HUDState.player.bank = bank;
        Elements.bankValue.textContent = formatMoney(bank);
    }
}

function updateWeapon(name, ammo, ammoMax, icon) {
    HUDState.weapon.name = name || 'Unarmed';
    HUDState.weapon.ammo = ammo || 0;
    HUDState.weapon.ammoMax = ammoMax || 0;
    HUDState.weapon.icon = icon || '✊';
    
    Elements.weaponName.textContent = HUDState.weapon.name;
    Elements.ammoCurrent.textContent = HUDState.weapon.ammo;
    Elements.ammoReserve.textContent = HUDState.weapon.ammoMax;
    Elements.weaponIcon.textContent = HUDState.weapon.icon;
    
    // Weapon switch animation
    Elements.weaponPanel.style.animation = 'none';
    setTimeout(() => {
        Elements.weaponPanel.style.animation = 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
}

function updateVehicleStatus(inVehicle) {
    HUDState.vehicle.inVehicle = inVehicle;
    
    if (inVehicle) {
        Elements.weaponPanel.style.display = 'none';
        Elements.vehiclePanel.style.display = 'block';
    } else {
        Elements.weaponPanel.style.display = 'block';
        Elements.vehiclePanel.style.display = 'none';
    }
}

function updateVehicleData(speed, fuel, engine, lights, locked) {
    if (speed !== undefined) {
        HUDState.vehicle.speed = speed;
        Elements.speedValue.textContent = Math.round(speed);
    }
    
    if (fuel !== undefined) {
        HUDState.vehicle.fuel = fuel;
        Elements.fuelFill.style.width = fuel + '%';
        Elements.fuelText.textContent = Math.round(fuel) + '%';
        
        if (fuel <= 10) {
            showNotification('Low Fuel!', 'Find a gas station soon', 'warning', '⛽');
        }
    }
    
    if (engine !== undefined) {
        HUDState.vehicle.engine = engine;
        Elements.engineIndicator.classList.toggle('active', engine);
    }
    
    if (lights !== undefined) {
        HUDState.vehicle.lights = lights;
        Elements.lightsIndicator.classList.toggle('active', lights);
    }
    
    if (locked !== undefined) {
        HUDState.vehicle.locked = locked;
        Elements.lockIndicator.classList.toggle('active', locked);
    }
}

function updateLocation(street, zone, heading) {
    if (street !== undefined) {
        HUDState.location.street = street;
        Elements.streetName.textContent = street;
    }
    
    if (zone !== undefined) {
        HUDState.location.zone = zone;
        Elements.zoneName.textContent = zone;
    }
    
    if (heading !== undefined) {
        HUDState.location.heading = heading;
        Elements.compassNeedle.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
        
        // Update compass direction
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(heading / 45) % 8;
        document.querySelector('.compass-direction').textContent = directions[index];
    }
}

function updateTime(gameTime, realTime, date) {
    if (gameTime !== undefined) {
        HUDState.time.game = gameTime;
        Elements.gameTime.textContent = gameTime;
        
        // Apply night mode effect based on game time
        const hour = parseInt(gameTime.split(':')[0]);
        if (HUDState.settings.showWeatherEffects) {
            if (hour >= 20 || hour < 6) {
                document.body.classList.add('night-mode');
            } else {
                document.body.classList.remove('night-mode');
            }
        }
    }
    
    if (realTime !== undefined) {
        HUDState.time.real = realTime;
        Elements.realTime.textContent = realTime;
    }
    
    if (date !== undefined) {
        HUDState.time.date = date;
        Elements.dateDisplay.textContent = date;
    }
}

function updateWeather(type, icon) {
    if (type !== undefined) {
        HUDState.weather.type = type;
        Elements.weatherText.textContent = type;
    }
    
    if (icon !== undefined) {
        HUDState.weather.icon = icon;
        Elements.weatherIcon.textContent = icon;
    }
}

function updateMission(active, title, objectives, distance) {
    HUDState.mission.active = active;
    
    if (active) {
        Elements.missionPanel.classList.add('active');
        
        if (title) {
            HUDState.mission.title = title;
            Elements.missionTitle.textContent = title;
        }
        
        if (objectives) {
            HUDState.mission.objectives = objectives;
            Elements.missionObjectives.innerHTML = objectives.map(obj => 
                `<div>• ${obj}</div>`
            ).join('');
        }
        
        if (distance !== undefined) {
            HUDState.mission.distance = distance;
            Elements.missionDistance.textContent = `Distance: ${Math.round(distance)}m`;
        }
    } else {
        Elements.missionPanel.classList.remove('active');
    }
}

function updateVoiceStatus(active) {
    HUDState.voice.active = active;
    Elements.voiceIndicator.classList.toggle('active', active);
}

// ============================================
// NOTIFICATIONS SYSTEM
// ============================================

function showNotification(title, message, type = 'info', icon = 'ℹ️') {
    if (!Elements.notificationContainer) return;
    
    // Limit to 5 notifications max
    const notifications = Elements.notificationContainer.children;
    if (notifications.length >= 5) {
        // Remove oldest notification
        notifications[0].remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Escape HTML to prevent XSS
    const safeTitle = String(title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeMessage = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeIcon = String(icon).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    notification.innerHTML = `
        <div class="notification-icon">${safeIcon}</div>
        <div class="notification-content">
            <div class="notification-title">${safeTitle}</div>
            <div class="notification-message">${safeMessage}</div>
        </div>
    `;
    
    Elements.notificationContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fadeOut');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 5000);
}

// ============================================
// VISUAL EFFECTS
// ============================================

function triggerDamageFlash() {
    if (!Elements.damageOverlay) return;
    
    Elements.damageOverlay.classList.add('active');
    setTimeout(() => {
        if (Elements.damageOverlay) {
            Elements.damageOverlay.classList.remove('active');
        }
    }, 500);
}

function createParticles() {
    if (!Elements.particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        Elements.particlesContainer.appendChild(particle);
    }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function openSettings() {
    Elements.hudSettingsMenu.style.display = 'block';
    loadSettings();
}

function closeSettings() {
    Elements.hudSettingsMenu.style.display = 'none';
}

function loadSettings() {
    document.getElementById('togglePlayerStatus').checked = HUDState.settings.showPlayerStatus;
    document.getElementById('toggleMoney').checked = HUDState.settings.showMoney;
    document.getElementById('toggleLocation').checked = HUDState.settings.showLocation;
    document.getElementById('toggleWeapon').checked = HUDState.settings.showWeapon;
    document.getElementById('toggleVehicle').checked = HUDState.settings.showVehicle;
    document.getElementById('toggleCompass').checked = HUDState.settings.showCompass;
    document.getElementById('toggleMission').checked = HUDState.settings.showMission;
    document.getElementById('toggleWeatherEffects').checked = HUDState.settings.showWeatherEffects;
    document.getElementById('themeSelect').value = HUDState.settings.theme;
}

function saveSettings() {
    HUDState.settings.showPlayerStatus = document.getElementById('togglePlayerStatus').checked;
    HUDState.settings.showMoney = document.getElementById('toggleMoney').checked;
    HUDState.settings.showLocation = document.getElementById('toggleLocation').checked;
    HUDState.settings.showWeapon = document.getElementById('toggleWeapon').checked;
    HUDState.settings.showVehicle = document.getElementById('toggleVehicle').checked;
    HUDState.settings.showCompass = document.getElementById('toggleCompass').checked;
    HUDState.settings.showMission = document.getElementById('toggleMission').checked;
    HUDState.settings.showWeatherEffects = document.getElementById('toggleWeatherEffects').checked;
    HUDState.settings.theme = document.getElementById('themeSelect').value;
    
    applySettings();
    
    // Send settings to client handler
    if (typeof mp !== 'undefined') {
        mp.trigger('saveHUDSettings', JSON.stringify(HUDState.settings));
    }
    
    showNotification('Settings Saved', 'Your HUD preferences have been saved', 'success', '✅');
    closeSettings();
}

function applySettings() {
    // Toggle sections
    Elements.playerStatus.classList.toggle('hidden', !HUDState.settings.showPlayerStatus);
    Elements.moneyTime.classList.toggle('hidden', !HUDState.settings.showMoney);
    Elements.locationMission.classList.toggle('hidden', !HUDState.settings.showLocation);
    Elements.weaponVehicle.classList.toggle('hidden', !HUDState.settings.showWeapon && !HUDState.settings.showVehicle);
    
    // Apply theme
    document.body.className = `theme-${HUDState.settings.theme}`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatMoney(amount) {
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateRealTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    updateTime(undefined, `${hours}:${minutes}:${seconds}`, undefined);
}

// ============================================
// RAGE:MP EVENT HANDLERS
// ============================================

if (typeof mp !== 'undefined') {
    // Update handlers
    mp.events.add('updateHUDPlayer', (data) => {
        try {
            const parsed = JSON.parse(data);
            if (!parsed || typeof parsed !== 'object') return;
            
            updatePlayerInfo(parsed);
            if (parsed.health !== undefined) updateHealth(parsed.health);
            if (parsed.armor !== undefined) updateArmor(parsed.armor);
            if (parsed.hunger !== undefined) updateHunger(parsed.hunger);
            if (parsed.thirst !== undefined) updateThirst(parsed.thirst);
            if (parsed.xp !== undefined) updateXP(parsed.xp, parsed.xpMax || 1000);
            if (parsed.cash !== undefined || parsed.bank !== undefined) {
                updateMoney(parsed.cash, parsed.bank);
            }
        } catch (error) {
            console.error('[Elite HUD] Error parsing player data:', error);
        }
    });
    
    mp.events.add('updateHUDWeapon', (name, ammo, ammoMax, icon) => {
        updateWeapon(name, ammo, ammoMax, icon);
    });
    
    mp.events.add('updateHUDVehicle', (inVehicle) => {
        updateVehicleStatus(inVehicle);
    });
    
    mp.events.add('updateHUDVehicleData', (speed, fuel, engine, lights, locked) => {
        updateVehicleData(speed, fuel, engine, lights, locked);
    });
    
    mp.events.add('updateHUDLocation', (street, zone, heading) => {
        updateLocation(street, zone, heading);
    });
    
    mp.events.add('updateHUDTime', (gameTime, date) => {
        updateTime(gameTime, undefined, date);
    });
    
    mp.events.add('updateHUDWeather', (type, icon) => {
        updateWeather(type, icon);
    });
    
    mp.events.add('updateHUDMission', (active, title, objectives, distance) => {
        try {
            const parsedObjectives = objectives ? JSON.parse(objectives) : [];
            updateMission(active, title, parsedObjectives, distance);
        } catch (error) {
            console.error('[Elite HUD] Error parsing mission objectives:', error);
            updateMission(active, title, [], distance);
        }
    });
    
    mp.events.add('updateHUDVoice', (active) => {
        updateVoiceStatus(active);
    });
    
    mp.events.add('showHUDNotification', (title, message, type, icon) => {
        showNotification(title, message, type, icon);
    });
    
    mp.events.add('triggerHUDDamage', () => {
        triggerDamageFlash();
    });
    
    mp.events.add('loadHUDSettings', (settingsJson) => {
        try {
            const settings = JSON.parse(settingsJson);
            if (settings && typeof settings === 'object') {
                HUDState.settings = { ...HUDState.settings, ...settings };
                applySettings();
            }
        } catch (error) {
            console.error('[Elite HUD] Error loading settings:', error);
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initElements();
    createParticles();
    applySettings();
    
    // Update real time every second
    setInterval(updateRealTime, 1000);
    
    // Settings button event
    Elements.hudSettingsBtn.addEventListener('click', openSettings);
    Elements.closeSettingsBtn.addEventListener('click', closeSettings);
    Elements.saveSettingsBtn.addEventListener('click', saveSettings);
    
    console.log('[Elite HUD] Initialized successfully');
});

// Export functions for external use
window.HUD = {
    updatePlayerInfo,
    updateHealth,
    updateArmor,
    updateHunger,
    updateThirst,
    updateXP,
    updateMoney,
    updateWeapon,
    updateVehicleStatus,
    updateVehicleData,
    updateLocation,
    updateTime,
    updateWeather,
    updateMission,
    updateVoiceStatus,
    showNotification,
    triggerDamageFlash
};
