const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const logger = require('../utils/logger');

let httpServerInstance = null;

const startHttpServer = async ({ config, services, repositories }) => {
  if (httpServerInstance) {
    return httpServerInstance;
  }

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.adminPanel.allowedOrigins,
      credentials: true
    }
  });

  app.use(cors({ origin: config.adminPanel.allowedOrigins, credentials: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const panelPath = path.resolve(__dirname, '../../admin-panel/public');
  if (fs.existsSync(panelPath)) {
    app.use('/', express.static(panelPath));
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    if (req.headers['x-panel-token']) {
      return req.headers['x-panel-token'];
    }
    return null;
  };

  const requireAuth = (req, res, next) => {
    const token = extractToken(req);
    const user = services.panel.verifyToken(token);
    if (!token || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    req.token = token;
    return next();
  };

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await services.panel.login({ username, password });
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: 'Invalid credentials', detail: error.message });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    services.panel.logout(req.token);
    res.json({ success: true });
  });

  app.get('/api/dashboard', requireAuth, (req, res) => {
    res.json(services.panel.getDashboardData());
  });

  app.get('/api/players', requireAuth, (req, res) => {
    res.json({ players: services.panel.listPlayers() });
  });

  app.get('/api/chat/recent', requireAuth, (req, res) => {
    res.json({ messages: services.chat.getRecent(100) });
  });

  app.get('/api/activity', requireAuth, (req, res) => {
    res.json({ activity: repositories.activity.list(100) });
  });

  app.get('/api/inventory/:playerId', requireAuth, (req, res) => {
    const items = services.inventory.getInventoryByPlayerId(req.params.playerId);
    res.json({ items });
  });

  app.post('/api/inventory/grant', requireAuth, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const { playerId, itemCode, label, quantity, metadata } = req.body;
    try {
      const item = services.inventory.addItemByPlayerId({
        playerId,
        itemCode,
        label: label || itemCode,
        quantity: Number(quantity) || 1,
        stackable: true,
        metadata
      });
      repositories.activity.log({
        type: 'inventory.grant',
        actorId: req.user.id,
        payload: { playerId, itemCode, quantity }
      });
      res.json({ success: true, item });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    const user = services.panel.verifyToken(token);
    if (!token || !user) {
      return next(new Error('Unauthorized'));
    }
    socket.user = user;
    return next();
  });

  io.on('connection', (socket) => {
    logger.info('Admin panel socket connected', { username: socket.user.username });
    socket.emit('init', services.panel.getDashboardData());

    socket.on('disconnect', () => {
      logger.info('Admin panel socket disconnected', { username: socket.user.username });
    });
  });

  const relay = (eventName) => (payload) => {
    io.emit(eventName, payload);
  };

  services.eventBus.on('chat:new', relay('chat:new'));
  services.eventBus.on('inventory:update', relay('inventory:update'));
  services.eventBus.on('panel:login', relay('panel:login'));
  services.eventBus.on('panel:logout', relay('panel:logout'));

  await new Promise((resolve) => {
    server.listen(config.adminPanel.port, () => {
      logger.info('Admin panel HTTP server started', { port: config.adminPanel.port });
      resolve();
    });
  });

  httpServerInstance = { app, server, io };
  return httpServerInstance;
};

module.exports = { startHttpServer };
