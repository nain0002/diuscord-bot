const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const chatRepository = (pool) => {
  const logMessage = async ({ playerId, message, channel }) => {
    const id = nanoid();
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
