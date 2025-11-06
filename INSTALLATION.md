# Installation Guide

## Step-by-Step Installation

### 1. System Requirements
- Windows/Linux Server
- RAGE:MP Server files (latest version)
- Node.js v14.x or higher
- MySQL Server 5.7 or higher
- 2GB RAM minimum
- 10GB free disk space

### 2. Download RAGE:MP Server
1. Go to https://rage.mp/
2. Download the server package for your OS
3. Extract to a directory (e.g., `C:\RageMP` or `/opt/ragemp`)

### 3. Install Node.js
**Windows:**
1. Download from https://nodejs.org/
2. Run installer
3. Verify: `node --version`

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Install MySQL
**Windows:**
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer and select "MySQL Server"
3. Set root password during installation
4. Start MySQL service

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### 5. Setup Database
1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create database:
```sql
CREATE DATABASE ragemp_roleplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

3. Import schema:
```bash
mysql -u root -p ragemp_roleplay < database.sql
```

4. Verify tables:
```bash
mysql -u root -p
USE ragemp_roleplay;
SHOW TABLES;
```
You should see 14 tables.

### 6. Configure Server Files
1. Copy this project to your RAGE:MP server directory:
```bash
# The structure should be:
RageMP/
├── packages/
│   └── rp-server/
├── client_packages/
├── conf.json
├── server.exe (or ragemp-server on Linux)
└── ...
```

2. Install Node.js dependencies:
```bash
cd RageMP
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Edit `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ragemp_roleplay
DB_PORT=3306

SERVER_NAME=My RP Server
MAX_PLAYERS=100
ANNOUNCE=true
```

5. Edit `conf.json`:
```json
{
  "maxplayers": 100,
  "name": "My Roleplay Server",
  "gamemode": "Roleplay",
  "streamDistance": 500.0,
  "announce": false,
  "port": 22005,
  "bind": "0.0.0.0",
  "language": "en",
  "voiceChat": true,
  "enable-nodejs": true,
  "csharp": false
}
```

### 7. Port Forwarding (For Public Server)
If hosting from home, forward these ports:
- **22005** (UDP) - RAGE:MP Game Port
- **22006** (TCP) - RAGE:MP HTTP Port

**Router Setup:**
1. Access router admin panel (usually 192.168.1.1)
2. Find "Port Forwarding" section
3. Add rules for ports above
4. Point to your server's local IP

**Firewall:**
```bash
# Windows
netsh advfirewall firewall add rule name="RAGE:MP" dir=in action=allow protocol=UDP localport=22005

# Linux
sudo ufw allow 22005/udp
sudo ufw allow 22006/tcp
```

### 8. Start Server
**Windows:**
```bash
server.exe
```

**Linux:**
```bash
./ragemp-server
```

### 9. Verify Server is Running
You should see:
```
========================================
  RAGE:MP Roleplay Server Starting...  
========================================
[Database] Successfully connected to MySQL database
[Shops] Loaded 6 shops
[Jobs] Loaded 8 jobs
[Events] Player events loaded
[Commands] Commands loaded
========================================
  Server Started Successfully!         
  Players can now connect              
========================================
```

### 10. Connect to Server
1. Start GTA V
2. Open RAGE:MP client
3. Add server: `127.0.0.1:22005` (for local) or `YOUR_IP:22005` (for remote)
4. Connect and enjoy!

## Troubleshooting

### Database Connection Failed
**Error:** `[Database] Connection error: Access denied`
- Check `.env` file credentials
- Verify MySQL is running: `sudo service mysql status`
- Test connection: `mysql -u root -p`

### Server Won't Start
**Error:** `Cannot find module 'mysql2'`
```bash
npm install
```

**Error:** `Port already in use`
- Change port in `conf.json`
- Kill process using port: `netstat -ano | findstr :22005`

### Players Can't Connect
- Verify server is running
- Check firewall/port forwarding
- Confirm correct IP and port
- Check `announce` setting in conf.json

### Database Tables Missing
```bash
mysql -u root -p ragemp_roleplay < database.sql
```

### Blank Login Screen
- Clear browser cache
- Check client_packages folder exists
- Verify HTML files are in correct location

## Optional Configuration

### Change Spawn Point
Edit `packages/rp-server/modules/character/character.js`:
```javascript
// Default spawn coordinates
position_x: -425.517,  // Your X
position_y: 1123.620,  // Your Y
position_z: 325.8544   // Your Z
```

### Adjust Salary Interval
Edit `packages/rp-server/index.js`:
```javascript
// Change from 30 minutes to desired time
}, 30 * 60 * 1000); // milliseconds
```

### Add Admin
1. Register an account in-game
2. Connect to database:
```sql
UPDATE players SET admin_level = 3 WHERE username = 'YourUsername';
```

### Modify Starting Money
Edit `database.sql` before importing:
```sql
money INT DEFAULT 5000,        -- Starting cash
bank_balance INT DEFAULT 10000 -- Starting bank
```

## Performance Tips

### MySQL Optimization
Add to my.cnf/my.ini:
```ini
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

### Server Performance
- Use SSD for database
- Increase RAM if needed
- Use dedicated server for production
- Enable MySQL query caching

## Backup

### Automated Backup Script
```bash
#!/bin/bash
mysqldump -u root -p ragemp_roleplay > backup_$(date +%Y%m%d).sql
```

### Manual Backup
```bash
mysqldump -u root -p ragemp_roleplay > backup.sql
```

### Restore Backup
```bash
mysql -u root -p ragemp_roleplay < backup.sql
```

## Next Steps

1. ✅ Server is running
2. ✅ Database is connected
3. ✅ Players can connect
4. Configure admin account
5. Customize server name/branding
6. Add custom jobs/shops
7. Setup automated backups
8. Invite players!

## Getting Help

- Check server console for errors
- Review database connection logs
- Test MySQL connection manually
- Verify all files are in correct locations
- Check RAGE:MP forums for updates

---

**Congratulations!** Your RAGE:MP Roleplay Server is ready!