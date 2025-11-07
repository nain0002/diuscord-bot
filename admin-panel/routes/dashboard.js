/**
 * Dashboard Routes
 * Server statistics and overview
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');
const os = require('os');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get database stats
        const [userCount] = await database.query('SELECT COUNT(*) as count FROM users');
        const [characterCount] = await database.query('SELECT COUNT(*) as count FROM characters');
        const [vehicleCount] = await database.query('SELECT COUNT(*) as count FROM vehicles');
        const [transactionCount] = await database.query('SELECT COUNT(*) as count FROM bank_transactions WHERE DATE(created_at) = CURDATE()');

        // Server stats
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();
        const cpuUsage = os.loadavg();

        // Recent registrations
        const recentUsers = await database.query(
            'SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        // Online players count (this would come from RAGE:MP server in production)
        const onlinePlayers = 0; // Placeholder

        res.json({
            success: true,
            stats: {
                users: (userCount && userCount[0]) ? userCount[0].count : 0,
                characters: (characterCount && characterCount[0]) ? characterCount[0].count : 0,
                vehicles: (vehicleCount && vehicleCount[0]) ? vehicleCount[0].count : 0,
                todayTransactions: (transactionCount && transactionCount[0]) ? transactionCount[0].count : 0,
                onlinePlayers: onlinePlayers || 0
            },
            server: {
                uptime: Math.floor(uptime),
                memory: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memUsage.heapTotal / 1024 / 1024)
                },
                cpu: cpuUsage[0].toFixed(2)
            },
            recentUsers: recentUsers
        });

    } catch (error) {
        console.error('[Dashboard] Error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get server activity logs
router.get('/activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const activities = await database.query(
            `SELECT 
                'character' as type,
                CONCAT(char_name, ' ', char_surname) as description,
                created_at as timestamp
            FROM characters
            ORDER BY created_at DESC
            LIMIT ?`,
            [limit]
        );

        res.json({ success: true, activities });

    } catch (error) {
        console.error('[Dashboard] Activity error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

module.exports = router;
