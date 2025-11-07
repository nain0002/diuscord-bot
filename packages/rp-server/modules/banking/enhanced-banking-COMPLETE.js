// Enhanced Banking System - Server-Side - COMPLETE WITH ALL FUNCTIONS
// With Security, PIN Verification, Manager Functions, and Advanced Features

const db = require('../../database/db');
const bcrypt = require('bcrypt');
const helpers = require('../../utils/helpers');

class EnhancedBankingSystem {
    constructor() {
        this.activeSessions = new Map(); // character_id -> session_id
        this.pendingVerifications = new Map(); // player -> { action, data }
        this.transactionLocks = new Set(); // Prevent concurrent transactions
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    async getAccount(characterId) {
        try {
            const accounts = await db.query(
                `SELECT * FROM bank_accounts WHERE character_id = ? AND status = 'Active'`,
                [characterId]
            );
            return accounts.length > 0 ? accounts[0] : null;
        } catch (error) {
            console.error('[Banking] Error fetching account:', error);
            return null;
        }
    }

    async createAccount(characterId, accountType = 'Personal', initialBalance = 10000) {
        try {
            // Check if account already exists
            const existing = await this.getAccount(characterId);
            if (existing) {
                return { success: false, message: 'Account already exists' };
            }

            // Generate unique account number
            const accountNumber = this.generateAccountNumber();
            
            // Generate default PIN (should be changed by player)
            const defaultPIN = '1234';
            const hashedPIN = await bcrypt.hash(defaultPIN, 10);

            await db.query(
                `INSERT INTO bank_accounts 
                (character_id, account_number, balance, account_type, pin, status, interest_rate)
                VALUES (?, ?, ?, ?, ?, 'Active', 0.05)`,
                [characterId, accountNumber, initialBalance, accountType, hashedPIN]
            );

            console.log(`[Banking] Account created for character ${characterId}: ${accountNumber}`);

            return {
                success: true,
                message: 'Account created successfully',
                accountNumber: accountNumber,
                defaultPIN: defaultPIN // Send to player securely
            };

        } catch (error) {
            console.error('[Banking] Error creating account:', error);
            return { success: false, message: 'Failed to create account' };
        }
    }

    async changePIN(characterId, oldPIN, newPIN) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) {
                return { success: false, message: 'Account not found' };
            }

            // Verify old PIN
            const validPIN = await bcrypt.compare(oldPIN, account.pin);
            if (!validPIN) {
                return { success: false, message: 'Invalid current PIN' };
            }

            // Validate new PIN
            if (!/^\d{4}$/.test(newPIN)) {
                return { success: false, message: 'PIN must be 4 digits' };
            }

            // Hash and update new PIN
            const hashedPIN = await bcrypt.hash(newPIN, 10);
            await db.query(
                'UPDATE bank_accounts SET pin = ? WHERE id = ?',
                [hashedPIN, account.id]
            );

            console.log(`[Banking] PIN changed for account ${account.account_number}`);

