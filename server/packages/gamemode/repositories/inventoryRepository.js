const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const inventoryRepository = (db) => {
  const getByPlayerId = (playerId) =>
    db.prepare('SELECT * FROM inventories WHERE player_id = ?').get(playerId);

  const createForPlayer = (playerId, capacity = 20) => {
    const id = nanoid();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO inventories (id, player_id, capacity, created_at)
       VALUES (@id, @player_id, @capacity, @created_at)`
    ).run({
      id,
      player_id: playerId,
      capacity,
      created_at: now
    });
    return getByPlayerId(playerId);
  };

  const listItems = (inventoryId) =>
    db
      .prepare('SELECT * FROM inventory_items WHERE inventory_id = ? ORDER BY created_at ASC')
      .all(inventoryId)
      .map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        stackable: Boolean(item.stackable),
        metadata: item.metadata ? JSON.parse(item.metadata) : null
      }));

  const addItem = ({ inventoryId, itemCode, label, quantity, stackable, metadata }) => {
    const now = new Date().toISOString();
    const existing = db
      .prepare(
        'SELECT * FROM inventory_items WHERE inventory_id = ? AND item_code = ? AND stackable = 1'
      )
      .get(inventoryId, itemCode);

    if (existing && stackable) {
      db.prepare('UPDATE inventory_items SET quantity = quantity + ?, updated_at = ? WHERE id = ?').run(
        quantity,
        now,
        existing.id
      );
      return getItemById(existing.id);
    }

    const id = nanoid();
    db.prepare(
      `INSERT INTO inventory_items (id, inventory_id, item_code, label, quantity, stackable, metadata, created_at, updated_at)
       VALUES (@id, @inventory_id, @item_code, @label, @quantity, @stackable, @metadata, @created_at, @updated_at)`
    ).run({
      id,
      inventory_id: inventoryId,
      item_code: itemCode,
      label,
      quantity,
      stackable: stackable ? 1 : 0,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_at: now,
      updated_at: now
    });
    return getItemById(id);
  };

  const getItemById = (id) => {
    const item = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
    if (!item) return null;
    return {
      ...item,
      quantity: Number(item.quantity),
      stackable: Boolean(item.stackable),
      metadata: item.metadata ? JSON.parse(item.metadata) : null
    };
  };

  const updateItemQuantity = (id, quantity) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE inventory_items SET quantity = ?, updated_at = ? WHERE id = ?').run(quantity, now, id);
  };

  const removeItem = (id) => {
    db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
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
