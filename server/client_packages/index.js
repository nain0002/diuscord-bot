const UI_URL = 'package://client_packages/ui/index.html';

let uiBrowser = null;
let uiReady = false;
let inventoryVisible = false;
const pendingMessages = [];

const openBrowser = () => {
  if (!uiBrowser) {
    uiBrowser = mp.browsers.new(UI_URL);
    uiReady = false;
  }
  mp.gui.cursor.show(true, true);
};

const closeBrowser = () => {
  if (!uiBrowser) return;
  uiBrowser.destroy();
  uiBrowser = null;
  uiReady = false;
  inventoryVisible = false;
  pendingMessages.length = 0;
  mp.gui.cursor.show(false, false);
};

const sendToUI = (event, payload = {}) => {
  const data = JSON.stringify({ event, payload });
  if (!uiBrowser || !uiReady) {
    pendingMessages.push(data);
    return;
  }
  uiBrowser.execute(`window.dispatchEvent(new CustomEvent('rage:message', { detail: ${data} }));`);
};

mp.events.add('ui:showAuth', (playerName) => {
  openBrowser();
  sendToUI('auth:show', { playerName });
});

mp.events.add('ui:syncSkin', () => {
  mp.players.local.setComponentVariation(11, 15, 0, 2);
});

mp.events.add('auth:register:success', (payload) => {
  openBrowser();
  sendToUI('auth:register:success', JSON.parse(payload));
});

mp.events.add('auth:register:error', (payload) => {
  openBrowser();
  sendToUI('auth:register:error', JSON.parse(payload));
});

mp.events.add('auth:login:success', (payload) => {
  const data = JSON.parse(payload);
  sendToUI('auth:login:success', data);
  inventoryVisible = false;
  setTimeout(() => {
    closeBrowser();
  }, 250);
});

mp.events.add('auth:login:error', (payload) => {
  openBrowser();
  sendToUI('auth:login:error', JSON.parse(payload));
});

mp.events.add('inventory:update', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  sendToUI('inventory:update', data);
});

mp.events.add('inventory:open', () => {
  inventoryVisible = true;
  openBrowser();
  mp.events.callRemote('inventory:request');
  sendToUI('inventory:open');
});

mp.events.add('inventory:close', () => {
  inventoryVisible = false;
  closeBrowser();
});

mp.events.add('ui:ready', () => {
  uiReady = true;
  while (pendingMessages.length > 0 && uiBrowser) {
    const payload = pendingMessages.shift();
    uiBrowser.execute(`window.dispatchEvent(new CustomEvent('rage:message', { detail: ${payload} }));`);
  }
});

mp.events.add('cef:ready', () => {
  uiReady = true;
  while (pendingMessages.length > 0 && uiBrowser) {
    const payload = pendingMessages.shift();
    uiBrowser.execute(`window.dispatchEvent(new CustomEvent('rage:message', { detail: ${payload} }));`);
  }
});

mp.events.add('cef:auth:register', (payload) => {
  mp.events.callRemote('auth:register', payload);
});

mp.events.add('cef:auth:login', (payload) => {
  mp.events.callRemote('auth:login', payload);
});

mp.events.add('cef:inventory:close', () => {
  inventoryVisible = false;
  closeBrowser();
});

mp.events.add('cef:inventory:useItem', (payload) => {
  mp.events.callRemote('inventory:useItem', payload);
});

mp.keys.bind(0x49, false, () => {
  if (!uiReady) return;
  if (inventoryVisible) {
    mp.events.call('inventory:close');
  } else {
    mp.events.call('inventory:open');
  }
});

mp.events.add('playerQuit', () => {
  closeBrowser();
});
