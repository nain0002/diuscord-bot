/**
 * Jobs Module
 * Handles job system (taxi, delivery, trucker, etc.)
 */

const database = require('./database');
const playerModule = require('./player');

// Job definitions
const jobs = {
    taxi: {
        name: 'Taxi Driver',
        description: 'Transport passengers around the city',
        minSalary: 100,
        maxSalary: 500,
        position: { x: 894.9, y: -179.3, z: 74.7 },
        blipSprite: 56,
        blipColor: 5,
        vehicle: 'taxi'
    },
    delivery: {
        name: 'Delivery Driver',
        description: 'Deliver packages to various locations',
        minSalary: 150,
        maxSalary: 600,
        position: { x: 78.3, y: 112.5, z: 81.2 },
        blipSprite: 67,
        blipColor: 17,
        vehicle: 'boxville'
    },
    trucker: {
        name: 'Trucker',
        description: 'Transport goods across San Andreas',
        minSalary: 200,
        maxSalary: 800,
        position: { x: 1240.4, y: -3257.2, z: 6.0 },
        blipSprite: 67,
        blipColor: 43,
        vehicle: 'phantom'
    },
    garbage: {
        name: 'Garbage Collector',
        description: 'Collect trash from around the city',
        minSalary: 120,
        maxSalary: 450,
        position: { x: -354.0, y: -1513.5, z: 27.7 },
        blipSprite: 318,
        blipColor: 2,
        vehicle: 'trash'
    },
    bus: {
        name: 'Bus Driver',
        description: 'Drive city bus routes',
        minSalary: 130,
        maxSalary: 500,
        position: { x: 453.3, y: -602.3, z: 28.6 },
        blipSprite: 513,
        blipColor: 26,
        vehicle: 'bus'
    },
    mechanic: {
        name: 'Mechanic',
        description: 'Repair and modify vehicles',
        minSalary: 180,
        maxSalary: 700,
        position: { x: -347.3, y: -133.0, z: 39.0 },
        blipSprite: 446,
        blipColor: 5,
        vehicle: 'towtruck'
    },
    police: {
        name: 'Police Officer',
        description: 'Serve and protect the city',
        minSalary: 300,
        maxSalary: 1200,
        position: { x: 441.0, y: -982.0, z: 30.7 },
        blipSprite: 60,
        blipColor: 29,
        vehicle: 'police'
    },
    medic: {
        name: 'Paramedic',
        description: 'Provide medical assistance',
        minSalary: 250,
        maxSalary: 1000,
        position: { x: 341.0, y: -580.0, z: 28.8 },
        blipSprite: 61,
        blipColor: 1,
        vehicle: 'ambulance'
    },
    miner: {
        name: 'Miner',
        description: 'Extract valuable resources from mines',
        minSalary: 150,
        maxSalary: 600,
        position: { x: 2832.0, y: 2797.5, z: 57.5 },
        blipSprite: 478,
        blipColor: 5,
        vehicle: null
    },
    lumberjack: {
        name: 'Lumberjack',
        description: 'Cut and transport lumber',
        minSalary: 140,
        maxSalary: 550,
        position: { x: -550.0, y: 5326.0, z: 74.5 },
        blipSprite: 1,
        blipColor: 2,
        vehicle: 'sadler'
    }
};

// Active job data for players
const activeJobs = new Map();

// Initialize jobs
async function initJobs() {
    try {
        const existing = await database.query('SELECT COUNT(*) as count FROM jobs');
        
        if (existing[0].count === 0) {
            for (const [key, job] of Object.entries(jobs)) {
                await database.query(
                    'INSERT INTO jobs (name, description, min_salary, max_salary, position_x, position_y, position_z, blip_sprite, blip_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [job.name, job.description, job.minSalary, job.maxSalary, 
                     job.position.x, job.position.y, job.position.z, 
                     job.blipSprite, job.blipColor]
                );
            }
            console.log('[Jobs] Initialized all job locations');
        }
    } catch (error) {
        console.error('[Jobs] Error initializing jobs:', error);
    }
}

// Send job locations to client
mp.events.add('playerReady', (player) => {
    const jobLocations = [];
    for (const [key, job] of Object.entries(jobs)) {
        jobLocations.push({
            id: key,
            ...job
        });
    }
    player.call('client:initJobLocations', [JSON.stringify(jobLocations)]);
});

