/**
 * RAGE:MP Modern Inventory System
 * Cyberpunk Style with Glassmorphism
 */

// ========================================
// State Management
// ========================================

const InventoryState = {
    items: [],
    playerData: {
        name: 'Player',
        level: 1,
        health: 100,
        armor: 100,
        money: 0,
        hunger: 100,
        thirst: 100,
        job: 'Unemployed'
    },
    maxWeight: 100,
    currentWeight: 0,
    currentFilter: 'all',
    searchQuery: '',
    selectedItem: null,
    gunSlots: {
        primary: null,
        secondary: null,
        melee: null
    },
    hotbar: [null, null, null, null, null],
    draggedItem: null
};

// ========================================
// Item Database (Icons & Data)
// ========================================

const ItemDatabase = {
    // Weapons
    'pistol': { icon: '🔫', type: 'weapon', weight: 1.2, rarity: 'uncommon', description: 'Standard issue pistol', value: 500 },
    'rifle': { icon: '🔫', type: 'weapon', weight: 3.5, rarity: 'rare', description: 'Assault rifle', value: 2000 },
    'shotgun': { icon: '🔫', type: 'weapon', weight: 4.0, rarity: 'rare', description: 'Pump-action shotgun', value: 1500 },
    'knife': { icon: '🔪', type: 'weapon', weight: 0.5, rarity: 'common', description: 'Combat knife', value: 100 },
    'bat': { icon: '⚾', type: 'weapon', weight: 1.5, rarity: 'common', description: 'Baseball bat', value: 50 },
    
    // Consumables
    'burger': { icon: '🍔', type: 'consumable', weight: 0.3, rarity: 'common', description: 'Restores 25 hunger', value: 10 },
    'pizza': { icon: '🍕', type: 'consumable', weight: 0.4, rarity: 'common', description: 'Restores 35 hunger', value: 15 },
    'water': { icon: '💧', type: 'consumable', weight: 0.5, rarity: 'common', description: 'Restores 50 thirst', value: 5 },
    'soda': { icon: '🥤', type: 'consumable', weight: 0.3, rarity: 'common', description: 'Restores 30 thirst', value: 8 },
    'medkit': { icon: '🏥', type: 'consumable', weight: 1.0, rarity: 'uncommon', description: 'Restores 50 health', value: 100 },
    'bandage': { icon: '🩹', type: 'consumable', weight: 0.1, rarity: 'common', description: 'Restores 15 health', value: 20 },
    
    // Misc Items
    'phone': { icon: '📱', type: 'misc', weight: 0.2, rarity: 'common', description: 'Smartphone', value: 300 },
    'lockpick': { icon: '🔑', type: 'misc', weight: 0.1, rarity: 'uncommon', description: 'Used to pick locks', value: 50 },
    'rope': { icon: '🪢', type: 'misc', weight: 1.5, rarity: 'common', description: 'Strong rope', value: 25 },
    'flashlight': { icon: '🔦', type: 'misc', weight: 0.5, rarity: 'common', description: 'LED flashlight', value: 30 },
    'radio': { icon: '📻', type: 'misc', weight: 0.8, rarity: 'uncommon', description: 'Two-way radio', value: 200 },
    'cigarette': { icon: '🚬', type: 'misc', weight: 0.05, rarity: 'common', description: 'Pack of cigarettes', value: 10 },
    'wallet': { icon: '👛', type: 'misc', weight: 0.1, rarity: 'common', description: 'Leather wallet', value: 50 },
    'watch': { icon: '⌚', type: 'misc', weight: 0.15, rarity: 'rare', description: 'Luxury watch', value: 1000 },
};

// ========================================
// Initialization
// ========================================

function initialize() {
    console.log('[Inventory] Initializing...');
    document.getElementById('inventoryContainer').style.display = 'none';
    document.getElementById('hotbarContainer').style.display = 'flex';
    
    // Add event listeners
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('click', hideContextMenu);
    
    console.log('[Inventory] Ready!');
}

// ========================================
// Open/Close Inventory
// ========================================

function openInventory() {
    const container = document.getElementById('inventoryContainer');
    container.style.display = 'flex';
    container.style.animation = 'slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    renderInventory();
    renderPlayerStats();
    updateWeightDisplay();
}

function closeInventory() {
    const container = document.getElementById('inventoryContainer');
    container.style.animation = 'slideOut 0.3s ease-out';
    
    setTimeout(() => {
        container.style.display = 'none';
        if (typeof mp !== 'undefined') {
            mp.trigger('inventoryClosed');
        }
    }, 300);
}

