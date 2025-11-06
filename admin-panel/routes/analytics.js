// Analytics & Statistics Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Server performance stats
router.get('/performance', async (req, res) => {
    try {
        const stats = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('[Analytics] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Player activity trends
router.get('/activity', async (req, res) => {
    try {
        const daily = await db.query(`
            SELECT 
                DATE(session_start) as date,
                COUNT(DISTINCT user_id) as unique_players,
                COUNT(*) as total_sessions,
                SUM(duration_minutes) as total_playtime
            FROM player_sessions
            WHERE session_start >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(session_start)
            ORDER BY date DESC
        `);
        
        const hourly = await db.query(`
            SELECT 
                HOUR(session_start) as hour,
                COUNT(*) as sessions
            FROM player_sessions
            WHERE session_start >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY HOUR(session_start)
            ORDER BY hour
        `);
        
        res.json({ success: true, daily: daily || [], hourly: hourly || [] });
    } catch (error) {
        console.error('[Analytics] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Popular jobs
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await db.query(`
            SELECT 
                job,
                COUNT(*) as player_count,
                AVG(job_rank) as avg_rank
            FROM characters
            WHERE job != 'unemployed'
            GROUP BY job
            ORDER BY player_count DESC
        `);
        
        res.json({ success: true, jobs: jobs || [] });
    } catch (error) {
        console.error('[Analytics] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Achievement statistics
router.get('/achievements', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                a.name,
                a.category,
                a.points,
                COUNT(pa.id) as unlocked_count,
                (SELECT COUNT(*) FROM characters) as total_players,
                ROUND((COUNT(pa.id) * 100.0 / (SELECT COUNT(*) FROM characters)), 2) as unlock_percentage
            FROM achievements a
            LEFT JOIN player_achievements pa ON a.id = pa.achievement_id
            GROUP BY a.id, a.name, a.category, a.points
            ORDER BY unlocked_count DESC
        `);
        
        res.json({ success: true, achievements: stats || [] });
    } catch (error) {
        console.error('[Analytics] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Leaderboards
router.get('/leaderboards', async (req, res) => {
    try {
        const richest = await db.query(`
            SELECT first_name, last_name, (money + bank_balance) as wealth
            FROM characters
            ORDER BY wealth DESC
            LIMIT 10
        `);
        
        const mostActive = await db.query(`
            SELECT c.first_name, c.last_name, c.playtime
            FROM characters c
            ORDER BY c.playtime DESC
            LIMIT 10
        `);
        
        const topLevel = await db.query(`
            SELECT first_name, last_name, level, experience
            FROM characters
            ORDER BY level DESC, experience DESC
            LIMIT 10
        `);
        
        res.json({ 
            success: true, 
            richest: richest || [],
            mostActive: mostActive || [],
            topLevel: topLevel || []
        });
    } catch (error) {
        console.error('[Analytics] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
