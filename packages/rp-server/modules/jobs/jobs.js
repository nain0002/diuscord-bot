// Job System
const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class JobSystem {
    constructor() {
        this.jobs = [];
        this.jobBlips = [];
        this.activeJobs = new Map(); // player -> job data
    }

    // Load all jobs
    async loadJobs() {
        try {
            this.jobs = await db.query('SELECT * FROM jobs');
            console.log(`[Jobs] Loaded ${this.jobs.length} jobs`);

            // Create job locations and blips
            this.createJobLocations();

        } catch (error) {
            console.error('[Jobs] Error loading jobs:', error);
        }
    }

    // Create job locations
    createJobLocations() {
        // Police Station
        this.createJobPoint(
            'Police Officer',
            441.5, -982.0, 30.68,
            60, // Blip sprite
            3  // Blip color
        );

        // Hospital
        this.createJobPoint(
            'Paramedic',
            298.5, -584.5, 43.26,
            61,
            2
        );

        // Mechanic Shop
        this.createJobPoint(
            'Mechanic',
            -337.0, -136.0, 39.0,
            446,
            5
        );

        // Taxi Stand
        this.createJobPoint(
            'Taxi Driver',
            895.5, -179.0, 74.7,
            198,
            5
        );

        // Trucking Depot
        this.createJobPoint(
            'Trucker',
            900.0, -1234.0, 25.0,
            477,
            17
        );

        // Mining Location
        this.createJobPoint(
            'Miner',
            2832.0, 2797.0, 57.0,
            478,
            6
        );

        // Fishing Pier
        this.createJobPoint(
            'Fisher',
            -1816.0, -1193.0, 14.0,
            68,
            38
        );

        // Bus Depot
        this.createJobPoint(
            'Bus Driver',
            453.0, -602.0, 28.0,
            513,
            17
        );
    }

    // Create job point (blip, marker, colshape)
    createJobPoint(jobName, x, y, z, blipSprite, blipColor) {
        // Create blip
        const blip = mp.blips.new(blipSprite, new mp.Vector3(x, y, z), {
            name: `${jobName} Job`,
            color: blipColor,
            shortRange: true
        });
        this.jobBlips.push(blip);

        // Create marker
        mp.markers.new(1, new mp.Vector3(x, y, z - 1), 1.5, {
            color: [0, 255, 0, 100],
            visible: true
        });

        // Create colshape
        const colshape = mp.colshapes.newSphere(x, y, z, 2.0);
        colshape.jobName = jobName;
        colshape.isJobPoint = true;
    }

    // Get job by name
    async getJob(jobName) {
        const jobs = await db.query(
            'SELECT * FROM jobs WHERE name = ?',
            [jobName]
        );
        return jobs.length > 0 ? jobs[0] : null;
    }

    // Get job ranks
    async getJobRanks(jobId) {
        return await db.query(
            'SELECT * FROM job_ranks WHERE job_id = ? ORDER BY rank_level',
            [jobId]
        );
    }

    // Set player job
    async setJob(player, jobName) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        try {
            const job = await this.getJob(jobName);
            if (!job) {
                return { success: false, message: 'Job not found.' };
            }

            // Update character job
            await db.query(
                'UPDATE characters SET job = ?, job_rank = 0 WHERE id = ?',
                [jobName, player.characterId]
            );

            player.characterData.job = jobName;
            player.characterData.job_rank = 0;

            console.log(`[Jobs] ${player.name} became a ${jobName}`);

            return { 
                success: true, 
                message: `You are now a ${jobName}!`
            };

        } catch (error) {
            console.error('[Jobs] Error setting job:', error);
            return { success: false, message: 'Failed to set job.' };
        }
    }

    // Quit job
    async quitJob(player) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        try {
            await db.query(
                'UPDATE characters SET job = \'Unemployed\', job_rank = 0 WHERE id = ?',
                [player.characterId]
            );

            player.characterData.job = 'Unemployed';
            player.characterData.job_rank = 0;

            // Stop active job
            this.activeJobs.delete(player.id);

            return { 
                success: true, 
                message: 'You quit your job.'
            };

        } catch (error) {
            console.error('[Jobs] Error quitting job:', error);
            return { success: false, message: 'Failed to quit job.' };
        }
    }

    // Start job task
    async startJob(player) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        if (player.characterData.job === 'Unemployed') {
            return { success: false, message: 'You need a job first!' };
        }

        if (this.activeJobs.has(player.id)) {
            return { success: false, message: 'You are already working!' };
        }

        // Start job based on type
        const jobName = player.characterData.job;

        switch (jobName) {
            case 'Taxi Driver':
                return this.startTaxiJob(player);
            case 'Trucker':
                return this.startTruckerJob(player);
            case 'Miner':
                return this.startMiningJob(player);
            case 'Fisher':
                return this.startFishingJob(player);
            case 'Bus Driver':
                return this.startBusJob(player);
            default:
                return { success: false, message: 'This job has no tasks yet.' };
        }
    }

    // Taxi job
    startTaxiJob(player) {
        // Random passenger location
        const passengerLocations = [
            { x: -265.0, y: -957.0, z: 31.2 },
            { x: 123.0, y: -1930.0, z: 21.3 },
            { x: 1138.0, y: -982.0, z: 46.4 }
        ];

        const pickup = passengerLocations[Math.floor(Math.random() * passengerLocations.length)];
        const destination = passengerLocations[Math.floor(Math.random() * passengerLocations.length)];

        this.activeJobs.set(player.id, {
            type: 'taxi',
            pickup: pickup,
            destination: destination,
            payment: Math.floor(Math.random() * 100) + 50
        });

        player.call('client:startTaxiJob', [JSON.stringify({ pickup, destination })]);

        return { 
            success: true, 
            message: 'Taxi job started! Pick up the passenger.'
        };
    }

    // Trucker job
    startTruckerJob(player) {
        const deliveryLocations = [
            { x: 1195.0, y: -3253.0, z: 7.0 },
            { x: -67.0, y: -1270.0, z: 29.0 }
        ];

        const delivery = deliveryLocations[Math.floor(Math.random() * deliveryLocations.length)];

        this.activeJobs.set(player.id, {
            type: 'trucker',
            delivery: delivery,
            payment: Math.floor(Math.random() * 200) + 150
        });

        player.call('client:startTruckerJob', [JSON.stringify({ delivery })]);

        return { 
            success: true, 
            message: 'Trucking job started! Deliver the goods.'
        };
    }

    // Mining job
    startMiningJob(player) {
        this.activeJobs.set(player.id, {
            type: 'mining',
            ores: 0,
            maxOres: 10,
            payment: 15
        });

        return { 
            success: true, 
            message: 'Mining started! Mine 10 ores. Use /mine'
        };
    }

    // Fishing job
    startFishingJob(player) {
        this.activeJobs.set(player.id, {
            type: 'fishing',
            fish: 0,
            maxFish: 10,
            payment: 12
        });

        return { 
            success: true, 
            message: 'Fishing started! Catch 10 fish. Use /fish'
        };
    }

    // Bus job
    startBusJob(player) {
        const busStops = [
            { x: 56.0, y: -876.0, z: 30.0 },
            { x: -255.0, y: -716.0, z: 33.0 },
            { x: -533.0, y: -216.0, z: 37.0 }
        ];

        this.activeJobs.set(player.id, {
            type: 'bus',
            stops: busStops,
            currentStop: 0,
            payment: 100
        });

        player.call('client:startBusJob', [JSON.stringify({ stops: busStops })]);

        return { 
            success: true, 
            message: 'Bus route started! Visit all stops.'
        };
    }

    // Complete job
    async completeJob(player) {
        if (!this.activeJobs.has(player.id)) {
            return { success: false, message: 'No active job.' };
        }

        const jobData = this.activeJobs.get(player.id);
        const payment = jobData.payment;

        // Pay player
        await db.query(
            'UPDATE characters SET money = money + ? WHERE id = ?',
            [payment, player.characterId]
        );

        player.characterData.money += payment;

        this.activeJobs.delete(player.id);

        console.log(`[Jobs] ${player.name} completed job and earned ${helpers.formatCurrency(payment)}`);

        return { 
            success: true, 
            message: `Job completed! Earned ${helpers.formatCurrency(payment)}`
        };
    }

    // Pay salary
    async paySalary(player) {
        if (!player.characterId || player.characterData.job === 'Unemployed') {
            return;
        }

        try {
            const job = await this.getJob(player.characterData.job);
            if (!job) return;

            const ranks = await this.getJobRanks(job.id);
            const currentRank = ranks.find(r => r.rank_level === player.characterData.job_rank);
            
            const salary = currentRank ? currentRank.salary : job.base_salary;

            await db.query(
                'UPDATE characters SET bank_balance = bank_balance + ? WHERE id = ?',
                [salary, player.characterId]
            );

            player.characterData.bank_balance += salary;

            helpers.sendSuccess(player, `Salary paid: ${helpers.formatCurrency(salary)}`);

        } catch (error) {
            console.error('[Jobs] Error paying salary:', error);
        }
    }
}

module.exports = new JobSystem();
