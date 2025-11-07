// Banking System Event Handlers - Server Side
// Connects client UI with server banking logic

const enhancedBanking = require('../modules/banking/enhanced-banking');
const robberySystem = require('../modules/robbery/robbery-system');
const helpers = require('../utils/helpers');

// ==================== BANK OPENING/CLOSING ====================

mp.events.add('bank:open', async (player) => {
    if (!player.loggedIn || !player.characterId) {
        return helpers.sendError(player, 'You must be logged in');
    }

    // Start banking session
    enhancedBanking.startSession(player);

    // Get account data
    const account = await enhancedBanking.getAccount(player.characterId);
    
    if (!account) {
        // Create account if doesn't exist
        const result = await enhancedBanking.createAccount(player.characterId);
        if (result.success) {
            helpers.sendSuccess(player, 'Bank account created!');
            const newAccount = await enhancedBanking.getAccount(player.characterId);
            player.call('updateAccountData', [JSON.stringify(newAccount)]);
        } else {
            return helpers.sendError(player, result.message);
        }
    } else {
        player.call('updateAccountData', [JSON.stringify(account)]);
    }

    // Send player data
    const playerData = {
        name: player.name,
        cash: player.characterData.money || 0
    };
    player.call('updatePlayerData', [JSON.stringify(playerData)]);

    // Load recent transactions
    const transactions = await enhancedBanking.getTransactions(player.characterId, 10);
    player.call('updateTransactions', [JSON.stringify(transactions)]);

    // Load loans
    const loans = await enhancedBanking.getLoans(player.characterId);
    player.call('updateLoans', [JSON.stringify(loans)]);

    // Load cards
    const cards = await enhancedBanking.getCards(player.characterId);
    player.call('updateCards', [JSON.stringify(cards)]);

    console.log(`[Banking] ${player.name} opened banking interface`);
});

mp.events.add('bank:close', (player) => {
    enhancedBanking.endSession(player);
    console.log(`[Banking] ${player.name} closed banking interface`);
});

// ==================== TRANSACTIONS ====================

mp.events.add('bank:deposit', async (player, amount) => {
    const result = await enhancedBanking.deposit(player, parseInt(amount));
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.call('showNotification', [result.message, 'success']);
        
        // Update account data
        const account = await enhancedBanking.getAccount(player.characterId);
        player.call('updateAccountData', [JSON.stringify(account)]);
        
        // Update player data
        const playerData = { name: player.name, cash: player.characterData.money };
        player.call('updatePlayerData', [JSON.stringify(playerData)]);
        
        // Refresh transactions
        const transactions = await enhancedBanking.getTransactions(player.characterId, 10);
        player.call('updateTransactions', [JSON.stringify(transactions)]);
    } else {
        helpers.sendError(player, result.message);
        player.call('showNotification', [result.message, 'error']);
    }
});

mp.events.add('bank:withdraw', async (player, amount) => {
    // Store pending action
    enhancedBanking.pendingVerifications.set(player.id, {
        action: 'withdraw',
        data: { amount: parseInt(amount) }
    });
    
    // Request PIN
    player.call('requestPIN');
});

mp.events.add('bank:transfer', async (player, recipient, amount, note) => {
    // Store pending action
    enhancedBanking.pendingVerifications.set(player.id, {
        action: 'transfer',
        data: { recipient, amount: parseInt(amount), note }
    });
    
    // Request PIN
    player.call('requestPIN');
});

mp.events.add('bank:verifyPIN', async (player, pin) => {
    const valid = await enhancedBanking.verifyPIN(player.characterId, pin);
    
    if (!valid) {
        player.call('pinVerified', [false]);
        player.call('showNotification', ['Invalid PIN', 'error']);
        return;
    }

    player.call('pinVerified', [true]);

    // Execute pending action
    if (enhancedBanking.pendingVerifications.has(player.id)) {
        const pending = enhancedBanking.pendingVerifications.get(player.id);
        enhancedBanking.pendingVerifications.delete(player.id);

        let result;
        
        switch (pending.action) {
            case 'withdraw':
                result = await enhancedBanking.withdraw(player, pending.data.amount, true);
                break;
            case 'transfer':
                result = await enhancedBanking.transfer(player, pending.data.recipient, pending.data.amount, pending.data.note, true);
                break;
        }

        if (result) {
            if (result.success) {
                helpers.sendSuccess(player, result.message);
                player.call('showNotification', [result.message, 'success']);
                
                // Update data
                const account = await enhancedBanking.getAccount(player.characterId);
                player.call('updateAccountData', [JSON.stringify(account)]);
                
                const playerData = { name: player.name, cash: player.characterData.money };
                player.call('updatePlayerData', [JSON.stringify(playerData)]);
                
                const transactions = await enhancedBanking.getTransactions(player.characterId, 10);
                player.call('updateTransactions', [JSON.stringify(transactions)]);
            } else {
                helpers.sendError(player, result.message);
                player.call('showNotification', [result.message, 'error']);
            }
        }
    }
});

mp.events.add('bank:refreshBalance', async (player) => {
    const account = await enhancedBanking.getAccount(player.characterId);
    if (account) {
        player.call('updateAccountData', [JSON.stringify(account)]);
    }
});

// ==================== TRANSACTIONS HISTORY ====================

