function createCharacter() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    
    if (!firstName || !lastName) {
        showMessage('error', 'Please enter both first and last name!');
        return;
    }
    
    if (age < 18 || age > 100) {
        showMessage('error', 'Age must be between 18 and 100!');
        return;
    }
    
    // Generate basic skin data
    const skinData = JSON.stringify({
        model: gender === 'male' ? 'mp_m_freemode_01' : 'mp_f_freemode_01',
        gender: gender
    });
    
    mp.trigger('character:create', firstName, lastName, age, gender, skinData);
}

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message show ' + type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
