# 🚀 RAGE:MP Admin Panel - Quick Start Guide

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ MySQL server running
- ✅ Database `ragemp_server` created
- ✅ Node.js installed
- ✅ All dependencies installed (run `npm install` in `packages/rp-server` and `admin-panel`)

## 🎯 Step-by-Step Launch

### Step 1: Start MySQL
Make sure your MySQL server is running and accessible.

### Step 2: Start RAGE:MP Server
```bash
cd C:\RAGEMP\server-files
ragemp-server.exe
```

**Wait for:**
```
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[DONE] The server is ready to accept connections.
```

### Step 3: Start Admin Panel
Open a new terminal:
```bash
cd C:\RAGEMP\server-files
node admin-panel/server-enhanced.js
```

**Wait for:**
```
[Admin Panel] Server running on http://localhost:3001
[Admin Panel] WebSocket server ready
```

### Step 4: Access Admin Panel
1. Open browser: **http://localhost:3001**
2. Login with your admin credentials
3. Done! 🎉

---

## 🔍 Verify Everything Works

### Check Dashboard
- ✅ See server statistics
- ✅ Online players count updates
- ✅ Server status shows "Online" (green dot)

### Check Vehicles Page
- ✅ Shows "No vehicles found" (or existing vehicles)
- ✅ Statistics display (Total Vehicles, Unique Models, Avg Fuel)

### Check Economy Page
- ✅ Economy overview shows $0 or actual amounts
- ✅ Richest players table loads
- ✅ Transaction history appears

### Check Server Control
- ✅ Broadcast message form works
- ✅ Give money form is functional
- ✅ Set level form is ready
- ✅ Quick action buttons visible

---

## ⚠️ Troubleshooting

### Admin Panel Won't Start
**Error:** `Cannot find module...`
```bash
cd C:\RAGEMP\server-files\admin-panel
npm install
```

**Error:** `EADDRINUSE` (Port already in use)
- Close any other instance of the admin panel
- Or change port in `admin-panel/server-enhanced.js` (line with `PORT`)

### Database Connection Error
**Error:** `ER_ACCESS_DENIED_ERROR`
- Check `.env` file credentials
- Verify MySQL is running
- Test connection manually

### Features Show "No Data"
**This is normal if:**
- Server just started (no players yet)
- No transactions yet
- No vehicles spawned

**Not normal if:**
- Dashboard shows 0 users when you have registered users
- Check database connection
- Check if tables were created

### Page Not Loading
**Check browser console (F12):**
- If you see 404 errors, verify routes are loaded
- If you see CORS errors, restart admin panel
- Clear browser cache

---

## 🎮 Create Test Data

### 1. Register a User (In-Game)
- Connect to server
- Go through registration
- Create a character

### 2. Add Test Vehicle
```sql
INSERT INTO vehicles (character_id, model, plate, fuel, engine_health, created_at)
VALUES (1, 'adder', 'TEST123', 100, 1000, NOW());
```

### 3. Add Test Transaction
```sql
INSERT INTO economy_logs (character_id, transaction_type, amount, balance_before, balance_after, source)
VALUES (1, 'earn', 5000, 0, 5000, 'admin_test');
```

### 4. Create Test Report
```sql
INSERT INTO reports (reporter_id, reported_id, reason, status, created_at)
VALUES (1, 1, 'Test report', 'pending', NOW());
```

---

## 📊 Access All Features

### Navigation Menu (Left Sidebar)

**Main Section:**
- 📊 Dashboard - Server overview
- 👥 Live Players - Real-time player management
- 💬 Live Chat - Chat monitoring

**Management Section:**
- 👤 User Database - All users
- 🚗 Vehicles - Vehicle management
- 💰 Economy - Money & transactions
- 🚫 Bans & Reports - Moderation
- 💾 Database - Direct database access

**Analytics Section:**
- 📈 Statistics - Server analytics
- 🏆 Leaderboards - Top players

**Control Section:**
- 🎮 Server Control - Admin actions
- 📝 Logs - Server logs

---

## 🔐 Admin Credentials

Default admin accounts should be created in the database:

```sql
-- Create admin user (password: admin123)
INSERT INTO users (username, email, password, admin_level, created_at)
VALUES ('admin', 'admin@server.com', '$2b$10$...', 5, NOW());
```

**Note:** Hash the password using bcrypt before inserting!

Or register normally in-game, then set admin level:
```sql
UPDATE users SET admin_level = 5 WHERE username = 'yourusername';
```

**Admin Levels:**
- 0 = Player
- 1 = Helper
- 2 = Moderator
- 3 = Admin
- 4 = Head Admin
- 5 = Owner (full access)

---

## 🎨 Features Overview

### ✅ Working Features (All Tested)
1. ✅ Real-time player monitoring
2. ✅ Live chat monitoring
3. ✅ Vehicle management (view, delete)
4. ✅ Economy overview & transactions
5. ✅ Ban/unban players
6. ✅ Player reports management
7. ✅ Server analytics & statistics
8. ✅ Leaderboards (richest, active, level)
9. ✅ Server control (broadcast, give money, set level)
10. ✅ Database management
11. ✅ Server logs
12. ✅ Achievement tracking
13. ✅ User management
14. ✅ Performance monitoring

### 🔧 API Endpoints (30+)
All documented in `ADMIN_PANEL_FEATURES.md`

---

## 📱 Browser Compatibility

✅ **Recommended:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

⚠️ **Not Recommended:**
- Internet Explorer (not supported)
- Very old browsers

---

## 💡 Tips

1. **Keep Console Open:** Watch for real-time updates and errors
2. **Use Search:** Most tables have search functionality
3. **Refresh Buttons:** Click refresh to get latest data
4. **Mobile Access:** Panel works on mobile devices
5. **Multiple Tabs:** You can open multiple admin panel tabs
6. **Keyboard Shortcuts:** F5 to refresh, Ctrl+F to search

---

## 🆘 Need Help?

1. Check `ADMIN_PANEL_FEATURES.md` for complete feature list
2. Check browser console (F12) for JavaScript errors
3. Check admin panel terminal for Node.js errors
4. Check RAGE:MP server console for server errors
5. Verify database tables exist and have data
6. Check `.env` configuration

---

## 📞 Common Questions

**Q: How do I add more admins?**
A: Update the user's `admin_level` in the database (levels 1-5).

**Q: Can players access the admin panel?**
A: No, only authenticated admin users can access it.

**Q: How do I change the port?**
A: Edit `PORT` in `admin-panel/server-enhanced.js` and `.env`.

**Q: Can I access remotely?**
A: Yes, but configure firewall and use HTTPS in production.

**Q: What if a feature shows 0 or "No data"?**
A: This is normal if there's no data yet. Play on the server to generate data.

---

## ✨ Status: READY FOR USE

Everything is set up and working! Enjoy your professional RAGE:MP admin panel! 🎉

**Last Updated:** 2025-11-06
**Version:** 3.0 Complete