// ========================================
// Update Inventory Data
// ========================================

function updateInventory(data) {
    console.log('[Inventory] Updating data:', data);
    
    if (data.items) {
        InventoryState.items = data.items;
    }
    
    if (data.playerData) {
        InventoryState.playerData = { ...InventoryState.playerData, ...data.playerData };
    }
    
    if (data.maxWeight) {
        InventoryState.maxWeight = data.maxWeight;
    }
    
    if (data.gunSlots) {
        InventoryState.gunSlots = data.gunSlots;
    }
    
    if (data.hotbar) {
        InventoryState.hotbar = data.hotbar;
    }
    
    renderInventory();
    renderPlayerStats();
    renderGunSlots();
    renderHotbar();
    updateWeightDisplay();
}

// ========================================
// Render Functions
// ========================================

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Filter items
    let filteredItems = InventoryState.items.filter(item => {
        const itemName = (item.name || item.item_name || '').toLowerCase();
        const itemData = ItemDatabase[itemName];
        
        // Filter by category
        if (InventoryState.currentFilter !== 'all') {
            // Map filter names to item types
            const filterMap = {
                'weapons': 'weapon',
                'consumables': 'consumable',
                'misc': 'misc'
            };
            const targetType = filterMap[InventoryState.currentFilter] || InventoryState.currentFilter;
            
            if (!itemData || itemData.type !== targetType) {
                return false;
            }
        }
        
        // Filter by search
        if (InventoryState.searchQuery) {
            return itemName.includes(InventoryState.searchQuery.toLowerCase());
        }
        
        return true;
    });
    
    if (filteredItems.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredItems.map((item, index) => {
        const itemName = (item.name || item.item_name || '').toLowerCase();
        const itemData = ItemDatabase[itemName] || {
            icon: '📦',
            type: 'misc',
            rarity: 'common',
            weight: 0.5
        };
        
        return `
            <div class="inventory-item ${itemData.type}" 
                 draggable="true"
                 data-index="${item.originalIndex || index}"
                 data-item='${JSON.stringify(item)}'
                 ondragstart="dragStart(event)"
                 ondragend="dragEnd(event)"
                 oncontextmenu="showContextMenu(event, ${item.originalIndex || index})"
                 onmouseenter="showTooltip(event, '${item.name}')"
                 onmouseleave="hideTooltip()">
                
                <div class="item-icon">${itemData.icon}</div>
                <div class="item-name">${item.name || item.item_name}</div>
                
                ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                <div class="item-rarity ${itemData.rarity}">${itemData.rarity}</div>
            </div>
        `;
    }).join('');
    
    // Update item count
    document.getElementById('itemCount').textContent = filteredItems.length;
}

function renderPlayerStats() {
    const data = InventoryState.playerData;
    
    // Basic info
    document.getElementById('playerName').textContent = data.name || 'Player';
    document.getElementById('playerLevel').textContent = data.level || 1;
    document.getElementById('playerJob').textContent = data.job || 'Unemployed';
    
    // Health
    const healthPercent = Math.max(0, Math.min(100, data.health || 0));
    document.getElementById('healthBar').style.width = healthPercent + '%';
    document.getElementById('healthValue').textContent = `${Math.round(healthPercent)} / 100`;
    
    // Armor
    const armorPercent = Math.max(0, Math.min(100, data.armor || 0));
    document.getElementById('armorBar').style.width = armorPercent + '%';
    document.getElementById('armorValue').textContent = `${Math.round(armorPercent)} / 100`;
    
    // Money
    document.getElementById('moneyValue').textContent = `$${(data.money || 0).toLocaleString()}`;
    
    // Hunger
    const hungerPercent = Math.max(0, Math.min(100, data.hunger || 0));
    document.getElementById('hungerBar').style.width = hungerPercent + '%';
    document.getElementById('hungerValue').textContent = `${Math.round(hungerPercent)}%`;
    
    // Thirst
    const thirstPercent = Math.max(0, Math.min(100, data.thirst || 0));
    document.getElementById('thirstBar').style.width = thirstPercent + '%';
    document.getElementById('thirstValue').textContent = `${Math.round(thirstPercent)}%`;
}

