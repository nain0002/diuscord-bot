/**
 * Players Routes
 * Player management and actions
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');
const bcrypt = require('bcrypt');

// Get all players
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT u.*, 
                COUNT(c.id) as character_count,
                MAX(u.last_login) as last_login
            FROM users u
            LEFT JOIN characters c ON u.id = c.user_id
        `;

        let params = [];

        if (search) {
            query += ' WHERE u.username LIKE ? OR u.email LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const players = await database.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        let countParams = [];

        if (search) {
            countQuery += ' WHERE username LIKE ? OR email LIKE ?';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [{ total }] = await database.query(countQuery, countParams);

        res.json({
            success: true,
            players: players.map(p => ({
                id: p.id,
                username: p.username,
                email: p.email,
                character_count: p.character_count,
                created_at: p.created_at,
                last_login: p.last_login,
                is_banned: p.is_banned,
                ban_reason: p.ban_reason
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('[Players] List error:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Get player details
router.get('/:id', async (req, res) => {
    try {
        const playerId = req.params.id;

        const [user] = await database.query('SELECT * FROM users WHERE id = ?', [playerId]);
        
        if (!user) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const characters = await database.query(
            'SELECT * FROM characters WHERE user_id = ?',
            [playerId]
        );

        res.json({
            success: true,
            player: {
                id: user.id,
                username: user.username,
                email: user.email,
                social_club: user.social_club,
                created_at: user.created_at,
                last_login: user.last_login,
                is_banned: user.is_banned,
                ban_reason: user.ban_reason
            },
            characters: characters
        });

    } catch (error) {
        console.error('[Players] Details error:', error);
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
});

// Ban player
router.post('/:id/ban', async (req, res) => {
    try {
        const playerId = req.params.id;
        const { reason } = req.body;

        await database.query(
            'UPDATE users SET is_banned = TRUE, ban_reason = ? WHERE id = ?',
            [reason || 'No reason provided', playerId]
        );

        // Emit event to kick player if online
        const io = req.app.get('io');
        io.to('admins').emit('playerBanned', { playerId, reason });

        res.json({ success: true, message: 'Player banned successfully' });

    } catch (error) {
        console.error('[Players] Ban error:', error);
        res.status(500).json({ error: 'Failed to ban player' });
    }
});

// Unban player
router.post('/:id/unban', async (req, res) => {
    try {
        const playerId = req.params.id;

        await database.query(
            'UPDATE users SET is_banned = FALSE, ban_reason = NULL WHERE id = ?',
            [playerId]
        );

        res.json({ success: true, message: 'Player unbanned successfully' });

    } catch (error) {
        console.error('[Players] Unban error:', error);
        res.status(500).json({ error: 'Failed to unban player' });
    }
});

// Delete player
router.delete('/:id', async (req, res) => {
    try {
        const playerId = req.params.id;

        await database.query('DELETE FROM users WHERE id = ?', [playerId]);

        res.json({ success: true, message: 'Player deleted successfully' });

    } catch (error) {
        console.error('[Players] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// Reset player password
router.post('/:id/reset-password', async (req, res) => {
    try {
        const playerId = req.params.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await database.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, playerId]
        );

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('[Players] Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = router;
