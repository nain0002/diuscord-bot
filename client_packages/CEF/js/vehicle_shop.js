let vehicleData = {};
let currentCategory = 'compact';

function showVehicles(vehicles) {
    vehicleData = vehicles;
    
    // Create category tabs
    const tabsContainer = document.getElementById('categoryTabs');
    tabsContainer.innerHTML = '';
    
    const categories = Object.keys(vehicles);
    categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.className = 'tab-button' + (index === 0 ? ' active' : '');
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.onclick = () => showCategory(category);
        tabsContainer.appendChild(button);
    });
    
    // Show first category
    showCategory(categories[0]);
}

function showCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category) {
            btn.classList.add('active');
        }
    });
    
    // Populate vehicles
    const container = document.getElementById('vehiclesContainer');
    container.innerHTML = '';
    
    const vehicles = vehicleData[category] || [];
    vehicles.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.innerHTML = `
            <div class="vehicle-name">${vehicle.name}</div>
            <div class="vehicle-price">$${vehicle.price.toLocaleString()}</div>
            <button class="buy-btn" onclick="buyVehicle('${vehicle.model}', '${vehicle.name}', ${vehicle.price})">Purchase</button>
        `;
        container.appendChild(card);
    });
}

function buyVehicle(model, name, price) {
    mp.trigger('vehicle:buy', model, name, price);
}

function closeMenu() {
    mp.trigger('vehicle:close');
}

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message show ' + type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
