const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const mapPlayer = (row) => {
  if (!row) return null;
  return {
    ...row,
    cash: row.cash != null ? Number(row.cash) : 0,
    bank: row.bank != null ? Number(row.bank) : 0,
    level: row.level != null ? Number(row.level) : 1,
    last_position: row.last_position ? JSON.parse(row.last_position) : null
  };
};

const playerRepository = (pool) => {
  const getByUsername = async (username) => {
    const [rows] = await pool.query(
      'SELECT * FROM players WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [username]
    );
    return mapPlayer(rows[0]);
  };

  const getById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ? LIMIT 1', [id]);
    return mapPlayer(rows[0]);
  };

  const getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY created_at DESC');
    return rows.map(mapPlayer);
  };

  const create = async ({ username, passwordHash, email, socialClub, role }) => {
    const id = nanoid();
    await pool.query(
      `INSERT INTO players
        (id, username, password_hash, email, social_club, role, cash, bank, level, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [
        id,
        username,
        passwordHash,
        email || null,
        socialClub || null,
        role || 'player',
        500,
        0,
        1
      ]
    );
    return getById(id);
  };

  const updateLastLogin = async (id) => {
    await pool.query('UPDATE players SET last_login = NOW(), updated_at = NOW() WHERE id = ?', [id]);
  };

  const updatePosition = async (id, position) => {
    await pool.query('UPDATE players SET last_position = ?, updated_at = NOW() WHERE id = ?', [
      position ? JSON.stringify(position) : null,
      id
    ]);
  };

  const updateFinancials = async (id, { cash, bank }) => {
    await pool.query('UPDATE players SET cash = ?, bank = ?, updated_at = NOW() WHERE id = ?', [
      cash,
      bank,
      id
    ]);
  };

  const promote = async (id, role) => {
    await pool.query('UPDATE players SET role = ?, updated_at = NOW() WHERE id = ?', [role, id]);
  };

  return {
    getByUsername,
    getById,
    getAll,
    create,
    updateLastLogin,
    updatePosition,
    updateFinancials,
    promote
  };
};

module.exports = playerRepository;
