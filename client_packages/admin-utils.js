// Admin Utilities - Client-side functions for admin commands

// Freeze/unfreeze player
mp.events.add('setPlayerFrozen', (frozen) => {
    try {
        const player = mp.players.local;
        player.freezePosition(frozen);
        
        if (frozen) {
            mp.game.controls.disableAllControlActions(0);
            mp.events.call('showNotification', 'You have been frozen by an admin', 'warning');
        } else {
            mp.game.controls.enableAllControlActions(0);
            mp.events.call('showNotification', 'You have been unfrozen', 'success');
        }
    } catch (error) {
        console.error('[Admin Utils] Error freezing player:', error);
    }
});

// Apply character appearance
mp.events.add('applyCharacterAppearance', (appearanceJson) => {
    try {
        const appearance = JSON.parse(appearanceJson);
        const player = mp.players.local;
        
        // Set head blend
        player.setHeadBlendData(
            appearance.face_preset || 0,
            appearance.face_preset || 0,
            0,
            appearance.face_preset || 0,
            appearance.face_preset || 0,
            0,
            0.5,
            0.5,
            0,
            false
        );
        
        // Set face features
        const featureMap = {
            nose_width: 0,
            nose_length: 1,
            jaw_width: 4,
            lip_thickness: 6
        };
        
        Object.keys(featureMap).forEach(key => {
            const value = (appearance[key] || 0) / 10.0; // Normalize -10 to 10 -> -1 to 1
            player.setFaceFeature(featureMap[key], value);
        });
        
        // Set hair
        player.setComponentVariation(2, appearance.hair_style || 0, 0, 2);
        player.setHairColor(appearance.hair_color || 0, appearance.hair_color || 0);
        
        // Set eye color
        player.setEyeColor(appearance.eye_color || 0);
        
        console.log('[Admin Utils] Applied character appearance');
    } catch (error) {
        console.error('[Admin Utils] Error applying appearance:', error);
    }
});

// Teleport player to coordinates
mp.events.add('teleportToCoords', (x, y, z) => {
    try {
        const player = mp.players.local;
        player.position = new mp.Vector3(x, y, z);
        mp.events.call('showNotification', 'Teleported!', 'success');
    } catch (error) {
        console.error('[Admin Utils] Error teleporting:', error);
    }
});

console.log('[Admin Utils] Module loaded');
