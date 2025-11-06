/**
 * Character Module
 * Handles character creation and management
 */

const database = require('./database');
const playerModule = require('./player');

// Create character event
mp.events.add('server:createCharacter', async (player, firstName, lastName, age, gender, skinData) => {
    try {
        const data = playerModule.getPlayerData(player);

        if (!data || !data.userId) {
            player.call('client:characterResponse', ['error', 'You must be logged in!']);
            return;
        }

        // Validate input
        if (!firstName || !lastName || !age || !gender) {
            player.call('client:characterResponse', ['error', 'All fields are required!']);
            return;
        }

        if (firstName.length < 2 || lastName.length < 2) {
            player.call('client:characterResponse', ['error', 'Names must be at least 2 characters!']);
            return;
        }

        if (age < 18 || age > 100) {
            player.call('client:characterResponse', ['error', 'Age must be between 18 and 100!']);
            return;
        }

        if (!['male', 'female'].includes(gender.toLowerCase())) {
            player.call('client:characterResponse', ['error', 'Invalid gender!']);
            return;
        }

        // Check if character name already exists
        const fullName = `${firstName} ${lastName}`;
        const existing = await database.query(
            'SELECT id FROM characters WHERE char_name = ? AND char_surname = ?',
            [firstName, lastName]
        );

        if (existing.length > 0) {
            player.call('client:characterResponse', ['error', 'Character name already exists!']);
            return;
        }

        // Create character
        const result = await database.query(
            `INSERT INTO characters 
            (user_id, char_name, char_surname, age, gender, skin_data, money, bank_balance) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.userId, firstName, lastName, age, gender.toLowerCase(), 
             skinData || '{}', 5000, 10000]
        );

        const characterId = result.insertId;

        // Create bank account for character
        const accountNumber = generateAccountNumber();
        const pin = '1234'; // Default PIN
        await database.query(
            'INSERT INTO bank_accounts (character_id, account_number, balance, pin) VALUES (?, ?, ?, ?)',
            [characterId, accountNumber, 10000, pin]
        );

        console.log(`[Character] New character created: ${fullName} (ID: ${characterId})`);
        
        // Load the character
        loadCharacter(player, characterId);

    } catch (error) {
        console.error('[Character] Error creating character:', error);
        player.call('client:characterResponse', ['error', 'Character creation failed!']);
    }
});

// Select character event
mp.events.add('server:selectCharacter', async (player, characterId) => {
    try {
        const data = playerModule.getPlayerData(player);

        if (!data || !data.userId) {
            return;
        }

        // Verify character belongs to user
        const characters = await database.query(
            'SELECT * FROM characters WHERE id = ? AND user_id = ?',
            [characterId, data.userId]
        );

        if (characters.length === 0) {
            player.outputChatBox('!{#FF0000}Character not found!');
            return;
        }

        loadCharacter(player, characterId);

    } catch (error) {
        console.error('[Character] Error selecting character:', error);
    }
});

// Load character
async function loadCharacter(player, characterId) {
    try {
        const characters = await database.query(
            'SELECT * FROM characters WHERE id = ?',
            [characterId]
        );

        if (characters.length === 0) return;

        const character = characters[0];

        // Set player data
        playerModule.setPlayerData(player, 'characterId', characterId);
        playerModule.setPlayerData(player, 'characterData', {
            name: `${character.char_name} ${character.char_surname}`,
            age: character.age,
            gender: character.gender,
            money: character.money,
            bankBalance: character.bank_balance,
            job: character.job,
            jobRank: character.job_rank
        });

        // Set player position
        player.dimension = 0; // Main dimension
        player.position = new mp.Vector3(
            character.position_x || -1037.8,
            character.position_y || -2738.5,
            character.position_z || 13.8
        );
        player.heading = character.heading || 0;
        player.health = character.health || 100;
        player.armour = character.armor || 0;

        // Apply character skin
        if (character.skin_data) {
            try {
                const skinData = JSON.parse(character.skin_data);
                if (skinData.model) {
                    player.model = mp.joaat(skinData.model);
                }
            } catch (e) {
                // Use default model based on gender
                player.model = character.gender === 'male' ? mp.joaat('mp_m_freemode_01') : mp.joaat('mp_f_freemode_01');
            }
        }

        player.name = `${character.char_name}_${character.char_surname}`;
        player.frozen = false;

        // Send character data to client
        player.call('client:characterLoaded', [
            JSON.stringify({
                id: characterId,
                name: `${character.char_name} ${character.char_surname}`,
                money: character.money,
                bankBalance: character.bank_balance,
                job: character.job,
                jobRank: character.job_rank
            })
        ]);

        player.outputChatBox(`!{#00FF00}Welcome back, ${character.char_name} ${character.char_surname}!`);
        console.log(`[Character] ${character.char_name} ${character.char_surname} spawned (ID: ${characterId})`);

    } catch (error) {
        console.error('[Character] Error loading character:', error);
    }
}

// Delete character event
mp.events.add('server:deleteCharacter', async (player, characterId) => {
    try {
        const data = playerModule.getPlayerData(player);

        if (!data || !data.userId) return;

        // Verify ownership
        const characters = await database.query(
            'SELECT id FROM characters WHERE id = ? AND user_id = ?',
            [characterId, data.userId]
        );

        if (characters.length === 0) {
            player.outputChatBox('!{#FF0000}Character not found!');
            return;
        }

        // Delete character
        await database.query('DELETE FROM characters WHERE id = ?', [characterId]);
        
        player.outputChatBox('!{#00FF00}Character deleted successfully!');
        console.log(`[Character] Character ${characterId} deleted by user ${data.userId}`);

        // Show character selection again
        const remainingChars = await database.query(
            'SELECT * FROM characters WHERE user_id = ?',
            [data.userId]
        );

        if (remainingChars.length > 0) {
            player.call('client:showCharacterSelection', [JSON.stringify(remainingChars)]);
        } else {
            player.call('client:showCharacterCreator');
        }

    } catch (error) {
        console.error('[Character] Error deleting character:', error);
    }
});

// Generate random account number
function generateAccountNumber() {
    return 'ACC' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

module.exports = {
    loadCharacter
};
