// Banking System
const db = require('../../database/db');
const helpers = require('../../utils/helpers');

class BankingSystem {
    // Get player's bank account
    async getAccount(characterId) {
        try {
            const accounts = await db.query(
                'SELECT * FROM bank_accounts WHERE character_id = ?',
                [characterId]
            );
            return accounts.length > 0 ? accounts[0] : null;
        } catch (error) {
            console.error('[Banking] Error fetching account:', error);
            return null;
        }
    }

    // Deposit money
    async deposit(player, amount) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Invalid amount.' };
        }

        // Check if player has enough cash
        if (player.characterData.money < amount) {
            return { success: false, message: 'Insufficient cash.' };
        }

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Bank account not found.' };
            }

            // Update balances
            await db.query(
                'UPDATE characters SET money = money - ?, bank_balance = bank_balance + ? WHERE id = ?',
                [amount, amount, player.characterId]
            );

            await db.query(
                'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
                [amount, account.id]
            );

            // Log transaction
            await db.query(
                'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
                [account.id, 'Deposit', amount, 'Cash deposit']
            );

            // Update player data
            player.characterData.money -= amount;
            player.characterData.bank_balance += amount;

            console.log(`[Banking] ${player.name} deposited ${helpers.formatCurrency(amount)}`);

            return { 
                success: true, 
                message: `Deposited ${helpers.formatCurrency(amount)}`,
                newBalance: player.characterData.bank_balance
            };

        } catch (error) {
            console.error('[Banking] Deposit error:', error);
            return { success: false, message: 'Transaction failed.' };
        }
    }

    // Withdraw money
    async withdraw(player, amount) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Invalid amount.' };
        }

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Bank account not found.' };
            }

            // Check balance
            if (account.balance < amount) {
                return { success: false, message: 'Insufficient funds.' };
            }

            // Update balances
            await db.query(
                'UPDATE characters SET money = money + ?, bank_balance = bank_balance - ? WHERE id = ?',
                [amount, amount, player.characterId]
            );

            await db.query(
                'UPDATE bank_accounts SET balance = balance - ? WHERE id = ?',
                [amount, account.id]
            );

            // Log transaction
            await db.query(
                'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
                [account.id, 'Withdraw', amount, 'Cash withdrawal']
            );

            // Update player data
            player.characterData.money += amount;
            player.characterData.bank_balance -= amount;

            console.log(`[Banking] ${player.name} withdrew ${helpers.formatCurrency(amount)}`);

            return { 
                success: true, 
                message: `Withdrew ${helpers.formatCurrency(amount)}`,
                newBalance: player.characterData.bank_balance
            };

        } catch (error) {
            console.error('[Banking] Withdraw error:', error);
            return { success: false, message: 'Transaction failed.' };
        }
    }

    // Transfer money
    async transfer(player, targetCharacterId, amount) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Invalid amount.' };
        }

        if (player.characterId === targetCharacterId) {
            return { success: false, message: 'Cannot transfer to yourself.' };
        }

        try {
            const senderAccount = await this.getAccount(player.characterId);
            const receiverAccount = await this.getAccount(targetCharacterId);

            if (!senderAccount || !receiverAccount) {
                return { success: false, message: 'Account not found.' };
            }

            // Check balance
            if (senderAccount.balance < amount) {
                return { success: false, message: 'Insufficient funds.' };
            }

            // Update balances
            await db.query(
                'UPDATE bank_accounts SET balance = balance - ? WHERE id = ?',
                [amount, senderAccount.id]
            );

            await db.query(
                'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
                [amount, receiverAccount.id]
            );

            await db.query(
                'UPDATE characters SET bank_balance = bank_balance - ? WHERE id = ?',
                [amount, player.characterId]
            );

            await db.query(
                'UPDATE characters SET bank_balance = bank_balance + ? WHERE id = ?',
                [amount, targetCharacterId]
            );

            // Log transactions
            await db.query(
                'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
                [senderAccount.id, 'Transfer', -amount, `Transfer to account ${receiverAccount.account_number}`]
            );

            await db.query(
                'INSERT INTO bank_transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
                [receiverAccount.id, 'Transfer', amount, `Transfer from account ${senderAccount.account_number}`]
            );

            // Update player data
            player.characterData.bank_balance -= amount;

            console.log(`[Banking] ${player.name} transferred ${helpers.formatCurrency(amount)}`);

            return { 
                success: true, 
                message: `Transferred ${helpers.formatCurrency(amount)}`,
                newBalance: player.characterData.bank_balance
            };

        } catch (error) {
            console.error('[Banking] Transfer error:', error);
            return { success: false, message: 'Transaction failed.' };
        }
    }

    // Get transaction history
    async getTransactions(characterId, limit = 10) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) return [];

            const transactions = await db.query(
                `SELECT * FROM bank_transactions 
                 WHERE account_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [account.id, limit]
            );

            return transactions;
        } catch (error) {
            console.error('[Banking] Error fetching transactions:', error);
            return [];
        }
    }
}

module.exports = new BankingSystem();
