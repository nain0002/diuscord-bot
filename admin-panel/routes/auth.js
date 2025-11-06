/**
 * Authentication Routes
 * Handle login/logout for admin panel
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const database = require('../../packages/rp-server/modules/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Default admin credentials (change in production!)
        const defaultAdmin = {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10)
        };

        // Check database for admin users
        try {
            const admins = await database.query(
                'SELECT * FROM users WHERE username = ? AND admin_level >= 3',
                [username]
            );

            if (admins.length > 0) {
                const admin = admins[0];
                const passwordMatch = await bcrypt.compare(password, admin.password);

                if (passwordMatch) {
                    req.session.isAuthenticated = true;
                    req.session.adminId = admin.id;
                    req.session.adminUsername = admin.username;
                    req.session.adminLevel = admin.admin_level;

                    return res.json({
                        success: true,
                        message: 'Login successful',
                        user: {
                            username: admin.username,
                            level: admin.admin_level
                        }
                    });
                }
            }
        } catch (dbError) {
            console.log('[Admin Panel] Database not ready, using default credentials');
        }

        // Fallback to default credentials
        if (username === defaultAdmin.username) {
            const passwordMatch = await bcrypt.compare(password, defaultAdmin.password);
            
            if (passwordMatch) {
                req.session.isAuthenticated = true;
                req.session.adminUsername = 'admin';
                req.session.adminLevel = 4;

                return res.json({
                    success: true,
                    message: 'Login successful (default credentials)',
                    user: {
                        username: 'admin',
                        level: 4
                    }
                });
            }
        }

        res.status(401).json({ error: 'Invalid credentials' });

    } catch (error) {
        console.error('[Admin Panel] Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check auth status
router.get('/status', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.json({
            authenticated: true,
            user: {
                username: req.session.adminUsername,
                level: req.session.adminLevel
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;
