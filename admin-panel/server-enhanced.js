/**
 * Enhanced Admin Panel Web Server
 * With comprehensive logging and monitoring
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const os = require('os');
const WebSocketBridge = require('./websocket-bridge');
const database = require('../packages/rp-server/modules/database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// ═══════════════════════════════════════════════════════════════════════
// ENHANCED LOGGING SYSTEM
// ═══════════════════════════════════════════════════════════════════════

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

class Logger {
    constructor() {
        this.logFile = path.join(logDir, `admin-${new Date().toISOString().split('T')[0]}.log`);
        this.errorFile = path.join(logDir, 'errors.log');
        this.accessFile = path.join(logDir, 'access.log');
    }

    log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        const logString = `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}\n`;

        // Console output with colors
        const colors = {
            info: '\x1b[36m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            success: '\x1b[32m'
        };
        console.log(`${colors[level] || '\x1b[0m'}${logString}\x1b[0m`);

        // File output
        fs.appendFileSync(this.logFile, logString);
        if (level === 'error') {
            fs.appendFileSync(this.errorFile, logString);
        }
    }

    info(message, meta) { this.log('info', message, meta); }
    warn(message, meta) { this.log('warn', message, meta); }
    error(message, meta) { this.log('error', message, meta); }
    success(message, meta) { this.log('success', message, meta); }
}

const logger = new Logger();
app.locals.logger = logger;

// ═══════════════════════════════════════════════════════════════════════
// SECURITY & MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
logger.info('Security middleware (Helmet) loaded');

app.use(cors());
logger.info('CORS enabled');

// Enhanced rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded`, { ip: req.ip, path: req.path });
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logger.warn(`Login rate limit exceeded`, { ip: req.ip });
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again later.'
        });
    }
});

app.use('/api/', apiLimiter);
logger.info('Rate limiting enabled (100 req/15min)');

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
logger.info('Body parser configured (10MB limit)');

// Enhanced session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'ragemp-admin-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    },
    name: 'admin.sid'
}));
logger.info('Session management configured (24h expiry)');

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };
        
        const logEntry = `${req.method} ${req.path} ${res.statusCode} ${duration}ms\n`;
        fs.appendFileSync(logger.accessFile, `[${new Date().toISOString()}] ${logEntry}`);
        
        if (res.statusCode >= 400) {
            logger.warn(`HTTP ${res.statusCode}`, logData);
        } else {
            logger.info(`HTTP ${res.statusCode}`, logData);
        }
    });
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════════════
// IMPORT ROUTES
// ═══════════════════════════════════════════════════════════════════════

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const playersRoutes = require('./routes/players');
const serverRoutes = require('./routes/server');
const databaseRoutes = require('./routes/database');
const logsRoutes = require('./routes/logs');
const adminManagementRoutes = require('./routes/admin-management');
const inventoryRoutes = require('./routes/inventory');
const authMiddleware = require('./middleware/auth');

logger.info('All route modules loaded');

// ═══════════════════════════════════════════════════════════════════════
// MOUNT ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard-enhanced'));
app.use('/api/players', authMiddleware, playersRoutes);
app.use('/api/players', authMiddleware, require('./routes/players-enhanced'));
app.use('/api/server', authMiddleware, serverRoutes);
app.use('/api/database', authMiddleware, databaseRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);
app.use('/api/admin-management', authMiddleware, adminManagementRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);

// Enhanced admin features
app.use('/api/admin-logs', authMiddleware, require('./routes/admin-logs'));
app.use('/api/whitelist', authMiddleware, require('./routes/whitelist'));
app.use('/api/bans', authMiddleware, require('./routes/bans'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));

// RAGE:MP Essential Features
app.use('/api/vehicles', authMiddleware, require('./routes/vehicles'));
app.use('/api/economy', authMiddleware, require('./routes/economy'));
app.use('/api/analytics', authMiddleware, require('./routes/analytics'));
app.use('/api/server-control', authMiddleware, require('./routes/server-control'));

// Ultra Admin Panel Features
app.use('/api/admin', authMiddleware, require('./routes/admin'));
app.use('/api/analytics', authMiddleware, require('./routes/analytics-ultra'));

logger.info('All routes mounted (including RAGE:MP essentials & Ultra Admin)');

// ═══════════════════════════════════════════════════════════════════════
// ENHANCED MONITORING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: os.loadavg(),
        database: database.isConnected() ? 'connected' : 'disconnected'
    };
    res.json(health);
});

// System info
app.get('/api/system/info', authMiddleware, (req, res) => {
    res.json({
        success: true,
        data: {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            cpuModel: os.cpus()[0].model,
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
            uptime: Math.floor(os.uptime()),
            nodeVersion: process.version,
            pid: process.pid,
            hostname: os.hostname()
        }
    });
});

// Server logs endpoint
app.get('/api/logs/server', authMiddleware, (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 100;
        const logFile = logger.logFile;
        
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            const logLines = content.split('\n').filter(line => line.trim());
            const recentLogs = logLines.slice(-lines);
            
            res.json({
                success: true,
                logs: recentLogs,
                totalLines: logLines.length
            });
        } else {
            res.json({
                success: true,
                logs: [],
                message: 'No logs available yet'
            });
        }
    } catch (error) {
        logger.error('Failed to read logs', { error: error.message });
        res.status(500).json({ success: false, message: 'Failed to read logs' });
    }
});

// Error logs endpoint
app.get('/api/logs/errors', authMiddleware, (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 50;
        
        if (fs.existsSync(logger.errorFile)) {
            const content = fs.readFileSync(logger.errorFile, 'utf8');
            const logLines = content.split('\n').filter(line => line.trim());
            const recentErrors = logLines.slice(-lines);
            
            res.json({
                success: true,
                errors: recentErrors,
                totalErrors: logLines.length
            });
        } else {
            res.json({
                success: true,
                errors: [],
                message: 'No errors logged'
            });
        }
    } catch (error) {
        logger.error('Failed to read error logs', { error: error.message });
        res.status(500).json({ success: false, message: 'Failed to read error logs' });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// PAGE ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'public', 'ultra-admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ultra-admin.html'));
});

// Legacy modern dashboard route
app.get('/modern-dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'modern-dashboard.html'));
});

// ═══════════════════════════════════════════════════════════════════════
// WEBSOCKET & BRIDGE
// ═══════════════════════════════════════════════════════════════════════

let wsBridge;
try {
    wsBridge = new WebSocketBridge(3001);
    wsBridge.start();
    logger.success('WebSocket bridge started on port 3001');
} catch (error) {
    logger.error('Failed to start WebSocket bridge', { error: error.message });
}

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
    logger.info('Admin client connected', { socketId: socket.id });

    socket.on('subscribe', (data) => {
        if (data.authenticated) {
            socket.join('admins');
            logger.info('Admin subscribed to updates', { socketId: socket.id });
            
            if (wsBridge) {
                socket.emit('initialData', wsBridge.getServerData());
            }
        }
    });

    socket.on('adminCommand', (command) => {
        logger.info('Admin command received', { type: command.type, socketId: socket.id });
        if (wsBridge) {
            wsBridge.handleAdminClientMessage(command);
        }
    });

    socket.on('disconnect', () => {
        logger.info('Admin client disconnected', { socketId: socket.id });
    });
});

// Real-time stats broadcaster (every 5 seconds)
setInterval(async () => {
    try {
        const onlinePlayers = wsBridge ? (wsBridge.getOnlinePlayers() || []) : [];
        
        const [vehicles, reports] = await Promise.all([
            database.query('SELECT COUNT(*) as count FROM vehicles'),
            database.query('SELECT COUNT(*) as count FROM reports WHERE status = "pending"')
        ]);
        
        const avgPing = onlinePlayers.length > 0
            ? Math.round(onlinePlayers.reduce((sum, p) => sum + (p.ping || 0), 0) / onlinePlayers.length)
            : 0;
        
        io.to('admins').emit('statsUpdate', {
            totalPlayers: onlinePlayers.length,
            totalVehicles: vehicles[0]?.count || 0,
            pendingReports: reports[0]?.count || 0,
            serverPing: avgPing,
            timestamp: Date.now()
        });
        
    } catch (error) {
        logger.error('Stats broadcast error', { error: error.message });
    }
}, 5000);

// Player position updates (for map - every 2 seconds)
setInterval(() => {
    if (wsBridge) {
        const players = wsBridge.getOnlinePlayers() || [];
        io.to('admins').emit('playerUpdate', {
            players: players.map(p => ({
                id: p.id,
                name: p.name,
                x: p.x || 0,
                y: p.y || 0,
                z: p.z || 0,
                heading: p.heading || 0,
                vehicle: p.vehicle || null,
                health: p.health || 100
            })),
            timestamp: Date.now()
        });
    }
}, 2000);

// Make bridge and io available to routes
app.set('wsBridge', wsBridge);
app.set('io', io);

// ═══════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found', { path: req.path, ip: req.ip });
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// ═══════════════════════════════════════════════════════════════════════
// DATABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

database.connect().then(async () => {
    logger.success('Database connected successfully');
    
    try {
        // Create admins table
        await database.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                admin_level INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_ip VARCHAR(45),
                login_count INT DEFAULT 0,
                INDEX idx_username (username)
            )
        `);
        logger.success('Admins table verified/created');
        
        // Check for default admin
        const admins = await database.query('SELECT id FROM admins WHERE username = ?', ['admin']);
        
        if (admins.length === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await database.query(
                'INSERT INTO admins (username, password, email, admin_level) VALUES (?, ?, ?, ?)',
                ['admin', hashedPassword, 'admin@localhost', 4]
            );
            
            logger.success('Default admin user created');
            logger.warn('Default credentials: admin / admin123 - CHANGE IMMEDIATELY!');
        }
        
    } catch (error) {
        logger.error('Database setup error', { error: error.message });
    }
}).catch(error => {
    logger.error('Database connection failed', { error: error.message });
});

// ═══════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════

const PORT = process.env.ADMIN_PORT || 3000;
server.listen(PORT, () => {
    console.log('\n' + '═'.repeat(80));
    logger.success(`Admin Panel running on http://localhost:${PORT}`);
    logger.info(`Default login: admin / admin123`);
    logger.warn(`⚠️  CHANGE DEFAULT PASSWORD IMMEDIATELY!`);
    logger.info(`Logs directory: ${logDir}`);
    logger.info(`WebSocket bridge: ws://localhost:3001`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    console.log('═'.repeat(80) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

module.exports = { app, io, logger };
