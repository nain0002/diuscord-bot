// Futuristic Banking Interface - Client-Side JavaScript
// Connects with RAGE:MP

const BankingUI = {
    currentTab: 'overview',
    playerData: {},
    accountData: {},
    transactions: [],
    currentPage: 1,
    itemsPerPage: 10,
    pendingAction: null,

    init() {
        this.setupEventListeners();
        this.loadSounds();
        console.log('[Banking UI] Initialized');
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
                this.playSound('click');
            });
        });

        // Quick Actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.switchTab(action);
                this.playSound('click');
            });
        });

        // Close Button
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeBank();
            this.playSound('close');
        });

        // Deposit Tab
        this.setupDepositListeners();

        // Withdraw Tab
        this.setupWithdrawListeners();

        // Transfer Tab
        this.setupTransferListeners();

        // Loans Tab
        this.setupLoansListeners();

        // Cards Tab
        this.setupCardsListeners();

        // Manager Tab
        this.setupManagerListeners();

        // Modals
        this.setupModalListeners();

        // Refresh Balance
        document.getElementById('refreshBalance').addEventListener('click', () => {
            this.refreshBalance();
            this.playSound('success');
        });

        // Transaction Filters
        document.getElementById('transactionFilter')?.addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('transactionDate')?.addEventListener('change', () => {
            this.filterTransactions();
        });

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTransactions();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTransactions();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeBank();
            }
        });
    },

    setupDepositListeners() {
        const depositAmount = document.getElementById('depositAmount');
        const depositSlider = document.getElementById('depositSlider');
        const depositBtn = document.getElementById('depositBtn');

        // Slider sync with input
        depositSlider.addEventListener('input', (e) => {
            const percentage = e.target.value;
            const cashOnHand = this.playerData.cash || 0;
            const amount = Math.floor((cashOnHand * percentage) / 100);
            depositAmount.value = amount;
        });

        // Input sync with slider
        depositAmount.addEventListener('input', (e) => {
            const amount = parseInt(e.target.value) || 0;
            const cashOnHand = this.playerData.cash || 0;
            const percentage = Math.min((amount / cashOnHand) * 100, 100);
            depositSlider.value = percentage;
        });

        // Quick amounts
        document.querySelectorAll('#tab-deposit .quick-amount').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.currentTarget.dataset.amount;
                if (amount === 'all') {
                    depositAmount.value = this.playerData.cash || 0;
                    depositSlider.value = 100;
                } else {
                    const value = parseInt(amount);
                    depositAmount.value = Math.min(value, this.playerData.cash || 0);
                    depositSlider.value = Math.min((value / (this.playerData.cash || 1)) * 100, 100);
                }
                this.playSound('click');
            });
        });

        // Deposit button
        depositBtn.addEventListener('click', () => {
            const amount = parseInt(depositAmount.value);
            if (amount > 0 && amount <= this.playerData.cash) {
                this.deposit(amount);
            } else {
                this.showNotification('Invalid amount or insufficient cash', 'error');
            }
        });
    },

    setupWithdrawListeners() {
        const withdrawAmount = document.getElementById('withdrawAmount');
        const withdrawSlider = document.getElementById('withdrawSlider');
        const withdrawBtn = document.getElementById('withdrawBtn');

        withdrawSlider.addEventListener('input', (e) => {
            const percentage = e.target.value;
            const balance = this.accountData.balance || 0;
            const amount = Math.floor((balance * percentage) / 100);
            withdrawAmount.value = amount;
        });

        withdrawAmount.addEventListener('input', (e) => {
            const amount = parseInt(e.target.value) || 0;
            const balance = this.accountData.balance || 0;
            const percentage = Math.min((amount / balance) * 100, 100);
            withdrawSlider.value = percentage;
        });

        document.querySelectorAll('#tab-withdraw .quick-amount').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.currentTarget.dataset.amount;
                if (amount === 'all') {
                    withdrawAmount.value = this.accountData.balance || 0;
                    withdrawSlider.value = 100;
                } else {
                    const value = parseInt(amount);
                    withdrawAmount.value = Math.min(value, this.accountData.balance || 0);
                    withdrawSlider.value = Math.min((value / (this.accountData.balance || 1)) * 100, 100);
                }
                this.playSound('click');
            });
        });

        withdrawBtn.addEventListener('click', () => {
            const amount = parseInt(withdrawAmount.value);
            if (amount > 0 && amount <= this.accountData.balance) {
                this.withdraw(amount);
            } else {
                this.showNotification('Invalid amount or insufficient balance', 'error');
            }
        });
    },

    setupTransferListeners() {
        const transferRecipient = document.getElementById('transferRecipient');
        const transferAmount = document.getElementById('transferAmount');
        const transferNote = document.getElementById('transferNote');
        const transferBtn = document.getElementById('transferBtn');
        const lookupBtn = document.getElementById('lookupPlayer');

        // Lookup player
        lookupBtn.addEventListener('click', () => {
            const recipient = transferRecipient.value.trim();
            if (recipient) {
                this.lookupPlayer(recipient);
            }
        });

        // Update transfer summary
        transferAmount.addEventListener('input', () => {
            const amount = parseFloat(transferAmount.value) || 0;
            const fee = amount * 0.01; // 1% fee
            const total = amount + fee;
            
            document.getElementById('transferDisplayAmount').textContent = `$${amount.toFixed(2)}`;
            document.getElementById('transferFee').textContent = `$${fee.toFixed(2)}`;
            document.getElementById('transferTotal').textContent = `$${total.toFixed(2)}`;
        });

        // Transfer button
        transferBtn.addEventListener('click', () => {
            const recipient = transferRecipient.value.trim();
            const amount = parseFloat(transferAmount.value);
            const note = transferNote.value.trim();

            if (!recipient) {
                this.showNotification('Please enter recipient account', 'error');
                return;
            }

            if (amount <= 0 || amount > this.accountData.balance) {
                this.showNotification('Invalid amount or insufficient balance', 'error');
                return;
            }

            this.transfer(recipient, amount, note);
        });
    },

    setupLoansListeners() {
        const loanAmount = document.getElementById('loanAmount');
        const loanTerm = document.getElementById('loanTerm');
        const applyLoanBtn = document.getElementById('applyLoanBtn');

        // Calculate loan on change
        const calculateLoan = () => {
            const principal = parseFloat(loanAmount.value) || 0;
            const months = parseInt(loanTerm.value);
            const rate = 5.5 / 100 / 12; // Monthly rate
            
            const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
            const totalRepayment = monthlyPayment * months;

            document.getElementById('monthlyPayment').textContent = `$${monthlyPayment.toFixed(2)}`;
            document.getElementById('totalRepayment').textContent = `$${totalRepayment.toFixed(2)}`;
        };

        loanAmount.addEventListener('input', calculateLoan);
        loanTerm.addEventListener('change', calculateLoan);

        applyLoanBtn.addEventListener('click', () => {
            const amount = parseFloat(loanAmount.value);
            const term = parseInt(loanTerm.value);

            if (amount < 1000) {
                this.showNotification('Minimum loan amount is $1,000', 'error');
                return;
            }

            this.applyForLoan(amount, term);
        });
    },

    setupCardsListeners() {
        document.getElementById('requestCardBtn')?.addEventListener('click', () => {
            this.requestCard();
        });
    },

    setupManagerListeners() {
        document.getElementById('viewAccountsBtn')?.addEventListener('click', () => {
            this.viewAllAccounts();
        });

        document.getElementById('approveLoansBtn')?.addEventListener('click', () => {
            this.viewPendingLoans();
        });

        document.getElementById('manageSecurityBtn')?.addEventListener('click', () => {
            this.manageSecuritySettings();
        });

        document.getElementById('lockdownBtn')?.addEventListener('click', () => {
            this.initiateLockdown();
        });
    },

    setupModalListeners() {
        // PIN Modal
        const pinDigits = document.querySelectorAll('.pin-digit');
        pinDigits.forEach((digit, index) => {
            digit.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < pinDigits.length - 1) {
                    pinDigits[index + 1].focus();
                }
            });

            digit.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    pinDigits[index - 1].focus();
                }
            });
        });

        document.getElementById('confirmPinBtn').addEventListener('click', () => {
            const pin = Array.from(pinDigits).map(d => d.value).join('');
            if (pin.length === 4) {
                this.verifyPIN(pin);
            }
        });

        document.getElementById('cancelPinBtn').addEventListener('click', () => {
            this.closeModal('pinModal');
        });

        // Confirmation Modal
        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            if (this.pendingAction) {
                this.pendingAction();
                this.pendingAction = null;
            }
            this.closeModal('confirmModal');
        });

        document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
            this.closeModal('confirmModal');
        });
    },

    // Tab Switching
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        if (tabName === 'transactions') {
            this.loadTransactions();
        } else if (tabName === 'loans') {
            this.loadLoans();
        } else if (tabName === 'cards') {
            this.loadCards();
        } else if (tabName === 'manager') {
            this.loadManagerData();
        }
    },

    // Banking Actions
    deposit(amount) {
        this.showModal('confirmModal', 'Confirm Deposit', `Deposit $${amount} into your account?`);
        this.pendingAction = () => {
            mp.trigger('bank:deposit', amount);
            this.playSound('money');
        };
    },

    withdraw(amount) {
        this.showModal('pinModal');
        this.pendingAction = () => {
            mp.trigger('bank:withdraw', amount);
            this.playSound('money');
        };
    },

    transfer(recipient, amount, note) {
        this.showModal('pinModal');
        this.pendingAction = () => {
            mp.trigger('bank:transfer', recipient, amount, note);
            this.playSound('money');
        };
    },

    applyForLoan(amount, term) {
        this.showModal('confirmModal', 'Apply for Loan', `Apply for a loan of $${amount} for ${term} months?`);
        this.pendingAction = () => {
            mp.trigger('bank:applyLoan', amount, term);
        };
    },

    requestCard() {
        mp.trigger('bank:requestCard');
    },

    lookupPlayer(identifier) {
        mp.trigger('bank:lookupPlayer', identifier);
    },

    verifyPIN(pin) {
        this.closeModal('pinModal');
        if (this.pendingAction) {
            mp.trigger('bank:verifyPIN', pin);
        }
    },

    refreshBalance() {
        mp.trigger('bank:refreshBalance');
        this.showNotification('Balance refreshed', 'success');
    },

    // Manager Actions
    viewAllAccounts() {
        mp.trigger('bank:manager:viewAccounts');
    },

    viewPendingLoans() {
        mp.trigger('bank:manager:viewLoans');
    },

    manageSecuritySettings() {
        mp.trigger('bank:manager:security');
    },

    initiateLockdown() {
        this.showModal('confirmModal', 'Initiate Lockdown', 'This will lock all bank operations. Continue?');
        this.pendingAction = () => {
            mp.trigger('bank:manager:lockdown');
            this.playSound('alert');
        };
    },

    // UI Updates
    updatePlayerData(data) {
        this.playerData = data;
        document.getElementById('playerName').textContent = data.name || 'Player';
        document.getElementById('cashOnHand').textContent = `$${this.formatMoney(data.cash || 0)}`;
    },

    updateAccountData(data) {
        this.accountData = data;
        document.getElementById('accountNumber').textContent = data.account_number || 'ACC-000000';
        document.getElementById('accountType').textContent = data.account_type || 'Personal';
        document.getElementById('mainBalance').textContent = this.formatMoney(data.balance || 0);
        document.getElementById('availableBalance').textContent = `$${this.formatMoney(data.balance || 0)}`;
        document.getElementById('totalDeposits').textContent = `$${this.formatMoney(data.total_deposits || 0)}`;
        document.getElementById('totalWithdrawals').textContent = `$${this.formatMoney(data.total_withdrawals || 0)}`;
        document.getElementById('interestRate').textContent = `${(data.interest_rate || 0)}%`;

        // Show manager tab if applicable
        if (data.account_type === 'Manager') {
            document.querySelector('.manager-only').style.display = 'flex';
        }
    },

    loadTransactions() {
        mp.trigger('bank:getTransactions');
    },

    renderTransactions(transactions) {
        if (transactions) {
            this.transactions = transactions;
        }

        const container = document.getElementById('transactionsContainer');
        const recentContainer = document.getElementById('recentTransactions');
        
        // Clear containers
        if (container) container.innerHTML = '';
        if (recentContainer) recentContainer.innerHTML = '';

        // Paginate
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageTransactions = this.transactions.slice(start, end);

        // Render full list
        pageTransactions.forEach(tx => {
            const element = this.createTransactionElement(tx);
            if (container) container.appendChild(element);
        });

        // Render recent (first 5)
        this.transactions.slice(0, 5).forEach(tx => {
            const element = this.createTransactionElement(tx);
            if (recentContainer) recentContainer.appendChild(element);
        });

        // Update pagination
        const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
    },

    createTransactionElement(tx) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        
        const type = tx.transaction_type || 'Unknown';
        const icon = this.getTransactionIcon(type);
        const isPositive = type.includes('Deposit') || type.includes('Transfer_In');
        const amount = tx.amount || 0;

        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${type.toLowerCase()}">
                    ${icon}
                </div>
                <div class="transaction-details">
                    <h4>${type.replace('_', ' ')}</h4>
                    <p>${new Date(tx.timestamp).toLocaleString()}</p>
                </div>
            </div>
            <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '+' : '-'}$${this.formatMoney(amount)}
            </div>
        `;

        return div;
    },

    getTransactionIcon(type) {
        const icons = {
            'Deposit': '💰',
            'Withdraw': '💸',
            'Transfer_In': '📥',
            'Transfer_Out': '📤',
            'Interest': '📈',
            'Fee': '📊',
            'Loan': '💳',
            'Robbery': '🚨'
        };
        return icons[type] || '💵';
    },

    filterTransactions() {
        const typeFilter = document.getElementById('transactionFilter').value;
        const dateFilter = document.getElementById('transactionDate').value;

        mp.trigger('bank:filterTransactions', typeFilter, dateFilter);
    },

    loadLoans() {
        mp.trigger('bank:getLoans');
    },

    renderLoans(loans) {
        const container = document.querySelector('.loans-list');
        if (!container) return;

        container.innerHTML = '';

        if (loans.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No active loans</p>';
            return;
        }

        loans.forEach(loan => {
            const div = document.createElement('div');
            div.className = 'glass-panel';
            div.style.padding = '20px';
            div.style.marginBottom = '15px';

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Loan #${loan.id}</h4>
                        <p style="color: rgba(255,255,255,0.6);">
                            ${loan.payments_made} / ${loan.loan_term} payments made
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: 700; color: var(--neon-blue);">
                            $${this.formatMoney(loan.remaining_balance)}
                        </div>
                        <p style="color: rgba(255,255,255,0.6);">Remaining</p>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${(loan.payments_made / loan.loan_term) * 100}%; height: 100%; background: var(--gradient-success);"></div>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    },

    loadCards() {
        mp.trigger('bank:getCards');
    },

    renderCards(cards) {
        const container = document.getElementById('cardsGrid');
        if (!container) return;

        container.innerHTML = '';

        cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'credit-card';
            
            const gradients = {
                'Debit': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'Credit': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'Platinum': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'Black': 'linear-gradient(135deg, #000000 0%, #434343 100%)'
            };

            div.style.background = gradients[card.card_type] || gradients['Debit'];

            div.innerHTML = `
                <div class="card-chip"></div>
                <div class="card-number">${this.formatCardNumber(card.card_number)}</div>
                <div class="card-info">
                    <div class="card-holder">
                        <div class="card-label">Card Holder</div>
                        <div class="card-value">${card.card_holder}</div>
                    </div>
                    <div class="card-expiry">
                        <div class="card-label">Expires</div>
                        <div class="card-value">${this.formatExpiry(card.expiry_date)}</div>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    },

    loadManagerData() {
        mp.trigger('bank:manager:getData');
    },

    updateManagerData(data) {
        document.getElementById('totalAccounts').textContent = data.totalAccounts || 0;
        document.getElementById('totalBalance').textContent = `$${this.formatMoney(data.totalBalance || 0)}`;
        document.getElementById('todayTransactions').textContent = data.todayTransactions || 0;
        document.getElementById('pendingLoans').textContent = data.pendingLoans || 0;
    },

    // Robbery Alert
    showRobberyAlert(location, timeLeft) {
        const alert = document.getElementById('robberyAlert');
        const locationElem = document.getElementById('robberyLocation');
        const timerElem = document.getElementById('robberyTimer');

        locationElem.textContent = location;
        alert.style.display = 'flex';

        this.playSound('alert');

        // Countdown
        const countdown = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElem.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                alert.style.display = 'none';
            }
        }, 1000);

        document.getElementById('callPoliceBtn').addEventListener('click', () => {
            mp.trigger('bank:callPolice');
            clearInterval(countdown);
            alert.style.display = 'none';
        });
    },

    hideRobberyAlert() {
        document.getElementById('robberyAlert').style.display = 'none';
    },

    // Modals
    showModal(modalId, title, message) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (title && modalId === 'confirmModal') {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
        }

        modal.style.display = 'flex';
        this.playSound('open');

        // Clear PIN inputs
        if (modalId === 'pinModal') {
            document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
            document.querySelector('.pin-digit').focus();
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Notifications
    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <div class="notification-text">
                    <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;

        container.appendChild(notification);

        this.playSound(type);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-out';
            setTimeout(() => notification.remove(), 400);
        }, 5000);
    },

    // Utility Functions
    formatMoney(amount) {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatCardNumber(number) {
        return number.match(/.{1,4}/g).join(' ');
    },

    formatExpiry(date) {
        const d = new Date(date);
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
    },

    // Sound System
    loadSounds() {
        this.sounds = {
            click: new Audio('sounds/click.mp3'),
            money: new Audio('sounds/money.mp3'),
            success: new Audio('sounds/success.mp3'),
            error: new Audio('sounds/error.mp3'),
            alert: new Audio('sounds/alert.mp3'),
            open: new Audio('sounds/open.mp3'),
            close: new Audio('sounds/close.mp3')
        };

        // Set volumes
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    },

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(() => {});
        }
    },

    // Bank Control
    openBank() {
        document.getElementById('bankContainer').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.playSound('open');
    },

    closeBank() {
        mp.trigger('bank:close');
        document.getElementById('bankContainer').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BankingUI.init());
} else {
    BankingUI.init();
}

