/**
 * Authentication Module - FIXED
 * Handles player login, registration, and character management
 */

const database = require('./database');
const bcrypt = require('bcrypt');
const playerModule = require('./player');

// ============================================================================
// PLAYER LOGIN
// ============================================================================

mp.events.add('attemptLogin', async (player, username, password) => {
    try {
        console.log(`[Auth] Login attempt: ${username}`);
        
        // Validate input
        if (!username || !password) {
            player.call('loginFailed', ['Username and password are required']);
            return;
        }
        
        // Get user from database
        const users = await database.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            player.call('loginFailed', ['Invalid username or password']);
            return;
        }
        
        const user = users[0];
        
        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            player.call('loginFailed', ['Invalid username or password']);
            return;
        }
        
        // Check if banned
        const bans = await database.query(
            'SELECT * FROM bans WHERE user_id = ? AND is_active = TRUE',
            [user.id]
        );
        
        if (bans.length > 0) {
            const ban = bans[0];
            player.call('loginFailed', [`You are banned. Reason: ${ban.reason}`]);
            player.kick('Banned');
            return;
        }
        
        // Update player data
        const playerData = playerModule.getPlayerData(player);
        if (playerData) {
            playerData.loggedIn = true;
            playerData.authenticated = true;
            playerData.userId = user.id;
        }
        
        // Set player variables
        player.setVariable('logged_in', true);
        player.setVariable('user_id', user.id);
        player.setVariable('username', user.username);
        player.setVariable('admin_level', user.admin_level || 0);
        player.setVariable('isAdmin', user.admin_level > 0);
        
        // Update last login
        await database.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );
        
        console.log(`[Auth] ${username} logged in successfully (ID: ${user.id})`);
        
        // Check if player has a character
        const characters = await database.query(
            'SELECT * FROM characters WHERE user_id = ?',
            [user.id]
        );
        
        if (characters.length === 0) {
            // No character - show character creation
            player.call('loginSuccess');
            setTimeout(() => {
                player.call('showCharacterCreation');
            }, 1000);
        } else {
            // Load character
            await loadCharacter(player, characters[0]);
        }
        
    } catch (error) {
        console.error('[Auth] Login error:', error);
        player.call('loginFailed', ['An error occurred. Please try again.']);
    }
});

// ============================================================================
// PLAYER REGISTRATION
// ============================================================================

mp.events.add('attemptRegister', async (player, username, password, email) => {
    try {
        console.log(`[Auth] Registration attempt: ${username}`);
        
        // Validate input
        if (!username || !password) {
            player.call('registerFailed', ['Username and password are required']);
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            player.call('registerFailed', ['Username must be 3-20 characters']);
            return;
        }
        
        if (password.length < 6) {
            player.call('registerFailed', ['Password must be at least 6 characters']);
            return;
        }
        
        // Check if username exists
        const existing = await database.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existing.length > 0) {
            player.call('registerFailed', ['Username already exists']);
            return;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await database.query(
            'INSERT INTO users (username, password, email, social_club) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email || null, player.socialClub || '']
        );
        
        console.log(`[Auth] ${username} registered successfully (ID: ${result.insertId})`);
        
        player.call('registerSuccess');
        
    } catch (error) {
        console.error('[Auth] Registration error:', error);
        player.call('registerFailed', ['An error occurred. Please try again.']);
    }
});

// ============================================================================
// CHARACTER CREATION
// ============================================================================

// Handle both event names for compatibility
mp.events.add('createCharacter', async (player, data) => {
    await handleCharacterCreation(player, data);
});

mp.events.add('saveCharacterCreation', async (player, dataJson) => {
    try {
        const data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
        await handleCharacterCreation(player, data);
    } catch (error) {
        console.error('[Auth] saveCharacterCreation parse error:', error);
        player.call('characterCreationFailed', 'Invalid character data');
    }
});

