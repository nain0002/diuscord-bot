/**
 * Inventory Management Routes
 * Admin panel routes for managing player inventories
 */

const express = require('express');
const router = express.Router();
const database = require('../../packages/rp-server/modules/database');

// Get player inventory
router.get('/:characterId', async (req, res) => {
    try {
        const { characterId } = req.params;
        
        const inventory = await database.query(
            'SELECT i.*, c.char_name, c.char_surname FROM inventory i ' +
            'JOIN characters c ON i.character_id = c.id ' +
            'WHERE i.character_id = ? ' +
            'ORDER BY i.item_type, i.item_name',
            [characterId]
        );
        
        res.json({ success: true, inventory });
    } catch (error) {
        console.error('[Inventory] Error getting inventory:', error);
        res.status(500).json({ error: 'Failed to get inventory' });
    }
});

// Get all inventories
router.get('/', async (req, res) => {
    try {
        const inventories = await database.query(
            'SELECT i.id, i.character_id, c.char_name, c.char_surname, ' +
            'i.item_name, i.item_type, i.quantity, i.data ' +
            'FROM inventory i ' +
            'JOIN characters c ON i.character_id = c.id ' +
            'ORDER BY c.char_name, i.item_type, i.item_name'
        );
        
        res.json({ success: true, inventories });
    } catch (error) {
        console.error('[Inventory] Error getting inventories:', error);
        res.status(500).json({ error: 'Failed to get inventories' });
    }
});

// Add item to inventory
router.post('/add', async (req, res) => {
    try {
        const { characterId, itemName, itemType, quantity } = req.body;
        
        if (!characterId || !itemName || !itemType || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if item exists
        const existing = await database.query(
            'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
            [characterId, itemName]
        );
        
        if (existing.length > 0) {
            // Update quantity
            await database.query(
                'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            // Insert new item
            await database.query(
                'INSERT INTO inventory (character_id, item_name, item_type, quantity) VALUES (?, ?, ?, ?)',
                [characterId, itemName, itemType, quantity]
            );
        }
        
        res.json({ success: true, message: `Added ${quantity}x ${itemName}` });
    } catch (error) {
        console.error('[Inventory] Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Remove item from inventory
router.post('/remove', async (req, res) => {
    try {
        const { inventoryId, quantity } = req.body;
        
        if (!inventoryId) {
            return res.status(400).json({ error: 'Missing inventory ID' });
        }
        
        // Get item
        const items = await database.query(
            'SELECT * FROM inventory WHERE id = ?',
            [inventoryId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = items[0];
        const removeQty = quantity || item.quantity;
        
        if (item.quantity <= removeQty) {
            // Delete item
            await database.query('DELETE FROM inventory WHERE id = ?', [inventoryId]);
        } else {
            // Update quantity
            await database.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
                [removeQty, inventoryId]
            );
        }
        
        res.json({ success: true, message: 'Item removed successfully' });
    } catch (error) {
        console.error('[Inventory] Error removing item:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// Clear inventory
router.post('/clear/:characterId', async (req, res) => {
    try {
        const { characterId } = req.params;
        
        await database.query('DELETE FROM inventory WHERE character_id = ?', [characterId]);
        
        res.json({ success: true, message: 'Inventory cleared' });
    } catch (error) {
        console.error('[Inventory] Error clearing inventory:', error);
        res.status(500).json({ error: 'Failed to clear inventory' });
    }
});

module.exports = router;
