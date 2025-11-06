// Vehicle Management Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get vehicle statistics (MUST come BEFORE /:id route)
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_vehicles,
                COUNT(DISTINCT model) as unique_models,
                COUNT(DISTINCT character_id) as total_owners,
                AVG(fuel) as avg_fuel,
                AVG(engine_health) as avg_engine_health
            FROM vehicles
        `);
        
        const topModels = await db.query(`
            SELECT model, COUNT(*) as count
            FROM vehicles
            GROUP BY model
            ORDER BY count DESC
            LIMIT 10
        `);
        
        res.json({ 
            success: true, 
            stats: stats[0] || { total_vehicles: 0, unique_models: 0, total_owners: 0, avg_fuel: 0, avg_engine_health: 0 },
            topModels: topModels || []
        });
    } catch (error) {
        console.error('[Vehicles] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all vehicles
router.get('/', async (req, res) => {
    try {
        const vehicles = await db.query(`
            SELECT v.*, c.first_name, c.last_name, u.username
            FROM vehicles v
            LEFT JOIN characters c ON v.character_id = c.id
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY v.created_at DESC
            LIMIT 500
        `);
        
        res.json({ success: true, vehicles: vehicles || [] });
    } catch (error) {
        console.error('[Vehicles] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
        
        if (!vehicle || vehicle.length === 0) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }
        
        res.json({ success: true, vehicle: vehicle[0] });
    } catch (error) {
        console.error('[Vehicles] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('[Vehicles] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
