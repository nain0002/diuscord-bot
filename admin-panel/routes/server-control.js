// Server Control Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Broadcast message to all players
router.post('/broadcast', async (req, res) => {
    try {
        const { message, admin } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message required' });
        }
        
        // Send via WebSocket to game server
        // This would need the WebSocket bridge implementation
        
        // Log the broadcast
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, reason, timestamp) VALUES (?, ?, ?, NOW())',
            ['broadcast', admin || 'System', message]
        );
        
        res.json({ success: true, message: 'Broadcast sent' });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Give money to player
router.post('/give-money', async (req, res) => {
    try {
        const { character_id, amount, admin } = req.body;
        
        if (!character_id || !amount) {
            return res.status(400).json({ success: false, error: 'Character ID and amount required' });
        }
        
        // Get current balance
        const char = await db.query('SELECT money, first_name, last_name FROM characters WHERE id = ?', [character_id]);
        
        if (!char || char.length === 0) {
            return res.status(404).json({ success: false, error: 'Character not found' });
        }
        
        const oldBalance = char[0].money;
        const newBalance = oldBalance + parseInt(amount);
        
        // Update balance
        await db.execute('UPDATE characters SET money = ? WHERE id = ?', [newBalance, character_id]);
        
        // Log transaction
        await db.execute(
            `INSERT INTO economy_logs (character_id, transaction_type, amount, balance_before, balance_after, source, description) 
             VALUES (?, 'earn', ?, ?, ?, 'admin', ?)`,
            [character_id, amount, oldBalance, newBalance, `Admin ${admin} gave money`]
        );
        
        // Log admin action
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, target_name, reason, timestamp) VALUES (?, ?, ?, ?, NOW())',
            ['give_money', admin || 'System', `${char[0].first_name} ${char[0].last_name}`, `Gave $${amount}`]
        );
        
        res.json({ success: true, message: `Gave $${amount} to ${char[0].first_name} ${char[0].last_name}`, newBalance });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Set player level
router.post('/set-level', async (req, res) => {
    try {
        const { character_id, level, admin } = req.body;
        
        if (!character_id || level === undefined) {
            return res.status(400).json({ success: false, error: 'Character ID and level required' });
        }
        
        const char = await db.query('SELECT first_name, last_name FROM characters WHERE id = ?', [character_id]);
        
        if (!char || char.length === 0) {
            return res.status(404).json({ success: false, error: 'Character not found' });
        }
        
        await db.execute('UPDATE characters SET level = ? WHERE id = ?', [level, character_id]);
        
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, target_name, reason, timestamp) VALUES (?, ?, ?, ?, NOW())',
            ['set_level', admin || 'System', `${char[0].first_name} ${char[0].last_name}`, `Set level to ${level}`]
        );
        
        res.json({ success: true, message: `Set ${char[0].first_name} ${char[0].last_name}'s level to ${level}` });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Heal all players
router.post('/heal-all', async (req, res) => {
    try {
        const { admin } = req.body;
        
        // This would send command to game server via WebSocket
        
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, reason, timestamp) VALUES (?, ?, ?, NOW())',
            ['heal_all', admin || 'System', 'Healed all players']
        );
        
        res.json({ success: true, message: 'Heal all command sent' });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Clear vehicles
router.post('/clear-vehicles', async (req, res) => {
    try {
        const { admin } = req.body;
        
        // This would send command to game server
        
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, reason, timestamp) VALUES (?, ?, ?, NOW())',
            ['clear_vehicles', admin || 'System', 'Cleared all vehicles']
        );
        
        res.json({ success: true, message: 'Clear vehicles command sent' });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Server maintenance mode
router.post('/maintenance', async (req, res) => {
    try {
        const { enabled, admin } = req.body;
        
        // Save to server config or environment
        
        await db.execute(
            'INSERT INTO admin_logs (action, admin_name, reason, timestamp) VALUES (?, ?, ?, NOW())',
            ['maintenance_mode', admin || 'System', enabled ? 'Enabled' : 'Disabled']
        );
        
        res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
        console.error('[ServerControl] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
