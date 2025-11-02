const logger = require('../utils/logger');

const buildJobService = ({ config, repositories, eventBus, state }) => {
  const definitions = config.jobs || [];

  const getDefinitions = () => definitions;

  const getJobByCode = (code) => definitions.find((job) => job.code === code);

  const assignJob = async ({ player, account, jobCode }) => {
    const definition = getJobByCode(jobCode);
    if (!definition) {
      return { error: 'JOB_NOT_FOUND' };
    }

    const active = await repositories.jobs.getActiveJob(account.id);
    if (active) {
      return { error: 'JOB_ALREADY_ACTIVE' };
    }

    const playerPos = player.position;
    const start = definition.startPosition;
    const distance = Math.sqrt(
      (playerPos.x - start.x) ** 2 + (playerPos.y - start.y) ** 2 + (playerPos.z - start.z) ** 2
    );
    if (distance > 5) {
      return { error: 'MOVE_CLOSER_TO_JOB_START' };
    }

    const job = await repositories.jobs.startJob({
      playerId: account.id,
      jobCode,
      payload: { routeIndex: 0 }
    });

    logger.info('Job started', { player: account.username, job: jobCode });

    if (eventBus) {
      eventBus.emit('job:start', { player, account, job, definition });
    }

    return { job, definition };
  };

  const completeStage = async ({ player, account, progressIncrement = 1 }) => {
    const active = await repositories.jobs.getActiveJob(account.id);
    if (!active) {
      return { error: 'NO_ACTIVE_JOB' };
    }

    const definition = getJobByCode(active.job_code);
    if (!definition) {
      await repositories.jobs.updateJob({ jobId: active.id, status: 'failed', progress: active.progress });
      return { error: 'JOB_DEFINITION_MISSING' };
    }

    const nextProgress = (active.progress || 0) + progressIncrement;
    const totalStages = definition.route ? definition.route.length : 1;

    if (nextProgress >= totalStages) {
      const updated = await repositories.jobs.updateJob({
        jobId: active.id,
        status: 'completed',
        progress: totalStages,
        payload: { routeIndex: totalStages }
      });

      const newCash = (account.cash || 0) + (definition.payment?.cash || 0);
      const newBank = (account.bank || 0) + (definition.payment?.bank || 0);
      await repositories.players.updateFinancials(account.id, {
        cash: newCash,
        bank: newBank
      });

      if (state) {
        state.updateAccount(player, { ...account, cash: newCash, bank: newBank });
      }

      logger.info('Job completed', { player: account.username, job: definition.code });

      if (eventBus) {
        eventBus.emit('job:completed', { player, account, job: updated, definition });
      }

      return { completed: true, job: updated, definition };
    }

    const payload = { routeIndex: nextProgress };
    const updated = await repositories.jobs.updateJob({
      jobId: active.id,
      status: 'active',
      progress: nextProgress,
      payload
    });

    if (eventBus) {
      eventBus.emit('job:progress', { player, account, job: updated, definition });
    }

    return { completed: false, job: updated, definition };
  };

  const abandonJob = async ({ account }) => {
    if (!account) return;
    await repositories.jobs.clearActiveJobs(account.id);
    if (eventBus) {
      eventBus.emit('job:abandoned', { account });
    }
  };

  return {
    getDefinitions,
    getJobByCode,
    assignJob,
    completeStage,
    abandonJob
  };
};

module.exports = { buildJobService };
