/**
 * Logs Routes
 * Server logs and console output
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// In-memory log storage (in production, use file-based logging)
let logBuffer = [];
const MAX_LOGS = 1000;

// Add log entry (called from server)
function addLog(type, message) {
    logBuffer.push({
        type,
        message,
        timestamp: new Date().toISOString()
    });

    // Keep only last MAX_LOGS entries
    if (logBuffer.length > MAX_LOGS) {
        logBuffer = logBuffer.slice(-MAX_LOGS);
    }
}

// Get logs
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const type = req.query.type; // info, error, warning

    let logs = logBuffer;

    if (type) {
        logs = logs.filter(log => log.type === type);
    }

    // Get last N logs
    logs = logs.slice(-limit).reverse();

    res.json({ success: true, logs });
});

// Clear logs
router.delete('/', (req, res) => {
    logBuffer = [];
    res.json({ success: true, message: 'Logs cleared' });
});

// Get server console output (if available)
router.get('/console', (req, res) => {
    try {
        // This would read from actual log files in production
        res.json({
            success: true,
            console: logBuffer.slice(-50).reverse()
        });

    } catch (error) {
        console.error('[Logs] Console error:', error);
        res.status(500).json({ error: 'Failed to fetch console output' });
    }
});

// Export addLog function
module.exports = router;
module.exports.addLog = addLog;
