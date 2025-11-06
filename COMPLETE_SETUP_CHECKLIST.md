# ✅ Complete Setup Checklist

Use this checklist to ensure everything is set up correctly.

---

## 📋 Pre-Installation Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] MySQL installed and running
- [ ] RAGE:MP Server downloaded from https://rage.mp/
- [ ] All project files downloaded/cloned

---

## 📂 Directory Structure Checklist

### Workspace Directory (`C:\RAGEMP\workspace\`)
- [ ] `package.json` exists
- [ ] `.env` exists
- [ ] `admin-panel/` folder exists
- [ ] `packages/` folder exists
- [ ] `client_packages/` folder exists
- [ ] `conf.json` exists
- [ ] `node_modules/` exists (run `npm install` if not)

### Server-Files Directory (`C:\RAGEMP\server-files\`)
- [ ] `ragemp-server.exe` exists (or `server.exe`)
- [ ] `conf.json` exists
- [ ] `.env` exists
- [ ] `packages/rp-server/` folder exists
- [ ] `packages/rp-server/index.js` exists
- [ ] `packages/rp-server/modules/` folder exists
- [ ] `packages/rp-server/node_modules/` exists
- [ ] `client_packages/` folder exists
- [ ] `client_packages/index.js` exists

---

## ⚙️ Configuration Checklist

### conf.json
- [ ] File exists in `server-files/`
- [ ] `"enable-nodejs": true` is set
- [ ] Port is `22005` (or your preferred port)
- [ ] Valid JSON syntax (test at jsonlint.com)

### .env File
- [ ] File exists in BOTH `workspace/` AND `server-files/`
- [ ] `DB_HOST` is set (usually `localhost`)
- [ ] `DB_USER` is set (usually `root`)
- [ ] `DB_PASSWORD` is set (your MySQL password)
- [ ] `DB_NAME` is set to `ragemp_server`
- [ ] `DB_PORT` is set to `3306`

---

## 🗄️ Database Checklist

- [ ] MySQL service is running
- [ ] Can connect to MySQL with credentials
- [ ] Database `ragemp_server` created (or will be auto-created)
- [ ] MySQL user has proper permissions

**Test MySQL connection:**
```bash
mysql -u root -p
# Enter password, then:
SHOW DATABASES;
# You should see ragemp_server (or it will be created on first run)
EXIT;
```

---

## 📦 Dependencies Checklist

### Workspace Dependencies
```bash
cd C:\RAGEMP\workspace
npm install
```
- [ ] Installation completed without errors
- [ ] `node_modules/` folder created

### Server-Files Dependencies
```bash
cd C:\RAGEMP\server-files\packages\rp-server
npm install
```
- [ ] Installation completed without errors
- [ ] `node_modules/` folder created
- [ ] `dotenv` installed
- [ ] `mysql2` installed
- [ ] `bcrypt` installed
- [ ] `ws` installed

---

## 🚀 Server Start Checklist

### Before Starting
- [ ] MySQL is running
- [ ] All files copied to correct locations
- [ ] Dependencies installed
- [ ] Configuration files updated
- [ ] Database created

### Starting Game Server
- [ ] Navigate to: `cd C:\RAGEMP\server-files`
- [ ] Run: `ragemp-server.exe` (NOT `node` or `npm`)
- [ ] Window stays open
- [ ] No critical errors
- [ ] See "Server Initialization Complete!"
- [ ] Database connection successful
- [ ] All modules loaded

### Starting Admin Panel (Optional)
- [ ] Navigate to: `cd C:\RAGEMP\workspace`
- [ ] Run: `npm run admin`
- [ ] See "Admin panel running on http://localhost:3000"
- [ ] Can access http://localhost:3000 in browser
- [ ] Can login with admin/admin123

---

## 🎮 Client Connection Checklist

- [ ] RAGE:MP Client installed
- [ ] Server is running (green checkmarks above)
- [ ] Direct Connect to `localhost:22005`
- [ ] Connection successful
- [ ] See login/registration screen

---

## ✅ Success Indicators

### Game Server Console Shows:
```
✅ [Server] Environment variables loaded
✅ [Server] Initializing modules...
✅ [Database] Connected to MySQL database successfully!
✅ [Database] All tables created/verified successfully!
✅ [Player] Module loaded
✅ [Character] Module loaded
✅ [Banking] Module loaded
✅ [Inventory] Module loaded
✅ [Shops] Module loaded
✅ [Jobs] Module loaded
✅ [Vehicles] Module loaded
✅ [Admin] Module loaded
✅ [Spawn] Module loaded
✅ Server Initialization Complete!
```

### Admin Panel Console Shows:
```
✅ [Database] Connected to MySQL database successfully!
✅ Admin panel running on http://localhost:3000
✅ WebSocket bridge listening on port 3001
```

### In Browser:
```
✅ http://localhost:3000 loads
✅ Can login with admin/admin123
✅ Dashboard shows statistics
✅ No console errors
```

---

## 🔧 Common Issues & Quick Fixes

### ❌ "mp is not defined"
- [ ] Using `ragemp-server.exe` (not `node`)?
- [ ] `"enable-nodejs": true` in conf.json?
- [ ] Correct folder structure (`packages/rp-server/index.js`)?

### ❌ "Cannot find module 'dotenv'"
- [ ] Run `npm install` in `server-files/packages/rp-server/`
- [ ] `package.json` exists?
- [ ] `node_modules/` folder created?

### ❌ "Database connection failed"
- [ ] MySQL running? (`tasklist | findstr mysql`)
- [ ] `.env` file in server-files?
- [ ] Correct password in `.env`?
- [ ] Database created?

### ❌ Server closes instantly
- [ ] Visual C++ Redistributables installed?
- [ ] Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
- [ ] Restart computer after installing

### ❌ Admin panel can't connect to server
- [ ] Game server running?
- [ ] Both running on same machine?
- [ ] No firewall blocking?

---

## 📊 Final Verification Commands

Run these to verify everything:

```bash
# Check server files structure
cd C:\RAGEMP\server-files
dir
dir packages\rp-server
dir packages\rp-server\modules
dir client_packages

# Check if MySQL is running
tasklist | findstr mysql

# Check conf.json content
type conf.json

# Check if .env exists
dir .env

# Check if dependencies installed
dir packages\rp-server\node_modules

# Start server (if all above OK)
ragemp-server.exe
```

---

## 🎯 Quick Setup Script

Instead of manual steps, run:

```bash
cd C:\RAGEMP\workspace
setup-server.bat
```

This will automatically:
1. Copy all files to correct locations
2. Install dependencies
3. Verify configuration

---

## 📞 Getting Help

If something doesn't work:

1. **Check this checklist** - Make sure all items are checked
2. **Read error messages** - Copy the EXACT error text
3. **Check documentation:**
   - `FINAL_SETUP_GUIDE.md` - Complete setup steps
   - `FIX_INSTANT_CLOSE.md` - Server closes immediately
   - `CRITICAL_ERROR_FIX.md` - mp is not defined error
   - `FIX_MP_NOT_FOUND.md` - Node.js configuration

---

## ✅ All Done?

If you can check all boxes:
- [ ] Game server running without errors
- [ ] Admin panel accessible (if needed)
- [ ] Can connect with RAGE:MP client
- [ ] Can register/login in game

**🎉 Congratulations! Your server is fully operational!**

---

*Last updated: November 6, 2025*
