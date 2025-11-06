/**
 * Banking Module
 * Handles banking operations (deposit, withdraw, transfer)
 */

const database = require('./database');
const playerModule = require('./player');

// Banking locations
const atmLocations = [
    { x: 147.4, y: -1035.8, z: 29.3 },
    { x: -846.3, y: -341.3, z: 38.7 },
    { x: -1204.3, y: -324.8, z: 37.8 },
    { x: -1216.2, y: -331.0, z: 37.8 },
    { x: -2962.7, y: 482.9, z: 15.7 },
    { x: -112.2, y: 6469.3, z: 31.6 },
    { x: 155.9, y: 6642.9, z: 31.6 },
    { x: 174.1, y: 6637.9, z: 31.6 },
    { x: 1701.2, y: 6426.6, z: 32.8 },
    { x: 1822.6, y: 3683.1, z: 34.3 },
    { x: 540.0, y: 2671.0, z: 42.2 },
    { x: 2564.4, y: 2585.1, z: 38.1 },
    { x: 2558.8, y: 349.6, z: 108.6 },
    { x: 2558.5, y: 389.5, z: 108.6 },
    { x: 1077.7, y: -776.5, z: 58.2 },
    { x: 1138.2, y: -468.9, z: 66.7 },
    { x: 1167.0, y: -456.1, z: 66.8 },
    { x: 5.2, y: -919.8, z: 29.6 }
];

const bankLocations = [
    { x: 149.9, y: -1040.5, z: 29.4, name: "Fleeca Bank" },
    { x: 314.2, y: -278.6, z: 54.2, name: "Fleeca Bank" },
    { x: -351.5, y: -49.5, z: 49.0, name: "Fleeca Bank" },
    { x: -1212.9, y: -330.8, z: 37.8, name: "Fleeca Bank" },
    { x: -2962.5, y: 482.6, z: 15.7, name: "Fleeca Bank" },
    { x: 1175.0, y: 2706.6, z: 38.1, name: "Fleeca Bank" },
    { x: 246.6, y: 223.1, z: 106.3, name: "Pacific Standard Bank" }
];

// Create markers and blips on server start
mp.events.add('playerReady', (player) => {
    // Send ATM and bank locations to client
    player.call('client:initBankingLocations', [
        JSON.stringify(atmLocations),
        JSON.stringify(bankLocations)
    ]);
});

// Deposit money
mp.events.add('server:depositMoney', async (player, amount) => {
    try {
        const data = playerModule.getPlayerData(player);
        
        if (!data || !data.characterId) return;

        amount = parseInt(amount);

        if (isNaN(amount) || amount <= 0) {
            player.call('client:bankingResponse', ['error', 'Invalid amount!']);
            return;
        }

        if (playerModule.getMoney(player) < amount) {
            player.call('client:bankingResponse', ['error', 'Not enough cash!']);
            return;
        }

        // Get bank account
        const accounts = await database.query(
            'SELECT * FROM bank_accounts WHERE character_id = ?',
            [data.characterId]
        );

        if (accounts.length === 0) {
            player.call('client:bankingResponse', ['error', 'No bank account found!']);
            return;
        }

        const account = accounts[0];

        // Take cash from player
        if (!playerModule.takeMoney(player, amount)) {
            player.call('client:bankingResponse', ['error', 'Transaction failed!']);
            return;
        }

        // Add to bank account
        await database.query(
            'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
            [amount, account.id]
        );

        // Log transaction
        await database.query(
            'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
            [account.id, 'deposit', amount, 'Cash deposit']
        );

        // Update character data
        data.characterData.bankBalance += amount;

        player.call('client:bankingResponse', ['success', `Deposited $${amount.toLocaleString()}`]);
        player.call('client:updateBankBalance', [data.characterData.bankBalance]);
        
        console.log(`[Banking] ${player.name} deposited $${amount}`);

    } catch (error) {
        console.error('[Banking] Deposit error:', error);
        player.call('client:bankingResponse', ['error', 'Transaction failed!']);
    }
});

// Withdraw money
mp.events.add('server:withdrawMoney', async (player, amount) => {
    try {
        const data = playerModule.getPlayerData(player);
        
        if (!data || !data.characterId) return;

        amount = parseInt(amount);

        if (isNaN(amount) || amount <= 0) {
            player.call('client:bankingResponse', ['error', 'Invalid amount!']);
            return;
        }

        // Get bank account
        const accounts = await database.query(
            'SELECT * FROM bank_accounts WHERE character_id = ?',
            [data.characterId]
        );

        if (accounts.length === 0) {
            player.call('client:bankingResponse', ['error', 'No bank account found!']);
            return;
        }

        const account = accounts[0];

        if (account.balance < amount) {
            player.call('client:bankingResponse', ['error', 'Insufficient funds!']);
            return;
        }

        // Remove from bank account
        await database.query(
            'UPDATE bank_accounts SET balance = balance - ? WHERE id = ?',
            [amount, account.id]
        );

        // Give cash to player
        playerModule.giveMoney(player, amount);

        // Log transaction
        await database.query(
            'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
            [account.id, 'withdrawal', amount, 'Cash withdrawal']
        );

        // Update character data
        data.characterData.bankBalance -= amount;

        player.call('client:bankingResponse', ['success', `Withdrew $${amount.toLocaleString()}`]);
        player.call('client:updateBankBalance', [data.characterData.bankBalance]);
        
        console.log(`[Banking] ${player.name} withdrew $${amount}`);

    } catch (error) {
        console.error('[Banking] Withdrawal error:', error);
        player.call('client:bankingResponse', ['error', 'Transaction failed!']);
    }
});

