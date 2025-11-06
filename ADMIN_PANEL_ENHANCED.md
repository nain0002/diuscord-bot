# 🎯 Enhanced Admin Panel - Complete Guide

## ✨ New Features Added

### 1. Comprehensive Logging System
- **Real-time logging** to console and files
- **Separate log files** for different purposes:
  - `admin-YYYY-MM-DD.log` - Daily general logs
  - `errors.log` - All error logs
  - `access.log` - HTTP access logs
- **Color-coded console output** for easy reading
- **Structured JSON logging** for parsing

### 2. Enhanced Security
- **Rate limiting** on login attempts (5 per 15 min)
- **API rate limiting** (100 requests per 15 min)
- **Security headers** with Helmet
- **Session security** with SameSite cookies
- **IP tracking** in logs
- **Failed login attempt logging**

### 3. Advanced Monitoring
- **Health check endpoint**: `GET /health`
- **System info endpoint**: `GET /api/system/info`
- **Server logs viewer**: `GET /api/logs/server`
- **Error logs viewer**: `GET /api/logs/errors`
- **Real-time metrics**: CPU, Memory, Uptime

### 4. Better Error Detection
- **Automatic error logging** to file
- **Stack trace capture**
- **HTTP error tracking**
- **Request timing** (response time logging)
- **Database connection monitoring**

### 5. Graceful Shutdown
- **SIGTERM/SIGINT handling**
- **Proper cleanup** on shutdown
- **Connection closing**

---

## 🚀 How to Start

### Using Enhanced Version (Recommended):
```bash
cd C:\RAGEMP\workspace
npm run admin
```

### Using Old Version:
```bash
cd C:\RAGEMP\workspace
npm run admin-old
```

---

## 📊 Available Endpoints

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/api/auth/login` | POST | Admin login |

### Protected Endpoints (Requires Auth)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/dashboard/activity` | GET | Recent activity |
| `/api/players` | GET | List all players |
| `/api/players/:id` | GET | Get player details |
| `/api/server/info` | GET | Server information |
| `/api/system/info` | GET | System information |
| `/api/logs/server` | GET | View server logs |
| `/api/logs/errors` | GET | View error logs |
| `/api/database/tables` | GET | List database tables |
| `/api/inventory/:characterId` | GET | Player inventory |

---

## 📝 Log Files Location

Logs are stored in: `C:\RAGEMP\workspace\admin-panel\logs\`

**Log Files:**
- `admin-2025-11-06.log` - Today's logs
- `errors.log` - All errors
- `access.log` - HTTP requests

**View logs in real-time:**
```bash
# Windows PowerShell
Get-Content C:\RAGEMP\workspace\admin-panel\logs\admin-*.log -Wait

# Command Prompt
tail -f C:\RAGEMP\workspace\admin-panel\logs\admin-*.log
```

---

## 🔍 Monitoring & Debugging

### Health Check
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T17:20:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 89,
    "rss": 120
  },
  "cpu": [1.5, 1.2, 1.1],
  "database": "connected"
}
```

### System Info
```bash
curl -H "Cookie: admin.sid=..." http://localhost:3000/api/system/info
```

### View Recent Logs
```bash
curl -H "Cookie: admin.sid=..." http://localhost:3000/api/logs/server?lines=50
```

### View Errors
```bash
curl -H "Cookie: admin.sid=..." http://localhost:3000/api/logs/errors?lines=20
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Admin Panel
ADMIN_PORT=3000
SESSION_SECRET=change-this-to-random-string

# Database (shared with game server)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ragemp_server
DB_PORT=3306

# Node Environment
NODE_ENV=development
```

---

## 📈 What Gets Logged

### Request Logs
```
[2025-11-06T17:20:00.000Z] [INFO] GET /api/dashboard/stats 200 45ms {"ip":"::1","userAgent":"Mozilla/5.0..."}
```

### Error Logs
```
[2025-11-06T17:20:00.000Z] [ERROR] Database query failed {"error":"Connection lost","query":"SELECT * FROM users"}
```