async function handleCharacterCreation(player, data) {
    try {
        const playerData = playerModule.getPlayerData(player);
        
        if (!playerData || !playerData.userId) {
            player.outputChatBox('!{#FF0000}[Error] You must be logged in to create a character');
            return;
        }
        
        console.log(`[Auth] Creating character for user ID: ${playerData.userId}`);
        
        // Parse character data
        const charData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Create character in database
        const result = await database.query(
            `INSERT INTO characters (
                user_id, firstname, lastname, gender, birthdate,
                position_x, position_y, position_z, heading,
                health, armor, money, bank_balance, level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                playerData.userId,
                charData.firstname || 'John',
                charData.lastname || 'Doe',
                charData.gender || 0,
                charData.birthdate || '1990-01-01',
                -1035.5, -2731.5, 20.2, 0, // Airport spawn
                100, 0, 5000, 0, 1
            ]
        );
        
        const characterId = result.insertId;
        console.log(`[Auth] Character created (ID: ${characterId})`);
        
        // Save appearance data
        if (charData.appearance) {
            await database.query(
                `INSERT INTO character_appearance (
                    character_id, father, mother, similarity, skin_similarity,
                    hair, hair_color, eyebrows, eyebrows_color
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    characterId,
                    charData.appearance.father || 0,
                    charData.appearance.mother || 0,
                    charData.appearance.similarity || 0.5,
                    charData.appearance.skinSimilarity || 0.5,
                    charData.appearance.hair || 0,
                    charData.appearance.hairColor || 0,
                    charData.appearance.eyebrows || 0,
                    charData.appearance.eyebrowsColor || 0
                ]
            );
        }
        
        // Load the new character
        const characters = await database.query(
            'SELECT * FROM characters WHERE id = ?',
            [characterId]
        );
        
        if (characters.length > 0) {
            await loadCharacter(player, characters[0]);
        }
        
        player.call('characterCreationComplete');
        
    } catch (error) {
        console.error('[Auth] Character creation error:', error);
        player.outputChatBox('!{#FF0000}[Error] Failed to create character');
    }
});

// ============================================================================
// LOAD CHARACTER
// ============================================================================

async function loadCharacter(player, character) {
    try {
        console.log(`[Auth] Loading character (ID: ${character.id}) for ${player.name}`);
        
        // Set character data
        const playerData = playerModule.getPlayerData(player);
        if (playerData) {
            playerData.characterId = character.id;
            playerData.characterData = {
                firstname: character.firstname,
                lastname: character.lastname,
                money: character.money || 0,
                bank_balance: character.bank_balance || 0,
                level: character.level || 1,
                job: character.job || 'Unemployed',
                health: character.health || 100,
                armor: character.armor || 0
            };
        }
        
        // Set player variables - CRITICAL for other scripts
        player.setVariable('character_id', character.id);
        player.setVariable('money', character.money || 0);
        player.setVariable('level', character.level || 1);
        player.setVariable('job', character.job || 'Unemployed');
        
        // Set player position
        player.position = new mp.Vector3(
            character.position_x || -1035.5,
            character.position_y || -2731.5,
            character.position_z || 20.2
        );
        player.heading = character.heading || 0;
        
        // Set player health and armor
        player.health = character.health || 100;
        player.armour = character.armor || 0;
        
        // Unfreeze and set dimension
        player.dimension = 0;
        player.frozen = false;
        
        // Notify client
        player.call('loginSuccess');
        player.call('characterLoaded', [JSON.stringify(playerData.characterData)]);
        
        // Trigger playerReady event for other scripts
        setTimeout(() => {
            player.call('playerReady');
        }, 500);
        
        player.outputChatBox('!{#00FF00}Welcome to the server!');
        player.outputChatBox(`!{#00FFFF}Character: ${character.firstname} ${character.lastname}`);
        player.outputChatBox(`!{#FFFF00}Money: $${character.money} | Bank: $${character.bank_balance}`);
        
    } catch (error) {
        console.error('[Auth] Load character error:', error);
    }
}

module.exports = {
    loadCharacter
};
