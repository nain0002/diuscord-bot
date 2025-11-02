const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const playerRepository = (db) => {
  const getByUsername = (username) =>
    db.prepare('SELECT * FROM players WHERE LOWER(username) = LOWER(?)').get(username);

  const getById = (id) => db.prepare('SELECT * FROM players WHERE id = ?').get(id);

  const getAll = () => db.prepare('SELECT * FROM players ORDER BY created_at DESC').all();

  const create = ({ username, passwordHash, email, socialClub, role }) => {
    const now = new Date().toISOString();
    const id = nanoid();
    db.prepare(
      `INSERT INTO players (id, username, password_hash, email, social_club, role, cash, bank, level, status, created_at, updated_at)
       VALUES (@id, @username, @password_hash, @email, @social_club, @role, @cash, @bank, @level, @status, @created_at, @updated_at)`
    ).run({
      id,
      username,
      password_hash: passwordHash,
      email: email || null,
      social_club: socialClub || null,
      role: role || 'player',
      cash: 500,
      bank: 0,
      level: 1,
      status: 'active',
      created_at: now,
      updated_at: now
    });
    return getById(id);
  };

  const updateLastLogin = (id) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE players SET last_login = ?, updated_at = ? WHERE id = ?').run(now, now, id);
  };

  const updatePosition = (id, position) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE players SET last_position = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(position), now, id);
  };

  const updateFinancials = (id, { cash, bank }) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE players SET cash = ?, bank = ?, updated_at = ? WHERE id = ?').run(cash, bank, now, id);
  };

  const promote = (id, role) => {
    const now = new Date().toISOString();
    db.prepare('UPDATE players SET role = ?, updated_at = ? WHERE id = ?').run(role, now, id);
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