            return { success: true, message: 'PIN changed successfully' };

        } catch (error) {
            console.error('[Banking] Error changing PIN:', error);
            return { success: false, message: 'Failed to change PIN' };
        }
    }

    async verifyPIN(characterId, pin) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) return false;

            const valid = await bcrypt.compare(pin, account.pin);
            return valid;

        } catch (error) {
            console.error('[Banking] Error verifying PIN:', error);
            return false;
        }
    }

    // ==================== SESSION MANAGEMENT ====================

    startSession(player) {
        const sessionId = this.generateSessionId();
        this.activeSessions.set(player.characterId, sessionId);
        
        // Update database
        db.query(
            'UPDATE bank_accounts SET session_id = ?, last_access = NOW() WHERE character_id = ?',
            [sessionId, player.characterId]
        );

        console.log(`[Banking] Session started for ${player.name}`);
        return sessionId;
    }

    async endSession(player) {
        if (!player.characterId) return;

        this.activeSessions.delete(player.characterId);
        
        // Clear session in database
        await db.query(
            'UPDATE bank_accounts SET session_id = NULL WHERE character_id = ?',
            [player.characterId]
        );

        console.log(`[Banking] Session ended for ${player.name}`);
    }

    async checkConcurrentAccess(characterId) {
        const account = await this.getAccount(characterId);
        if (!account) return false;

        if (account.session_id && this.activeSessions.has(characterId)) {
            const activeSession = this.activeSessions.get(characterId);
            return account.session_id === activeSession;
        }

        return true;
    }

    // ==================== TRANSACTIONS (Same as before) ====================
    // ... (keeping all transaction methods from previous version)

    async deposit(player, amount) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        if (amount <= 0 || !Number.isInteger(amount)) {
            return { success: false, message: 'Invalid amount' };
        }

        if (player.characterData.money < amount) {
            return { success: false, message: 'Insufficient cash' };
        }

        if (this.transactionLocks.has(player.characterId)) {
            return { success: false, message: 'Transaction in progress' };
        }

        this.transactionLocks.add(player.characterId);

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Account not found' };
            }

            const hasAccess = await this.checkConcurrentAccess(player.characterId);
            if (!hasAccess) {
                return { success: false, message: 'Account accessed from another location' };
            }

            const refNumber = this.generateReferenceNumber('DEP');

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                await connection.query(
                    'UPDATE bank_accounts SET balance = balance + ?, total_deposits = total_deposits + ? WHERE id = ?',
                    [amount, amount, account.id]
                );

                await connection.query(
                    'UPDATE characters SET money = money - ? WHERE id = ?',
                    [amount, player.characterId]
                );

                await connection.query(
                    `INSERT INTO bank_transactions 
                    (account_id, transaction_type, amount, description, location, reference_number, timestamp)
                    VALUES (?, 'Deposit', ?, 'Cash deposit', ?, ?, NOW())`,
                    [account.id, amount, player.position ? `${player.position.x},${player.position.y},${player.position.z}` : 'Unknown', refNumber]
                );

                await connection.commit();
                connection.release();

                player.characterData.money -= amount;
                player.characterData.bank_balance += amount;

                console.log(`[Banking] ${player.name} deposited ${helpers.formatCurrency(amount)} - Ref: ${refNumber}`);

                return {
                    success: true,
                    message: `Deposited ${helpers.formatCurrency(amount)}`,
                    newBalance: player.characterData.bank_balance,
                    reference: refNumber
                };

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('[Banking] Deposit error:', error);
            return { success: false, message: 'Transaction failed' };
        } finally {
            this.transactionLocks.delete(player.characterId);
        }
    }

    async withdraw(player, amount, pinVerified = false) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        if (amount <= 0 || !Number.isInteger(amount)) {
            return { success: false, message: 'Invalid amount' };
        }

        if (!pinVerified) {
            return { success: false, message: 'PIN verification required', requiresPIN: true };
        }

        if (this.transactionLocks.has(player.characterId)) {
            return { success: false, message: 'Transaction in progress' };
        }

        this.transactionLocks.add(player.characterId);

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Account not found' };
            }

            if (account.balance < amount) {
                return { success: false, message: 'Insufficient funds' };
            }

            const hasAccess = await this.checkConcurrentAccess(player.characterId);
            if (!hasAccess) {
                return { success: false, message: 'Account accessed from another location' };
            }

            const refNumber = this.generateReferenceNumber('WDR');

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                await connection.query(
                    'UPDATE bank_accounts SET balance = balance - ?, total_withdrawals = total_withdrawals + ? WHERE id = ?',
                    [amount, amount, account.id]
                );

                await connection.query(
                    'UPDATE characters SET money = money + ? WHERE id = ?',
                    [amount, player.characterId]
                );

                await connection.query(
                    `INSERT INTO bank_transactions 
                    (account_id, transaction_type, amount, description, location, reference_number, timestamp)
                    VALUES (?, 'Withdraw', ?, 'Cash withdrawal', ?, ?, NOW())`,
                    [account.id, amount, player.position ? `${player.position.x},${player.position.y},${player.position.z}` : 'Unknown', refNumber]
                );

                await connection.commit();
                connection.release();

                player.characterData.money += amount;
                player.characterData.bank_balance -= amount;

                console.log(`[Banking] ${player.name} withdrew ${helpers.formatCurrency(amount)} - Ref: ${refNumber}`);

                return {
                    success: true,
                    message: `Withdrew ${helpers.formatCurrency(amount)}`,
                    newBalance: player.characterData.bank_balance,
                    reference: refNumber
                };

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('[Banking] Withdraw error:', error);
            return { success: false, message: 'Transaction failed' };
        } finally {
            this.transactionLocks.delete(player.characterId);
        }
    }

    async transfer(player, recipientIdentifier, amount, note = '', pinVerified = false) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        if (amount <= 0 || !Number.isInteger(amount)) {
            return { success: false, message: 'Invalid amount' };
        }

        if (!pinVerified) {
            return { success: false, message: 'PIN verification required', requiresPIN: true };
        }

        if (this.transactionLocks.has(player.characterId)) {
            return { success: false, message: 'Transaction in progress' };
        }

        try {
            const senderAccount = await this.getAccount(player.characterId);
            if (!senderAccount) {
                return { success: false, message: 'Your account not found' };
            }

            // Find recipient
            let recipientAccount;
            if (recipientIdentifier.startsWith('ACC-')) {
                const accounts = await db.query(
                    'SELECT * FROM bank_accounts WHERE account_number = ? AND status = \'Active\'',
                    [recipientIdentifier]
                );
                recipientAccount = accounts.length > 0 ? accounts[0] : null;
            } else {
                recipientAccount = await this.getAccount(parseInt(recipientIdentifier));
            }

            if (!recipientAccount) {
                return { success: false, message: 'Recipient account not found' };
            }

            if (senderAccount.id === recipientAccount.id) {
                return { success: false, message: 'Cannot transfer to yourself' };
            }

            const fee = Math.floor(amount * 0.01);
            const total = amount + fee;

            if (senderAccount.balance < total) {
                return { success: false, message: 'Insufficient funds (including fee)' };
            }

            this.transactionLocks.add(player.characterId);

            const refNumber = this.generateReferenceNumber('TXN');

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                await connection.query(
                    'UPDATE bank_accounts SET balance = balance - ?, total_withdrawals = total_withdrawals + ? WHERE id = ?',
                    [total, amount, senderAccount.id]
                );

                await connection.query(
                    'UPDATE bank_accounts SET balance = balance + ?, total_deposits = total_deposits + ? WHERE id = ?',
                    [amount, amount, recipientAccount.id]
                );

                await connection.query(
                    `INSERT INTO bank_transactions 
                    (account_id, transaction_type, amount, receiver_id, receiver_account, description, reference_number, timestamp)
                    VALUES (?, 'Transfer_Out', ?, ?, ?, ?, ?, NOW())`,
                    [senderAccount.id, amount, recipientAccount.id, recipientAccount.account_number, note || 'Money transfer', refNumber]
                );

                await connection.query(
                    `INSERT INTO bank_transactions 
                    (account_id, transaction_type, amount, description, reference_number, timestamp)
                    VALUES (?, 'Transfer_In', ?, ?, ?, NOW())`,
                    [recipientAccount.id, amount, note || 'Money transfer', refNumber]
                );

                if (fee > 0) {
                    await connection.query(
                        `INSERT INTO bank_transactions 
                        (account_id, transaction_type, amount, description, reference_number, timestamp)
                        VALUES (?, 'Fee', ?, 'Transfer fee', ?, NOW())`,
                        [senderAccount.id, fee, refNumber]
                    );
                }

                await connection.commit();
                connection.release();

                player.characterData.bank_balance -= total;

                const recipient = mp.players.toArray().find(p => p.characterId === recipientAccount.character_id);
                if (recipient) {
                    helpers.sendSuccess(recipient, `You received ${helpers.formatCurrency(amount)} from ${player.name}`);
                }

                console.log(`[Banking] ${player.name} transferred ${helpers.formatCurrency(amount)} to ${recipientAccount.account_number} - Ref: ${refNumber}`);

                return {
                    success: true,
                    message: `Transferred ${helpers.formatCurrency(amount)} (Fee: ${helpers.formatCurrency(fee)})`,
                    newBalance: player.characterData.bank_balance,
                    reference: refNumber
                };

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('[Banking] Transfer error:', error);
            return { success: false, message: 'Transaction failed' };
        } finally {
            this.transactionLocks.delete(player.characterId);
        }
    }

    // ==================== TRANSACTION HISTORY ====================

    async getTransactions(characterId, limit = 50, type = null, date = null) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) return [];

            let query = 'SELECT * FROM bank_transactions WHERE account_id = ?';
            const params = [account.id];

            if (type && type !== 'all') {
                query += ' AND transaction_type = ?';
                params.push(type);
            }

            if (date) {
                query += ' AND DATE(timestamp) = ?';
                params.push(date);
            }

            query += ' ORDER BY timestamp DESC LIMIT ?';
            params.push(limit);

            const transactions = await db.query(query, params);
            return transactions;

        } catch (error) {
            console.error('[Banking] Error fetching transactions:', error);
            return [];
        }
    }

    // ==================== LOANS (Same as before) ====================

    async applyForLoan(player, amount, term) {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        if (amount < 1000 || amount > 100000) {
            return { success: false, message: 'Loan amount must be between $1,000 and $100,000' };
        }

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Account not found' };
            }

            const existingLoans = await db.query(
                'SELECT * FROM bank_loans WHERE account_id = ? AND status IN (\'Active\', \'Pending\')',
                [account.id]
            );

            if (existingLoans.length > 0) {
                return { success: false, message: 'You already have an active or pending loan' };
            }

            const interestRate = 5.5;
            const monthlyRate = interestRate / 100 / 12;
            const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
            const totalRepayment = monthlyPayment * term;

            await db.query(
                `INSERT INTO bank_loans 
                (account_id, loan_amount, interest_rate, remaining_balance, monthly_payment, loan_term, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
                [account.id, amount, interestRate, totalRepayment, monthlyPayment, term]
            );

            console.log(`[Banking] Loan application: ${player.name} applied for ${helpers.formatCurrency(amount)}`);

            return {
                success: true,
                message: 'Loan application submitted for approval',
                monthlyPayment: monthlyPayment,
                totalRepayment: totalRepayment
            };

        } catch (error) {
            console.error('[Banking] Loan application error:', error);
            return { success: false, message: 'Failed to apply for loan' };
        }
    }

    async getLoans(characterId) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) return [];

            const loans = await db.query(
                'SELECT * FROM bank_loans WHERE account_id = ? ORDER BY created_at DESC',
                [account.id]
            );

            return loans;

        } catch (error) {
            console.error('[Banking] Error fetching loans:', error);
            return [];
        }
    }

    // ==================== CREDIT CARDS (Same as before) ====================

    async requestCard(player, cardType = 'Debit') {
        if (!player.characterId) {
            return { success: false, message: 'No character loaded' };
        }

        try {
            const account = await this.getAccount(player.characterId);
            if (!account) {
                return { success: false, message: 'Account not found' };
            }

            const existingCards = await db.query(
                'SELECT * FROM credit_cards WHERE account_id = ? AND status = \'Active\'',
                [account.id]
            );

            if (existingCards.length >= 3) {
                return { success: false, message: 'Maximum 3 cards per account' };
            }

            const cardNumber = this.generateCardNumber();
            const cvv = this.generateCVV();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 3);

            const hashedCVV = await bcrypt.hash(cvv, 10);
            const defaultPIN = '1234';
            const hashedPIN = await bcrypt.hash(defaultPIN, 10);

            const characters = await db.query(
                'SELECT first_name, last_name FROM characters WHERE id = ?',
                [player.characterId]
            );

            const cardHolder = characters.length > 0 
                ? `${characters[0].first_name} ${characters[0].last_name}`.toUpperCase()
                : 'CARDHOLDER';

            await db.query(
                `INSERT INTO credit_cards 
                (account_id, card_number, card_holder, cvv, expiry_date, card_type, pin, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
                [account.id, cardNumber, cardHolder, hashedCVV, expiryDate, cardType, hashedPIN]
            );

            console.log(`[Banking] Card issued to ${player.name}: ${cardNumber}`);

            return {
                success: true,
                message: 'Card issued successfully',
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                defaultPIN: defaultPIN
            };

        } catch (error) {
            console.error('[Banking] Card request error:', error);
            return { success: false, message: 'Failed to issue card' };
        }
    }

    async getCards(characterId) {
        try {
            const account = await this.getAccount(characterId);
            if (!account) return [];

            const cards = await db.query(
                'SELECT id, card_number, card_holder, expiry_date, card_type, status FROM credit_cards WHERE account_id = ? ORDER BY issued_date DESC',
                [account.id]
            );

            return cards;

        } catch (error) {
            console.error('[Banking] Error fetching cards:', error);
            return [];
        }
    }

    // ==================== MANAGER FUNCTIONS ====================
    // FIXED: Added all missing manager functions

    async getManagerStatistics() {
        try {
            const stats = await db.query(`
                SELECT 
                    COUNT(DISTINCT ba.id) as totalAccounts,
                    SUM(ba.balance) as totalBalance,
                    COUNT(DISTINCT CASE WHEN DATE(bt.timestamp) = CURDATE() THEN bt.id END) as todayTransactions,
                    COUNT(DISTINCT CASE WHEN bl.status = 'Pending' THEN bl.id END) as pendingLoans
                FROM bank_accounts ba
                LEFT JOIN bank_transactions bt ON bt.timestamp IS NOT NULL
                LEFT JOIN bank_loans bl ON bl.account_id = ba.id
                WHERE ba.status = 'Active'
            `);

            return stats[0] || {
                totalAccounts: 0,
                totalBalance: 0,
                todayTransactions: 0,
                pendingLoans: 0
            };

        } catch (error) {
            console.error('[Banking] Error fetching manager statistics:', error);
            return {
                totalAccounts: 0,
                totalBalance: 0,
                todayTransactions: 0,
                pendingLoans: 0
            };
        }
    }

    async getAllAccounts() {
        try {
            const accounts = await db.query(`
                SELECT 
                    ba.*,
                    c.first_name,
                    c.last_name,
                    COUNT(bt.id) as transaction_count
                FROM bank_accounts ba
                JOIN characters c ON ba.character_id = c.id
                LEFT JOIN bank_transactions bt ON bt.account_id = ba.id
                WHERE ba.status = 'Active'
                GROUP BY ba.id
                ORDER BY ba.balance DESC
            `);

            return accounts;

        } catch (error) {
            console.error('[Banking] Error fetching all accounts:', error);
            return [];
        }
    }

    async getPendingLoans() {
        try {
            const loans = await db.query(`
                SELECT 
                    bl.*,
                    ba.account_number,
                    c.first_name,
                    c.last_name
                FROM bank_loans bl
                JOIN bank_accounts ba ON bl.account_id = ba.id
                JOIN characters c ON ba.character_id = c.id
                WHERE bl.status = 'Pending'
                ORDER BY bl.created_at DESC
            `);

            return loans;

        } catch (error) {
            console.error('[Banking] Error fetching pending loans:', error);
            return [];
        }
    }

    async approveLoan(loanId, managerId) {
        try {
            const loans = await db.query(
                'SELECT * FROM bank_loans WHERE id = ? AND status = \'Pending\'',
                [loanId]
            );

            if (loans.length === 0) {
                return { success: false, message: 'Loan not found or already processed' };
            }

            const loan = loans[0];

            // Update loan status
            await db.query(
                'UPDATE bank_loans SET status = \'Approved\', approved_by = ?, approved_at = NOW() WHERE id = ?',
                [managerId, loanId]
            );

            // Add funds to account
            await db.query(
                'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
                [loan.loan_amount, loan.account_id]
            );

            // Log transaction
            await db.query(
                `INSERT INTO bank_transactions 
                (account_id, transaction_type, amount, description, timestamp)
                VALUES (?, 'Loan', ?, 'Loan approved and disbursed', NOW())`,
                [loan.account_id, loan.loan_amount]
            );

            console.log(`[Banking] Loan ${loanId} approved by manager ${managerId}`);

            return {
                success: true,
                message: 'Loan approved and funds disbursed'
            };

        } catch (error) {
            console.error('[Banking] Error approving loan:', error);
            return { success: false, message: 'Failed to approve loan' };
        }
    }

    async denyLoan(loanId, managerId, reason = '') {
        try {
            const result = await db.query(
                'UPDATE bank_loans SET status = \'Denied\', approved_by = ?, approved_at = NOW() WHERE id = ? AND status = \'Pending\'',
                [managerId, loanId]
            );

            if (result.affectedRows === 0) {
                return { success: false, message: 'Loan not found or already processed' };
            }

            console.log(`[Banking] Loan ${loanId} denied by manager ${managerId}: ${reason}`);

            return {
                success: true,
                message: 'Loan denied'
            };

        } catch (error) {
            console.error('[Banking] Error denying loan:', error);
            return { success: false, message: 'Failed to deny loan' };
        }
    }

    async freezeAccount(accountId, managerId, reason = '') {
        try {
            await db.query(
                'UPDATE bank_accounts SET status = \'Frozen\' WHERE id = ?',
                [accountId]
            );

            console.log(`[Banking] Account ${accountId} frozen by manager ${managerId}: ${reason}`);

            return {
                success: true,
                message: 'Account frozen successfully'
            };

        } catch (error) {
            console.error('[Banking] Error freezing account:', error);
            return { success: false, message: 'Failed to freeze account' };
        }
    }

    async unfreezeAccount(accountId, managerId) {
        try {
            await db.query(
                'UPDATE bank_accounts SET status = \'Active\' WHERE id = ?',
                [accountId]
            );

            console.log(`[Banking] Account ${accountId} unfrozen by manager ${managerId}`);

            return {
                success: true,
                message: 'Account unfrozen successfully'
            };

        } catch (error) {
            console.error('[Banking] Error unfreezing account:', error);
            return { success: false, message: 'Failed to unfreeze account' };
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    generateAccountNumber() {
        return 'ACC' + Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateSessionId() {
        return 'SES' + Date.now() + Math.floor(Math.random() * 10000);
    }

    generateReferenceNumber(prefix) {
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    generateCardNumber() {
        let number = '4532';
        for (let i = 0; i < 12; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }

    generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }

    async lookupPlayer(identifier) {
        try {
            let account;
            
            if (identifier.startsWith('ACC-')) {
                const accounts = await db.query(
                    'SELECT ba.*, c.first_name, c.last_name FROM bank_accounts ba JOIN characters c ON ba.character_id = c.id WHERE ba.account_number = ?',
                    [identifier]
                );
                account = accounts.length > 0 ? accounts[0] : null;
            } else {
                const characterId = parseInt(identifier);
                const accounts = await db.query(
                    'SELECT ba.*, c.first_name, c.last_name FROM bank_accounts ba JOIN characters c ON ba.character_id = c.id WHERE ba.character_id = ?',
                    [characterId]
                );
                account = accounts.length > 0 ? accounts[0] : null;
            }

            if (account) {
                const name = `${account.first_name} ${account.last_name}`;
                const online = mp.players.toArray().some(p => p.characterId === account.character_id);
                
                return {
                    found: true,
                    name: name,
                    accountNumber: account.account_number,
                    status: online ? 'online' : 'offline'
                };
            }

            return { found: false };

        } catch (error) {
            console.error('[Banking] Lookup error:', error);
            return { found: false };
        }
    }

    // ==================== INTEREST SYSTEM ====================

    async applyInterest() {
        try {
            const accounts = await db.query(
                'SELECT * FROM bank_accounts WHERE status = \'Active\' AND account_type IN (\'Savings\', \'Personal\')'
            );

            let totalInterest = 0;

            for (const account of accounts) {
                const interest = Math.floor(account.balance * (account.interest_rate / 100 / 12));
                
                if (interest > 0) {
                    await db.query(
                        'UPDATE bank_accounts SET balance = balance + ? WHERE id = ?',
                        [interest, account.id]
                    );

                    await db.query(
                        `INSERT INTO bank_transactions 
                        (account_id, transaction_type, amount, description, timestamp)
                        VALUES (?, 'Interest', ?, 'Monthly interest', NOW())`,
                        [account.id, interest]
                    );

                    totalInterest += interest;
                }
            }

            console.log(`[Banking] Applied ${helpers.formatCurrency(totalInterest)} interest to ${accounts.length} accounts`);

        } catch (error) {
            console.error('[Banking] Interest application error:', error);
        }
    }
}

module.exports = new EnhancedBankingSystem();
