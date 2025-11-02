const { generateId } = require('../utils/id');

const mapPlayerJob = (row) => {
  if (!row) return null;
  return {
    ...row,
    progress: row.progress != null ? Number(row.progress) : 0,
    payload: row.payload ? JSON.parse(row.payload) : null
  };
};

const jobRepository = (pool) => {
  const getActiveJob = async (playerId) => {
    const [rows] = await pool.query(
      `SELECT * FROM player_jobs WHERE player_id = ? AND status = 'active' LIMIT 1`,
      [playerId]
    );
    return mapPlayerJob(rows[0]);
  };

  const startJob = async ({ playerId, jobCode, payload }) => {
    const active = await getActiveJob(playerId);
    if (active) {
      return mapPlayerJob(active);
    }
    const id = generateId(16);
    await pool.query(
      `INSERT INTO player_jobs (id, player_id, job_code, status, progress, payload, started_at, updated_at)
       VALUES (?, ?, ?, 'active', 0, ?, NOW(), NOW())`,
      [id, playerId, jobCode, payload ? JSON.stringify(payload) : null]
    );
    return getActiveJob(playerId);
  };

  const updateJob = async ({ jobId, progress, status, payload }) => {
    await pool.query(
      `UPDATE player_jobs
         SET progress = ?, status = ?, payload = ?,
             updated_at = NOW(), completed_at = CASE WHEN ? IN ('completed','failed') THEN NOW() ELSE completed_at END
       WHERE id = ?`,
      [
        progress != null ? progress : 0,
        status || 'active',
        payload ? JSON.stringify(payload) : null,
        status || 'active',
        jobId
      ]
    );
    const [rows] = await pool.query('SELECT * FROM player_jobs WHERE id = ? LIMIT 1', [jobId]);
    return mapPlayerJob(rows[0]);
  };

  const clearActiveJobs = async (playerId) => {
    await pool.query(
      `UPDATE player_jobs SET status = 'failed', updated_at = NOW(), completed_at = NOW()
       WHERE player_id = ? AND status = 'active'`,
      [playerId]
    );
  };

  return {
    getActiveJob,
    startJob,
    updateJob,
    clearActiveJobs
  };
};

module.exports = jobRepository;
