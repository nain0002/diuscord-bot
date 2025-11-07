function showTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const tabs = {
        'deposit': 0,
        'withdraw': 1,
        'transfer': 2
    };
    
    document.querySelectorAll('.tab-button')[tabs[tab]].classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

function deposit() {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    
    if (!amount || amount <= 0) {
        showMessage('error', 'Please enter a valid amount!');
        return;
    }
    
    mp.trigger('banking:deposit', amount);
}

function withdraw() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    
    if (!amount || amount <= 0) {
        showMessage('error', 'Please enter a valid amount!');
        return;
    }
    
    mp.trigger('banking:withdraw', amount);
}

function transfer() {
    const name = document.getElementById('transfer-name').value.trim();
    const amount = parseInt(document.getElementById('transfer-amount').value);
    
    if (!name) {
        showMessage('error', 'Please enter recipient name!');
        return;
    }
    
    if (!amount || amount <= 0) {
        showMessage('error', 'Please enter a valid amount!');
        return;
    }
    
    mp.trigger('banking:transfer', name, amount);
}

function closeMenu() {
    mp.trigger('banking:close');
}

function updateBalance(bankBalance, cash, accountNumber) {
    document.getElementById('bankBalance').textContent = '$' + bankBalance.toLocaleString();
    document.getElementById('cashBalance').textContent = '$' + cash.toLocaleString();
    document.getElementById('accountNumber').textContent = accountNumber;
}

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message show ' + type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
