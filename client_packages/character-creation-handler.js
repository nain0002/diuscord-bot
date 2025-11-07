// Character Creation Handler
let creationBrowser = null;
let creationActive = false;
let creationCamera = null;

// Open character creation
mp.events.add('openCharacterCreation', () => {
    if (!creationBrowser) {
        creationBrowser = mp.browsers.new('package://CEF/character-creation.html');
    }
    
    creationActive = true;
    mp.gui.cursor.visible = true;
    mp.gui.chat.show(false);
    
    // Setup camera
    setupCreationCamera();
    
    // Freeze player
    mp.players.local.freezePosition(true);
});

// Setup camera for character preview
function setupCreationCamera() {
    const player = mp.players.local;
    const pos = player.position;
    
    // Create camera in front of player
    creationCamera = mp.cameras.new('default', new mp.Vector3(pos.x, pos.y + 2, pos.z + 0.5), new mp.Vector3(0, 0, 0), 50);
    creationCamera.pointAtCoord(pos.x, pos.y, pos.z + 0.5);
    creationCamera.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
}

// Handle character creation step changes
mp.events.add('characterCreationStep', (step, data) => {
    // Update preview based on step
    console.log(`[Character Creation] Step: ${step}`);
});

// Handle gender selection
mp.events.add('characterCreationGender', (gender) => {
    const player = mp.players.local;
    const isMale = gender === 'male';
    
    // Change player model
    const modelHash = mp.game.joaat(isMale ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
    mp.game.streaming.requestModel(modelHash);
    
    let attempts = 0;
    const checkModel = setInterval(() => {
        attempts++;
        if (mp.game.streaming.hasModelLoaded(modelHash) || attempts > 50) {
            clearInterval(checkModel);
            if (mp.game.streaming.hasModelLoaded(modelHash)) {
                player.model = modelHash;
            }
        }
    }, 100);
});

// Handle preset changes
mp.events.add('characterCreationPreset', (type, value) => {
    const player = mp.players.local;
    
    if (type === 'face') {
        // Set head blend
        player.setHeadBlendData(value, value, 0, value, value, 0, 0.5, 0.5, 0, false);
    } else if (type === 'hair') {
        // Set hair style
        player.setComponentVariation(2, value, 0, 2);
    }
});

// Handle slider changes (face features)
mp.events.add('characterCreationSlider', (name, value) => {
    const player = mp.players.local;
    const normalizedValue = value / 10.0; // Convert -10 to 10 range to -1 to 1
    
    const featureMap = {
        'noseWidth': 0,
        'noseLength': 1,
        'jawWidth': 4,
        'lipThickness': 6
    };
    
    if (featureMap[name] !== undefined) {
        player.setFaceFeature(featureMap[name], normalizedValue);
    }
});

// Handle color changes
mp.events.add('characterCreationColor', (type, value) => {
    const player = mp.players.local;
    
    if (type === 'hair') {
        player.setHairColor(value, value);
    } else if (type === 'eyes') {
        player.setEyeColor(value);
    }
});

// Finish character creation
mp.events.add('finishCharacterCreation', (dataJson) => {
    const data = JSON.parse(dataJson);
    
    // Send to server
    mp.events.callRemote('saveCharacterCreation', dataJson);
    
    // Close creation
    closeCharacterCreation();
});

// Close character creation
function closeCharacterCreation() {
    creationActive = false;
    mp.gui.cursor.visible = false;
    mp.gui.chat.show(true);
    
    // Destroy camera
    if (creationCamera) {
        creationCamera.setActive(false);
        mp.game.cam.renderScriptCams(false, false, 0, true, false);
        creationCamera.destroy();
        creationCamera = null;
    }
    
    // Unfreeze player
    mp.players.local.freezePosition(false);
    
    // Close browser
    if (creationBrowser) {
        creationBrowser.destroy();
        creationBrowser = null;
    }
}

// Allow camera rotation with mouse
let lastMouseX = 0;
let cameraRotation = 0;

mp.events.add('render', () => {
    if (creationActive && creationCamera) {
        const player = mp.players.local;
        const pos = player.position;
        
        // Smooth camera rotation
        const radius = 2.0;
        const camX = pos.x + Math.cos(cameraRotation) * radius;
        const camY = pos.y + Math.sin(cameraRotation) * radius;
        const camZ = pos.z + 0.5;
        
        creationCamera.setCoord(camX, camY, camZ);
        creationCamera.pointAtCoord(pos.x, pos.y, pos.z + 0.5);
    }
});

// Mouse movement for camera rotation
mp.keys.bind(0x01, true, () => { // Left mouse button
    if (creationActive) {
        const currentX = mp.game.controls.getDisabledControlNormal(1, 1);
        const deltaX = currentX - lastMouseX;
        cameraRotation += deltaX * 2.0;
        lastMouseX = currentX;
    }
});
