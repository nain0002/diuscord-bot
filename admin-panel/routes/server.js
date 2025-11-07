/**
 * Server Routes
 * Server control and management
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get server status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: {
            running: true, // Would check actual server process
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0'
        }
    });
});

// Get server configuration
router.get('/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, '../../conf.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        res.json({ success: true, config });

    } catch (error) {
        console.error('[Server] Config error:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Update server configuration
router.post('/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, '../../conf.json');
        const newConfig = req.body;

        // Validate configuration
        if (!newConfig.maxplayers || !newConfig.port) {
            return res.status(400).json({ error: 'Invalid configuration' });
        }

        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));

        res.json({ success: true, message: 'Configuration updated. Restart server to apply changes.' });

    } catch (error) {
        console.error('[Server] Config update error:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Execute server command
router.post('/command', (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command required' });
        }

        // Emit command to RAGE:MP server via WebSocket or IPC
        const io = req.app.get('io');
        io.to('admins').emit('serverCommand', { command });

        res.json({ success: true, message: 'Command executed' });

    } catch (error) {
        console.error('[Server] Command error:', error);
        res.status(500).json({ error: 'Failed to execute command' });
    }
});

// Get server resources
router.get('/resources', (req, res) => {
    try {
        const packagesPath = path.join(__dirname, '../../packages');
        const clientPackagesPath = path.join(__dirname, '../../client_packages');

        const serverPackages = fs.readdirSync(packagesPath).filter(f => 
            fs.statSync(path.join(packagesPath, f)).isDirectory()
        );

        const clientPackages = fs.readdirSync(clientPackagesPath).filter(f => 
            fs.statSync(path.join(clientPackagesPath, f)).isDirectory()
        );

        res.json({
            success: true,
            resources: {
                server: serverPackages,
                client: clientPackages
            }
        });

    } catch (error) {
        console.error('[Server] Resources error:', error);
        res.status(500).json({ error: 'Failed to list resources' });
    }
});

// Restart server (placeholder - would need proper implementation)
router.post('/restart', (req, res) => {
    res.json({
        success: true,
        message: 'Server restart initiated (requires server-side integration)'
    });
});

module.exports = router;