// Start job
mp.events.add('server:startJob', async (player, jobId) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        const job = jobs[jobId];
        if (!job) {
            player.outputChatBox('!{#FF0000}Invalid job!');
            return;
        }

        // Check if already on a job
        if (activeJobs.has(player)) {
            player.outputChatBox('!{#FF0000}You are already on a job! Use /quitjob to quit.');
            return;
        }

        // Create job vehicle if needed
        let vehicle = null;
        if (job.vehicle) {
            const pos = player.position;
            const spawnPos = new mp.Vector3(pos.x + 3, pos.y, pos.z);
            vehicle = mp.vehicles.new(mp.joaat(job.vehicle), spawnPos,
                {
                    numberPlate: 'JOB' + Math.floor(Math.random() * 1000),
                    color: [[255, 255, 255], [255, 255, 255]],
                    locked: false,
                    engine: true,
                    dimension: player.dimension
                }
            );
        }

        // Set active job
        activeJobs.set(player, {
            jobId: jobId,
            jobData: job,
            vehicle: vehicle,
            completed: 0,
            earnings: 0
        });

        player.outputChatBox(`!{#00FF00}You started working as a ${job.name}!`);
        player.outputChatBox(`!{#FFFF00}Use /quitjob to stop working.`);
        
        // Start job task
        player.call('client:startJobTask', [jobId, JSON.stringify(job)]);

        console.log(`[Jobs] ${player.name} started job: ${job.name}`);

    } catch (error) {
        console.error('[Jobs] Error starting job:', error);
    }
});

// Complete job task
mp.events.add('server:completeJobTask', async (player) => {
    try {
        const data = playerModule.getPlayerData(player);
        if (!data || !data.characterId) return;

        const jobData = activeJobs.get(player);
        if (!jobData) {
            player.outputChatBox('!{#FF0000}You are not on a job!');
            return;
        }

        // Calculate payment
        const payment = Math.floor(
            Math.random() * (jobData.jobData.maxSalary - jobData.jobData.minSalary) + 
            jobData.jobData.minSalary
        );

        // Give money
        playerModule.giveMoney(player, payment);

        // Update stats
        jobData.completed++;
        jobData.earnings += payment;

        player.outputChatBox(`!{#00FF00}Job completed! You earned $${payment.toLocaleString()}`);
        player.outputChatBox(`!{#FFFF00}Total earnings: $${jobData.earnings.toLocaleString()} | Completed: ${jobData.completed}`);

        // Continue job
        player.call('client:startJobTask', [jobData.jobId, JSON.stringify(jobData.jobData)]);

        console.log(`[Jobs] ${player.name} completed task, earned $${payment}`);

    } catch (error) {
        console.error('[Jobs] Error completing task:', error);
    }
});

// Quit job
mp.events.add('server:quitJob', (player) => {
    const jobData = activeJobs.get(player);
    
    if (!jobData) {
        player.outputChatBox('!{#FF0000}You are not on a job!');
        return;
    }

    // Destroy job vehicle
    if (jobData.vehicle) {
        jobData.vehicle.destroy();
    }

    player.outputChatBox(`!{#FFFF00}You quit your job as ${jobData.jobData.name}`);
    player.outputChatBox(`!{#00FF00}Total earnings: $${jobData.earnings.toLocaleString()} | Completed: ${jobData.completed}`);
    
    activeJobs.delete(player);
    player.call('client:stopJobTask');

    console.log(`[Jobs] ${player.name} quit job: ${jobData.jobData.name}`);
});

// Command: /quitjob
mp.events.addCommand('quitjob', (player) => {
    mp.events.call('server:quitJob', player);
});

// Command: /job
mp.events.addCommand('job', (player) => {
    const jobData = activeJobs.get(player);
    
    if (!jobData) {
        player.outputChatBox('!{#FF0000}You are not on a job!');
        player.outputChatBox('!{#FFFF00}Visit a job location to start working.');
        return;
    }

    player.outputChatBox(`!{#00FF00}Current Job: ${jobData.jobData.name}`);
    player.outputChatBox(`!{#FFFF00}Tasks Completed: ${jobData.completed}`);
    player.outputChatBox(`!{#FFFF00}Total Earnings: $${jobData.earnings.toLocaleString()}`);
});

// Clean up on player quit
mp.events.add('playerQuit', (player) => {
    const jobData = activeJobs.get(player);
    
    if (jobData && jobData.vehicle) {
        jobData.vehicle.destroy();
    }
    
    activeJobs.delete(player);
});

// Initialize jobs on server start
setTimeout(() => {
    initJobs();
}, 2000);

console.log('[Jobs] Module loaded');

module.exports = {};
