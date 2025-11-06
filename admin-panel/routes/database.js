/**
 * Database Routes
 * Database management and queries
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// Get database tables
router.get('/tables', async (req, res) => {
    try {
        const tables = await database.query('SHOW TABLES');
        const dbName = process.env.DB_NAME || 'ragemp_server';
        
        const tableList = tables.map(t => t[`Tables_in_${dbName}`]);

        res.json({ success: true, tables: tableList });

    } catch (error) {
        console.error('[Database] Tables error:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// Get table data
router.get('/table/:name', async (req, res) => {
    try {
        const tableName = req.params.name;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Get table structure
        const structure = await database.query(`DESCRIBE ${tableName}`);

        // Get table data
        const data = await database.query(
            `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        // Get total count
        const [{ total }] = await database.query(
            `SELECT COUNT(*) as total FROM ${tableName}`
        );

        res.json({
            success: true,
            table: tableName,
            structure,
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('[Database] Table data error:', error);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
});

// Execute SQL query (dangerous - use with caution!)
router.post('/query', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query required' });
        }

        // Block dangerous queries
        const dangerousKeywords = ['DROP', 'TRUNCATE', 'DELETE FROM users', 'DELETE FROM characters'];
        const upperQuery = query.toUpperCase();
        
        if (dangerousKeywords.some(keyword => upperQuery.includes(keyword))) {
            return res.status(403).json({ error: 'Dangerous query blocked' });
        }

        const result = await database.query(query);

        res.json({ success: true, result });

    } catch (error) {
        console.error('[Database] Query error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Backup database
router.post('/backup', (req, res) => {
    try {
        const { exec } = require('child_process');
        const date = new Date().toISOString().split('T')[0];
        const filename = `backup_${date}.sql`;

        const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filename}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: 'Backup failed' });
            }

            res.json({ success: true, message: 'Backup created', filename });
        });

    } catch (error) {
        console.error('[Database] Backup error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Get database statistics
router.get('/stats', async (req, res) => {
    try {
        const tables = await database.query('SHOW TABLES');
        const dbName = process.env.DB_NAME || 'ragemp_server';
        
        const stats = [];

        for (const table of tables) {
            const tableName = table[`Tables_in_${dbName}`];
            const [{ total }] = await database.query(`SELECT COUNT(*) as total FROM ${tableName}`);
            const [size] = await database.query(
                `SELECT 
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
                FROM information_schema.TABLES
                WHERE table_schema = ? AND table_name = ?`,
                [dbName, tableName]
            );

            stats.push({
                name: tableName,
                rows: total,
                size: size.size_mb || 0
            });
        }

        res.json({ success: true, stats });

    } catch (error) {
        console.error('[Database] Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch database statistics' });
    }
});

module.exports = router;
