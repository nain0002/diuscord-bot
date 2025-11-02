const { generateId } = require('../utils/id');

const mapTerritory = (row) => {
  if (!row) return null;
  return {
    ...row,
    reward_cash: row.reward_cash != null ? Number(row.reward_cash) : 0,
    capture_time: row.capture_time != null ? Number(row.capture_time) : 120
  };
};

const territoryRepository = (pool) => {
  const getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM territories ORDER BY created_at ASC');
    return rows.map(mapTerritory);
  };

  const syncDefinitions = async (definitions) => {
    const existing = await getAll();
    const existingByCode = new Map(existing.map((territory) => [territory.code, territory]));

    for (const def of definitions) {
      const current = existingByCode.get(def.code);
      if (!current) {
        await pool.query(
          `INSERT INTO territories (id, code, name, reward_cash, capture_time, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [generateId(16), def.code, def.name, def.rewardCash || 0, def.captureTime || 120]
        );
      } else {
        await pool.query(
          `UPDATE territories
             SET name = ?, reward_cash = ?, capture_time = ?, updated_at = NOW()
           WHERE code = ?`,
          [def.name, def.rewardCash || 0, def.captureTime || 120, def.code]
        );
      }
    }
  };

  const getByCode = async (code) => {
    const [rows] = await pool.query('SELECT * FROM territories WHERE code = ? LIMIT 1', [code]);
    return mapTerritory(rows[0]);
  };

  const updateOwner = async ({ code, playerId, playerName }) => {
    await pool.query(
      `UPDATE territories
         SET owner_player_id = ?, owner_name = ?, last_capture_at = NOW(), updated_at = NOW()
       WHERE code = ?`,
      [playerId || null, playerName || null, code]
    );
    const territory = await getByCode(code);

    await pool.query(
      `INSERT INTO territory_control_logs (id, territory_id, winner_player_id, winner_name, reward_cash)
       VALUES (?, ?, ?, ?, ?)`
      , [generateId(16), territory.id, playerId || null, playerName || null, territory.reward_cash || 0]
    );

    return territory;
  };

  return {
    syncDefinitions,
    getAll,
    getByCode,
    updateOwner
  };
};

module.exports = territoryRepository;
