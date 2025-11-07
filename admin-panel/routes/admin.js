/**
 * Admin Action Routes
 * Handles admin commands (kick, ban, freeze, heal, etc.)
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

// Kick player
router.post('/kick', async (req, res) => {
    try {
        const { playerId, reason } = req.body;
        
        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: 'Player ID is required'
            });
        }
        
        const adminId = req.session.adminId;
        const adminName = req.session.username;
        
        // Log action
        await database.query(
            `INSERT INTO admin_logs (admin_id, admin_name, action, target_id, reason, ip_address)
             VALUES (?, ?, 'kick', ?, ?, ?)`,
            [adminId, adminName, playerId, reason || 'No reason provided', req.ip]
        );
        
        // Send command to game server via WebSocket bridge
        const wsBridge = req.app.get('wsBridge');
        if (wsBridge) {
            wsBridge.sendToGameServer({
                type: 'kickPlayer',
                playerId: parseInt(playerId),
                reason: reason || 'Kicked by admin',
                adminName
            });
        }
        
        res.json({
            success: true,
            message: 'Player kicked successfully'
        });
        
    } catch (error) {
        req.app.locals.logger.error('Kick player error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to kick player'
        });
    }
});

// Ban player
router.post('/ban', async (req, res) => {
    try {
        const { playerId, reason, duration } = req.body;
        
        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: 'Player ID is required'
            });
        }
        
        const adminId = req.session.adminId;
        const adminName = req.session.username;
        
        // Get player info
        const players = await database.query(
            'SELECT username, social_club, ip_address FROM users WHERE id = ?',
            [playerId]
        );
        
        if (players.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }
        
        const player = players[0];
        const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
        
        // Create ban record
        await database.query(
            `INSERT INTO bans (user_id, username, social_club, ip_address, reason, banned_by, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [playerId, player.username, player.social_club, player.ip_address, reason || 'Banned by admin', adminName, expiresAt]
        );
        
        // Log action
        await database.query(
            `INSERT INTO admin_logs (admin_id, admin_name, action, target_id, target_name, reason, ip_address)
             VALUES (?, ?, 'ban', ?, ?, ?, ?)`,
            [adminId, adminName, playerId, player.username, reason || 'No reason provided', req.ip]
        );
        
        // Send command to game server
        const wsBridge = req.app.get('wsBridge');
        if (wsBridge) {
            wsBridge.sendToGameServer({
                type: 'banPlayer',
                playerId: parseInt(playerId),
                reason: reason || 'Banned by admin',
                adminName
            });
        }
        
        res.json({
            success: true,
            message: 'Player banned successfully'
        });
        
    } catch (error) {
        req.app.locals.logger.error('Ban player error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to ban player'
        });
    }
});

// Freeze player
router.post('/freeze', async (req, res) => {
    try {
        const { playerId, reason, automated } = req.body;
        
        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: 'Player ID is required'
            });
        }
        
        const adminId = req.session.adminId;
        const adminName = automated ? 'AI System' : req.session.username;
        
        // Log action
        await database.query(
            `INSERT INTO admin_logs (admin_id, admin_name, action, target_id, reason, ip_address)
             VALUES (?, ?, 'freeze', ?, ?, ?)`,
            [adminId || 0, adminName, playerId, reason || 'Frozen by admin', req.ip]
        );
        
        // Send command to game server
        const wsBridge = req.app.get('wsBridge');
        if (wsBridge) {
            wsBridge.sendToGameServer({
                type: 'freezePlayer',
                playerId: parseInt(playerId),
                freeze: true,
                adminName
            });
        }
        
        res.json({
            success: true,
            message: 'Player frozen successfully'
        });
        
    } catch (error) {
        req.app.locals.logger.error('Freeze player error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to freeze player'
        });
    }
});

// Heal player
router.post('/heal', async (req, res) => {
    try {
        const { playerId } = req.body;
        
        if (!playerId) {
            return res.status(400).json({
                success: false,
                message: 'Player ID is required'
            });
        }
        
        const adminId = req.session.adminId;
        const adminName = req.session.username;
        
        // Log action
        await database.query(
            `INSERT INTO admin_logs (admin_id, admin_name, action, target_id, ip_address)
             VALUES (?, ?, 'heal', ?, ?)`,
            [adminId, adminName, playerId, req.ip]
        );
        
        // Send command to game server
        const wsBridge = req.app.get('wsBridge');
        if (wsBridge) {
            wsBridge.sendToGameServer({
                type: 'healPlayer',
                playerId: parseInt(playerId),
                adminName
            });
        }
        
        res.json({
            success: true,
            message: 'Player healed successfully'
        });
        
    } catch (error) {
        req.app.locals.logger.error('Heal player error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to heal player'
        });
    }
});

// Teleport to player
router.post('/teleport', async (req, res) => {
    try {
        const { targetId } = req.body;
        
        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: 'Target ID is required'
            });
        }
        
        const adminId = req.session.adminId;
        const adminName = req.session.username;
        
        // Log action
        await database.query(
            `INSERT INTO admin_logs (admin_id, admin_name, action, target_id, ip_address)
             VALUES (?, ?, 'teleport', ?, ?)`,
            [adminId, adminName, targetId, req.ip]
        );
        
        // Send command to game server
        const wsBridge = req.app.get('wsBridge');
        if (wsBridge) {
            wsBridge.sendToGameServer({
                type: 'teleportToPlayer',
                adminId: parseInt(adminId),
                targetId: parseInt(targetId),
                adminName
            });
        }
        
        res.json({
            success: true,
            message: 'Teleported successfully'
        });
        
    } catch (error) {
        req.app.locals.logger.error('Teleport error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to teleport'
        });
    }
});

// Search (global)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({
                success: true,
                results: []
            });
        }
        
        const searchTerm = `%${q}%`;
        const results = [];
        
        // Search players
        const players = await database.query(
            'SELECT id, username FROM users WHERE username LIKE ? LIMIT 5',
            [searchTerm]
        );
        
        players.forEach(player => {
            results.push({
                type: 'player',
                id: player.id,
                title: player.username,
                subtitle: `Player ID: ${player.id}`
            });
        });
        
        // Search reports
        const reports = await database.query(
            'SELECT id, reporter_name, reported_name FROM reports WHERE reporter_name LIKE ? OR reported_name LIKE ? LIMIT 5',
            [searchTerm, searchTerm]
        );
        
        reports.forEach(report => {
            results.push({
                type: 'report',
                id: report.id,
                title: `Report #${report.id}`,
                subtitle: `${report.reporter_name} reported ${report.reported_name}`
            });
        });
        
        // Search bans
        const bans = await database.query(
            'SELECT id, username, reason FROM bans WHERE username LIKE ? OR reason LIKE ? LIMIT 5',
            [searchTerm, searchTerm]
        );
        
        bans.forEach(ban => {
            results.push({
                type: 'ban',
                id: ban.id,
                title: ban.username,
                subtitle: `Ban: ${ban.reason}`
            });
        });
        
        res.json({
            success: true,
            results
        });
        
    } catch (error) {
        req.app.locals.logger.error('Search error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

module.exports = router;
