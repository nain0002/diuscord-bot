/**
 * Inventory UI JavaScript
 * Handles inventory display and interactions
 */

let inventory = [];
let selectedItem = null;
let currentCategory = 'all';

// Item icons mapping
const itemIcons = {
    // Weapons
    weapon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
    </svg>`,
    
    // Food
    food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>`,
    
    // Items
    item: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>`,
    
    // Clothing
    clothing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`
};

// Item descriptions
const itemDescriptions = {
    'Burger': 'A delicious burger that restores your health and hunger.',
    'Water': 'Fresh water to quench your thirst and restore stamina.',
    'Pizza': 'A large pizza slice that fills you up nicely.',
    'Soda': 'A refreshing carbonated drink.',
    'Phone': 'A mobile phone for communication and apps.',
    'Lockpick': 'Used to unlock doors and vehicles.',
    'Rope': 'Strong rope useful for various activities.',
    'Bandage': 'First aid item that restores a small amount of health.',
    'Medkit': 'Professional medical kit that fully restores health.'
};

// Item weights (kg)
const itemWeights = {
    'Burger': 0.3,
    'Water': 0.5,
    'Pizza': 0.4,
    'Soda': 0.3,
    'Phone': 0.2,
    'Lockpick': 0.1,
    'Rope': 1.5,
    'Bandage': 0.1,
    'Medkit': 1.0
};

// Show inventory
function showInventory(inventoryData) {
    inventory = inventoryData;
    selectedItem = null;
    
    renderInventory();
    updateCategoryCounts();
    updateWeight();
    
    document.getElementById('detailsPanel').style.display = 'none';
}

// Render inventory
function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Filter items
    const filteredItems = inventory.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.item_type === currentCategory;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
    
    // Show/hide empty state
    if (filteredItems.length === 0) {
        grid.style.display = 'none';
        emptyState.classList.add('show');
        return;
    } else {
        grid.style.display = 'grid';
        emptyState.classList.remove('show');
    }
    
    // Render items
    grid.innerHTML = '';
    filteredItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        if (selectedItem && selectedItem.id === item.id) {
            itemDiv.classList.add('selected');
        }
        
        const icon = itemIcons[item.item_type] || itemIcons.item;
        
        itemDiv.innerHTML = `
            <div class="item-icon">${icon}</div>
            <div class="item-name" title="${item.item_name}">${item.item_name}</div>
            <div class="item-quantity">x${item.quantity}</div>
            <div class="item-type-badge">${item.item_type}</div>
        `;
        
        itemDiv.onclick = () => selectItem(item);
        grid.appendChild(itemDiv);
    });
}

// Select item
function selectItem(item) {
    selectedItem = item;
    renderInventory();
    showItemDetails(item);
}

// Show item details
function showItemDetails(item) {
    const panel = document.getElementById('detailsPanel');
    const icon = itemIcons[item.item_type] || itemIcons.item;
    const weight = itemWeights[item.item_name] || 0.5;
    const description = itemDescriptions[item.item_name] || 'No description available.';
    
    document.getElementById('detailName').textContent = item.item_name;
    document.getElementById('detailRarity').textContent = item.item_type;
    document.getElementById('detailImage').innerHTML = icon;
    document.getElementById('detailType').textContent = item.item_type;
    document.getElementById('detailQuantity').textContent = item.quantity;
    document.getElementById('detailWeight').textContent = `${(weight * item.quantity).toFixed(1)} kg`;
    document.getElementById('detailDescription').textContent = description;
    
    panel.style.display = 'flex';
}

// Update category counts
function updateCategoryCounts() {
    const counts = {
        all: inventory.length,
        weapon: 0,
        food: 0,
        item: 0,
        clothing: 0
    };
    
    inventory.forEach(item => {
        if (counts[item.item_type] !== undefined) {
            counts[item.item_type]++;
        }
    });
    
    Object.keys(counts).forEach(category => {
        const element = document.getElementById(`count-${category}`);
        if (element) {
            element.textContent = counts[category];
        }
    });
}

// Update weight
function updateWeight() {
    let totalWeight = 0;
    inventory.forEach(item => {
        const weight = itemWeights[item.item_name] || 0.5;
        totalWeight += weight * item.quantity;
    });
    
    document.getElementById('currentWeight').textContent = totalWeight.toFixed(1);
}

// Filter by category
function filterCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    renderInventory();
}

// Filter items (search)
function filterItems() {
    renderInventory();
}

// Use item
function useItem() {
    if (!selectedItem) return;
    
    if (window.mp) {
        mp.trigger('inventory:useItem', selectedItem.id, selectedItem.item_name);
    }
}

// Drop item
function dropItem() {
    if (!selectedItem) return;
    
    if (window.mp) {
        mp.trigger('inventory:dropItem', selectedItem.id, selectedItem.item_name);
    }
}

// Give item
function giveItem() {
    if (!selectedItem) return;
    
    if (window.mp) {
        mp.trigger('inventory:giveItem', selectedItem.id, selectedItem.item_name);
    }
}

// Close inventory
function closeInventory() {
    if (window.mp) {
        mp.trigger('inventory:close');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInventory();
    }
});

console.log('[Inventory UI] Loaded');
