// Economy Management Routes
const express = require('express');
const router = express.Router();
const db = require('../../packages/rp-server/modules/database');

// Get economy statistics
router.get('/stats', async (req, res) => {
    try {
        const overview = await db.query(`
            SELECT 
                COALESCE(SUM(money), 0) as total_cash,
                COALESCE(SUM(bank_balance), 0) as total_bank,
                COALESCE(SUM(dirty_money), 0) as total_dirty,
                COALESCE(AVG(money), 0) as avg_cash,
                COALESCE(AVG(bank_balance), 0) as avg_bank
            FROM characters
        `);
        
        const richest = await db.query(`
            SELECT id, first_name, last_name, 
                   COALESCE(money, 0) as money, 
                   COALESCE(bank_balance, 0) as bank_balance,
                   (COALESCE(money, 0) + COALESCE(bank_balance, 0)) as total_wealth
            FROM characters
            ORDER BY total_wealth DESC
            LIMIT 10
        `);
        
        const transactions = await db.query(`
            SELECT 
                transaction_type,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total_amount
            FROM economy_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY transaction_type
        `);
        
        res.json({ 
            success: true, 
            overview: overview[0] || { total_cash: 0, total_bank: 0, total_dirty: 0, avg_cash: 0, avg_bank: 0 },
            richest: richest || [],
            transactions: transactions || []
        });
    } catch (error) {
        console.error('[Economy] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get recent transactions
router.get('/transactions', async (req, res) => {
    try {
        const limit = req.query.limit || 100;
        const offset = req.query.offset || 0;
        
        const transactions = await db.query(`
            SELECT el.*, c.first_name, c.last_name
            FROM economy_logs el
            LEFT JOIN characters c ON el.character_id = c.id
            ORDER BY el.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        res.json({ success: true, transactions: transactions || [] });
    } catch (error) {
        console.error('[Economy] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get transaction by character
router.get('/transactions/character/:id', async (req, res) => {
    try {
        const transactions = await db.query(`
            SELECT * FROM economy_logs 
            WHERE character_id = ? 
            ORDER BY created_at DESC 
            LIMIT 100
        `, [req.params.id]);
        
        res.json({ success: true, transactions: transactions || [] });
    } catch (error) {
        console.error('[Economy] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Money distribution chart data
router.get('/distribution', async (req, res) => {
    try {
        const distribution = await db.query(`
            SELECT 
                CASE
                    WHEN (money + bank_balance) < 10000 THEN '0-10k'
                    WHEN (money + bank_balance) < 50000 THEN '10k-50k'
                    WHEN (money + bank_balance) < 100000 THEN '50k-100k'
                    WHEN (money + bank_balance) < 500000 THEN '100k-500k'
                    WHEN (money + bank_balance) < 1000000 THEN '500k-1M'
                    ELSE '1M+'
                END as wealth_range,
                COUNT(*) as count
            FROM characters
            GROUP BY wealth_range
            ORDER BY MIN(money + bank_balance)
        `);
        
        res.json({ success: true, distribution: distribution || [] });
    } catch (error) {
        console.error('[Economy] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