### Authentication Logs
```
[2025-11-06T17:20:00.000Z] [WARN] Failed login attempt {"username":"admin","ip":"::1"}
[2025-11-06T17:20:00.000Z] [SUCCESS] Admin logged in {"username":"admin","ip":"::1"}
```

### Rate Limiting Logs
```
[2025-11-06T17:20:00.000Z] [WARN] Rate limit exceeded {"ip":"::1","path":"/api/auth/login"}
```

---

## 🛡️ Security Features

### Rate Limiting
- **Login attempts**: 5 per 15 minutes
- **API requests**: 100 per 15 minutes
- **Automatic IP blocking** on abuse

### Session Security
- **HTTPOnly cookies** (prevent XSS)
- **SameSite strict** (prevent CSRF)
- **24-hour expiration**
- **Secure flag** in production

### Password Security
- **bcrypt hashing** (10 rounds)
- **No plaintext passwords**
- **Forced password change** reminder

---

## 🐛 Troubleshooting

### Admin Panel Won't Start

**Check logs:**
```bash
cd C:\RAGEMP\workspace\admin-panel\logs
type admin-*.log | findstr ERROR
```

**Common issues:**
1. **Port 3000 in use**
   ```bash
   netstat -ano | findstr :3000
   taskkill /F /PID <PID>
   ```

2. **Database not connected**
   - Check MySQL is running
   - Verify .env credentials
   - Check logs for connection errors

3. **Missing dependencies**
   ```bash
   cd C:\RAGEMP\workspace
   npm install
   ```

### Can't Access Admin Panel

1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check firewall:**
   - Allow port 3000 in Windows Firewall

3. **Check logs:**
   ```bash
   cd C:\RAGEMP\workspace\admin-panel\logs
   type errors.log
   ```

### WebSocket Bridge Not Connecting

**This is normal if game server isn't running!**

The admin panel will show:
```
[WARN] Game server not connected, command ignored
```

**To fix:**
1. Start the game server first
2. Then start admin panel
3. Bridge will connect automatically

---

## 📊 Performance Monitoring

### Memory Usage
Monitor in admin panel or via API:
```bash
curl http://localhost:3000/health
```

### CPU Usage
Logged every request:
```
cpu: [1.5, 1.2, 1.1]  // 1-minute, 5-minute, 15-minute load average
```

### Response Times
Every request logs duration:
```
GET /api/dashboard/stats 200 45ms
```

---

## 🎯 Best Practices

### 1. Change Default Password
```sql
UPDATE admins SET password = ? WHERE username = 'admin';
```

### 2. Monitor Logs Regularly
```bash
# Check for errors daily
type C:\RAGEMP\workspace\admin-panel\logs\errors.log
```

### 3. Set Strong Session Secret
```env
SESSION_SECRET=use-a-long-random-string-here-min-32-chars
```

### 4. Enable HTTPS in Production
Update `.env`:
```env
NODE_ENV=production
```

### 5. Backup Logs
```bash
# Weekly backup
xcopy C:\RAGEMP\workspace\admin-panel\logs C:\RAGEMP\backups\logs-%date% /E /I
```

---

## 🆘 Getting Help

### View All Logs
```bash
cd C:\RAGEMP\workspace\admin-panel\logs
dir
type admin-*.log
type errors.log
```

### Check Health
```bash
curl http://localhost:3000/health
```

### Test Database
```bash
mysql -u root -p -e "SELECT 1;"
```

### Restart Admin Panel
```bash
# Stop: Ctrl+C
# Start: npm run admin
```

---

## ✅ Features Summary

✅ **Comprehensive logging** (file + console)
✅ **Health monitoring** endpoint
✅ **Error tracking** with stack traces
✅ **Rate limiting** for security
✅ **Session security** enhancements
✅ **Real-time metrics** (CPU, Memory, Uptime)
✅ **Request timing** logging
✅ **Graceful shutdown** handling
✅ **Database monitoring**
✅ **IP tracking**
✅ **Failed login detection**
✅ **System information** endpoint
✅ **Log viewer** API
✅ **Enhanced error messages**

---

**Your admin panel is now production-ready with enterprise-grade logging and monitoring!** 🎉
