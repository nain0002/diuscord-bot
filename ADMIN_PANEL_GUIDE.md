# Admin Panel Guide

## 🎛️ Web-Based Admin Panel - Complete Control Center

Your RAGE:MP server now includes a **full-featured web admin panel** similar to txAdmin, allowing you to manage your server from any browser!

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Admin Panel
```bash
npm run admin
```

Or for development with auto-reload:
```bash
npm run admin:dev
```

### 3. Access the Panel
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Login
**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials in production!

---

## 📊 Features

### Dashboard
- **Real-time Statistics**
  - Total users
  - Total characters
  - Vehicles count
  - Today's transactions
  
- **Server Metrics**
  - Uptime
  - Memory usage
  - CPU usage

- **Recent Activity**
  - Latest user registrations
  - Character creations
  - Server events

### Player Management
- **View All Players**
  - Paginated list
  - Search by username/email
  - Sort and filter

- **Player Actions**
  - View detailed player info
  - Ban/unban players
  - Delete player accounts
  - Reset passwords
  - View player characters

- **Player Details**
  - Username and email
  - Character count
  - Registration date
  - Last login
  - Ban status and reason

### Database Management
- **View All Tables**
  - Browse all database tables
  - View table structure
  - View table data

- **Table Browser**
  - Paginated data view
  - Column information
  - Row counts

- **Database Statistics**
  - Table sizes
  - Row counts per table
  - Total database size

- **Query Console** (Advanced)
  - Execute custom SQL queries
  - Built-in safety checks
  - Query results viewer

- **Backup System**
  - One-click database backup
  - Automatic backup naming
  - Download backups

### Server Control
- **Configuration Viewer**
  - View server settings
  - Max players
  - Server name
  - Port configuration
  - Game mode

- **Resources Manager**
  - List server packages
  - List client packages
  - Resource status

- **Server Commands** (Planned)
  - Execute server commands
  - Restart server
  - Stop server
  - Reload resources

### Logs Viewer
- **Real-time Logs**
  - Server console output
  - Error logs
  - Warning logs
  - Info logs

- **Log Management**
  - Filter by type
  - Search logs
  - Clear logs
  - Export logs

---

## 🔐 Security Features

### Authentication
- **Session-based Authentication**
  - Secure session management
  - HTTP-only cookies
  - Session timeout

- **Default Credentials**
  - Change immediately in production
  - Can integrate with game database
  - Admin level system (0-4)

### Protection
- **Helmet.js**
  - Security headers
  - XSS protection
  - Clickjacking prevention

- **Rate Limiting**
  - 100 requests per 15 minutes per IP
  - Prevents brute force attacks

- **CORS Protection**
  - Configurable origins
  - Secure cross-origin requests

### Query Safety
- **SQL Injection Prevention**
  - Parameterized queries
  - Dangerous keyword blocking
  - Query validation

---

## 🎨 User Interface

### Modern Design
- **Responsive Layout**
  - Works on desktop, tablet, mobile
  - Collapsible sidebar on mobile
  - Touch-friendly controls

- **Dark/Light Theme**
  - Professional dark sidebar
  - Clean white content area
  - High contrast for readability

- **Beautiful Components**
  - Gradient accents
  - Smooth animations
  - Card-based layout
  - Modern icons

### Real-time Updates
- **WebSocket Integration**
  - Live server statistics
  - Instant player updates
  - Real-time logs streaming

---

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```env
# Admin Panel Configuration
ADMIN_PORT=3000
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
```

### Port Configuration

Default: `3000`

To change:
1. Update `ADMIN_PORT` in `.env`
2. Restart admin panel

### Session Secret

**CRITICAL:** Change in production!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the output as your `SESSION_SECRET`

---

## 👥 Admin Levels

The system supports 5 admin levels:

| Level | Name | Permissions |
|-------|------|-------------|
| 0 | User | No admin access |
| 1 | Moderator | View only |
| 2 | Admin | Player management |
| 3 | Head Admin | Full panel access |
| 4 | Owner | All permissions |

### Setting Admin Level

**Method 1: Database**
```sql
UPDATE users SET admin_level = 4 WHERE username = 'your_username';
```

