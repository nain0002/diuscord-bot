const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const activityRepository = (pool) => {
  const log = async ({ type, actorId, payload }) => {
    const id = nanoid();
    await pool.query(
      `INSERT INTO activity_logs (id, type, actor_id, payload, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, type, actorId || null, payload ? JSON.stringify(payload) : null]
    );
    return { id, type, actorId, payload, created_at: new Date().toISOString() };
  };

  const list = async (limit = 100) => {
    const [rows] = await pool.query(
      `SELECT activity_logs.*, players.username
         FROM activity_logs
         LEFT JOIN players ON activity_logs.actor_id = players.id
         ORDER BY activity_logs.created_at DESC
         LIMIT ?`,
      [limit]
    );
    return rows.map((entry) => ({
      ...entry,
      payload: entry.payload ? JSON.parse(entry.payload) : null
    }));
  };

  return {
    log,
    list
  };
};

module.exports = activityRepository;
