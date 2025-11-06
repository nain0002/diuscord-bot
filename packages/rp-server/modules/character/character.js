// Character Management System
const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class CharacterManager {
    // Get player's characters
    async getCharacters(playerId) {
        try {
            const characters = await db.query(
                `SELECT c.id, c.first_name, c.last_name, c.age, c.gender, c.money, 
                 c.bank_balance, c.job, c.job_rank, c.playtime, c.last_played
                 FROM characters c WHERE c.player_id = ?`,
                [playerId]
            );
            return characters;
        } catch (error) {
            console.error('[Character] Error fetching characters:', error);
            return [];
        }
    }

    // Create new character
    async createCharacter(playerId, characterData) {
        try {
            const { firstName, lastName, age, gender } = characterData;

            // Validate input
            if (!firstName || !lastName) {
                return { success: false, message: 'First and last name are required.' };
            }

            if (age < 18 || age > 100) {
                return { success: false, message: 'Age must be between 18 and 100.' };
            }

            // Check character limit (max 3 characters per account)
            const existingChars = await this.getCharacters(playerId);
            if (existingChars.length >= 3) {
                return { success: false, message: 'Maximum 3 characters per account.' };
            }

            // Generate phone number
            let phoneNumber = helpers.generatePhoneNumber();
            let phoneExists = true;

            while (phoneExists) {
                const result = await db.query(
                    'SELECT id FROM characters WHERE phone_number = ?',
                    [phoneNumber]
                );
                if (result.length === 0) {
                    phoneExists = false;
                } else {
                    phoneNumber = helpers.generatePhoneNumber();
                }
            }

            // Insert character
            const result = await db.query(
                `INSERT INTO characters (player_id, first_name, last_name, age, gender, phone_number)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [playerId, firstName, lastName, age, gender, phoneNumber]
            );

            const characterId = result.insertId;

            // Create bank account
            const accountNumber = helpers.generateAccountNumber();
            await db.query(
                'INSERT INTO bank_accounts (character_id, account_number) VALUES (?, ?)',
                [characterId, accountNumber]
            );

            console.log(`[Character] New character created: ${firstName} ${lastName} (ID: ${characterId})`);

            return { 
                success: true, 
                message: 'Character created successfully!',
                characterId: characterId
            };

        } catch (error) {
            console.error('[Character] Error creating character:', error);
            return { success: false, message: 'Failed to create character.' };
        }
    }

    // Save character appearance
    async saveAppearance(characterId, appearance) {
        try {
            // Check if appearance exists
            const existing = await db.query(
                'SELECT id FROM character_appearance WHERE character_id = ?',
                [characterId]
            );

            if (existing.length > 0) {
                // Update existing
                await db.query(
                    `UPDATE character_appearance SET 
                    gender = ?, mother = ?, father = ?, similarity = ?, skin_similarity = ?,
                    eyecolor = ?, haircolor = ?, highlightcolor = ?, hair = ?, eyebrows = ?,
                    eyebrows_color = ?, beard = ?, beard_color = ?, nose_width = ?, nose_height = ?,
                    nose_length = ?, nose_bridge = ?, nose_tip = ?, nose_shift = ?, brow_height = ?,
                    brow_width = ?, cheekbone_height = ?, cheekbone_width = ?, cheeks_width = ?,
                    eyes = ?, lips = ?, jaw_width = ?, jaw_height = ?, chin_length = ?,
                    chin_position = ?, chin_width = ?, chin_shape = ?, neck_width = ?
                    WHERE character_id = ?`,
                    [
                        appearance.gender, appearance.mother, appearance.father, 
                        appearance.similarity, appearance.skinSimilarity, appearance.eyeColor,
                        appearance.hairColor, appearance.highlightColor, appearance.hair,
                        appearance.eyebrows, appearance.eyebrowsColor, appearance.beard,
                        appearance.beardColor, appearance.noseWidth, appearance.noseHeight,
                        appearance.noseLength, appearance.noseBridge, appearance.noseTip,
                        appearance.noseShift, appearance.browHeight, appearance.browWidth,
                        appearance.cheekboneHeight, appearance.cheekboneWidth, appearance.cheeksWidth,
                        appearance.eyes, appearance.lips, appearance.jawWidth, appearance.jawHeight,
                        appearance.chinLength, appearance.chinPosition, appearance.chinWidth,
                        appearance.chinShape, appearance.neckWidth, characterId
                    ]
                );
            } else {
                // Insert new
                await db.query(
                    `INSERT INTO character_appearance 
                    (character_id, gender, mother, father, similarity, skin_similarity,
                    eyecolor, haircolor, highlightcolor, hair, eyebrows, eyebrows_color,
                    beard, beard_color, nose_width, nose_height, nose_length, nose_bridge,
                    nose_tip, nose_shift, brow_height, brow_width, cheekbone_height,
                    cheekbone_width, cheeks_width, eyes, lips, jaw_width, jaw_height,
                    chin_length, chin_position, chin_width, chin_shape, neck_width)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        characterId, appearance.gender, appearance.mother, appearance.father,
                        appearance.similarity, appearance.skinSimilarity, appearance.eyeColor,
                        appearance.hairColor, appearance.highlightColor, appearance.hair,
                        appearance.eyebrows, appearance.eyebrowsColor, appearance.beard,
                        appearance.beardColor, appearance.noseWidth, appearance.noseHeight,
                        appearance.noseLength, appearance.noseBridge, appearance.noseTip,
                        appearance.noseShift, appearance.browHeight, appearance.browWidth,
                        appearance.cheekboneHeight, appearance.cheekboneWidth, appearance.cheeksWidth,
                        appearance.eyes, appearance.lips, appearance.jawWidth, appearance.jawHeight,
                        appearance.chinLength, appearance.chinPosition, appearance.chinWidth,
                        appearance.chinShape, appearance.neckWidth
                    ]
                );
            }

            return { success: true, message: 'Appearance saved!' };

        } catch (error) {
            console.error('[Character] Error saving appearance:', error);
            return { success: false, message: 'Failed to save appearance.' };
        }
    }

    // Load character
    async loadCharacter(player, characterId) {
        try {
            // Get character data
            const chars = await db.query(
                `SELECT * FROM characters WHERE id = ? AND player_id = ?`,
                [characterId, player.playerId]
            );

            if (chars.length === 0) {
                return { success: false, message: 'Character not found.' };
            }

            const char = chars[0];

            // Get appearance data
            const appearance = await db.query(
                'SELECT * FROM character_appearance WHERE character_id = ?',
                [characterId]
            );

            // Set player data
            player.characterId = characterId;
            player.characterData = char;
            player.name = `${char.first_name} ${char.last_name}`;
            player.dimension = char.dimension;
            
            // Spawn player
            player.spawn(new mp.Vector3(char.position_x, char.position_y, char.position_z));
            player.health = char.health;
            player.armour = char.armor;

            // Apply appearance if exists
            if (appearance.length > 0) {
                player.call('client:applyAppearance', [JSON.stringify(appearance[0])]);
            }

            // Update last played
            await db.query(
                'UPDATE characters SET last_played = NOW() WHERE id = ?',
                [characterId]
            );

            console.log(`[Character] Character loaded: ${player.name} (ID: ${characterId})`);

            return { success: true, message: 'Character loaded successfully!' };

        } catch (error) {
            console.error('[Character] Error loading character:', error);
            return { success: false, message: 'Failed to load character.' };
        }
    }

    // Save character position
    async savePosition(player) {
        if (!player.characterId) return;

        try {
            await db.query(
                `UPDATE characters SET position_x = ?, position_y = ?, position_z = ?, 
                 dimension = ?, health = ?, armor = ? WHERE id = ?`,
                [
                    player.position.x, player.position.y, player.position.z,
                    player.dimension, player.health, player.armour, player.characterId
                ]
            );
        } catch (error) {
            console.error('[Character] Error saving position:', error);
        }
    }

    // Update character money
    async updateMoney(characterId, amount) {
        try {
            await db.query(
                'UPDATE characters SET money = money + ? WHERE id = ?',
                [amount, characterId]
            );
        } catch (error) {
            console.error('[Character] Error updating money:', error);
        }
    }

    // Update bank balance
    async updateBank(characterId, amount) {
        try {
            await db.query(
                'UPDATE characters SET bank_balance = bank_balance + ? WHERE id = ?',
                [amount, characterId]
            );
        } catch (error) {
            console.error('[Character] Error updating bank:', error);
        }
    }
}

module.exports = new CharacterManager();