// Transfer money
mp.events.add('server:transferMoney', async (player, targetName, amount) => {
    try {
        const data = playerModule.getPlayerData(player);
        
        if (!data || !data.characterId) return;

        amount = parseInt(amount);

        if (isNaN(amount) || amount <= 0) {
            player.call('client:bankingResponse', ['error', 'Invalid amount!']);
            return;
        }

        // Get sender's bank account
        const senderAccounts = await database.query(
            'SELECT * FROM bank_accounts WHERE character_id = ?',
            [data.characterId]
        );

        if (senderAccounts.length === 0) {
            player.call('client:bankingResponse', ['error', 'No bank account found!']);
            return;
        }

        const senderAccount = senderAccounts[0];

        if (senderAccount.balance < amount) {
            player.call('client:bankingResponse', ['error', 'Insufficient funds!']);
            return;
        }

        // Find recipient
        const [firstName, lastName] = targetName.split('_');
        const recipients = await database.query(
            'SELECT * FROM characters WHERE char_name = ? AND char_surname = ?',
            [firstName, lastName]
        );

        if (recipients.length === 0) {
            player.call('client:bankingResponse', ['error', 'Recipient not found!']);
            return;
        }

        const recipient = recipients[0];

        if (recipient.id === data.characterId) {
            player.call('client:bankingResponse', ['error', 'Cannot transfer to yourself!']);
            return;
        }

        // Get recipient's bank account
        const recipientAccounts = await database.query(
            'SELECT * FROM bank_accounts WHERE character_id = ?',
            [recipient.id]
        );

        if (recipientAccounts.length === 0) {
            player.call('client:bankingResponse', ['error', 'Recipient has no bank account!']);
            return;
        }

        const recipientAccount = recipientAccounts[0];

        // Perform transfer
        await database.query(
            'UPDATE bank_accounts SET balance = balance - ? WHERE id = ?',
            [amount, senderAccount.id]
        );

        await database.query(
            'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
            [amount, recipientAccount.id]
        );

        // Log transactions
        await database.query(
            'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
            [senderAccount.id, 'transfer_out', amount, `Transfer to ${targetName}`]
        );

        await database.query(
            'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
            [recipientAccount.id, 'transfer_in', amount, `Transfer from ${player.name}`]
        );

        // Update sender's character data
        data.characterData.bankBalance -= amount;

        // Notify recipient if online
        const targetPlayer = mp.players.toArray().find(p => p.name === targetName);
        if (targetPlayer) {
            const targetData = playerModule.getPlayerData(targetPlayer);
            if (targetData && targetData.characterData) {
                targetData.characterData.bankBalance += amount;
                targetPlayer.call('client:updateBankBalance', [targetData.characterData.bankBalance]);
                targetPlayer.outputChatBox(`!{#00FF00}You received $${amount.toLocaleString()} from ${player.name}`);
            }
        }

        player.call('client:bankingResponse', ['success', `Transferred $${amount.toLocaleString()} to ${targetName}`]);
        player.call('client:updateBankBalance', [data.characterData.bankBalance]);
        
        console.log(`[Banking] ${player.name} transferred $${amount} to ${targetName}`);

    } catch (error) {
        console.error('[Banking] Transfer error:', error);
        player.call('client:bankingResponse', ['error', 'Transaction failed!']);
    }
});

// Check balance
mp.events.add('server:checkBalance', async (player) => {
    try {
        const data = playerModule.getPlayerData(player);
        
        if (!data || !data.characterId) return;

        const accounts = await database.query(
            'SELECT * FROM bank_accounts WHERE character_id = ?',
            [data.characterId]
        );

        if (accounts.length === 0) {
            player.call('client:bankingResponse', ['error', 'No bank account found!']);
            return;
        }

        const account = accounts[0];
        
        player.call('client:showBankBalance', [
            account.balance,
            playerModule.getMoney(player),
            account.account_number
        ]);

    } catch (error) {
        console.error('[Banking] Balance check error:', error);
    }
});

console.log('[Banking] Module loaded with ATM and bank locations');

module.exports = {};
