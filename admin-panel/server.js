/**
 * Admin Panel Web Server
 * Web-based admin panel for RAGE:MP server management
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

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const playersRoutes = require('./routes/players');
const serverRoutes = require('./routes/server');
const databaseRoutes = require('./routes/database');
const logsRoutes = require('./routes/logs');
const adminManagementRoutes = require('./routes/admin-management');
const inventoryRoutes = require('./routes/inventory');

// Import middleware
const authMiddleware = require('./middleware/auth');

// Security
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'ragemp-admin-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/players', authMiddleware, playersRoutes);
app.use('/api/server', authMiddleware, serverRoutes);
app.use('/api/database', authMiddleware, databaseRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);
app.use('/api/admin-management', authMiddleware, adminManagementRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);

// Serve admin panel
app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'public', 'modern-dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'modern-dashboard.html'));
});

// Start WebSocket bridge for game server connection
const wsBridge = new WebSocketBridge(3001);
wsBridge.start();

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
    console.log('[Admin Panel] Client connected');

    socket.on('subscribe', (data) => {
        if (data.authenticated) {
            socket.join('admins');
            console.log('[Admin Panel] Admin subscribed to updates');
            
            // Send initial server data
            socket.emit('initialData', wsBridge.getServerData());
        }
    });

    // Handle admin commands
    socket.on('adminCommand', (command) => {
        console.log('[Admin Panel] Command received:', command.type);
        // Commands will be forwarded through the bridge
        wsBridge.handleAdminClientMessage(command);
    });

    socket.on('disconnect', () => {
        console.log('[Admin Panel] Client disconnected');
    });
});

// Make bridge available to routes
app.set('wsBridge', wsBridge);

// Make io available to routes
app.set('io', io);

// Error handling
app.use((err, req, res, next) => {
    console.error('[Admin Panel] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database connection
database.connect().then(async () => {
    console.log('[Admin Panel] Database connected');
    
    // Create admins table if it doesn't exist
    try {
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
                INDEX idx_username (username)
            )
        `);
        
        // Check if default admin exists
        const admins = await database.query('SELECT id FROM admins WHERE username = ?', ['admin']);
        
        if (admins.length === 0) {
            // Create default admin
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await database.query(
                'INSERT INTO admins (username, password, email, admin_level) VALUES (?, ?, ?, ?)',
                ['admin', hashedPassword, 'admin@localhost', 4]
            );
            
            console.log('[Admin Panel] Default admin user created');
            console.log('[Admin Panel] ⚠️  Username: admin / Password: admin123');
        }
        
        console.log('[Admin Panel] Admins table ready');
    } catch (error) {
        console.error('[Admin Panel] Error setting up admins table:', error);
    }
});

// Start server
const PORT = process.env.ADMIN_PORT || 3000;
server.listen(PORT, () => {
    console.log('=================================');
    console.log(`Admin Panel running on http://localhost:${PORT}`);
    console.log('Default login: admin / admin123');
    console.log('⚠️  CHANGE DEFAULT PASSWORD IMMEDIATELY!');
    console.log('=================================');
});

module.exports = { app, io };