// RAGE:MP Event Handlers (called from client.js)
if (typeof mp !== 'undefined') {
    // Update player data
    mp.events.add('updatePlayerData', (data) => {
        BankingUI.updatePlayerData(JSON.parse(data));
    });

    // Update account data
    mp.events.add('updateAccountData', (data) => {
        BankingUI.updateAccountData(JSON.parse(data));
    });

    // Update transactions
    mp.events.add('updateTransactions', (transactions) => {
        BankingUI.renderTransactions(JSON.parse(transactions));
    });

    // Update loans
    mp.events.add('updateLoans', (loans) => {
        BankingUI.renderLoans(JSON.parse(loans));
    });

    // Update cards
    mp.events.add('updateCards', (cards) => {
        BankingUI.renderCards(JSON.parse(cards));
    });

    // Update manager data
    mp.events.add('updateManagerData', (data) => {
        BankingUI.updateManagerData(JSON.parse(data));
    });

    // Show recipient info
    mp.events.add('showRecipientInfo', (name, status) => {
        const info = document.getElementById('recipientInfo');
        document.getElementById('recipientName').textContent = name;
        document.getElementById('recipientStatus').className = `recipient-status ${status}`;
        info.style.display = 'flex';
    });

    // Robbery alert
    mp.events.add('robberyAlert', (location, timeLeft) => {
        BankingUI.showRobberyAlert(location, timeLeft);
    });

    // Hide robbery alert
    mp.events.add('hideRobberyAlert', () => {
        BankingUI.hideRobberyAlert();
    });

    // Notifications
    mp.events.add('showNotification', (message, type) => {
        BankingUI.showNotification(message, type);
    });

    // PIN verification result
    mp.events.add('pinVerified', (success) => {
        if (success && BankingUI.pendingAction) {
            BankingUI.pendingAction();
            BankingUI.pendingAction = null;
        } else {
            BankingUI.showNotification('Invalid PIN', 'error');
        }
    });
}
