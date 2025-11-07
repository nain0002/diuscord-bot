/**
 * Login Page JavaScript
 */

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    // Show loader
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('success', data.message);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 500);
        } else {
            showMessage('error', data.error || 'Login failed');
        }

    } catch (error) {
        showMessage('error', 'Connection error. Please try again.');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message show ${type}`;
    messageDiv.textContent = message;

    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
