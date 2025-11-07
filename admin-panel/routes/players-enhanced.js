/**
 * Enhanced Players Routes
 * Extended API for ultra admin panel
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// Get detailed player data (for AI monitoring)
router.get('/detailed', async (req, res) => {
    try {
        // Get online players from game server
        const wsBridge = req.app.get('wsBridge');
        let onlinePlayers = [];
        
        if (wsBridge) {
            onlinePlayers = wsBridge.getOnlinePlayers() || [];
        }
        
        // Enrich with database data
        if (onlinePlayers.length > 0) {
            const playerIds = onlinePlayers.map(p => p.id);
            const placeholders = playerIds.map(() => '?').join(',');
            
            const dbData = await database.query(
                `SELECT 
                    u.id,
                    u.username,
                    u.admin_level,
                    c.money,
                    c.level,
                    c.job,
                    (SELECT COUNT(*) FROM bans WHERE user_id = u.id) as ban_count,
                    (SELECT COUNT(*) FROM reports WHERE reported_id = u.id) as report_count
                FROM users u
                LEFT JOIN characters c ON c.user_id = u.id
                WHERE u.id IN (${placeholders})`,
                playerIds
            );
            
            // Merge data
            onlinePlayers = onlinePlayers.map(player => {
                const dbPlayer = dbData.find(p => p.id === player.id);
                return {
                    ...player,
                    ...(dbPlayer || {}),
                    admin: (dbPlayer?.admin_level || 0) > 0
                };
            });
        }
        
        res.json({
            success: true,
            players: onlinePlayers,
            count: onlinePlayers.length,
            timestamp: Date.now()
        });
        
    } catch (error) {
        req.app.locals.logger.error('Get detailed players error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get player data'
        });
    }
});

// Get player positions (for map)
router.get('/positions', async (req, res) => {
    try {
        const wsBridge = req.app.get('wsBridge');
        let players = [];
        
        if (wsBridge) {
            const onlinePlayers = wsBridge.getOnlinePlayers() || [];
            
            players = onlinePlayers.map(player => ({
                id: player.id,
                name: player.name,
                x: player.x || 0,
                y: player.y || 0,
                z: player.z || 0,
                heading: player.heading || 0,
                vehicle: player.vehicle || null,
                wanted: player.wanted || false,
                admin: player.admin || false,
                health: player.health || 100,
                armor: player.armor || 0
            }));
        }
        
        res.json({
            success: true,
            players,
            count: players.length,
            timestamp: Date.now()
        });
        
    } catch (error) {
        req.app.locals.logger.error('Get player positions error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get player positions'
        });
    }
});

// Get player history
router.get('/:id/history', async (req, res) => {
    try {
        const playerId = req.params.id;
        
        // Get admin logs for this player
        const logs = await database.query(
            `SELECT 
                action,
                admin_name,
                reason,
                created_at
            FROM admin_logs
            WHERE target_id = ?
            ORDER BY created_at DESC
            LIMIT 50`,
            [playerId]
        );
        
        // Get bans
        const bans = await database.query(
            `SELECT 
                reason,
                banned_by,
                banned_at,
                expires_at,
                is_active
            FROM bans
            WHERE user_id = ?
            ORDER BY banned_at DESC
            LIMIT 10`,
            [playerId]
        );
        
        // Get reports
        const reports = await database.query(
            `SELECT 
                id,
                reporter_name,
                reason,
                status,
                created_at
            FROM reports
            WHERE reported_id = ?
            ORDER BY created_at DESC
            LIMIT 10`,
            [playerId]
        );
        
        res.json({
            success: true,
            history: {
                logs,
                bans,
                reports
            }
        });
        
    } catch (error) {
        req.app.locals.logger.error('Get player history error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get player history'
        });
    }
});

// Get player stats
router.get('/:id/stats', async (req, res) => {
    try {
        const playerId = req.params.id;
        
        const stats = await database.query(
            `SELECT 
                ps.*,
                u.username,
                c.level,
                c.money,
                c.bank_balance,
                c.job,
                c.playtime,
                (SELECT COUNT(*) FROM player_achievements WHERE player_id = u.id) as achievements_unlocked,
                (SELECT COUNT(*) FROM reports WHERE reported_id = u.id AND status = 'resolved') as warnings_received
            FROM users u
            LEFT JOIN characters c ON c.user_id = u.id
            LEFT JOIN player_stats ps ON ps.player_id = u.id
            WHERE u.id = ?`,
            [playerId]
        );
        
        if (stats.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }
        
        res.json({
            success: true,
            stats: stats[0]
        });
        
    } catch (error) {
        req.app.locals.logger.error('Get player stats error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get player stats'
        });
    }
});

module.exports = router;
