// Character Creation Module
const db = require('./database');

// Save character creation data
mp.events.add('saveCharacterCreation', async (player, dataJson) => {
    try {
        const data = JSON.parse(dataJson);
        const userId = player.getVariable('user_id');
        
        if (!userId) {
            player.outputChatBox('[ERROR] User ID not found');
            return;
        }
        
        // Calculate age from DOB
        const dob = new Date(data.dob);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        // Insert character into database
        const [result] = await db.execute(
            `INSERT INTO characters 
            (user_id, first_name, last_name, age, gender, money, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [userId, data.firstName, data.lastName, age, data.gender, 5000]
        );
        
        const characterId = result.insertId;
        
        // Create bank account for character
        await db.execute(
            'INSERT INTO bank_accounts (character_id, account_number, balance) VALUES (?, ?, ?)',
            [characterId, generateAccountNumber(), 10000]
        );
        
        // Set player variables
        player.setVariable('characterId', characterId);
        player.setVariable('characterName', `${data.firstName} ${data.lastName}`);
        player.setVariable('money', 5000);
        player.setVariable('level', 1);
        
        // Save appearance data (for future use)
        await db.execute(
            `INSERT INTO character_appearance 
            (character_id, face_preset, nose_width, nose_length, jaw_width, lip_thickness, 
            hair_style, hair_color, eye_color) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                characterId,
                data.facePreset || 0,
                data.noseWidth || 0,
                data.noseLength || 0,
                data.jawWidth || 0,
                data.lipThickness || 0,
                data.hairStyle || 0,
                data.hairColor || 0,
                data.eyeColor || 0
            ]
        );
        
        // Spawn player
        const spawnPos = new mp.Vector3(0, 0, 71); // Default spawn location
        player.spawn(spawnPos);
        player.dimension = 0;
        
        // Set player appearance
        const modelHash = data.gender === 'male' ? mp.joaat('mp_m_freemode_01') : mp.joaat('mp_f_freemode_01');
        player.model = modelHash;
        
        // Notify client
        player.call('characterCreationComplete');
        
        console.log(`[Character Creation] ${data.firstName} ${data.lastName} created for user ${userId}`);
        
        player.outputChatBox('[SUCCESS] Character created! Welcome to the server!');
        
        // Give starter items
        await giveStarterItems(characterId);
        
    } catch (error) {
        console.error('[Character Creation] Error:', error);
        player.outputChatBox('[ERROR] Failed to create character. Please try again.');
    }
});

// Helper: Generate bank account number
function generateAccountNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Helper: Give starter items to new character
async function giveStarterItems(characterId) {
    try {
        const starterItems = [
            { name: 'Phone', category: 'misc', quantity: 1, weight: 0.2 },
            { name: 'Water Bottle', category: 'food', quantity: 3, weight: 0.5 },
            { name: 'Bread', category: 'food', quantity: 2, weight: 0.3 }
        ];
        
        for (const item of starterItems) {
            await db.execute(
                'INSERT INTO inventory (character_id, item_name, category, quantity, weight) VALUES (?, ?, ?, ?, ?)',
                [characterId, item.name, item.category, item.quantity, item.weight]
            );
        }
        
        console.log(`[Character Creation] Starter items given to character ${characterId}`);
    } catch (error) {
        console.error('[Character Creation] Error giving starter items:', error);
    }
}

// Load character appearance on spawn
mp.events.add('loadCharacterAppearance', async (player) => {
    try {
        const characterId = player.getVariable('characterId');
        if (!characterId) return;
        
        const [appearance] = await db.query(
            'SELECT * FROM character_appearance WHERE character_id = ?',
            [characterId]
        );
        
        if (appearance && appearance[0]) {
            const app = appearance[0];
            
            // Apply appearance to player
            // This would need to be done client-side
            player.call('applyCharacterAppearance', [JSON.stringify(app)]);
        }
    } catch (error) {
        console.error('[Character Creation] Error loading appearance:', error);
    }
});

module.exports = {};
