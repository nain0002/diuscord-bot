// Player Authentication System
const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class Authentication {
    constructor() {
        this.loginAttempts = new Map();
    }

    // Register new player
    async register(player, username, password, email) {
        try {
            // Validate input
            if (!helpers.isValidUsername(username)) {
                return { success: false, message: 'Invalid username. Use 3-20 alphanumeric characters.' };
            }

            if (!helpers.isValidEmail(email)) {
                return { success: false, message: 'Invalid email address.' };
            }

            if (password.length < 6) {
                return { success: false, message: 'Password must be at least 6 characters long.' };
            }

            // Check if username exists
            const existingUser = await db.query(
                'SELECT id FROM players WHERE username = ?',
                [username]
            );

            if (existingUser.length > 0) {
                return { success: false, message: 'Username already exists.' };
            }

            // Check if email exists
            const existingEmail = await db.query(
                'SELECT id FROM players WHERE email = ?',
                [email]
            );

            if (existingEmail.length > 0) {
                return { success: false, message: 'Email already registered.' };
            }

            // Hash password
            const hashedPassword = await helpers.hashPassword(password);

            // Insert new player
            const result = await db.query(
                'INSERT INTO players (username, password, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email]
            );

            console.log(`[Auth] New player registered: ${username} (ID: ${result.insertId})`);
            
            return { 
                success: true, 
                message: 'Registration successful!',
                playerId: result.insertId
            };

        } catch (error) {
            console.error('[Auth] Registration error:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    }

    // Login player
    async login(player, username, password) {
        try {
            // Check login attempts
            const attempts = this.loginAttempts.get(player.socialClub) || 0;
            if (attempts >= 5) {
                player.kick('Too many failed login attempts');
                return { success: false, message: 'Too many failed attempts.' };
            }

            // Get player from database
            const result = await db.query(
                'SELECT id, password, banned, ban_reason FROM players WHERE username = ?',
                [username]
            );

            if (result.length === 0) {
                this.loginAttempts.set(player.socialClub, attempts + 1);
                return { success: false, message: 'Invalid username or password.' };
            }

            const playerData = result[0];

            // Check if banned
            if (playerData.banned) {
                player.kick(`Banned: ${playerData.ban_reason}`);
                return { success: false, message: 'Account is banned.' };
            }

            // Verify password
            const passwordValid = await helpers.verifyPassword(password, playerData.password);

            if (!passwordValid) {
                this.loginAttempts.set(player.socialClub, attempts + 1);
                return { success: false, message: 'Invalid username or password.' };
            }

            // Update last login
            await db.query(
                'UPDATE players SET last_login = NOW() WHERE id = ?',
                [playerData.id]
            );

            // Clear login attempts
            this.loginAttempts.delete(player.socialClub);

            console.log(`[Auth] Player logged in: ${username} (ID: ${playerData.id})`);

            return { 
                success: true, 
                message: 'Login successful!',
                playerId: playerData.id
            };

        } catch (error) {
            console.error('[Auth] Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    // Check if player is logged in
    isLoggedIn(player) {
        return player.loggedIn === true;
    }
}

module.exports = new Authentication();
