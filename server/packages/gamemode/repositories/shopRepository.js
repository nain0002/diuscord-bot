const { generateId } = require('../utils/id');

const shopRepository = (pool) => {
  const logPurchase = async ({ playerId, shopCode, itemCode, itemLabel, quantity, price }) => {
    await pool.query(
      `INSERT INTO shop_transactions (id, player_id, shop_code, item_code, item_label, quantity, price, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [generateId(16), playerId, shopCode, itemCode, itemLabel, quantity, price]
    );
  };

  const getRecentPurchases = async (playerId, limit = 20) => {
    const [rows] = await pool.query(
      `SELECT * FROM shop_transactions
         WHERE player_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
      [playerId, limit]
    );
    return rows.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
      price: Number(row.price)
    }));
  };

  return {
    logPurchase,
    getRecentPurchases
  };
};

module.exports = shopRepository;
