const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const activityRepository = (db) => {
  const log = ({ type, actorId, payload }) => {
    const now = new Date().toISOString();
    const id = nanoid();
    db.prepare(
      `INSERT INTO activity_logs (id, type, actor_id, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, type, actorId || null, payload ? JSON.stringify(payload) : null, now);
    return { id, type, actorId, payload, created_at: now };
  };

  const list = (limit = 100) =>
    db
      .prepare(
        `SELECT activity_logs.*, players.username
         FROM activity_logs
         LEFT JOIN players ON activity_logs.actor_id = players.id
         ORDER BY activity_logs.created_at DESC
         LIMIT ?`
      )
      .all(limit)
      .map((entry) => ({
        ...entry,
        payload: entry.payload ? JSON.parse(entry.payload) : null
      }));

  return {
    log,
    list
  };
};

module.exports = activityRepository;