mp.events.add('bank:getTransactions', async (player) => {
    const transactions = await enhancedBanking.getTransactions(player.characterId, 50);
    player.call('updateTransactions', [JSON.stringify(transactions)]);
});

mp.events.add('bank:filterTransactions', async (player, type, date) => {
    const transactions = await enhancedBanking.getTransactions(player.characterId, 50, type, date);
    player.call('updateTransactions', [JSON.stringify(transactions)]);
});

// ==================== LOANS ====================

mp.events.add('bank:applyLoan', async (player, amount, term) => {
    const result = await enhancedBanking.applyForLoan(player, parseInt(amount), parseInt(term));
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.call('showNotification', [result.message, 'success']);
        
        const loans = await enhancedBanking.getLoans(player.characterId);
        player.call('updateLoans', [JSON.stringify(loans)]);
    } else {
        helpers.sendError(player, result.message);
        player.call('showNotification', [result.message, 'error']);
    }
});

mp.events.add('bank:getLoans', async (player) => {
    const loans = await enhancedBanking.getLoans(player.characterId);
    player.call('updateLoans', [JSON.stringify(loans)]);
});

// ==================== CREDIT CARDS ====================

mp.events.add('bank:requestCard', async (player) => {
    const result = await enhancedBanking.requestCard(player);
    
    if (result.success) {
        helpers.sendSuccess(player, result.message);
        player.call('showNotification', [`Card issued! Default PIN: ${result.defaultPIN}`, 'success']);
        
        const cards = await enhancedBanking.getCards(player.characterId);
        player.call('updateCards', [JSON.stringify(cards)]);
    } else {
        helpers.sendError(player, result.message);
        player.call('showNotification', [result.message, 'error']);
    }
});

mp.events.add('bank:getCards', async (player) => {
    const cards = await enhancedBanking.getCards(player.characterId);
    player.call('updateCards', [JSON.stringify(cards)]);
});

// ==================== PLAYER LOOKUP ====================

mp.events.add('bank:lookupPlayer', async (player, identifier) => {
    const result = await enhancedBanking.lookupPlayer(identifier);
    
    if (result.found) {
        player.call('showRecipientInfo', [result.name, result.status]);
    } else {
        player.call('showNotification', ['Player/Account not found', 'error']);
    }
});

// ==================== MANAGER ACTIONS ====================

mp.events.add('bank:manager:getData', async (player) => {
    // Check if player is manager
    if (player.characterData.job !== 'Bank Manager') {
        return helpers.sendError(player, 'You are not a bank manager');
    }

    // Get statistics
    const stats = await enhancedBanking.getManagerStatistics();
    player.call('updateManagerData', [JSON.stringify(stats)]);
});

mp.events.add('bank:manager:viewAccounts', async (player) => {
    if (player.characterData.job !== 'Bank Manager') {
        return helpers.sendError(player, 'Unauthorized');
    }

    const accounts = await enhancedBanking.getAllAccounts();
    player.call('manager:showAccounts', [JSON.stringify(accounts)]);
});

mp.events.add('bank:manager:viewLoans', async (player) => {
    if (player.characterData.job !== 'Bank Manager') {
        return helpers.sendError(player, 'Unauthorized');
    }

    const loans = await enhancedBanking.getPendingLoans();
    player.call('manager:showLoans', [JSON.stringify(loans)]);
});

mp.events.add('bank:manager:lockdown', async (player) => {
    if (player.characterData.job !== 'Bank Manager') {
        return helpers.sendError(player, 'Unauthorized');
    }

    // Find nearest bank
    const nearestBank = findNearestBank(player.position);
    if (nearestBank) {
        await robberySystem.initiateManagerLockdown(nearestBank.id);
        helpers.sendSuccess(player, `Lockdown initiated at ${nearestBank.name}`);
        
        // Alert all players in bank
        mp.players.forEach(p => {
            if (helpers.getDistance(p.position, player.position) < 100) {
                p.call('showNotification', ['BANK LOCKDOWN INITIATED', 'error']);
            }
        });
    }
});

// ==================== ROBBERY EVENTS ====================

mp.events.add('robbery:startBank', async (player, bankId) => {
    const result = await robberySystem.startBankRobbery(player, bankId, 'Drill');
    
    if (result.success) {
        player.call('robbery:started', [result.duration, result.loot]);
    } else {
        player.call('showNotification', [result.message, 'error']);
    }
});

mp.events.add('robbery:startATM', async (player, atmId) => {
    const result = await robberySystem.startATMRobbery(player, atmId);
    
    if (result.success) {
        player.call('atm:robberyStarted', [result.duration]);
    } else {
        player.call('showNotification', [result.message, 'error']);
    }
});

mp.events.add('bank:callPolice', (player) => {
    // Notify all police
    mp.players.forEach(p => {
        if (p.characterData && p.characterData.job === 'Police Officer') {
            helpers.sendNotification(p, `🚨 911 Call: Bank robbery reported by ${player.name}`, 'error');
        }
    });
});

// ==================== CLEANUP ====================

mp.events.add('playerQuit', (player) => {
    // End banking session
    enhancedBanking.endSession(player);
    
    // Clear pending verifications
    enhancedBanking.pendingVerifications.delete(player.id);
});

// ==================== UTILITY ====================

function findNearestBank(position) {
    // This should query database for bank locations
    // Simplified for now
    return { id: 1, name: 'Pacific Standard Bank' };
}

console.log('[Events] Banking and robbery events loaded');
