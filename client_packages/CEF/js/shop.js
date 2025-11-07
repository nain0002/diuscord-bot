function showShop(shopType, items) {
    const titles = {
        '24/7': '24/7 Store',
        'clothing': 'Clothing Store',
        'gunstore': 'Ammu-Nation',
        'hardware': 'Hardware Store'
    };
    
    document.getElementById('shopTitle').textContent = titles[shopType] || 'Shop';
    
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-type">${item.type}</div>
            <div class="item-price">$${item.price.toLocaleString()}</div>
            <input type="number" class="quantity-input" id="qty-${index}" value="1" min="1" max="99" />
            <button class="buy-btn" onclick="buyItem('${item.name}', '${item.type}', ${item.price}, ${index})">Buy</button>
        `;
        container.appendChild(card);
    });
}

function buyItem(name, type, price, index) {
    const quantity = parseInt(document.getElementById('qty-' + index).value) || 1;
    mp.trigger('shop:buyItem', name, type, price, quantity);
}

function closeMenu() {
    mp.trigger('shop:close');
}

function showMessage(type, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message show ' + type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
