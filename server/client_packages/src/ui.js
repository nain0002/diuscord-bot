const mp = window.mp || {
  trigger: (...args) => {
    // eslint-disable-next-line no-console
    console.log('mp.trigger', ...args);
  }
};

const getEl = (id) => document.getElementById(id);

const state = {
  activeTab: 'login',
  inventory: []
};

const elements = {};

const setMessage = (text, isError = false) => {
  const el = elements.message;
  if (!text) {
    el.classList.add('hidden');
    el.textContent = '';
    el.classList.remove('error');
    return;
  }
  el.textContent = text;
  el.classList.remove('hidden');
  if (isError) {
    el.classList.add('error');
  } else {
    el.classList.remove('error');
  }
};

const setTab = (tab) => {
  state.activeTab = tab;
  elements.tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  elements.loginForm.classList.toggle('hidden', tab !== 'login');
  elements.registerForm.classList.toggle('hidden', tab !== 'register');
  setMessage('');
};

const showAuth = ({ playerName }) => {
  document.body.classList.remove('inventory-mode');
  elements.authRoot.classList.remove('hidden');
  elements.inventoryBackdrop.classList.add('hidden');
  elements.welcomeSubtitle.textContent = playerName
    ? `Welcome back, ${playerName.toUpperCase()}`
    : 'WELCOME BACK';
  setTab('login');
};

const toggleInventory = (isOpen) => {
  if (isOpen) {
    elements.inventoryBackdrop.classList.remove('hidden');
    elements.authRoot.classList.add('hidden');
  } else {
    elements.inventoryBackdrop.classList.add('hidden');
  }
};

const renderInventory = (items) => {
  state.inventory = items || [];
  const grid = elements.inventoryGrid;
  grid.innerHTML = '';
  if (!state.inventory.length) {
    elements.inventoryEmpty.classList.remove('hidden');
    return;
  }
  elements.inventoryEmpty.classList.add('hidden');
  state.inventory.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'inventory-card';
    card.innerHTML = `
      <h4>${item.label}</h4>
      <span>Code: ${item.item_code}</span>
      <span>Quantity: ${item.quantity}</span>
      <button data-item-id="${item.id}">Use Item</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      mp.trigger('cef:inventory:useItem', JSON.stringify({ itemId: item.id, quantity: item.quantity - 1 }));
    });
    grid.appendChild(card);
  });
};

const handleFormSubmit = (event, type) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {};
  formData.forEach((value, key) => {
    payload[key] = value.trim();
  });
  if (!payload.username || !payload.password) {
    setMessage('Please complete all required fields.', true);
    return;
  }
  mp.trigger(`cef:auth:${type}`, JSON.stringify(payload));
};

const handleMessage = ({ detail }) => {
  if (!detail) return;
  const { event, payload } = detail;
  switch (event) {
    case 'auth:show':
      showAuth(payload || {});
      break;
    case 'auth:register:success':
      setTab('login');
      setMessage('Account created! Please log in to complete your registration.');
      break;
    case 'auth:register:error':
      setMessage(payload?.message || 'Registration failed.', true);
      break;
    case 'auth:login:error':
      setMessage(payload?.message || 'Login failed.', true);
      break;
    case 'auth:login:success':
      setMessage('Welcome back! Loading city data...');
      toggleInventory(false);
      break;
    case 'inventory:open':
      toggleInventory(true);
      break;
    case 'inventory:update':
      toggleInventory(true);
      renderInventory(payload?.items || []);
      break;
    default:
      break;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  elements.authRoot = getEl('auth-root');
  elements.welcomeSubtitle = getEl('welcome-subtitle');
  elements.message = getEl('message-container');
  elements.loginForm = getEl('login-form');
  elements.registerForm = getEl('register-form');
  elements.backToLogin = getEl('back-to-login');
  elements.inventoryBackdrop = getEl('inventory-backdrop');
  elements.inventoryClose = getEl('inventory-close');
  elements.inventoryGrid = getEl('inventory-grid');
  elements.inventoryEmpty = getEl('inventory-empty');
  elements.tabButtons = Array.from(document.querySelectorAll('.tab-switcher button'));

  elements.loginForm.addEventListener('submit', (event) => handleFormSubmit(event, 'login'));
  elements.registerForm.addEventListener('submit', (event) => handleFormSubmit(event, 'register'));

  elements.backToLogin.addEventListener('click', () => setTab('login'));
  elements.inventoryClose.addEventListener('click', () => {
    toggleInventory(false);
    mp.trigger('cef:inventory:close');
  });

  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.tab));
  });

  window.addEventListener('rage:message', handleMessage);

  mp.trigger('cef:ready');
});
