const { generateId } = require('../utils/id');

const chatRepository = (pool) => {
  const logMessage = async ({ playerId, message, channel }) => {
    const id = generateId(16);
    await pool.query(
      `INSERT INTO chat_messages (id, player_id, message, channel, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, playerId || null, message, channel || 'global']
    );
    return { id, playerId, message, channel: channel || 'global', created_at: new Date().toISOString() };
  };

  const getRecent = async (limit = 50) => {
    const [rows] = await pool.query(
      `SELECT chat_messages.*, players.username
         FROM chat_messages
         LEFT JOIN players ON chat_messages.player_id = players.id
         ORDER BY chat_messages.created_at DESC
         LIMIT ?`,
      [limit]
    );
    return rows;
  };

  return {
    logMessage,
    getRecent
  };
};

module.exports = chatRepository;
