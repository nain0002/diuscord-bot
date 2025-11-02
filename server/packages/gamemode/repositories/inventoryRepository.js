const { generateId } = require('../utils/id');

const createId = () => generateId(16);

const mapInventory = (row) => {
  if (!row) return null;
  return {
    ...row,
    capacity: row.capacity != null ? Number(row.capacity) : 0
  };
};

const mapItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    quantity: item.quantity != null ? Number(item.quantity) : 0,
    stackable: Boolean(item.stackable),
    metadata: item.metadata ? JSON.parse(item.metadata) : null
  };
};

const inventoryRepository = (pool) => {
  const getByPlayerId = async (playerId) => {
    const [rows] = await pool.query('SELECT * FROM inventories WHERE player_id = ? LIMIT 1', [playerId]);
    return mapInventory(rows[0]);
  };

  const createForPlayer = async (playerId, capacity = 20) => {
    const id = createId();
    await pool.query(
      `INSERT INTO inventories (id, player_id, capacity, created_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE capacity = VALUES(capacity)`,
      [id, playerId, capacity]
    );
    return getByPlayerId(playerId);
  };

  const listItems = async (inventoryId) => {
    const [rows] = await pool.query(
      'SELECT * FROM inventory_items WHERE inventory_id = ? ORDER BY created_at ASC',
      [inventoryId]
    );
    return rows.map(mapItem);
  };

  const getItemById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE id = ? LIMIT 1', [id]);
    return mapItem(rows[0]);
  };

  const addItem = async ({ inventoryId, itemCode, label, quantity, stackable, metadata }) => {
    if (stackable) {
      const [existingRows] = await pool.query(
        'SELECT * FROM inventory_items WHERE inventory_id = ? AND item_code = ? AND stackable = 1 LIMIT 1',
        [inventoryId, itemCode]
      );
      const existing = existingRows[0];
      if (existing) {
        await pool.query(
          'UPDATE inventory_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
          [quantity, existing.id]
        );
        return getItemById(existing.id);
      }
    }

    const id = createId();
    await pool.query(
      `INSERT INTO inventory_items
        (id, inventory_id, item_code, label, quantity, stackable, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        inventoryId,
        itemCode,
        label,
        quantity,
        stackable ? 1 : 0,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
    return getItemById(id);
  };

  const updateItemQuantity = async (id, quantity) => {
    await pool.query('UPDATE inventory_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [
      quantity,
      id
    ]);
  };

  const removeItem = async (id) => {
    await pool.query('DELETE FROM inventory_items WHERE id = ?', [id]);
  };

  return {
    getByPlayerId,
    createForPlayer,
    listItems,
    addItem,
    getItemById,
    updateItemQuantity,
    removeItem
  };
};

module.exports = inventoryRepository;
