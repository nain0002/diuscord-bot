/**
 * Ultra Analytics Routes
 * Advanced player analytics for AI assistant
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// Get player heatmap (activity by hour)
router.get('/heatmap', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        
        const heatmap = await database.query(
            `SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as count
            FROM player_sessions
            WHERE created_at >= NOW() - INTERVAL ? DAY
            GROUP BY HOUR(created_at)
            ORDER BY hour`,
            [days]
        );
        
        res.json({
            success: true,
            heatmap: heatmap || []
        });
        
    } catch (error) {
        req.app.locals.logger.error('Heatmap error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to generate heatmap'
        });
    }
});

// Get top players by various metrics
router.get('/top-players', async (req, res) => {
    try {
        const metric = req.query.metric || 'playtime';
        const limit = parseInt(req.query.limit) || 10;
        
        let query = '';
        let params = [limit];
        
        switch(metric) {
            case 'playtime':
                query = `SELECT u.username, c.playtime as value
                        FROM users u
                        JOIN characters c ON c.user_id = u.id
                        ORDER BY c.playtime DESC
                        LIMIT ?`;
                break;
            case 'money':
                query = `SELECT u.username, (c.money + c.bank_balance) as value
                        FROM users u
                        JOIN characters c ON c.user_id = u.id
                        ORDER BY value DESC
                        LIMIT ?`;
                break;
            case 'level':
                query = `SELECT u.username, c.level as value
                        FROM users u
                        JOIN characters c ON c.user_id = u.id
                        ORDER BY c.level DESC
                        LIMIT ?`;
                break;
            case 'achievements':
                query = `SELECT u.username, COUNT(pa.id) as value
                        FROM users u
                        LEFT JOIN player_achievements pa ON pa.player_id = u.id
                        GROUP BY u.id
                        ORDER BY value DESC
                        LIMIT ?`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid metric'
                });
        }
        
        const topPlayers = await database.query(query, params);
        
        res.json({
            success: true,
            metric,
            players: topPlayers || []
        });
        
    } catch (error) {
        req.app.locals.logger.error('Top players error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get top players'
        });
    }
});

// Get economy flow (money in/out)
router.get('/economy-flow', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        
        const flow = await database.query(
            `SELECT 
                DATE(created_at) as date,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expense
            FROM economy_logs
            WHERE created_at >= NOW() - INTERVAL ? DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC`,
            [days]
        );
        
        res.json({
            success: true,
            flow: flow || []
        });
        
    } catch (error) {
        req.app.locals.logger.error('Economy flow error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get economy flow'
        });
    }
});

// Get server growth metrics
router.get('/growth', async (req, res) => {
    try {
        const [
            userGrowth,
            activePlayersTrend,
            revenueGrowth
        ] = await Promise.all([
            // New user registrations (last 30 days)
            database.query(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM users
                WHERE created_at >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `),
            
            // Active players trend (last 30 days)
            database.query(`
                SELECT DATE(login_time) as date, COUNT(DISTINCT user_id) as count
                FROM player_sessions
                WHERE login_time >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(login_time)
                ORDER BY date ASC
            `),
            
            // Total money in economy (growth)
            database.query(`
                SELECT 
                    DATE(created_at) as date,
                    SUM(money + bank_balance) as total_money
                FROM characters
                WHERE created_at >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `)
        ]);
        
        res.json({
            success: true,
            growth: {
                users: userGrowth || [],
                activePlayers: activePlayersTrend || [],
                economy: revenueGrowth || []
            }
        });
        
    } catch (error) {
        req.app.locals.logger.error('Growth metrics error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get growth metrics'
        });
    }
});

// Get job distribution
router.get('/job-distribution', async (req, res) => {
    try {
        const distribution = await database.query(`
            SELECT 
                job,
                COUNT(*) as count,
                AVG(level) as avg_level,
                AVG(money + bank_balance) as avg_wealth
            FROM characters
            WHERE job IS NOT NULL
            GROUP BY job
            ORDER BY count DESC
        `);
        
        res.json({
            success: true,
            distribution: distribution || []
        });
        
    } catch (error) {
        req.app.locals.logger.error('Job distribution error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get job distribution'
        });
    }
});

module.exports = router;