function renderGunSlots() {
    Object.keys(InventoryState.gunSlots).forEach(slotName => {
        const slotMap = { 'primary': '1', 'secondary': '2', 'melee': '3' };
        const slot = document.getElementById(`gunSlot${slotMap[slotName]}`);
        if (!slot) return;
        
        const weapon = InventoryState.gunSlots[slotName];
        
        if (weapon) {
            const itemData = ItemDatabase[weapon.name.toLowerCase()] || { icon: '🔫' };
            slot.innerHTML = `
                <div class="slot-label">${slotName.toUpperCase()}</div>
                <div class="item-icon" style="font-size: 32px;">${itemData.icon}</div>
                <div style="font-size: 10px; margin-top: 4px;">${weapon.name}</div>
            `;
            slot.classList.add('filled');
        } else {
            slot.innerHTML = `
                <div class="slot-label">${slotName.toUpperCase()}</div>
                <div class="slot-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="12" x2="2" y2="12"></line>
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                    <span>Empty</span>
                </div>
            `;
            slot.classList.remove('filled');
        }
    });
}

function renderHotbar() {
    for (let i = 0; i < 5; i++) {
        const slotContent = document.getElementById(`hotbar${i + 1}`);
        const item = InventoryState.hotbar[i];
        
        if (item) {
            const itemData = ItemDatabase[item.name.toLowerCase()] || { icon: '📦' };
            slotContent.innerHTML = `
                <div style="font-size: 32px;">${itemData.icon}</div>
                ${item.quantity > 1 ? `<div style="position: absolute; bottom: 4px; right: 4px; font-size: 10px; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 4px;">${item.quantity}</div>` : ''}
            `;
        } else {
            slotContent.innerHTML = '';
        }
    }
}

function updateWeightDisplay() {
    // Calculate current weight
    let totalWeight = 0;
    InventoryState.items.forEach(item => {
        const itemData = ItemDatabase[item.name.toLowerCase()];
        const weight = itemData ? itemData.weight : 0.5;
        totalWeight += weight * (item.quantity || 1);
    });
    
    InventoryState.currentWeight = totalWeight;
    
    // Update UI
    document.getElementById('currentWeight').textContent = totalWeight.toFixed(1);
    document.getElementById('maxWeight').textContent = InventoryState.maxWeight;
    
    const weightPercent = (totalWeight / InventoryState.maxWeight) * 100;
    document.getElementById('weightFill').style.width = Math.min(100, weightPercent) + '%';
    
    // Change color based on weight
    const fill = document.getElementById('weightFill');
    if (weightPercent > 90) {
        fill.style.background = 'linear-gradient(90deg, var(--danger-color), var(--danger-color))';
    } else if (weightPercent > 70) {
        fill.style.background = 'linear-gradient(90deg, var(--warning-color), var(--danger-color))';
    } else {
        fill.style.background = 'linear-gradient(90deg, var(--success-color), var(--warning-color))';
    }
}

// ========================================
// Drag and Drop
// ========================================

function dragStart(event) {
    const itemData = JSON.parse(event.target.dataset.item);
    InventoryState.draggedItem = itemData;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
    InventoryState.draggedItem = null;
    
    // Remove all dragover classes
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function allowDrop(event) {
    event.preventDefault();
    event.target.classList.add('drag-over');
}

function dropGun(event, slotType) {
    event.preventDefault();
    event.target.classList.remove('drag-over');
    
    if (!InventoryState.draggedItem) return;
    
    const itemData = ItemDatabase[InventoryState.draggedItem.name.toLowerCase()];
    
    // Check if it's a weapon
    if (itemData && itemData.type === 'weapon') {
        // Send to server
        if (typeof mp !== 'undefined') {
            mp.trigger('equipWeapon', JSON.stringify({
                item: InventoryState.draggedItem,
                slot: slotType
            }));
        }
        
        // Update UI immediately
        InventoryState.gunSlots[slotType] = InventoryState.draggedItem;
        renderGunSlots();
    }
}

// ========================================
// Search and Filter
// ========================================

function searchItems() {
    const searchInput = document.getElementById('searchInput');
    InventoryState.searchQuery = searchInput.value;
    renderInventory();
}

function filterItems(filter) {
    InventoryState.currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
    });
    
    renderInventory();
}

// ========================================
// Tooltip System
// ========================================

