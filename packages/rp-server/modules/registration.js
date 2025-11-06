/**
 * Registration Module
 * Handles player registration and login
 */

const database = require('./database');
const bcrypt = require('bcrypt');
const playerModule = require('./player');

// Registration event
mp.events.add('server:register', async (player, username, password, email) => {
    try {
        // Validate input
        if (!username || !password || !email) {
            player.call('client:authResponse', ['error', 'All fields are required!']);
            return;
        }

        if (username.length < 3 || username.length > 20) {
            player.call('client:authResponse', ['error', 'Username must be 3-20 characters!']);
            return;
        }

        if (password.length < 6) {
            player.call('client:authResponse', ['error', 'Password must be at least 6 characters!']);
            return;
        }

        // Check if username already exists
        const existingUser = await database.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            player.call('client:authResponse', ['error', 'Username already exists!']);
            return;
        }

        // Check if email already exists
        const existingEmail = await database.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            player.call('client:authResponse', ['error', 'Email already registered!']);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user account
        const result = await database.query(
            'INSERT INTO users (username, password, email, social_club) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, player.socialClub || 'unknown']
        );

        console.log(`[Registration] New user registered: ${username}`);
        player.call('client:authResponse', ['success', 'Registration successful! You can now login.']);

    } catch (error) {
        console.error('[Registration] Error:', error);
        player.call('client:authResponse', ['error', 'Registration failed. Please try again.']);
    }
});

// Login event
mp.events.add('server:login', async (player, username, password) => {
    try {
        // Validate input
        if (!username || !password) {
            player.call('client:authResponse', ['error', 'All fields are required!']);
            return;
        }

        // Get user from database
        const users = await database.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            player.call('client:authResponse', ['error', 'Invalid username or password!']);
            return;
        }

        const user = users[0];

        // Check if user is banned
        if (user.is_banned) {
            player.call('client:authResponse', ['error', `You are banned! Reason: ${user.ban_reason || 'No reason provided'}`]);
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            player.call('client:authResponse', ['error', 'Invalid username or password!']);
            return;
        }

        // Update last login
        await database.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Set player as authenticated
        playerModule.setPlayerData(player, 'loggedIn', true);
        playerModule.setPlayerData(player, 'userId', user.id);

        console.log(`[Login] ${username} logged in successfully`);

        // Check if user has characters
        const characters = await database.query(
            'SELECT * FROM characters WHERE user_id = ?',
            [user.id]
        );

        if (characters.length > 0) {
            // Send character list to client
            player.call('client:showCharacterSelection', [JSON.stringify(characters)]);
        } else {
            // No characters, show character creator
            player.call('client:showCharacterCreator');
        }

    } catch (error) {
        console.error('[Login] Error:', error);
        player.call('client:authResponse', ['error', 'Login failed. Please try again.']);
    }
});

module.exports = {};
