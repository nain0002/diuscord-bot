// Bans Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get all bans
router.get('/', async (req, res) => {
    try {
        const bans = await db.query(
            'SELECT * FROM bans ORDER BY banned_at DESC'
        );
        
        res.json({ success: true, bans: bans || [] });
    } catch (error) {
        console.error('[Bans] Error fetching bans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bans' });
    }
});

// Add ban
router.post('/add', async (req, res) => {
    try {
        const { social_club, character_id, reason, admin_name } = req.body;
        
        if (!social_club) {
            return res.status(400).json({ success: false, error: 'Social Club name required' });
        }
        
        await db.execute(
            'INSERT INTO bans (social_club, character_id, reason, admin_name, banned_at) VALUES (?, ?, ?, ?, NOW())',
            [social_club, character_id || null, reason || 'No reason provided', admin_name || 'System']
        );
        
        res.json({ success: true, message: 'Player banned successfully' });
    } catch (error) {
        console.error('[Bans] Error adding ban:', error);
        res.status(500).json({ success: false, error: 'Failed to add ban' });
    }
});

// Remove ban (unban)
router.delete('/:id', async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM bans WHERE id = ?',
            [req.params.id]
        );
        
        res.json({ success: true, message: 'Ban removed successfully' });
    } catch (error) {
        console.error('[Bans] Error removing ban:', error);
        res.status(500).json({ success: false, error: 'Failed to remove ban' });
    }
});

// Check if player is banned
router.get('/check/:social_club', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM bans WHERE social_club = ?',
            [req.params.social_club]
        );
        
        res.json({ 
            success: true, 
            banned: result && result.length > 0,
            ban: result && result.length > 0 ? result[0] : null
        });
    } catch (error) {
        console.error('[Bans] Error checking ban:', error);
        res.status(500).json({ success: false, error: 'Failed to check ban' });
    }
});

// Search bans
router.post('/search', async (req, res) => {
    try {
        const { search } = req.body;
        
        const bans = await db.query(
            'SELECT * FROM bans WHERE social_club LIKE ? OR reason LIKE ? OR admin_name LIKE ? ORDER BY banned_at DESC',
            [`%${search}%`, `%${search}%`, `%${search}%`]
        );
        
        res.json({ success: true, bans: bans || [] });
    } catch (error) {
        console.error('[Bans] Error searching bans:', error);
        res.status(500).json({ success: false, error: 'Failed to search bans' });
    }
});

module.exports = router;