function showTooltip(event, itemName) {
    const tooltip = document.getElementById('tooltip');
    const itemData = ItemDatabase[itemName.toLowerCase()];
    
    if (!itemData) {
        console.log('[Inventory] No item data for:', itemName);
        tooltip.style.display = 'none';
        return;
    }
    
    // Populate tooltip
    document.getElementById('tooltipName').textContent = itemName;
    document.getElementById('tooltipRarity').textContent = itemData.rarity;
    document.getElementById('tooltipRarity').className = `tooltip-rarity ${itemData.rarity}`;
    document.getElementById('tooltipDescription').textContent = itemData.description;
    document.getElementById('tooltipWeight').textContent = itemData.weight;
    document.getElementById('tooltipValue').textContent = itemData.value;
    
    // Stats
    const statsHtml = `
        <div><span>Type:</span> <span>${itemData.type}</span></div>
        <div><span>Weight:</span> <span>${itemData.weight} kg</span></div>
    `;
    document.getElementById('tooltipStats').innerHTML = statsHtml;
    
    // Position tooltip
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 20) + 'px';
    tooltip.style.top = event.clientY + 'px';
    
    // Adjust if off-screen
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tooltip.style.left = (event.clientX - rect.width - 20) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        tooltip.style.top = (window.innerHeight - rect.height - 20) + 'px';
    }
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

// ========================================
// Context Menu
// ========================================

let contextMenuItemIndex = null;

function showContextMenu(event, itemIndex) {
    event.preventDefault();
    event.stopPropagation();
    
    contextMenuItemIndex = itemIndex;
    const menu = document.getElementById('contextMenu');
    
    menu.style.display = 'block';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    // Adjust if off-screen
    setTimeout(() => {
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (event.clientX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (event.clientY - rect.height) + 'px';
        }
    }, 0);
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
    contextMenuItemIndex = null;
}

function contextUse() {
    if (contextMenuItemIndex !== null) {
        useItem(contextMenuItemIndex);
    }
    hideContextMenu();
}

function contextEquip() {
    if (contextMenuItemIndex !== null && typeof mp !== 'undefined') {
        mp.trigger('equipItem', contextMenuItemIndex);
    }
    hideContextMenu();
}

function contextHotbar() {
    if (contextMenuItemIndex !== null) {
        // Find first empty hotbar slot
        const emptySlot = InventoryState.hotbar.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            const item = InventoryState.items[contextMenuItemIndex];
            InventoryState.hotbar[emptySlot] = item;
            renderHotbar();
            
            if (typeof mp !== 'undefined') {
                mp.trigger('updateHotbar', JSON.stringify(InventoryState.hotbar));
            }
        }
    }
    hideContextMenu();
}

function contextSplit() {
    if (contextMenuItemIndex !== null && typeof mp !== 'undefined') {
        mp.trigger('splitItem', contextMenuItemIndex);
    }
    hideContextMenu();
}

function contextDrop() {
    if (contextMenuItemIndex !== null && typeof mp !== 'undefined') {
        mp.trigger('dropItem', contextMenuItemIndex);
    }
    hideContextMenu();
}

function contextDestroy() {
    if (contextMenuItemIndex !== null) {
        if (confirm('Are you sure you want to destroy this item? This action cannot be undone.')) {
            if (typeof mp !== 'undefined') {
                mp.trigger('destroyItem', contextMenuItemIndex);
            }
        }
    }
    hideContextMenu();
}

// ========================================
// Item Actions
// ========================================

function useItem(index) {
    if (typeof mp !== 'undefined') {
        mp.trigger('useInventoryItem', index);
    }
    console.log('[Inventory] Using item at index:', index);
}

function useHotbarSlot(slot) {
    const item = InventoryState.hotbar[slot - 1];
    if (item) {
        if (typeof mp !== 'undefined') {
            mp.trigger('useHotbarItem', slot - 1);
        }
        console.log('[Inventory] Using hotbar slot:', slot);
    }
}

// ========================================
// Keyboard Shortcuts
// ========================================

document.addEventListener('keydown', (event) => {
    // ESC to close
    if (event.key === 'Escape') {
        closeInventory();
    }
    
    // Number keys for hotbar (1-5)
    if (!document.querySelector('#searchInput:focus')) {
        if (event.key >= '1' && event.key <= '5') {
            const slot = parseInt(event.key) - 1;
            useHotbarSlot(slot + 1);
        }
    }
});

// ========================================
// Animation Utilities
// ========================================

function playSound(soundName) {
    // Placeholder for sound effects
    console.log('[Inventory] Playing sound:', soundName);
}

function showNotification(message, type = 'info') {
    console.log(`[Inventory] ${type.toUpperCase()}: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: white;
        font-weight: 600;
        z-index: 999999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// Initialize on Load
// ========================================

window.addEventListener('DOMContentLoaded', initialize);

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes slideOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
    }
`;
document.head.appendChild(style);

console.log('[Inventory] Script loaded successfully!');
