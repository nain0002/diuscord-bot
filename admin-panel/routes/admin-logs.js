// Admin Logs Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get admin logs
router.get('/', async (req, res) => {
    try {
        const logs = await db.query(
            'SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 500'
        );
        
        res.json({ success: true, logs: logs || [] });
    } catch (error) {
        console.error('[Admin Logs] Error fetching logs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admin logs' });
    }
});

// Get logs by admin
router.get('/admin/:adminName', async (req, res) => {
    try {
        const logs = await db.query(
            'SELECT * FROM admin_logs WHERE admin_name = ? ORDER BY timestamp DESC LIMIT 100',
            [req.params.adminName]
        );
        
        res.json({ success: true, logs: logs || [] });
    } catch (error) {
        console.error('[Admin Logs] Error fetching logs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admin logs' });
    }
});

// Get logs by action
router.get('/action/:action', async (req, res) => {
    try {
        const logs = await db.query(
            'SELECT * FROM admin_logs WHERE action = ? ORDER BY timestamp DESC LIMIT 100',
            [req.params.action]
        );
        
        res.json({ success: true, logs: logs || [] });
    } catch (error) {
        console.error('[Admin Logs] Error fetching logs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admin logs' });
    }
});

// Search logs
router.post('/search', async (req, res) => {
    try {
        const { search, startDate, endDate } = req.body;
        
        let query = 'SELECT * FROM admin_logs WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND (admin_name LIKE ? OR target_name LIKE ? OR reason LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY timestamp DESC LIMIT 200';
        
        const logs = await db.query(query, params);
        
        res.json({ success: true, logs: logs || [] });
    } catch (error) {
        console.error('[Admin Logs] Error searching logs:', error);
        res.status(500).json({ success: false, error: 'Failed to search admin logs' });
    }
});

module.exports = router;
