/**
 * Jobs Client Module
 * Handles job UI and task system
 */

let jobMarkers = [];
let jobBlips = [];
let currentJob = null;
let jobCheckpoints = [];

// Initialize job locations
mp.events.add('client:initJobLocations', (jobsJson) => {
    const jobs = JSON.parse(jobsJson);
    
    jobs.forEach(job => {
        // Create marker
        const marker = mp.markers.new(1, new mp.Vector3(job.position.x, job.position.y, job.position.z - 1),
            2.0,
            {
                direction: new mp.Vector3(0, 0, 0),
                rotation: new mp.Vector3(0, 0, 0),
                color: [255, 150, 0, 100],
                visible: true,
                dimension: 0
            }
        );
        marker.jobId = job.id;
        jobMarkers.push(marker);
        
        // Create blip
        const blip = mp.blips.new(job.blipSprite, new mp.Vector3(job.position.x, job.position.y, job.position.z),
            {
                name: job.name,
                scale: 0.8,
                color: job.blipColor,
                alpha: 255,
                drawDistance: 100.0,
                shortRange: true,
                dimension: 0
            }
        );
        jobBlips.push(blip);
    });
});

// Start job task
mp.events.add('client:startJobTask', (jobId, jobDataJson) => {
    const jobData = JSON.parse(jobDataJson);
    currentJob = jobId;
    
    // Create random checkpoint for job task
    const randomPos = getRandomJobLocation(jobId);
    
    // Clear old checkpoints
    jobCheckpoints.forEach(cp => cp.destroy());
    jobCheckpoints = [];
    
    // Create new checkpoint
    const checkpoint = mp.checkpoints.new(1, randomPos, 5.0,
        {
            color: [255, 200, 0, 100],
            visible: true,
            dimension: 0
        }
    );
    jobCheckpoints.push(checkpoint);
    
    // Create blip for checkpoint
    const blip = mp.blips.new(1, randomPos,
        {
            name: 'Job Location',
            scale: 0.8,
            color: 5,
            alpha: 255,
            drawDistance: 500.0,
            shortRange: false,
            dimension: 0
        }
    );
    jobCheckpoints.push(blip);
    
    mp.gui.chat.push('~y~Head to the checkpoint to complete the task!');
});

// Stop job task
mp.events.add('client:stopJobTask', () => {
    currentJob = null;
    jobCheckpoints.forEach(cp => cp.destroy());
    jobCheckpoints = [];
});

// Check if player enters checkpoint
setInterval(() => {
    if (!mp.players.local || !currentJob) return;
    
    const playerPos = mp.players.local.position;
    
    jobCheckpoints.forEach(checkpoint => {
        if (checkpoint.type === 'checkpoint') {
            const dist = mp.game.gameplay.getDistanceBetweenCoords(
                playerPos.x, playerPos.y, playerPos.z,
                checkpoint.position.x, checkpoint.position.y, checkpoint.position.z,
                true
            );
            
            if (dist <= 5.0) {
                mp.events.callRemote('server:completeJobTask');
            }
        }
    });
}, 100);

// Check if near job location
setInterval(() => {
    if (!mp.players.local || currentJob) return;
    
    const playerPos = mp.players.local.position;
    
    jobMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.game.graphics.drawText('Press ~g~E~w~ to start Job', [0.5, 0.9],
                {
                    font: 4,
                    color: [255, 255, 255, 255],
                    scale: [0.4, 0.4],
                    outline: true
                }
            );
        }
    });
}, 0);

// E key to start job
mp.keys.bind(0x45, false, () => {
    if (!mp.players.local || currentJob) return;
    
    const playerPos = mp.players.local.position;
    
    jobMarkers.forEach(marker => {
        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            playerPos.x, playerPos.y, playerPos.z,
            marker.position.x, marker.position.y, marker.position.z,
            true
        );
        
        if (dist <= 2.0) {
            mp.events.callRemote('server:startJob', marker.jobId);
        }
    });
});

// Get random job location based on job type
function getRandomJobLocation(jobId) {
    // Predefined locations for different job types
    const locations = {
        taxi: [
            new mp.Vector3(200.0, -1000.0, 29.0),
            new mp.Vector3(-500.0, -800.0, 30.0),
            new mp.Vector3(100.0, 200.0, 109.0),
            new mp.Vector3(-1500.0, -500.0, 50.0)
        ],
        delivery: [
            new mp.Vector3(300.0, -200.0, 60.0),
            new mp.Vector3(-700.0, 500.0, 100.0),
            new mp.Vector3(1000.0, -1500.0, 40.0),
            new mp.Vector3(-1000.0, 300.0, 70.0)
        ],
        trucker: [
            new mp.Vector3(1500.0, 3000.0, 40.0),
            new mp.Vector3(-2000.0, 3000.0, 30.0),
            new mp.Vector3(2500.0, 2500.0, 45.0),
            new mp.Vector3(-1000.0, 4500.0, 200.0)
        ],
        default: [
            new mp.Vector3(0.0, 0.0, 70.0),
            new mp.Vector3(500.0, 500.0, 100.0),
            new mp.Vector3(-500.0, -500.0, 50.0),
            new mp.Vector3(1000.0, -1000.0, 60.0)
        ]
    };
    
    const jobLocations = locations[jobId] || locations.default;
    return jobLocations[Math.floor(Math.random() * jobLocations.length)];
}

console.log('[Client] Jobs module loaded');
