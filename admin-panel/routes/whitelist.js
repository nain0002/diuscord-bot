// Whitelist Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get all whitelist entries
router.get('/', async (req, res) => {
    try {
        const whitelist = await db.query(
            'SELECT * FROM whitelist ORDER BY added_at DESC'
        );
        
        res.json({ success: true, whitelist: whitelist || [] });
    } catch (error) {
        console.error('[Whitelist] Error fetching whitelist:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch whitelist' });
    }
});

// Add to whitelist
router.post('/add', async (req, res) => {
    try {
        const { social_club, added_by } = req.body;
        
        if (!social_club) {
            return res.status(400).json({ success: false, error: 'Social Club name required' });
        }
        
        await db.execute(
            'INSERT INTO whitelist (social_club, added_by, added_at) VALUES (?, ?, NOW())',
            [social_club, added_by || 'System']
        );
        
        res.json({ success: true, message: 'Player added to whitelist' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'Player already whitelisted' });
        }
        console.error('[Whitelist] Error adding to whitelist:', error);
        res.status(500).json({ success: false, error: 'Failed to add to whitelist' });
    }
});

// Remove from whitelist
router.delete('/:social_club', async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM whitelist WHERE social_club = ?',
            [req.params.social_club]
        );
        
        res.json({ success: true, message: 'Player removed from whitelist' });
    } catch (error) {
        console.error('[Whitelist] Error removing from whitelist:', error);
        res.status(500).json({ success: false, error: 'Failed to remove from whitelist' });
    }
});

// Check if player is whitelisted
router.get('/check/:social_club', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM whitelist WHERE social_club = ?',
            [req.params.social_club]
        );
        
        res.json({ success: true, whitelisted: result && result.length > 0 });
    } catch (error) {
        console.error('[Whitelist] Error checking whitelist:', error);
        res.status(500).json({ success: false, error: 'Failed to check whitelist' });
    }
});

module.exports = router;
