/**
 * Enhanced Dashboard Routes
 * Ultra Admin Panel Stats
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// Get comprehensive dashboard stats
router.get('/stats', async (req, res) => {
    try {
        // Online players count
        const wsBridge = req.app.get('wsBridge');
        const onlinePlayers = wsBridge ? (wsBridge.getOnlinePlayers() || []) : [];
        const totalPlayers = onlinePlayers.length;
        
        // Total vehicles
        const vehicles = await database.query(
            'SELECT COUNT(*) as count FROM vehicles'
        );
        const totalVehicles = (vehicles && vehicles[0]) ? vehicles[0].count : 0;
        
        // Pending reports
        const reports = await database.query(
            `SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`
        );
        const pendingReports = (reports && reports[0]) ? reports[0].count : 0;
        
        // Average ping
        const avgPing = onlinePlayers.length > 0
            ? Math.round(onlinePlayers.reduce((sum, p) => sum + (p.ping || 0), 0) / onlinePlayers.length)
            : 0;
        
        // Total registered users
        const users = await database.query(
            'SELECT COUNT(*) as count FROM users'
        );
        const totalUsers = (users && users[0]) ? users[0].count : 0;
        
        // Active bans
        const bans = await database.query(
            `SELECT COUNT(*) as count FROM bans WHERE is_active = TRUE`
        );
        const activeBans = (bans && bans[0]) ? bans[0].count : 0;
        
        // Recent activity (last 24h)
        const recentActivity = await database.query(
            `SELECT COUNT(*) as count FROM admin_logs WHERE created_at >= NOW() - INTERVAL 24 HOUR`
        );
        const recentActions = (recentActivity && recentActivity[0]) ? recentActivity[0].count : 0;
        
        // Player join trend (last 7 days)
        const joinTrend = await database.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count
             FROM users
             WHERE created_at >= NOW() - INTERVAL 7 DAY
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );
        
        res.json({
            success: true,
            totalPlayers,
            totalVehicles,
            pendingReports,
            avgPing,
            totalUsers,
            activeBans,
            recentActions,
            joinTrend: joinTrend || [],
            serverUptime: Math.floor(process.uptime()),
            timestamp: Date.now()
        });
        
    } catch (error) {
        req.app.locals.logger.error('Dashboard stats error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard stats',
            totalPlayers: 0,
            totalVehicles: 0,
            pendingReports: 0,
            avgPing: 0
        });
    }
});

// Get real-time activity feed
router.get('/activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        
        const activity = await database.query(
            `SELECT 
                id,
                admin_name,
                action,
                target_name,
                reason,
                created_at,
                ip_address
            FROM admin_logs
            ORDER BY created_at DESC
            LIMIT ?`,
            [limit]
        );
        
        res.json({
            success: true,
            activity: activity || []
        });
        
    } catch (error) {
        req.app.locals.logger.error('Activity feed error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to load activity feed',
            activity: []
        });
    }
});

// Get server performance metrics
router.get('/performance', async (req, res) => {
    try {
        const metrics = {
            cpu: process.cpuUsage(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
            },
            uptime: Math.floor(process.uptime()),
            timestamp: Date.now()
        };
        
        res.json({
            success: true,
            metrics
        });
        
    } catch (error) {
        req.app.locals.logger.error('Performance metrics error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get performance metrics'
        });
    }
});

// Get quick stats for mini cards
router.get('/quick-stats', async (req, res) => {
    try {
        // Get multiple stats in parallel
        const [
            usersResult,
            charactersResult,
            vehiclesResult,
            reportsResult,
            bansResult
        ] = await Promise.all([
            database.query('SELECT COUNT(*) as count FROM users'),
            database.query('SELECT COUNT(*) as count FROM characters'),
            database.query('SELECT COUNT(*) as count FROM vehicles'),
            database.query('SELECT COUNT(*) as count FROM reports WHERE status = "pending"'),
            database.query('SELECT COUNT(*) as count FROM bans WHERE is_active = TRUE')
        ]);
        
        res.json({
            success: true,
            stats: {
                totalUsers: usersResult[0]?.count || 0,
                totalCharacters: charactersResult[0]?.count || 0,
                totalVehicles: vehiclesResult[0]?.count || 0,
                pendingReports: reportsResult[0]?.count || 0,
                activeBans: bansResult[0]?.count || 0
            }
        });
        
    } catch (error) {
        req.app.locals.logger.error('Quick stats error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get quick stats',
            stats: {
                totalUsers: 0,
                totalCharacters: 0,
                totalVehicles: 0,
                pendingReports: 0,
                activeBans: 0
            }
        });
    }
});

module.exports = router;
