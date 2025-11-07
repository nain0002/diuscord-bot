// Bank Robbery System - Server-Side
// Handles bank heists, ATM robberies, police alerts, and loot

const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class RobberySystem {
    constructor() {
        this.activeRobberies = new Map(); // bankId -> robbery data
        this.robberyCooldowns = new Map(); // bankId -> timestamp
        this.COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes
        this.ROBBERY_DURATION = 5 * 60 * 1000; // 5 minutes
        this.MIN_POLICE = 2; // Minimum police online
    }

    // ==================== BANK ROBBERY ====================

    async startBankRobbery(player, bankId, method = 'Drill') {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        try {
            // Get bank data
            const banks = await db.query(
                'SELECT * FROM bank_locations WHERE id = ?',
                [bankId]
            );

            if (banks.length === 0) {
                return { success: false, message: 'Bank not found' };
            }

            const bank = banks[0];

            // Check if bank is already being robbed
            if (this.activeRobberies.has(bankId)) {
                return { success: false, message: 'Bank robbery already in progress' };
            }

            // Check cooldown
            if (this.robberyCooldowns.has(bankId)) {
                const lastRobbery = this.robberyCooldowns.get(bankId);
                const timeLeft = this.COOLDOWN_TIME - (Date.now() - lastRobbery);
                
                if (timeLeft > 0) {
                    const minutesLeft = Math.ceil(timeLeft / 60000);
                    return { success: false, message: `Bank on cooldown. ${minutesLeft} minutes remaining` };
                }
            }

            // Check if player has robbery tool
            const hasTool = await this.checkRobberyTool(player, method);
            if (!hasTool) {
                return { success: false, message: `You need a ${method} to rob this bank` };
            }

            // Check police count
            const policeCount = this.getOnlinePoliceCount();
            if (policeCount < this.MIN_POLICE) {
                return { success: false, message: `Need at least ${this.MIN_POLICE} police online` };
            }

            // Check security level
            if (bank.security_level > 3 && method === 'Drill') {
                return { success: false, message: 'Security too high for drill. Use explosives or hack' };
            }

            // Calculate potential loot
            const lootAmount = this.calculateLoot(bank, method);

            // Start robbery
            const robberyData = {
                bankId: bankId,
                bankName: bank.name,
                robber: player,
                robberId: player.characterId,
                robberName: player.name,
                method: method,
                participants: [player.id],
                startTime: Date.now(),
                duration: this.ROBBERY_DURATION,
                lootAmount: lootAmount,
                stage: 'drilling', // drilling, vault_open, escaping
                progress: 0,
                policeNotified: false,
                alarmTriggered: false
            };

            this.activeRobberies.set(bankId, robberyData);

            // Activate bank alarm
            await this.activateAlarm(bankId, true);

            // Start robbery timer
            this.startRobberyTimer(robberyData);

            // Notify nearby players
            this.notifyNearbyPlayers(bank, player);

            // Notify police after 30 seconds
            setTimeout(() => {
                this.notifyPolice(robberyData);
            }, 30000);

            console.log(`[Robbery] ${player.name} started robbing ${bank.name} using ${method}`);

            return {
                success: true,
                message: `Robbery started! Get to work!`,
                duration: this.ROBBERY_DURATION / 1000,
                loot: lootAmount
            };

        } catch (error) {
            console.error('[Robbery] Start robbery error:', error);
            return { success: false, message: 'Failed to start robbery' };
        }
    }

    startRobberyTimer(robberyData) {
        const updateInterval = setInterval(() => {
            if (!this.activeRobberies.has(robberyData.bankId)) {
                clearInterval(updateInterval);
                return;
            }

            const robbery = this.activeRobberies.get(robberyData.bankId);
            const elapsed = Date.now() - robbery.startTime;
            robbery.progress = Math.min((elapsed / robbery.duration) * 100, 100);

            // Update stage based on progress
            if (robbery.progress >= 100) {
                robbery.stage = 'vault_open';
                this.completeRobbery(robbery);
                clearInterval(updateInterval);
            } else if (robbery.progress >= 75) {
                robbery.stage = 'vault_opening';
            } else if (robbery.progress >= 50 && !robbery.policeNotified) {
                robbery.policeNotified = true;
            }

            // Broadcast progress to participants
            robbery.participants.forEach(playerId => {
                const player = mp.players.at(playerId);
                if (player && mp.players.exists(player)) {
                    player.call('robbery:updateProgress', [robbery.progress, robbery.stage]);
                }
            });

        }, 1000);
    }

    async completeRobbery(robberyData) {
        try {
            const robber = robberyData.robber;
            
            if (!robber || !mp.players.exists(robber)) {
                await this.logRobbery(robberyData, false, 'Robber disconnected');
                this.activeRobberies.delete(robberyData.bankId);
                return;
            }

            // Check if robber is still at bank
            const bank = await db.query(
                'SELECT * FROM bank_locations WHERE id = ?',
                [robberyData.bankId]
            );

            if (bank.length === 0) return;

            const bankLocation = new mp.Vector3(bank[0].position_x, bank[0].position_y, bank[0].position_z);
            const distance = helpers.getDistance(robber.position, bankLocation);

            if (distance > 50) {
                helpers.sendError(robber, 'You left the bank! Robbery failed!');
                await this.logRobbery(robberyData, false, 'Left the area');
                this.activeRobberies.delete(robberyData.bankId);
                return;
            }

            // Give loot
            const moneyBagSerial = this.generateMoneyBagSerial();
            
            // Add money bag to inventory
            await db.query(
                `INSERT INTO inventory (character_id, item_name, item_type, quantity, slot)
                VALUES (?, 'Money Bag', 'Illegal', 1, ?)`,
                [robber.characterId, await this.findEmptySlot(robber.characterId)]
            );

            // Store serial number for tracking
            await db.query(
                `UPDATE inventory SET description = ? 
                WHERE character_id = ? AND item_name = 'Money Bag' 
                ORDER BY id DESC LIMIT 1`,
                [`Serial: ${moneyBagSerial}, Amount: $${robberyData.lootAmount}`, robber.characterId]
            );

            // Update bank vault
            await db.query(
                'UPDATE bank_locations SET vault_cash = vault_cash - ?, total_robberies = total_robberies + 1, last_robbed = NOW() WHERE id = ?',
                [robberyData.lootAmount, robberyData.bankId]
            );

            // Log successful robbery
            await this.logRobbery(robberyData, true, 'Success');

            // Set cooldown
            this.robberyCooldowns.set(robberyData.bankId, Date.now());

            // Deactivate alarm
            await this.activateAlarm(robberyData.bankId, false);

            // Notify robber
            helpers.sendSuccess(robber, `Robbery successful! You got $${robberyData.lootAmount.toLocaleString()} in a money bag!`);
            robber.call('robbery:complete', [true, robberyData.lootAmount]);

            // Notify police
            this.notifyPoliceSuccess(robberyData);

            console.log(`[Robbery] ${robber.name} successfully robbed ${robberyData.bankName} for $${robberyData.lootAmount}`);

            this.activeRobberies.delete(robberyData.bankId);

        } catch (error) {
            console.error('[Robbery] Complete robbery error:', error);
        }
    }

    async cancelRobbery(bankId, reason = 'Cancelled') {
        if (!this.activeRobberies.has(bankId)) return;

        const robberyData = this.activeRobberies.get(bankId);
        
        // Notify participants
        robberyData.participants.forEach(playerId => {
            const player = mp.players.at(playerId);
            if (player && mp.players.exists(player)) {
                helpers.sendError(player, `Robbery failed: ${reason}`);
                player.call('robbery:failed', [reason]);
            }
        });

        // Log failed robbery
        await this.logRobbery(robberyData, false, reason);

        // Deactivate alarm
        await this.activateAlarm(bankId, false);

        this.activeRobberies.delete(bankId);

        console.log(`[Robbery] Bank ${bankId} robbery cancelled: ${reason}`);
    }

    // ==================== ATM ROBBERY ====================

    async startATMRobbery(player, atmId) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        try {
            // Get ATM data
            const atms = await db.query(
                'SELECT * FROM atm_locations WHERE id = ?',
                [atmId]
            );

            if (atms.length === 0) {
                return { success: false, message: 'ATM not found' };
            }

            const atm = atms[0];

            if (atm.status !== 'Active') {
                return { success: false, message: 'ATM is not operational' };
            }

            // Check if recently robbed
            if (atm.last_robbery) {
                const timeSince = Date.now() - new Date(atm.last_robbery).getTime();
                if (timeSince < 15 * 60 * 1000) { // 15 minutes
                    return { success: false, message: 'ATM was recently robbed' };
                }
            }

            // Check if player has crowbar or explosive
            const hasT tool = await this.hasItem(player.characterId, 'Crowbar') || 
                              await this.hasItem(player.characterId, 'C4');

            if (!hasTool) {
                return { success: false, message: 'You need a Crowbar or C4' };
            }

            // Random loot (10-30% of cash available)
            const lootPercentage = 0.1 + Math.random() * 0.2;
            const lootAmount = Math.floor(atm.cash_available * lootPercentage);

            // Start ATM robbery (instant for now, can add timer)
            player.call('atm:startRobbery', [atmId, 30]); // 30 second timer

            // Set timer
            setTimeout(async () => {
                // Give loot
                await db.query(
                    'UPDATE characters SET money = money + ? WHERE id = ?',
                    [lootAmount, player.characterId]
                );

                player.characterData.money += lootAmount;

                // Update ATM
                await db.query(
                    'UPDATE atm_locations SET cash_available = cash_available - ?, status = \'Robbed\', last_robbery = NOW() WHERE id = ?',
                    [lootAmount, atmId]
                );

                // Alert nearby police
                this.alertPoliceATM(player.position, atmId);

                helpers.sendSuccess(player, `You robbed $${lootAmount.toLocaleString()} from the ATM!`);
                
                console.log(`[Robbery] ${player.name} robbed ATM ${atmId} for $${lootAmount}`);

            }, 30000);

            return {
                success: true,
                message: 'ATM robbery started!',
                duration: 30,
                estimatedLoot: lootAmount
            };

        } catch (error) {
            console.error('[Robbery] ATM robbery error:', error);
            return { success: false, message: 'Failed to rob ATM' };
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    calculateLoot(bank, method) {
        let percentage = 0.3; // Base 30%
        
        // Method multiplier
        if (method === 'Hack') percentage += 0.2;
        else if (method === 'Explosives') percentage += 0.15;
        else if (method === 'Inside_Job') percentage += 0.4;

        // Security level affects loot
        percentage -= (bank.security_level * 0.05);

        const loot = Math.floor(bank.vault_cash * percentage);
        return Math.max(loot, 10000); // Minimum $10,000
    }

    async checkRobberyTool(player, method) {
        switch (method) {
            case 'Drill':
                return await this.hasItem(player.characterId, 'Drill');
            case 'Explosives':
                return await this.hasItem(player.characterId, 'C4') || 
                       await this.hasItem(player.characterId, 'Dynamite');
            case 'Hack':
                return await this.hasItem(player.characterId, 'Hacking Device');
            default:
                return false;
        }
    }

    async hasItem(characterId, itemName) {
        const items = await db.query(
            'SELECT * FROM inventory WHERE character_id = ? AND item_name = ?',
            [characterId, itemName]
        );
        return items.length > 0;
    }

    async findEmptySlot(characterId) {
        const items = await db.query(
            'SELECT slot FROM inventory WHERE character_id = ? ORDER BY slot',
            [characterId]
        );

        let nextSlot = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i].slot !== i) {
                return i;
            }
            nextSlot = i + 1;
        }

        return nextSlot;
    }

    generateMoneyBagSerial() {
        const prefix = 'MB';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${timestamp}-${random}`;
    }

    getOnlinePoliceCount() {
        return mp.players.toArray().filter(p => 
            p.characterData && p.characterData.job === 'Police Officer'
        ).length;
    }

    // ==================== NOTIFICATIONS ====================

    notifyNearbyPlayers(bank, robber) {
        const bankPos = new mp.Vector3(bank.position_x, bank.position_y, bank.position_z);
        const radius = 100;

        mp.players.forEach(player => {
            if (player.id === robber.id) return;
            if (helpers.getDistance(player.position, bankPos) <= radius) {
                player.call('client:showNotification', ['Bank robbery in progress nearby!', 'warning']);
            }
        });
    }

    notifyPolice(robberyData) {
        mp.players.forEach(player => {
            if (player.characterData && player.characterData.job === 'Police Officer') {
                helpers.sendNotification(player, `🚨 BANK ROBBERY: ${robberyData.bankName}`, 'error');
                player.call('robbery:policeAlert', [
                    robberyData.bankName,
                    Math.floor((robberyData.duration - (Date.now() - robberyData.startTime)) / 1000)
                ]);
            }
        });

        robberyData.policeNotified = true;
    }

    notifyPoliceSuccess(robberyData) {
        mp.players.forEach(player => {
            if (player.characterData && player.characterData.job === 'Police Officer') {
                helpers.sendNotification(player, `🚨 Bank robbery completed at ${robberyData.bankName}. Suspects fleeing!`, 'error');
            }
        });
    }

    alertPoliceATM(position, atmId) {
        mp.players.forEach(player => {
            if (player.characterData && player.characterData.job === 'Police Officer') {
                helpers.sendNotification(player, `🚨 ATM ROBBERY: ATM #${atmId}`, 'error');
                player.call('police:atmAlert', [position.x, position.y, position.z]);
            }
        });
    }

    // ==================== ALARM SYSTEM ====================

    async activateAlarm(bankId, active) {
        await db.query(
            'UPDATE bank_locations SET alarm_active = ? WHERE id = ?',
            [active, bankId]
        );

        // Broadcast alarm sound to nearby players
        const bank = await db.query('SELECT * FROM bank_locations WHERE id = ?', [bankId]);
        if (bank.length > 0) {
            mp.players.forEach(player => {
                const distance = helpers.getDistance(
                    player.position,
                    new mp.Vector3(bank[0].position_x, bank[0].position_y, bank[0].position_z)
                );
                if (distance <= 200) {
                    player.call('client:playSound', [active ? 'alarm_on' : 'alarm_off']);
                }
            });
        }
    }

    async logRobbery(robberyData, success, note = '') {
        try {
            const participants = JSON.stringify(robberyData.participants);
            const evidence = JSON.stringify({
                method: robberyData.method,
                duration: Date.now() - robberyData.startTime,
                witnesses: [] // Can be extended
            });

            await db.query(
                `INSERT INTO robbery_logs 
                (bank_id, robber_id, robber_name, stolen_amount, success, method, participants, 
                 duration, caught, evidence_left, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    robberyData.bankId,
                    robberyData.robberId,
                    robberyData.robberName,
                    success ? robberyData.lootAmount : 0,
                    success,
                    robberyData.method,
                    participants,
                    Math.floor((Date.now() - robberyData.startTime) / 1000),
                    false, // caught (can be updated later)
                    evidence
                ]
            );

        } catch (error) {
            console.error('[Robbery] Log error:', error);
        }
    }

    // ==================== ADMIN/MANAGER FUNCTIONS ====================

    async initiateManagerLockdown(bankId) {
        await db.query(
            'UPDATE bank_locations SET lockdown_active = TRUE, alarm_active = TRUE WHERE id = ?',
            [bankId]
        );

        // Cancel active robbery if any
        if (this.activeRobberies.has(bankId)) {
            await this.cancelRobbery(bankId, 'Manager lockdown initiated');
        }

        console.log(`[Robbery] Lockdown initiated for bank ${bankId}`);
    }

    async getRobberyStatistics(bankId = null) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN success = TRUE THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) as failed,
                    SUM(stolen_amount) as total_stolen,
                    AVG(duration) as avg_duration
                FROM robbery_logs
            `;

            const params = [];
            if (bankId) {
                query += ' WHERE bank_id = ?';
                params.push(bankId);
            }

            const stats = await db.query(query, params);
            return stats[0];

        } catch (error) {
            console.error('[Robbery] Stats error:', error);
            return null;
        }
    }
}

module.exports = new RobberySystem();
