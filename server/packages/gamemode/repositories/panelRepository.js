const { generateId } = require('../utils/id');

const panelRepository = (pool) => {
  const createSession = async ({ playerId, token, expiresAt }) => {
    const id = generateId(24);
    await pool.query(
      `INSERT INTO panel_sessions (id, player_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, playerId, token, expiresAt]
    );
    return { id, playerId, token, expires_at: expiresAt, created_at: new Date().toISOString() };
  };

  const getByToken = async (token) => {
    const [rows] = await pool.query('SELECT * FROM panel_sessions WHERE token = ? LIMIT 1', [token]);
    return rows[0] || null;
  };

  const purgeExpired = async () => {
    await pool.query('DELETE FROM panel_sessions WHERE expires_at <= NOW()');
  };

  const deleteByToken = async (token) => {
    await pool.query('DELETE FROM panel_sessions WHERE token = ?', [token]);
  };

  return {
    createSession,
    getByToken,
    purgeExpired,
    deleteByToken
  };
};

module.exports = panelRepository;
