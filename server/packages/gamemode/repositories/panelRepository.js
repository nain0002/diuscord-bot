const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);

const panelRepository = (db) => {
  const createSession = ({ playerId, token, expiresAt }) => {
    const id = nanoid();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO panel_sessions (id, player_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, playerId, token, expiresAt, now);
    return { id, playerId, token, expires_at: expiresAt, created_at: now };
  };

  const getByToken = (token) =>
    db.prepare('SELECT * FROM panel_sessions WHERE token = ?').get(token);

  const purgeExpired = () => {
    const now = new Date().toISOString();
    db.prepare('DELETE FROM panel_sessions WHERE expires_at <= ?').run(now);
  };

  const deleteByToken = (token) => {
    db.prepare('DELETE FROM panel_sessions WHERE token = ?').run(token);
  };

  return {
    createSession,
    getByToken,
    purgeExpired,
    deleteByToken
  };
};

module.exports = panelRepository;
