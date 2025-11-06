function showTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-button:nth-child(1)').classList.add('active');
        document.getElementById('login-tab').classList.add('active');
    } else {
        document.querySelector('.tab-button:nth-child(2)').classList.add('active');
        document.getElementById('register-tab').classList.add('active');
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showMessage('error', 'Please fill in all fields!');
        return;
    }
    
    mp.trigger('auth:login', username, password);
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    
    if (!username || !password || !email) {
        showMessage('error', 'Please fill in all fields!');
        return;
    }
    
    mp.trigger('auth:register', username, password, email);
}

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message show ' + type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

// Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'login-tab') {
            login();
        } else {
            register();
        }
    }
});
