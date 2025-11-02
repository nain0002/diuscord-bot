const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const chatRepository = (db) => {
  const logMessage = ({ playerId, message, channel }) => {
    const now = new Date().toISOString();
    const id = nanoid();
    db.prepare(
      `INSERT INTO chat_messages (id, player_id, message, channel, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, playerId || null, message, channel || 'global', now);
    return { id, playerId, message, channel: channel || 'global', created_at: now };
  };

  const getRecent = (limit = 50) =>
    db
      .prepare(
        `SELECT chat_messages.*, players.username
         FROM chat_messages
         LEFT JOIN players ON chat_messages.player_id = players.id
         ORDER BY chat_messages.created_at DESC
         LIMIT ?`
      )
      .all(limit);

  return {
    logMessage,
    getRecent
  };
};

module.exports = chatRepository;
