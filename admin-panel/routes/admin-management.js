/**
 * Admin Management Routes
 * Manage admin users, passwords, and permissions
 */

const express = require('express');
const router = express.Router();
const database = require('../database-config');

// Get all admin users
router.get('/', async (req, res) => {
    try {
        const admins = await database.getAllAdmins();
        res.json({ success: true, admins });
    } catch (error) {
        console.error('[Admin Management] Error getting admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// Create new admin
router.post('/create', async (req, res) => {
    try {
        const { username, password, email, admin_level } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ error: 'Username must be 3-50 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if username already exists
        const existing = await database.getAdminByUsername(username);
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create admin
        const adminId = await database.createAdmin(
            username, 
            password, 
            email || null, 
            admin_level || 1
        );

        res.json({ 
            success: true, 
            message: 'Admin created successfully',
            adminId: adminId
        });

    } catch (error) {
        console.error('[Admin Management] Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Change admin password
router.post('/change-password', async (req, res) => {
    try {
        const { adminId, currentPassword, newPassword } = req.body;

        // Validate input
        if (!adminId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get admin
        const admins = await database.query('SELECT * FROM admins WHERE id = ?', [adminId]);
        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const admin = admins[0];

        // Verify current password
        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare(currentPassword, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        // Update password
        const success = await database.updateAdminPassword(adminId, newPassword);

        if (success) {
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update password' });
        }

    } catch (error) {
        console.error('[Admin Management] Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Change own password (for logged-in admin)
router.post('/change-my-password', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both passwords required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get current admin
        const admins = await database.query('SELECT * FROM admins WHERE id = ?', [req.session.user.id]);
        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const admin = admins[0];

        // Verify current password
        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare(currentPassword, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        // Update password
        const success = await database.updateAdminPassword(req.session.user.id, newPassword);

        if (success) {
            res.json({ success: true, message: 'Your password has been updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update password' });
        }

    } catch (error) {
        console.error('[Admin Management] Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Deactivate admin
router.post('/deactivate/:id', async (req, res) => {
    try {
        const adminId = req.params.id;

        // Don't allow deactivating yourself
        if (req.session.user && req.session.user.id === parseInt(adminId)) {
            return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        const success = await database.deactivateAdmin(adminId);

        if (success) {
            res.json({ success: true, message: 'Admin deactivated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to deactivate admin' });
        }

    } catch (error) {
        console.error('[Admin Management] Error deactivating admin:', error);
        res.status(500).json({ error: 'Failed to deactivate admin' });
    }
});

// Reactivate admin
router.post('/activate/:id', async (req, res) => {
    try {
        const adminId = req.params.id;

        await database.query('UPDATE admins SET is_active = TRUE WHERE id = ?', [adminId]);

        res.json({ success: true, message: 'Admin activated successfully' });

    } catch (error) {
        console.error('[Admin Management] Error activating admin:', error);
        res.status(500).json({ error: 'Failed to activate admin' });
    }
});

// Update admin level
router.post('/update-level/:id', async (req, res) => {
    try {
        const adminId = req.params.id;
        const { admin_level } = req.body;

        if (!admin_level || admin_level < 1 || admin_level > 4) {
            return res.status(400).json({ error: 'Admin level must be between 1 and 4' });
        }

        await database.query('UPDATE admins SET admin_level = ? WHERE id = ?', [admin_level, adminId]);

        res.json({ success: true, message: 'Admin level updated successfully' });

    } catch (error) {
        console.error('[Admin Management] Error updating admin level:', error);
        res.status(500).json({ error: 'Failed to update admin level' });
    }
});

module.exports = router;
