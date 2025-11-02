const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const logger = require('../utils/logger');

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    social_club TEXT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    cash INTEGER DEFAULT 500,
    bank INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    role TEXT DEFAULT 'player',
    status TEXT DEFAULT 'active',
    last_position TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS inventories (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    created_at TEXT NOT NULL,
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    inventory_id TEXT NOT NULL,
    item_code TEXT NOT NULL,
    label TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    stackable INTEGER NOT NULL DEFAULT 1,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(inventory_id) REFERENCES inventories(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    player_id TEXT,
    message TEXT NOT NULL,
    channel TEXT DEFAULT 'global',
    created_at TEXT NOT NULL,
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    actor_id TEXT,
    payload TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(actor_id) REFERENCES players(id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS panel_sessions (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
  );`
];

const ensureDefaultAdmin = (db) => {
  const count = db.prepare('SELECT COUNT(*) as total FROM players WHERE role = ?').get('admin');
  if (count.total === 0) {
    const now = new Date().toISOString();
    const adminId = nanoid();
    db.prepare(
      `INSERT INTO players (id, username, password_hash, role, cash, bank, level, status, created_at, updated_at)
       VALUES (@id, @username, @password_hash, @role, @cash, @bank, @level, @status, @created_at, @updated_at)`
    ).run({
      id: adminId,
      username: 'admin',
      password_hash: '$2a$10$7smfrpIEByU9GiddYDBWweoUxF9X5piw4M0raSfa10bK/u96zkRgG', // password: admin123
      role: 'admin',
      cash: 10000,
      bank: 50000,
      level: 10,
      status: 'active',
      created_at: now,
      updated_at: now
    });

    db.prepare(
      `INSERT INTO inventories (id, player_id, capacity, created_at)
       VALUES (@id, @player_id, @capacity, @created_at)`
    ).run({
      id: nanoid(),
      player_id: adminId,
      capacity: 50,
      created_at: now
    });

    logger.info('Default admin user created', { username: 'admin' });
  }
};

const runMigrations = (db) => {
  const transaction = db.transaction(() => {
    createTableStatements.forEach((statement) => db.prepare(statement).run());
  });

  transaction();
  ensureDefaultAdmin(db);
  logger.info('Database migrations completed');
};

module.exports = { runMigrations };
