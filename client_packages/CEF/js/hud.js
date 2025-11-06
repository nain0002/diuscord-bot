function updateMoney(amount) {
    document.getElementById('money').textContent = '$' + amount.toLocaleString();
}

function updateBank(amount) {
    document.getElementById('bank').textContent = '$' + amount.toLocaleString();
}

function updateHealth(health) {
    const percentage = Math.max(0, Math.min(100, health));
    document.getElementById('health-fill').style.width = percentage + '%';
}

function updateArmor(armor) {
    const percentage = Math.max(0, Math.min(100, armor));
    document.getElementById('armor-fill').style.width = percentage + '%';
}

function updateJob(job) {
    document.getElementById('job').textContent = job.charAt(0).toUpperCase() + job.slice(1);
}

function toggleHud(visible) {
    const hud = document.getElementById('hud');
    if (visible) {
        hud.classList.remove('hidden');
    } else {
        hud.classList.add('hidden');
    }
}
