// Reports Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   c1.name as reporter_name,
                   c2.name as reported_name
            FROM reports r
            LEFT JOIN characters c1 ON r.reporter_id = c1.id
            LEFT JOIN characters c2 ON r.reported_id = c2.id
            ORDER BY r.created_at DESC
            LIMIT 100
        `);
        
        res.json({ success: true, reports: reports || [] });
    } catch (error) {
        console.error('[Reports] Error fetching reports:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
});

// Get pending reports
router.get('/pending', async (req, res) => {
    try {
        const reports = await db.query(`
            SELECT r.*, 
                   c1.name as reporter_name,
                   c2.name as reported_name
            FROM reports r
            LEFT JOIN characters c1 ON r.reporter_id = c1.id
            LEFT JOIN characters c2 ON r.reported_id = c2.id
            WHERE r.status = 'pending'
            ORDER BY r.created_at DESC
        `);
        
        res.json({ success: true, reports: reports || [] });
    } catch (error) {
        console.error('[Reports] Error fetching pending reports:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch pending reports' });
    }
});

// Update report status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, handled_by } = req.body;
        
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        
        await db.execute(
            'UPDATE reports SET status = ?, handled_by = ?, handled_at = NOW() WHERE id = ?',
            [status, handled_by || 'System', req.params.id]
        );
        
        res.json({ success: true, message: 'Report status updated' });
    } catch (error) {
        console.error('[Reports] Error updating report:', error);
        res.status(500).json({ success: false, error: 'Failed to update report' });
    }
});

// Delete report
router.delete('/:id', async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM reports WHERE id = ?',
            [req.params.id]
        );
        
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('[Reports] Error deleting report:', error);
        res.status(500).json({ success: false, error: 'Failed to delete report' });
    }
});

// Get report statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM reports
        `);
        
        res.json({ success: true, stats: stats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0 } });
    } catch (error) {
        console.error('[Reports] Error fetching report stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch report stats' });
    }
});

module.exports = router;