**Method 2: In-game**
Add admin command in `packages/rp-server/modules/admin.js`

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/status
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/activity
```

### Players
```
GET    /api/players
GET    /api/players/:id
POST   /api/players/:id/ban
POST   /api/players/:id/unban
DELETE /api/players/:id
POST   /api/players/:id/reset-password
```

### Database
```
GET    /api/database/tables
GET    /api/database/table/:name
POST   /api/database/query
POST   /api/database/backup
GET    /api/database/stats
```

### Server
```
GET    /api/server/status
GET    /api/server/config
POST   /api/server/config
POST   /api/server/command
GET    /api/server/resources
POST   /api/server/restart
```

### Logs
```
GET    /api/logs
DELETE /api/logs
GET    /api/logs/console
```

---

## 🛠️ Advanced Usage

### Custom Queries

Navigate to Database → Query Console

**Safe Queries:**
```sql
SELECT * FROM users LIMIT 10;
SELECT COUNT(*) FROM characters;
UPDATE users SET admin_level = 1 WHERE id = 123;
```

**Blocked Queries:**
```sql
DROP TABLE users;           -- Blocked
TRUNCATE characters;         -- Blocked
DELETE FROM users;           -- Blocked (entire table)
```

### Backup & Restore

**Create Backup:**
1. Go to Database page
2. Click "Backup Database"
3. Wait for completion
4. Download backup file

**Restore Backup:**
```bash
mysql -u root -p ragemp_server < backup_2024-01-01.sql
```

### Integration with RAGE:MP

The admin panel can communicate with the RAGE:MP server:

**Send command from panel:**
```javascript
// Client-side
socket.emit('serverCommand', { command: 'announce Hello!' });

// Server-side (add to packages/rp-server)
io.on('serverCommand', (data) => {
    // Execute command in RAGE:MP
});
```

---

## 📱 Mobile Access

The admin panel is fully responsive and works on mobile devices:

1. Ensure server is accessible on your network
2. Use server IP: `http://192.168.1.xxx:3000`
3. Login with credentials
4. Manage server from anywhere!

---

## 🐛 Troubleshooting

### Cannot Access Admin Panel

**Check:**
1. Admin panel is running: `npm run admin`
2. Correct port: Default is 3000
3. Firewall allows port 3000
4. Using correct URL: `http://localhost:3000`

### Login Not Working

**Check:**
1. Using correct credentials (admin/admin123)
2. Database connection working
3. Session secret configured
4. Check browser console for errors

### Players Not Loading

**Check:**
1. Database connection active
2. Tables exist and populated
3. Check API response in browser dev tools

### Real-time Updates Not Working

**Check:**
1. WebSocket connection established
2. Check browser console
3. Firewall allows WebSocket connections

---

## 🚀 Performance

### Optimization Tips

1. **Enable Caching**
   - Cache dashboard stats (30s)
   - Cache table lists

2. **Limit Results**
   - Use pagination (default: 20 per page)
   - Limit log entries (default: 100)

3. **Database Indexes**
   - Already optimized
   - Add more if needed for custom queries

### Resource Usage

- **Memory:** ~50-100MB
- **CPU:** <1% when idle
- **Network:** Minimal (REST + WebSocket)

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change default admin credentials
- [ ] Set strong SESSION_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Configure firewall (allow only admin IPs)
- [ ] Set up database backups
- [ ] Enable logging to files
- [ ] Test all features
- [ ] Monitor resource usage
- [ ] Document custom changes

---

## 🎯 Roadmap

Future enhancements:

- [ ] Two-factor authentication (2FA)
- [ ] Audit log system
- [ ] Advanced permission system
- [ ] Plugin/extension system
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Custom dashboards
- [ ] Advanced analytics
- [ ] Server performance graphs
- [ ] Automated backup scheduling

---

## 📚 Additional Resources

### Files Structure
```
admin-panel/
├── server.js              # Main server file
├── routes/                # API routes
│   ├── auth.js
│   ├── dashboard.js
│   ├── players.js
│   ├── database.js
│   ├── server.js
│   └── logs.js
├── middleware/            # Express middleware
│   └── auth.js
└── public/                # Frontend files
    ├── css/
    │   └── admin.css
    ├── js/
    │   ├── login.js
    │   └── dashboard.js
    ├── login.html
    └── dashboard.html
```

### Technologies Used
- **Backend:**
  - Node.js + Express.js
  - Socket.IO (WebSocket)
  - MySQL2
  - Bcrypt
  - Helmet.js (Security)
  - Express Session

- **Frontend:**
  - Vanilla JavaScript
  - Socket.IO Client
  - Modern CSS3
  - Responsive Design

---

## 💡 Tips & Tricks

1. **Quick Player Search**
   - Use Ctrl+F in Players page
   - Search by username or email
   - Real-time filtering

2. **Keyboard Shortcuts**
   - `Ctrl + K` - Quick search (planned)
   - `Esc` - Close modals (planned)

3. **Browser Compatibility**
   - Chrome/Edge (Recommended)
   - Firefox
   - Safari
   - Mobile browsers

4. **Database Queries**
   - Test in MySQL first
   - Use LIMIT for large tables
   - Avoid DELETE without WHERE

---

## 🆘 Support

For issues:
1. Check this guide
2. Check server console logs
3. Check browser console (F12)
4. Review API responses
5. Check database connection

---

## 📜 License

Same as main project (MIT)

---

**Enjoy your powerful admin panel!** 🎉

*Your server, your control!*
