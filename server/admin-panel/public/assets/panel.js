const state = {
  token: null,
  socket: null,
  dashboard: null
};

const el = (id) => document.getElementById(id);

const elements = {};

const apiFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || response.statusText);
  }
  return response.json();
};

const setLoginMessage = (message, isError = false) => {
  const container = elements.loginMessage;
  if (!message) {
    container.textContent = '';
    container.classList.add('hidden');
    container.classList.remove('error');
    return;
  }
  container.textContent = message;
  container.classList.remove('hidden');
  container.classList.toggle('error', isError);
};

const setGrantMessage = (message, isError = false) => {
  const container = elements.grantMessage;
  if (!message) {
    container.classList.add('hidden');
    container.textContent = '';
    container.classList.remove('error');
    return;
  }
  container.textContent = message;
  container.classList.remove('hidden');
  container.classList.toggle('error', isError);
};

const saveToken = (token) => {
  state.token = token;
  if (token) {
    localStorage.setItem('rage-admin-token', token);
  } else {
    localStorage.removeItem('rage-admin-token');
  }
};

const populatePlayers = (players) => {
  const tbody = elements.playersTable.querySelector('tbody');
  tbody.innerHTML = '';
  players.forEach((player) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${player.username}</td>
      <td><span class="badge">${player.role}</span></td>
      <td>$${player.cash ?? 0}</td>
      <td>$${player.bank ?? 0}</td>
      <td>${player.last_login || 'N/A'}</td>
    `;
    tbody.appendChild(tr);
  });
  elements.statPlayers.textContent = players.length;
};

const populateChat = (messages) => {
  const container = elements.chatLog;
  container.innerHTML = '';
  messages.forEach((message) => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `
      <div>
        <strong>${message.username || 'SYSTEM'}</strong>
        <p style="margin:4px 0 0;">${message.message}</p>
      </div>
      <span>${new Date(message.created_at).toLocaleTimeString()}</span>
    `;
    container.appendChild(div);
  });
};

const populateActivity = (activity) => {
  const container = elements.activityLog;
  container.innerHTML = '';
  activity.forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `
      <div>
        <strong>${entry.type}</strong>
        <p style="margin:4px 0 0; opacity:0.75;">${JSON.stringify(entry.payload || {})}</p>
      </div>
      <span>${new Date(entry.created_at).toLocaleString()}</span>
    `;
    container.appendChild(div);
  });
  elements.statActivity.textContent = activity.length;
};

const loadDashboard = async () => {
  state.dashboard = await apiFetch('/api/dashboard');
  elements.adminUsername.textContent = state.dashboard?.players?.find((p) => p.role === 'admin')?.username || 'Administrator';
  populatePlayers(state.dashboard.players || []);
  populateChat(state.dashboard.recentChat || []);
  populateActivity(state.dashboard.activity || []);
  const registrationsToday = (state.dashboard.players || []).filter((player) => {
    const created = new Date(player.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;
  elements.statRegistrations.textContent = registrationsToday;
};

const showDashboard = async () => {
  elements.loginView.classList.add('hidden');
  elements.dashboard.classList.remove('hidden');
  await loadDashboard();
  connectSocket();
};

const connectSocket = () => {
  if (state.socket) {
    state.socket.disconnect();
  }
  state.socket = io({ auth: { token: state.token } });
  state.socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Socket connected');
  });
  state.socket.on('init', (payload) => {
    if (!payload) return;
    populatePlayers(payload.players || []);
    populateChat(payload.recentChat || []);
    populateActivity(payload.activity || []);
  });
  state.socket.on('chat:new', async () => {
    const data = await apiFetch('/api/chat/recent');
    populateChat(data.messages || []);
  });
  state.socket.on('inventory:update', () => {
    loadDashboard();
  });
  state.socket.on('panel:login', () => loadDashboard());
  state.socket.on('panel:logout', () => loadDashboard());
};

const attemptAutoLogin = async () => {
  const token = localStorage.getItem('rage-admin-token');
  if (!token) return;
  saveToken(token);
  try {
    await loadDashboard();
    elements.loginView.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    connectSocket();
  } catch (error) {
    saveToken(null);
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const credentials = Object.fromEntries(formData.entries());
  try {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    saveToken(response.token);
    setLoginMessage('Authenticated. Loading control center...');
    setTimeout(() => {
      showDashboard();
    }, 400);
  } catch (error) {
    setLoginMessage(error.message || 'Login failed', true);
  }
};

const handleLogout = async () => {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    // ignore errors on logout
  }
  saveToken(null);
  if (state.socket) {
    state.socket.disconnect();
    state.socket = null;
  }
  elements.dashboard.classList.add('hidden');
  elements.loginView.classList.remove('hidden');
  setLoginMessage('Session ended.');
};

const handleGrantItem = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    await apiFetch('/api/inventory/grant', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setGrantMessage('Item granted successfully.');
    event.target.reset();
    loadDashboard();
  } catch (error) {
    setGrantMessage(error.message || 'Failed to grant item', true);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  elements.loginView = el('login-view');
  elements.dashboard = el('dashboard');
  elements.loginForm = el('login-form');
  elements.loginMessage = el('login-message');
  elements.playersTable = el('players-table');
  elements.chatLog = el('chat-log');
  elements.activityLog = el('activity-log');
  elements.logoutButton = el('logout-button');
  elements.adminUsername = el('admin-username');
  elements.statPlayers = el('stat-players');
  elements.statRegistrations = el('stat-registrations');
  elements.statActivity = el('stat-activity');
  elements.grantForm = el('grant-form');
  elements.grantMessage = el('grant-message');

  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.grantForm.addEventListener('submit', handleGrantItem);

  attemptAutoLogin();
});
